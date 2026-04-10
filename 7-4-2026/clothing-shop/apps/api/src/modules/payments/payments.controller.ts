import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  async handleWebhook(
    @Body() body: { orderId: string; gatewayRef: string; status: string },
  ) {
    if (body.status === 'success') {
      return this.paymentsService.confirmPaymentWebhook(body.orderId);
    }
    return { status: 'ignored' };
  }
}
