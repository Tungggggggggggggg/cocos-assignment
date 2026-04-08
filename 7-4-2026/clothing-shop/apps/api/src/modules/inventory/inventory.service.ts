import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/common/database/database.service';

@Injectable()
export class InventoryService {
  constructor(private readonly db: DatabaseService) {}

  async importGoods(
    items: { variantId: string; quantity: number; unitCost: number }[],
    userId: string,
  ) {
    if (!items || items.length === 0) {
      throw new BadRequestException('Danh sách nhập kho trống');
    }
    return this.db.transaction(async (client) => {
      const receiptNo = `IMP-${Date.now()}`;
      const totalCost = items.reduce(
        (sum, item) => sum + item.quantity * item.unitCost,
        0,
      );
      const receiptQuery = await client.query(
        `INSERT INTO import_receipts (receipt_no, notes, total_cost, status, created_by)
        VALUES ($1, $2, $3, $4, $5) RETURNING id `,
        [receiptNo, 'Nhập hàng mới', totalCost, 'completed', userId],
      );
      const receiptId = receiptQuery.rows[0].id;

      for (const item of items) {
        await client.query(
          `INSERT INTO import_receipt_items (import_receipt_id, variant_id, quantity, unit_cost)
            VALUES ($1, $2, $3, $4)`,
          [receiptId, item.variantId, item.quantity, item.unitCost],
        );

        const invQuery = await client.query(
          `SELECT quantity_on_hand, avg_cost FROM inventory WHERE variant_id = $1 FOR UPDATE`,
          [item.variantId],
        );

        const currentQty = invQuery.rows.length
          ? invQuery.rows[0].quantity_on_hand
          : 0;
        const currentAvg = invQuery.rows.length
          ? Number(invQuery.rows[0].avg_cost)
          : 0;

        let newAvg = item.unitCost;
        if (currentQty + item.quantity > 0 && currentQty > 0) {
          newAvg =
            (currentQty * currentAvg + item.quantity * item.unitCost) /
            (currentQty + item.quantity);
        }

        await client.query(
          `INSERT INTO inventory (variant_id, quantity_on_hand, avg_cost, updated_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (variant_id)
            DO UPDATE SET
                quantity_on_hand = inventory.quantity_on_hand + EXCLUDED.quantity_on_hand, 
                avg_cost = EXCLUDED.avg_cost,
                updated_at = NOW()`,
          [item.variantId, item.quantity, newAvg],
        );

        await client.query(
          `INSERT INTO inventory_transactions (variant_id, type, quantity_delta, unit_cost, reference_id, reference_type, created_by)
            VALUES ($1, 'import', $2, $3, $4, 'import_receipt', $5)`,
          [item.variantId, item.quantity, item.unitCost, receiptId, userId],
        );
      }
      return { success: true, receiptNo, totalCost };
    });
  }
}
