import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: () => void) {
    // Check if the JWT cookie exists
    const token = req.cookies?.jwt;

    console.log('token', token);
    if (!token) {
      // Handle the case where the JWT cookie is missing
      const response = new ApiResponseDto(
        [],
        true,
        'Unauthorized to perform the request',
        null,
        404,
      );
      return res.status(401).send(response);
    }

    try {
      // Verify and decode the JWT token
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      req.user = decoded; // Attach the decoded user information to the request object
      next();
    } catch (error) {
      console.error(
        `Error occurred while parsing jwt token using secret`,
        error,
      );
      // Handle the case where the JWT token is invalid
      const response = new ApiResponseDto(
        [],
        true,
        'Something went wrong while parsing the token.',
        null,
        500,
      );
      return res.status(500).send(response);
    }
  }
}
