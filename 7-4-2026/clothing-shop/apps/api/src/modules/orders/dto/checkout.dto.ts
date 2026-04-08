import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  addressLine: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsNotEmpty()
  district?: string;
}

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  cartId: string;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;
}
