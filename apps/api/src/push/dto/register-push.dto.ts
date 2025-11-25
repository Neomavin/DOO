import { IsString, MinLength } from 'class-validator';

export class RegisterPushDto {
  @IsString()
  @MinLength(10)
  pushToken: string;
}
