import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly db: DatabaseService) {}
  async findAll(filters: {
    categoryId?: string;
    q?: string;
    page?: number;
    limit?: number;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const offset = (page - 1) * limit;

    let whereSql = `WHERE p.is_active = true AND p.is_archived = false`;
    const params: (string | number)[] = [];

    const addFilter = (condition: string, value: string | number) => {
      params.push(value);
      whereSql += ` AND ${condition} $${params.length}`;
    };

    if (filters.categoryId) addFilter('p.category_id', filters.categoryId);
    if (filters.q) {
      params.push(`%${filters.q}%`);
      whereSql += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }

    if (filters.minPrice !== undefined) {
      params.push(filters.minPrice);
      whereSql += ` AND (SELECT MIN(retail_price) FROM product_variants WHERE product_id = p.id AND is_active = true) >= $${params.length}`;
    }
    if (filters.maxPrice !== undefined) {
      params.push(filters.maxPrice);
      whereSql += ` AND (SELECT MIN(retail_price) FROM product_variants WHERE product_id = p.id AND is_active = true) <= $${params.length}`;
    }

    const countSql = `SELECT COUNT(*) as total FROM products p ${whereSql}`;
    const countResult = await this.db.query(countSql, params);
    const total = parseInt(countResult.rows[0].total, 10);

    const dataSql = `SELECT p.id, p.name, p.slug, p.image_url, p.is_active, c.name as category_name,
                          (SELECT MIN(retail_price) FROM product_variants WHERE product_id = p.id AND is_active = true) as min_price
                   FROM products p
                   LEFT JOIN categories c ON p.category_id = c.id
                   ${whereSql}
                   ORDER BY p.created_at DESC
                   LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    const result = await this.db.query(dataSql, [...params, limit, offset]);

    return {
      items: result.rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneBySlug(slug: string) {
    const productResult = await this.db.query(
      `SELECT id, name, slug, description, image_url, is_active, category_id FROM products WHERE slug = $1`,
      [slug],
    );
    if (productResult.rowCount === 0) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    const product = productResult.rows[0];

    const variantsResult = await this.db.query(
      `SELECT pv.id, pv.sku, pv.size, pv.color, pv.retail_price, pv.is_active,
        COALESCE(i.quantity_on_hand, 0) - COALESCE(i.quantity_reserved, 0) AS available_qty
        FROM product_variants pv
        LEFT JOIN inventory i ON i.variant_id = pv.id
        WHERE pv.product_id = $1`,
      [product.id],
    );
    return {
      ...product,
      variants: variantsResult.rows,
    };
  }

  async findOneById(id: string) {
    const productResult = await this.db.query(
      `SELECT id, name, slug, description, image_url, is_active, category_id FROM products WHERE id = $1`,
      [id],
    );
    if (productResult.rowCount === 0) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    const product = productResult.rows[0];

    const variantsResult = await this.db.query(
      `SELECT pv.id, pv.sku, pv.size, pv.color, pv.retail_price, pv.is_active,
        COALESCE(i.quantity_on_hand, 0) - COALESCE(i.quantity_reserved, 0) AS available_qty
        FROM product_variants pv
        LEFT JOIN inventory i ON i.variant_id = pv.id
        WHERE pv.product_id = $1`,
      [product.id],
    );
    return {
      ...product,
      variants: variantsResult.rows,
    };
  }
  async createProduct(data: CreateProductDto) {
    return this.db.transaction(async (client) => {
      const mainSku =
        data.variants && data.variants.length > 0
          ? data.variants[0].sku
          : `PROD-${Date.now()}`;

      const result = await client.query(
        `INSERT INTO products (category_id, name, slug, description, image_url, is_active, sku)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          data.categoryId,
          data.name,
          data.slug,
          data.description,
          data.imageUrl,
          data.isActive,
          mainSku,
        ],
      );
      const productId = result.rows[0].id;

      if (data.variants && Array.isArray(data.variants)) {
        for (const v of data.variants) {
          await client.query(
            `INSERT INTO product_variants (product_id, sku, size, color, retail_price, is_active)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              productId,
              v.sku,
              v.size,
              v.color,
              v.retailPrice,
              v.isActive ?? true,
            ],
          );
        }
      }
      return { success: true, id: productId };
    });
  }

  async updateProduct(id: string, data: UpdateProductDto) {
    return this.db.transaction(async (client) => {
      const mainSku =
        data.variants && data.variants.length > 0 ? data.variants[0].sku : null;
      let query = `UPDATE products SET name = $1, description = $2, is_active = $3`;
      const params: any[] = [data.name, data.description, data.isActive];

      if (mainSku) {
        params.push(mainSku);
        query += `, sku = $${params.length}`;
      }

      params.push(id);
      query += ` WHERE id = $${params.length} RETURNING id`;

      const productCheck = await client.query(query, params);
      if (productCheck.rowCount === 0) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      if (data.variants && Array.isArray(data.variants)) {
        const incomingIds = data.variants.filter((v) => v.id).map((v) => v.id);

        if (incomingIds.length > 0) {
          await client.query(
            `UPDATE product_variants SET is_active = false WHERE product_id = $1 AND id != ANY($2::uuid[])`,
            [id, incomingIds],
          );
        } else {
          await client.query(
            `UPDATE product_variants SET is_active = false WHERE product_id = $1`,
            [id],
          );
        }

        for (const v of data.variants) {
          if (v.id) {
            await client.query(
              `UPDATE product_variants SET sku = $1, size = $2, color = $3, retail_price = $4, is_active = $5 
               WHERE id = $6 AND product_id = $7`,
              [
                v.sku,
                v.size,
                v.color,
                v.retailPrice,
                v.isActive ?? true,
                v.id,
                id,
              ],
            );
          } else {
            await client.query(
              `INSERT INTO product_variants (product_id, sku, size, color, retail_price, is_active)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [id, v.sku, v.size, v.color, v.retailPrice, v.isActive ?? true],
            );
          }
        }
      }
      return { success: true };
    });
  }

  async deleteProduct(id: string) {
    await this.db.query(
      `UPDATE products SET is_archived = true WHERE id = $1`,
      [id],
    );
    return { success: true };
  }
}
