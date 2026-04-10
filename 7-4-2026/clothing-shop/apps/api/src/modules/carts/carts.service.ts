import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class CartsService {
  constructor(private readonly db: DatabaseService) {}

  async getCartByUserId(userId: string) {
    const cartCheck = await this.db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cartCheck.rowCount === 0) {
      return { items: [] };
    }
    const cartId = cartCheck.rows[0].id;
    
    const itemsQuery = await this.db.query(
      `SELECT ci.variant_id, ci.quantity, pv.sku, pv.size, pv.color, pv.retail_price, 
              p.name as product_name, p.slug as product_slug 
       FROM cart_items ci
       JOIN product_variants pv ON pv.id = ci.variant_id
       JOIN products p ON p.id = pv.product_id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    return {
      cartId,
      items: itemsQuery.rows
    };
  }

  async addItemToCart(userId: string, variantId: string, quantity: number) {
    return this.db.transaction(async (client) => {
      let cartCheck = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
      let cartId;
      
      if (cartCheck.rowCount === 0) {
        const newCart = await client.query(
          'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
          [userId]
        );
        cartId = newCart.rows[0].id;
      } else {
        cartId = cartCheck.rows[0].id;
      }

      const invQuery = await client.query(
        'SELECT quantity_on_hand, quantity_reserved FROM inventory WHERE variant_id = $1',
        [variantId]
      );
      
      if (invQuery.rowCount === 0) {
        throw new BadRequestException('Sản phẩm không tồn tại trong hệ thống');
      }

      const available = invQuery.rows[0].quantity_on_hand - invQuery.rows[0].quantity_reserved;
      if (available < quantity) {
        throw new BadRequestException('Kho không đủ hàng cho số lượng này');
      }

      const existingItem = await client.query(
        'SELECT quantity FROM cart_items WHERE cart_id = $1 AND variant_id = $2',
        [cartId, variantId]
      );

      if (existingItem.rowCount && existingItem.rowCount > 0) {
        await client.query(
          'UPDATE cart_items SET quantity = quantity + $1, updated_at = NOW() WHERE cart_id = $2 AND variant_id = $3',
          [quantity, cartId, variantId]
        );
      } else {
        await client.query(
          'INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES ($1, $2, $3)',
          [cartId, variantId, quantity]
        );
      }

      return { success: true, cartId };
    });
  }

  async removeItemFromCart(userId: string, variantId: string) {
    const cartCheck = await this.db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cartCheck.rowCount === 0) {
      return { success: true };
    }
    const cartId = cartCheck.rows[0].id;
    
    await this.db.query(
      'DELETE FROM cart_items WHERE cart_id = $1 AND variant_id = $2',
      [cartId, variantId]
    );
    
    return { success: true };
  }
}
