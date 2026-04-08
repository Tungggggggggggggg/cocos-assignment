import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/common/database/database.service';

@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}
  async processCheckout(
    userId: string,
    cartId: string,
    shippingAddress: object,
  ) {
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
        `INSERT INTO orders (order_no, user_id, channel, subtotal, total_amount, shipping_address)
        VALUES ($1, $2, 'online', $3, $4, $5) RETURNING id`,
        [orderNo, userId, subtotal, subtotal, JSON.stringify(shippingAddress)],
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
            SET quantity_reserved = quantity_reserved + $1, updated_at = NOW()
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
}
