import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../../common/database/database.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    return this.db.transaction(async (client) => {
      const existCheck = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [dto.email],
      );
      if ((existCheck.rowCount ?? 0) > 0) {
        throw new ConflictException('Email này đã được sử dụng');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(dto.password, salt);

      const insertUser = await client.query(
        'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name',
        [dto.email, hashedPassword, dto.fullName],
      );
      const user = insertUser.rows[0];

      const roleCheck = await client.query(
        'SELECT id FROM roles WHERE name = $1',
        ['customer'],
      );
      if (roleCheck.rowCount === 0) {
        throw new InternalServerErrorException(
          'System missing baseline roles. Run seeder!',
        );
      }

      await client.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
        [user.id, roleCheck.rows[0].id],
      );
      return this.generateToken(user.id, user.email);
    });
  }

  async login(dto: LoginDto) {
    const result = await this.db.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [dto.email],
    );
    if (result.rowCount === 0) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Sai mật khẩu');
    }

    const permissionQuery = await this.db.query(
      `SELECT CONCAT(p.resource, ':', p.action) AS perm 
      FROM user_roles ur
      JOIN role_permissions rp ON rp.role_id = ur.role_id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = $1`,
      [user.id],
    );
    const permissions = permissionQuery.rows.map((r) => r.perm);
    return this.generateToken(user.id, user.email, permissions);
  }

  private generateToken(
    userId: string,
    email: string,
    permissions: string[] = [],
  ) {
    const payload = { sub: userId, email, permissions };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
