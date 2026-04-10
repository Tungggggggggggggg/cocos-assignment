import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import * as bcrypt from 'bcryptjs';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async validateLocalUser(email: string, pass: string): Promise<any> {
    const sql = `SELECT id, email, password_hash, full_name FROM users WHERE LOWER(email) = LOWER($1) AND is_active = true`;
    const result = await this.db.query(sql, [email]);
    if (result.rowCount === 0) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(pass, user.password_hash);

    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const permissions = await this.getUserPermissions(user.email);
    const role = permissions.includes('admin:access') ? 'admin' : 'customer';

    const payload = {
      sub: user.id,
      email: user.email,
      user_metadata: {
        full_name: user.full_name,
        role: role,
      },
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: role,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async getUserPermissions(email: string): Promise<string[]> {
    const sql = `
      SELECT DISTINCT p.resource || ':' || p.action as permission
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE LOWER(u.email) = LOWER($1) AND u.is_active = true AND r.is_active = true
    `;
    const result = await this.db.query(sql, [email]);
    return result.rows.map((r) => r.permission);
  }

  async syncUser(email: string, fullName: string) {
    const check = await this.db.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email],
    );
    if (check.rowCount === 0) {
      await this.db.query(
        'INSERT INTO users (email, full_name) VALUES ($1, $2)',
        [email, fullName],
      );
    }
  }
}
