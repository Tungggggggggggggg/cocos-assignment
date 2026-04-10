import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from 'src/common/database/database.service';

@Injectable()
export class OrdersCronService {
  private readonly logger = new Logger(OrdersCronService.name);

  constructor(private readonly db: DatabaseService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredOrders() {
    const timeoutThreshold = new Date(
      Date.now() - 15 * 60 * 1000,
    ).toISOString();

    await this.db.transaction(async (trxClient) => {
      const expiredQuery = await trxClient.query(
        `SELECT id FROM orders WHERE status = 'pending' AND created_at <= $1 FOR UPDATE SKIP LOCKED`,
        [timeoutThreshold],
      );

      if (expiredQuery.rowCount === 0) {
        return;
      }

      this.logger.log(
        `Phát hiện ${expiredQuery.rowCount} đơn hàng hết hạn. Tiến hành Rollback tồn kho...`,
      );

      for (const row of expiredQuery.rows) {
        const orderId = row.id;

        const items = await trxClient.query(
          `SELECT variant_id, quantity, unit_cost FROM order_items WHERE order_id = $1`,
          [orderId],
        );

        for (const item of items.rows) {
          await trxClient.query(
            `UPDATE inventory SET quantity_reserved = quantity_reserved - $1 WHERE variant_id = $2`,
            [item.quantity, item.variant_id],
          );

          await trxClient.query(
            `INSERT INTO inventory_transactions (variant_id, type, quantity_delta, unit_cost, reference_id, reference_type)
             VALUES ($1, 'sale_release', $2, $3, $4, 'order')`,
            [item.variant_id, item.quantity, item.unit_cost, orderId],
          );
        }

        await trxClient.query(
          `UPDATE orders SET status = 'cancelled', cancel_reason = 'Quá hạn thanh toán 15 phút' WHERE id = $1`,
          [orderId],
        );
      }
    });
  }
}
