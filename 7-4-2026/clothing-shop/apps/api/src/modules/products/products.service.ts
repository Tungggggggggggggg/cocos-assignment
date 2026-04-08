import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class ProductsService {
  constructor(private readonly db: DatabaseService) {}
  async findAll() {
    const result = await this.db.query(
      `SELECT p.id, p.name, p.slug, p.is_active, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = true AND p.is_archived = false`,
    );
    return result.rows;
  }

  async findOneBySlug(slug: string) {
    const productResult = await this.db.query(
      `SELECT id, name, slug, description FROM products WHERE slug = $1`,
      [slug],
    );
    if (productResult.rowCount === 0) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    const product = productResult.rows[0];

    const variantsResult = await this.db.query(
      `SELECT pv.id, pv.sku, pv.size, pv.color, pv.retail_price,
        COALESCE(i.quantity_on_hand, 0) - COALESCE(i.quantity_reserved, 0) AS available_qty
        FROM product_variants pv
        LEFT JOIN inventory i ON i.variant_id = pv.id
        WHERE pv.product_id = $1 AND pv.is_active = true`,
      [product.id],
    );
    return {
      ...product,
      variants: variantsResult.rows,
    };
  }
}
