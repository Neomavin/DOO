import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeliverOrderDto {
  @ApiProperty({
    example: '1234',
    description: 'Confirmation code from customer (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  confirmationCode?: string;
}
