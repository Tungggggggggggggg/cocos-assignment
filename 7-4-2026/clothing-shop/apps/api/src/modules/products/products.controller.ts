import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Get()
  async getAll() {
    return this.productsService.findAll();
  }
  @Get(':slug')
  async getDetail(@Param('slug') slug: string) {
    return this.productsService.findOneBySlug(slug);
  }
}
