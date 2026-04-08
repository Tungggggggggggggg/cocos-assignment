import { Controller, Post, Body, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import type { AuthenticatedRequest } from 'src/common/interfaces/request.interface';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Post('checkout')
  async checkout(@Body() body: CheckoutDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub || '00000000-0000-0000-0000-000000000000';
    return this.orderService.processCheckout(
      userId,
      body.cartId,
      body.shippingAddress,
    );
  }
}
