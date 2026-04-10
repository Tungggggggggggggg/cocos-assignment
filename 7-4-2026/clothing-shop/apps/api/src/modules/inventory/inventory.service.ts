import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/common/database/database.service';

@Injectable()
export class InventoryService {
  constructor(private readonly db: DatabaseService) {}

  async importGoods(
    items: { variantId: string; quantity: number; unitCost: number }[],
  ) {
    if (!items || items.length === 0) {
      throw new BadRequestException('Danh sách nhập kho trống');
    }
    return this.db.transaction(async (client) => {
      const receiptNo = `IMP-${Date.now()}`;

      for (const item of items) {
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
          `INSERT INTO inventory (variant_id, quantity_on_hand, avg_cost)
            VALUES ($1, $2, $3)
            ON CONFLICT (variant_id)
            DO UPDATE SET
                quantity_on_hand = inventory.quantity_on_hand + EXCLUDED.quantity_on_hand, 
                avg_cost = EXCLUDED.avg_cost`,
          [item.variantId, item.quantity, newAvg],
        );

        await client.query(
          `INSERT INTO inventory_transactions (variant_id, type, quantity_delta, unit_cost, reference_id, reference_type)
            VALUES ($1, 'import', $2, $3, $4, 'manual_import')`,
          [item.variantId, item.quantity, item.unitCost, null],
        );
      }
      const totalCost = items.reduce(
        (sum, item) => sum + item.quantity * item.unitCost,
        0,
      );
      return { success: true, receiptNo, totalCost };
    });
  }

  async getLogs(limit = 20) {
    const sql = `
      SELECT it.id, it.type, it.quantity_delta, it.unit_cost, it.created_at,
             p.name as product_name, pv.size, pv.color, pv.sku
      FROM inventory_transactions it
      JOIN product_variants pv ON it.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      ORDER BY it.created_at DESC
      LIMIT $1
    `;
    const result = await this.db.query(sql, [limit]);
    return result.rows;
  }
}
