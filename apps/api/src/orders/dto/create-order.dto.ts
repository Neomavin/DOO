import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  @Min(0)
  priceCents: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @IsString()
  @IsNotEmpty()
  addressId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsInt()
  @Min(0)
  subtotalCents: number;

  @IsInt()
  @Min(0)
  taxCents: number;

  @IsInt()
  @Min(0)
  deliveryCents: number;

  @IsInt()
  @Min(0)
  totalCents: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  notes?: string;
}
