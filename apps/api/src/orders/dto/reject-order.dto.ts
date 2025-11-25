import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectOrderDto {
  @ApiProperty({
    example: 'Sin ingredientes disponibles',
    description: 'Reason for rejecting the order',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
