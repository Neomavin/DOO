import { IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateScheduleDto {
  @ApiProperty({
    example: '08:00',
    description: 'Opening time in HH:MM format',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'openTime must be in HH:MM format (e.g., 08:00)',
  })
  openTime?: string;

  @ApiProperty({
    example: '22:00',
    description: 'Closing time in HH:MM format',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'closeTime must be in HH:MM format (e.g., 22:00)',
  })
  closeTime?: string;

  @ApiProperty({
    example: '0,6',
    description: 'Closed days (0=Sunday, 1=Monday, ..., 6=Saturday). Comma-separated.',
    required: false,
  })
  @IsString()
  @IsOptional()
  closedDays?: string;
}
