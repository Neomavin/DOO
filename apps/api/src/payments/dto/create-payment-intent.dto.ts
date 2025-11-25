import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsInt()
  @Min(100)
  amountCents: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class ConfirmPaymentDto {
  @IsString()
  paymentIntentId: string;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}

export class RefundPaymentDto {
  @IsString()
  paymentIntentId: string;

  @IsOptional()
  @IsInt()
  @Min(100)
  amountCents?: number;
}
