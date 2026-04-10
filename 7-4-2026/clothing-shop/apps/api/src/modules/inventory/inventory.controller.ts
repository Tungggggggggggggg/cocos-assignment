import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(JwtAuthGuard)
  @Get('logs')
  async getLogs() {
    return this.inventoryService.getLogs();
  }

  @UseGuards(JwtAuthGuard)
  @Post('imports')
  async importGoods(
    @Body()
    body: {
      items: { variantId: string; quantity: number; unitCost: number }[];
    },
  ) {
    return this.inventoryService.importGoods(body.items);
  }
}
