import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

import { OrdersCronService } from './orders-cron.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersCronService],
})
export class OrdersModule {}
