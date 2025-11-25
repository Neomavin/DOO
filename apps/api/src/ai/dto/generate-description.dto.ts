import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateDescriptionDto {
  @IsString()
  @MaxLength(80)
  dishName: string;

  @IsOptional()
  @IsString()
  cuisineType?: string;

  @IsOptional()
  @IsString()
  ingredients?: string;

  @IsOptional()
  @IsString()
  tone?: string;
}
