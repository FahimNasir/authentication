import { Body, Controller, Post, Request, Response } from '@nestjs/common';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { SignOutDto } from './dto/sign-out.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('/login')
  public async login(
    @Request() req,
    @Response() res,
    @Body() body: LoginDto,
  ): Promise<ApiResponseDto> {
    try {
      const result = await this.service.login(body);

      const { data, isError, message, errorDetails, responseCode } = result;
      res.cookie('jwt', data.token);
      return res
        .status(responseCode)
        .send(
          new ApiResponseDto(
            data.response,
            isError,
            message,
            errorDetails,
            responseCode,
          ),
        );
    } catch (error) {
      console.error(error);
      return new ApiResponseDto(
        [],
        true,
        `Something wen't wrong while making the request`,
        error,
        500,
      );
    }
  }

  @Post('/signup')
  public async signUp(
    @Response() res,
    @Body() body: SignUpDto,
  ): Promise<ApiResponseDto> {
    try {
      const result = await this.service.signUp(body);

      const { data, isError, message, errorDetails, responseCode } = result;
      console.log('before setting cookie');
      res.cookie('jwt', data.token);
      console.log('after setting cookie');

      return res
        .status(responseCode)
        .send(
          new ApiResponseDto(
            data.response,
            isError,
            message,
            errorDetails,
            responseCode,
          ),
        );
    } catch (error) {
      console.error(error);
      return new ApiResponseDto(
        [],
        true,
        `Something wen't wrong while making the request`,
        error,
        500,
      );
    }
  }

  @Post('/signout')
  public async signout(
    @Response() res,
    @Body() body: SignOutDto,
  ): Promise<ApiResponseDto> {
    try {
      const result = await this.service.signout(body);
      if (!result.isError) {
        res.clearCookie('jwt');
        return res.status(result.responseCode).send(result);
      }

      return res.send(result);
    } catch (error) {
      console.error(error);
      return new ApiResponseDto(
        [],
        true,
        `Something wen't wrong while making the request`,
        error,
        500,
      );
    }
  }

  @Post('/forgotpassword')
  public async forgotPassword(
    @Body() body: ForgotPasswordDto,
  ): Promise<ApiResponseDto> {
    try {
      return await this.service.forgotPassword(body);
    } catch (error) {
      console.error(error);
      return new ApiResponseDto(
        [],
        true,
        `Something wen't wrong while making the request`,
        error,
        500,
      );
    }
  }
}
