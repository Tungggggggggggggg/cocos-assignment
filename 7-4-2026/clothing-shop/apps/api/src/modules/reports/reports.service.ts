import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class ReportsService {
  constructor(private readonly db: DatabaseService) {}

  async getDashboardMetrics() {
    return this.db.transaction(async (client) => {
      // 1. Revenue & Actual Gross Profit
      const salesQuery = await client.query(
        `SELECT 
            SUM(quantity * unit_price) as revenue,
            SUM(quantity * (unit_price - unit_cost)) as profit
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         WHERE o.status != 'cancelled'`,
      );

      const salesData = salesQuery.rows[0];

      // 2. New orders today
      const newOrdersQuery = await client.query(
        `SELECT COUNT(id) as count FROM orders WHERE created_at >= current_date`,
      );

      // 3. Low stock count
      const lowStockQuery = await client.query(
        `SELECT COUNT(variant_id) as count FROM inventory WHERE quantity_on_hand < 10`,
      );

      // 4. Recent orders for dashboard list
      const recentOrdersQuery = await client.query(
        `SELECT o.id, o.order_no, o.total_amount, o.status, o.created_at, u.full_name as customer_name
         FROM orders o
         LEFT JOIN users u ON u.id = o.user_id
         ORDER BY o.created_at DESC LIMIT 5`,
      );

      // 5. Inventory alerts
      const inventoryAlertsQuery = await client.query(
        `SELECT p.name as product_name, pv.sku, pv.size, pv.color, 
                i.quantity_on_hand as available_qty
         FROM inventory i
         JOIN product_variants pv ON pv.id = i.variant_id
         JOIN products p ON p.id = pv.product_id
         WHERE i.quantity_on_hand < 10
         LIMIT 5`,
      );

      return {
        stats: {
          revenue: Number(salesData.revenue || 0),
          grossProfit: Number(salesData.profit || 0),
          orderCount: Number(newOrdersQuery.rows[0].count),
          lowStockCount: Number(lowStockQuery.rows[0].count),
        },
        recentOrders: recentOrdersQuery.rows,
        inventoryAlerts: inventoryAlertsQuery.rows,
      };
    });
  }

  async getFinancialStats() {
    return this.db.transaction(async (client) => {
      // Summary
      const summaryQuery = await client.query(
        `SELECT 
            SUM(quantity * unit_price) as revenue,
            SUM(quantity * unit_cost) as cogs,
            SUM(quantity * (unit_price - unit_cost)) as gross_profit
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         WHERE o.status != 'cancelled'`,
      );

      // Monthly trends
      const monthlyQuery = await client.query(
        `SELECT 
            TO_CHAR(o.created_at, 'YYYY-MM') as month,
            SUM(oi.quantity * oi.unit_price) as revenue,
            SUM(oi.quantity * (oi.unit_price - oi.unit_cost)) as profit
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         WHERE o.status != 'cancelled'
         GROUP BY 1 ORDER BY 1 DESC LIMIT 6`,
      );

      // Top products by profit
      const topProductsQuery = await client.query(
        `SELECT 
            p.name, pv.sku, pv.size, pv.color,
            SUM(oi.quantity) as total_sold,
            SUM(oi.quantity * (oi.unit_price - oi.unit_cost)) as total_profit
         FROM order_items oi
         JOIN product_variants pv ON pv.id = oi.variant_id
         JOIN products p ON p.id = pv.product_id
         JOIN orders o ON o.id = oi.order_id
         WHERE o.status != 'cancelled'
         GROUP BY p.name, pv.sku, pv.size, pv.color
         ORDER BY total_profit DESC LIMIT 10`,
      );

      return {
        summary: {
          revenue: Number(summaryQuery.rows[0].revenue || 0),
          cogs: Number(summaryQuery.rows[0].cogs || 0),
          profit: Number(summaryQuery.rows[0].gross_profit || 0),
          margin:
            summaryQuery.rows[0].revenue > 0
              ? (Number(summaryQuery.rows[0].gross_profit) /
                  Number(summaryQuery.rows[0].revenue)) *
                100
              : 0,
        },
        monthlyTrends: monthlyQuery.rows,
        topProducts: topProductsQuery.rows,
      };
    });
  }
}
