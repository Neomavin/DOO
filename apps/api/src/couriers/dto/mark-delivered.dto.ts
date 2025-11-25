import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkDeliveredDto {
  @ApiProperty({
    example: '1234',
    description: 'Confirmation code from customer',
    required: false,
  })
  @IsString()
  @IsOptional()
  confirmationCode?: string;
}
