import { Controller, Post, Body, Req } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import type { AuthenticatedRequest } from '../../common/interfaces/request.interface';

@Controller('api/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('imports')
  async importGoods(
    @Body()
    body: {
      items: { variantId: string; quantity: number; unitCost: number }[];
    },
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub || '00000000-0000-0000-0000-000000000000';
    return this.inventoryService.importGoods(body.items, userId);
  }
}
