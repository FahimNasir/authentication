import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { DatabaseService } from 'src/database/database.service';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtService } from '@nestjs/jwt';
import { SignOutDto } from './dto/sign-out.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailService } from 'src/mail/mail.service';
import { VerifyForgotPasswordTokenDto } from './dto/verify-fp-token.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly mailService: MailService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  private async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  private generateRandom6DigitNumber() {
    // Generate a random number between 100,000 and 999,999
    const randomNumber = Math.floor(Math.random() * 900000) + 100000;
    // Convert the number to a string and return it
    return randomNumber.toString();
  }

  public async login(user: LoginDto): Promise<ApiResponseDto> {
    let responseCode = 500;
    let message = ``;

    const { emailAddress, password } = user;

    const dbUser = await this.db.appUser.findFirst({ where: { emailAddress } });

    // * Check if user exists
    if (!dbUser) {
      responseCode = 404;
      message = `No user exists with email: ${emailAddress}`;
      return new ApiResponseDto([], true, message, null, responseCode);
    }

    // * If user exists, compare the password
    const passwordCorrect = await this.comparePasswords(
      password,
      dbUser.password,
    );
    if (!passwordCorrect) {
      responseCode = 400;
      message = `Invalid password provided for ${emailAddress}`;
      return new ApiResponseDto([], true, message, null, responseCode);
    }

    responseCode = 200;
    message = `User logged in successfully!`;

    await this.db.appUser.update({
      data: { isLoggedIn: true },
      where: { id: dbUser.id },
    });

    const appUserRoles = await this.db.appUserRoles.findMany({where: {userId: dbUser.id}, select: {roleId: true}});

    
    const appUserStringArray = [];
    appUserRoles.forEach(item => {
      appUserStringArray.push(item);
    });

    const userPermissions = await this.db.rolePermissions.findMany({where: {roleId: {in: appUserStringArray}}});

    const { id, name } = dbUser;

    const response = {
      userId: id,
      emailAddress,
      name,
      userPermissions,
      appUserRoles
    };

    const token = this.jwt.sign(response, { secret: process.env.JWT_SECRET });
    console.log(`token`, token);

    return new ApiResponseDto(
      { response, token },
      false,
      message,
      null,
      responseCode,
    );
  }

  public async signUp(user: SignUpDto): Promise<ApiResponseDto> {
    let message = ``;
    let code = 500;
    const { emailAddress, password, name } = user;

    const existingUser = await this.db.appUser.findFirst({
      where: { emailAddress },
    });

    if (existingUser) {
      code = 400;
      message = `User already exists with email: ${emailAddress}`;
      return new ApiResponseDto([], true, message, null, code);
    }

    const hashedPassword = await this.hashPassword(password);
    const newUser = await this.db.appUser.create({
      data: {
        emailAddress,
        isLoggedIn: true,
        name,
        password: hashedPassword,
      },
      select: {
        emailAddress: true,
        name: true,
        id: true,
      },
    });

    const response = {
      userId: newUser.id,
      emailAddress,
      name,
    };

    const token = this.jwt.sign(response, { secret: process.env.JWT_SECRET });

    code = 201;
    message = `User created successfully!`;
    return new ApiResponseDto({ response, token }, false, message, null, code);
  }

  public async signout(user: SignOutDto): Promise<ApiResponseDto> {
    const { userId, emailAddress } = user;

    const dbUser = await this.db.appUser.findFirst({
      where: { emailAddress, id: userId, isLoggedIn: true },
    });

    if (!dbUser) {
      return new ApiResponseDto(
        [],
        true,
        `No user found with sent information`,
        null,
        400,
      );
    }

    await this.db.appUser.update({
      data: { isLoggedIn: false },
      where: { id: userId },
    });

    return new ApiResponseDto(
      { emailAddress },
      false,
      `User logged out successfully`,
      null,
      200,
    );
  }

  public async forgotPassword(
    user: ForgotPasswordDto,
  ): Promise<ApiResponseDto> {
    const { emailAddress } = user;

    const dbUser = await this.db.appUser.findFirst({ where: { emailAddress } });

    if (!dbUser) {
      return new ApiResponseDto(
        [],
        true,
        `No registration found with email: ${emailAddress}`,
        null,
        404,
      );
    }

    const token = this.generateRandom6DigitNumber();

    const userToken = await this.db.userToken.findFirst({
      where: { isVerified: false, emailAddress },
    });

    if (userToken) {
      await this.db.userToken.update({
        data: { token },
        where: { id: userToken.id },
      });
    } else {
      await this.db.userToken.create({
        data: {
          emailAddress,
          isVerified: false,
          token,
          userId: dbUser.id,
        },
      });
    }

    // Send it to user's email address.
    await this.mailService.sendEmail(
      emailAddress,
      `Email Verification Token: Movie Booking`,
      `Your verification code is ${token}`,
    );

    return new ApiResponseDto(
      { emailAddress },
      false,
      `Token sent over email for verification`,
      null,
      200,
    );
  }

  public async verifyForgetPasswordToken(
    user: VerifyForgotPasswordTokenDto,
  ): Promise<ApiResponseDto> {
    const { emailAddress, token } = user;

    const dbUser = await this.db.appUser.findFirst({
      where: { emailAddress },
      select: { id: true },
    });

    const userToken = await this.db.userToken.findFirst({
      where: { emailAddress, token, isVerified: false, userId: dbUser.id },
    });

    if (!userToken) {
      return new ApiResponseDto(
        [],
        true,
        `Token can't be verified by provided code for email: ${emailAddress}`,
        null,
        404,
      );
    }

    await this.db.userToken.update({
      data: { isVerified: true, updatedAt: new Date() },
      where: { id: userToken.id },
    });

    return new ApiResponseDto(
      { emailAddress },
      false,
      `Token verified successfully!`,
      null,
      200,
    );
  }

  // * New Password (using forget password)
  public async changePasswordFPtoken(
    body: NewPasswordDto,
  ): Promise<ApiResponseDto> {
    const { emailAddress, newPassword } = body;

    const dbUser = await this.db.appUser.findFirst({
      where: { emailAddress },
      select: { id: true },
    });
    if (!dbUser) {
      return new ApiResponseDto(
        [],
        true,
        'No user Found for this email',
        null,
        400,
      );
    }

    const userToken = await this.db.userToken.findFirst({
      where: { emailAddress, isVerified: true, userId: dbUser.id },
    });

    if (!userToken) {
      return new ApiResponseDto(
        [],
        true,
        'No Verification Code was used for this Email',
        null,
        404,
      );
    }
    const hashedPassword = await this.hashPassword(newPassword);
    const changedUser = await this.db.appUser.update({
      data: { password: hashedPassword, updatedAt: new Date() },
      where: { id: userToken.userId, emailAddress: userToken.emailAddress },
    });
    await this.db.userToken.delete({
      where: { id: userToken.id, userId: changedUser.id },
    });

    return new ApiResponseDto(
      { emailAddress },
      false,
      'Password Changed Successfully',
      null,
      201,
    );
  }

  // * Update the existing Password (using protected route)
  public async changePassword(
    body: ChangePasswordDto,
    userId: string,
  ): Promise<ApiResponseDto> {
    const { newPassword } = body;

    const dbUser = await this.db.appUser.findFirst({
      where: { id: userId, isLoggedIn: true },
    });

    if (!dbUser) {
      return new ApiResponseDto([], true, `Unable to find user`, null, 404);
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.db.appUser.update({
      data: { password: hashedPassword, updatedAt: new Date() },
      where: { id: userId },
    });

    return new ApiResponseDto(
      { emailAddress: dbUser.emailAddress },
      false,
      'Password Changed Successfully',
      null,
      201,
    );

    // * before changing the password, check the following first.
    // * If the new and old password aren't the same.
    // * Generate a notification to authorize the operation via 2FA
    // * Get the old password from them too.
    // * We may keep a validity for password change.
    // * We may utilize sending a token on user's email for changing password
    // Log the user out.
  }
}
