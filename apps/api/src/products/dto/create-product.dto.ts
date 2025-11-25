import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  restaurantId?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsInt()
  @Min(0)
  priceCents: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  prepTimeMinutes?: number;

  @IsOptional()
  @IsString()
  ingredients?: string;
}
