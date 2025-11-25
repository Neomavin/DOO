import { IsEmail, IsOptional, IsString, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @IsIn(['CLIENT', 'RESTAURANT', 'COURIER'], {
    message: 'Role must be CLIENT, RESTAURANT, or COURIER. ADMIN role cannot be registered via this endpoint.',
  })
  role?: string;
}
