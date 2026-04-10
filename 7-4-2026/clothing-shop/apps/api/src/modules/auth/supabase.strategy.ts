import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'SUPABASE_JWT_SECRET',
        'super-secret-jwt-token-with-at-least-32-characters-long',
      ),
    });
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Token Supabase không hợp lệ');
    }

    
    await this.authService.syncUser(
      payload.email,
      payload.user_metadata?.full_name || payload.email,
    );

    
    const permissions = await this.authService.getUserPermissions(
      payload.email,
    );

    
    const role =
      permissions.length > 0
        ? permissions.includes('admin:access')
          ? 'admin'
          : 'customer'
        : 'customer';

    return {
      sub: payload.sub,
      email: payload.email,
      role: role,
      permissions: permissions,
    };
  }
}
