import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import type { AuthenticatedRequest } from '../../common/interfaces/request.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PosCheckoutDto } from './dto/pos-checkout.dto';

@Controller('api/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Post('checkout')
  async checkout(@Body() body: CheckoutDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user!.sub;
    return this.orderService.processCheckout(userId, body.cartId);
  }

  @Post('pos-checkout')
  @UseGuards(RbacGuard)
  @Permissions('orders:manage')
  async posCheckout(
    @Body() body: PosCheckoutDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const sellerId = req.user!.sub;
    return this.orderService.processPosCheckout(sellerId, body.items);
  }

  @Get('my-orders')
  async getMyOrders(@Req() req: AuthenticatedRequest) {
    const userId = req.user!.sub;
    return this.orderService.getUserOrders(userId);
  }

  @Get('admin')
  @UseGuards(RbacGuard)
  @Permissions('orders:view')
  async getAllOrders(@Query('status') status?: string) {
    return this.orderService.getAllOrders(status);
  }

  @Get(':id')
  async getOrderDetail(@Param('id') orderId: string) {
    return this.orderService.getOrderById(orderId);
  }

  @Put(':id/status')
  @UseGuards(RbacGuard)
  @Permissions('orders:manage')
  async updateStatus(
    @Param('id') orderId: string,
    @Body('status') status: string,
  ) {
    return this.orderService.updateOrderStatus(orderId, status);
  }
}
