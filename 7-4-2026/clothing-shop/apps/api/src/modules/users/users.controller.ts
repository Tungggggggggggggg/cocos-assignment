import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('api/users')
@UseGuards(JwtAuthGuard, RbacGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions('users:view')
  async findAll() {
    return this.usersService.findAll();
  }

  @Put(':id/role')
  @Permissions('users:manage')
  async updateRole(@Param('id') userId: string, @Body() body: { role: string }) {
    return this.usersService.updateRole(userId, body.role);
  }
}
