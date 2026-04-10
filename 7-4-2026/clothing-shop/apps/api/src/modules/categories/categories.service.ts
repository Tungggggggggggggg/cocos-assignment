import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    const result = await this.db.query(
      'SELECT id, name, slug FROM categories ORDER BY name ASC',
    );
    return result.rows;
  }

  async findOne(id: string) {
    const result = await this.db.query(
      'SELECT id, name, slug FROM categories WHERE id = $1',
      [id],
    );
    if (result.rowCount === 0)
      throw new NotFoundException('Không tìm thấy danh mục');
    return result.rows[0];
  }

  async create(data: { name: string; slug: string; description?: string }) {
    const result = await this.db.query(
      'INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id',
      [data.name, data.slug],
    );
    return { success: true, id: result.rows[0].id };
  }

  async update(
    id: string,
    data: Partial<{ name: string; slug: string; isActive: boolean }>,
  ) {
    const result = await this.db.query(
      'UPDATE categories SET name = $1, slug = $2 WHERE id = $3 RETURNING id',
      [data.name, data.slug, id],
    );
    if (result.rowCount === 0)
      throw new NotFoundException('Không tìm thấy danh mục để cập nhật');
    return { success: true };
  }

  async remove(id: string) {
    const result = await this.db.query(
      'UPDATE categories SET is_archived = true WHERE id = $1',
      [id],
    );
    if (result.rowCount === 0)
      throw new NotFoundException('Không tìm thấy danh mục để xóa');
    return { success: true };
  }
}
