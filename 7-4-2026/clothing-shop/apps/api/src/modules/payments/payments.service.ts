import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/common/database/database.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly db: DatabaseService) {}

  async confirmPaymentWebhook(orderId: string) {
    return this.db.transaction(async (client) => {
      const orderQuery = await client.query(
        `SELECT id, status, total_amount FROM orders WHERE id = $1 FOR UPDATE`,
        [orderId],
      );
      if (orderQuery.rowCount === 0)
        throw new NotFoundException('Đơn hàng không tồn tại');

      const order = orderQuery.rows[0];
      if (order.status !== 'pending')
        return { message: 'Đơn hàng đã được xử lý' };

      const items = await client.query(
        `SELECT oi.variant_id, oi.quantity, oi.unit_price, i.avg_cost
         FROM order_items oi
         JOIN inventory i ON i.variant_id = oi.variant_id
         WHERE oi.order_id = $1`,
        [orderId],
      );

      for (const item of items.rows) {
        await client.query(
          `UPDATE order_items SET unit_cost = $1 WHERE order_id = $2 AND variant_id = $3`,
          [item.avg_cost, orderId, item.variant_id],
        );

        await client.query(
          `UPDATE inventory SET
             quantity_on_hand = quantity_on_hand - $1,
             quantity_reserved = quantity_reserved - $1
           WHERE variant_id = $2`,
          [item.quantity, item.variant_id],
        );

        await client.query(
          `INSERT INTO inventory_transactions (variant_id, type, quantity_delta, unit_cost, reference_id, reference_type)
           VALUES ($1, 'sale_deduct', $2, $3, $4, 'order')`,
          [item.variant_id, -item.quantity, item.avg_cost, orderId],
        );
      }

      await client.query(
        `UPDATE orders SET status = 'processing' WHERE id = $1`,
        [orderId],
      );

      await client.query(
        `INSERT INTO payments (order_id, status, amount) VALUES ($1, 'completed', $2)`,
        [orderId, order.total_amount],
      );

      return {
        success: true,
        orderId,
        message: 'Xác nhận thanh toán và ghi nhận doanh thu thành công',
      };
    });
  }
}
