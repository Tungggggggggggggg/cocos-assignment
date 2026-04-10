import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/common/database/database.service';

@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}
  async processCheckout(userId: string, cartId: string) {
    return this.db.transaction(async (client) => {
      const cartItemsQuery = await client.query(
        `SELECT ci.variant_id, ci.quantity, pv.retail_price, p.name AS product_name, pv.sku, pv.size, pv.color
        FROM cart_items ci
        JOIN product_variants pv ON pv.id = ci.variant_id
        JOIN products p ON p.id = pv.product_id
        WHERE ci.cart_id = $1`,
        [cartId],
      );
      if (cartItemsQuery.rowCount === 0) {
        throw new BadRequestException('Giỏ hàng trống');
      }

      const cartItems = cartItemsQuery.rows;
      const variantIds = cartItems.map((r) => r.variant_id).sort();

      const inventoryQuery = await client.query(
        `SELECT variant_id, quantity_on_hand, quantity_reserved, avg_cost
        FROM inventory
        WHERE variant_id = ANY($1::uuid[])
        ORDER BY variant_id
        FOR UPDATE`,
        [variantIds],
      );
      const invMap = new Map();
      inventoryQuery.rows.forEach((r) => invMap.set(r.variant_id, r));

      let subtotal = 0;
      for (const item of cartItems) {
        const inv = invMap.get(item.variant_id);
        if (!inv) {
          throw new BadRequestException(`Lỗi dữ liệu kho cho thẻ ${item.sku}`);
        }
        const available = inv.quantity_on_hand - inv.quantity_reserved;
        if (available < item.quantity) {
          throw new BadRequestException(
            `Sản phẩm ${item.product_name}(${item.size}-${item.color}) chỉ còn ${available} món.`,
          );
        }
        subtotal += item.retail_price * item.quantity;
      }
      const orderNo = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderResult = await client.query(
        `INSERT INTO orders (order_no, user_id, total_amount)
        VALUES ($1, $2, $3) RETURNING id`,
        [orderNo, userId, subtotal],
      );
      const orderId = orderResult.rows[0].id;

      for (const item of cartItems) {
        const inv = invMap.get(item.variant_id);

        await client.query(
          `INSERT INTO order_items (order_id, variant_id, unit_price, quantity, unit_cost)
            VALUES ($1, $2, $3, $4, $5)`,
          [
            orderId,
            item.variant_id,
            item.retail_price,
            item.quantity,
            inv.avg_cost,
          ],
        );

        await client.query(
          `UPDATE inventory 
            SET quantity_reserved = quantity_reserved + $1
            WHERE variant_id = $2`,
          [item.quantity, item.variant_id],
        );

        await client.query(
          `INSERT INTO inventory_transactions (variant_id, type, quantity_delta, unit_cost, reference_id, reference_type)
            VALUES ($1, 'sale_reserve', $2, $3, $4, 'order')`,
          [item.variant_id, -item.quantity, inv.avg_cost, orderId],
        );
      }
      await client.query('DELETE FROM carts WHERE id = $1', [cartId]);
      return { success: true, orderId, orderNo, totalAmount: subtotal };
    });
  }

  async getUserOrders(userId: string) {
    const result = await this.db.query(
      `SELECT id, order_no, status, total_amount, created_at
       FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async getAllOrders(status?: string) {
    let sql = `SELECT o.id, o.order_no, o.status, o.total_amount, o.created_at, u.full_name as customer_name
               FROM orders o
               LEFT JOIN users u ON u.id = o.user_id`;
    const params = [];
    if (status) {
      params.push(status);
      sql += ` WHERE o.status = $1`;
    }
    sql += ` ORDER BY o.created_at DESC`;
    const result = await this.db.query(sql, params);
    return result.rows;
  }

  async getOrderById(orderId: string) {
    const orderQuery = await this.db.query(
      `SELECT o.id, o.order_no, o.status, o.total_amount, o.created_at, u.full_name as customer_name, u.email as customer_email
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       WHERE o.id = $1`,
      [orderId],
    );
    if (orderQuery.rowCount === 0) {
      throw new BadRequestException('Không tìm thấy đơn hàng');
    }
    const order = orderQuery.rows[0];

    const itemsQuery = await this.db.query(
      `SELECT oi.*, pv.sku, p.name as product_name, pv.size, pv.color
       FROM order_items oi
       JOIN product_variants pv ON pv.id = oi.variant_id
       JOIN products p ON p.id = pv.product_id
       WHERE oi.order_id = $1`,
      [orderId],
    );
    return { ...order, items: itemsQuery.rows };
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.db.transaction(async (client) => {
      const orderQuery = await client.query(
        `SELECT status FROM orders WHERE id = $1 FOR UPDATE`,
        [orderId],
      );
      if (orderQuery.rowCount === 0) {
        throw new BadRequestException('Đơn hàng không tồn tại');
      }
      const oldStatus = orderQuery.rows[0].status;

      if (oldStatus === status) return { success: true };

      if (status === 'cancelled' && oldStatus !== 'cancelled') {
        const items = await client.query(
          `SELECT variant_id, quantity, unit_cost FROM order_items WHERE order_id = $1`,
          [orderId],
        );
        for (const item of items.rows) {
          await client.query(
            `UPDATE inventory SET quantity_reserved = quantity_reserved - $1 WHERE variant_id = $2`,
            [item.quantity, item.variant_id],
          );
          await client.query(
            `INSERT INTO inventory_transactions (variant_id, type, quantity_delta, unit_cost, reference_id, reference_type)
             VALUES ($1, 'sale_release', $2, $3, $4, 'order')`,
            [item.variant_id, item.quantity, item.unit_cost ?? 0, orderId],
          );
        }
      }

      await client.query('UPDATE orders SET status = $1 WHERE id = $2', [
        status,
        orderId,
      ]);

      return { success: true, newStatus: status };
    });
  }

  async processPosCheckout(
    sellerId: string,
    items: { variantId: string; quantity: number }[],
  ) {
    return this.db.transaction(async (client) => {
      const variantIds = items.map((i) => i.variantId).sort();

      
      const inventoryQuery = await client.query(
        `SELECT i.variant_id, i.quantity_on_hand, i.quantity_reserved, i.avg_cost,
                pv.retail_price, p.name as product_name, pv.sku, pv.size, pv.color
         FROM inventory i
         JOIN product_variants pv ON pv.id = i.variant_id
         JOIN products p ON p.id = pv.product_id
         WHERE i.variant_id = ANY($1::uuid[])
         ORDER BY i.variant_id
         FOR UPDATE`,
        [variantIds],
      );

      const invMap = new Map();
      inventoryQuery.rows.forEach((r) => invMap.set(r.variant_id, r));

      let subtotal = 0;

      
      for (const item of items) {
        const inv = invMap.get(item.variantId);
        if (!inv) {
          throw new BadRequestException(
            `Sản phẩm với ID ${item.variantId} không có trong kho.`,
          );
        }
        const available = inv.quantity_on_hand - inv.quantity_reserved;
        if (available < item.quantity) {
          throw new BadRequestException(
            `Sản phẩm ${inv.product_name} (${inv.size}-${inv.color}) chỉ còn ${available} món.`,
          );
        }
        subtotal += Number(inv.retail_price) * item.quantity;
      }

      const orderNo = `POS-${Date.now()}-${Math.floor(1000 + Math.random() * 8999)}`;

      const orderResult = await client.query(
        `INSERT INTO orders (order_no, user_id, status, total_amount)
         VALUES ($1, $2, 'delivered', $3) RETURNING id`,
        [orderNo, sellerId, subtotal],
      );
      const orderId = orderResult.rows[0].id;

      
      for (const item of items) {
        const inv = invMap.get(item.variantId);

        await client.query(
          `INSERT INTO order_items (order_id, variant_id, unit_price, quantity, unit_cost)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            orderId,
            item.variantId,
            inv.retail_price,
            item.quantity,
            inv.avg_cost,
          ],
        );

        
        await client.query(
          `UPDATE inventory 
           SET quantity_on_hand = quantity_on_hand - $1
           WHERE variant_id = $2`,
          [item.quantity, item.variantId],
        );

        
        await client.query(
          `INSERT INTO inventory_transactions (variant_id, type, quantity_delta, unit_cost, reference_id, reference_type)
           VALUES ($1, 'sale_deduct', $2, $3, $4, 'order')`,
          [item.variantId, -item.quantity, inv.avg_cost, orderId],
        );
      }

      
      await client.query(
        `INSERT INTO payments (order_id, status, amount) 
         VALUES ($1, 'completed', $2)`,
        [orderId, subtotal],
      );

      return { success: true, orderId, orderNo, totalAmount: subtotal };
    });
  }
}
