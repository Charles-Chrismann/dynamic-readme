import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    const token = request.cookies?.auth_token;
    
    if (
      !token ||
      this.config.getOrThrow('API_AUTH_TOKEN') !== token
    ) {
      response.redirect('/login');
      return false;
    }

    return true;
  }
}