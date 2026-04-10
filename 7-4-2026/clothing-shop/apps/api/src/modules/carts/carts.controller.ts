import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/interfaces/request.interface';

@Controller('api/carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  async getCart(@Req() req: AuthenticatedRequest) {
    const userId = req.user!.sub;
    return this.cartsService.getCartByUserId(userId);
  }

  @Post('items')
  async addItem(
    @Req() req: AuthenticatedRequest,
    @Body() body: { variantId: string; quantity: number },
  ) {
    const userId = req.user!.sub;
    return this.cartsService.addItemToCart(
      userId,
      body.variantId,
      body.quantity,
    );
  }

  @Delete('items/:variantId')
  async removeItem(
    @Req() req: AuthenticatedRequest,
    @Param('variantId') variantId: string,
  ) {
    const userId = req.user!.sub;
    return this.cartsService.removeItemFromCart(userId, variantId);
  }
}
