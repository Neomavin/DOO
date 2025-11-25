import { IsIn, IsString } from 'class-validator';

export const ORDER_STATUSES = [
  'NEW',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'PICKED_UP',
  'ON_ROUTE',
  'DELIVERED',
  'CANCELLED',
] as const;

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(ORDER_STATUSES)
  status: (typeof ORDER_STATUSES)[number];
}
