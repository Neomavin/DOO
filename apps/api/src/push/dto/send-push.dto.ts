import { IsArray, IsString, MinLength } from 'class-validator';

export class SendPushDto {
  @IsString()
  userId: string;

  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(5)
  body: string;
}

export class SendBulkPushDto {
  @IsArray()
  userIds: string[];

  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(5)
  body: string;
}
