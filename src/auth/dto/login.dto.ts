import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  emailAddress: string;

  @IsNotEmpty()
  password: string;
}
