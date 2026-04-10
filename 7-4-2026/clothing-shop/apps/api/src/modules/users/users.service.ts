import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    const result = await this.db.query(
      `SELECT u.id, u.email, u.full_name, u.created_at, 
              (SELECT r.name FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = u.id LIMIT 1) as role
       FROM users u
       ORDER BY u.created_at DESC`,
    );
    return result.rows;
  }

  async updateRole(userId: string, roleName: string) {
    return this.db.transaction(async (client) => {
      const roleQuery = await client.query(
        'SELECT id FROM roles WHERE name = $1',
        [roleName],
      );
      if (roleQuery.rowCount === 0)
        throw new NotFoundException('Role không tồn tại');
      const roleId = roleQuery.rows[0].id;

      await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);

      await client.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
        [userId, roleId],
      );

      return { success: true };
    });
  }
}
