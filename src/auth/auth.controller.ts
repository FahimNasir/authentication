import {
  Body,
  Controller,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { SignOutDto } from './dto/sign-out.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyForgotPasswordTokenDto } from './dto/verify-fp-token.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { ChangePasswordDto } from './dto/change-password.dto';

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
    @Request() req,
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

  @Post('/verifyFPToken')
  public async verifyForgetPasswordToken(
    @Body() body: VerifyForgotPasswordTokenDto,
  ): Promise<ApiResponseDto> {
    try {
      return await this.service.verifyForgetPasswordToken(body);
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

    // * New Password (using forget password)
  @Post('/changePasswordFPtoken')
  public async changePasswordFPtoken(
    @Body() body: NewPasswordDto,
  ): Promise<ApiResponseDto> {
    try {
      return this.service.changePasswordFPtoken(body);
    } catch (error) {
      return new ApiResponseDto(
        [],
        true,
        `Something wen't wrong while making the request`,
        error,
        500,
      );
    }
  }


    // * Update the existing Password 
    @Post('/changePassword')
    @UseGuards(AuthMiddleware)
    public async changePassword(
      @Request() req,
      @Response() res,
      @Body() body: ChangePasswordDto,
    ): Promise<ApiResponseDto> {
      try {
        console.log("User", req.user);
        const response = await this.service.changePassword(body, req.user.userId);

        if(!response.isError) {
          res.clearCookie('jwt');
        }

        return res.status(response.responseCode).send(response);
      } catch (error) {
        return new ApiResponseDto(
          [],
          true,
          `Something wen't wrong while making the request`,
          error,
          500,
        );
      }
    }


  // @Post('/createCustomer')
  // @UseGuards(AuthMiddleware)
  // public async createCustomer(
  //   @Request() req,
  //   @Body() body: CreateCustomerDto, {name, address, phoneNo}
  //   //Mongoose {createBy: User}
  // ): Promise<ApiResponseDto> {
  //   try {
  //     //req.user.id
  //     return this.service.createCustomer(body);
  //   } catch (error) {
  //     return new ApiResponseDto(
  //       [],
  //       true,
  //       `Something wen't wrong while making the request`,
  //       error,
  //       500,
  //     );
  //   }
  // }
}
