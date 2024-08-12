import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService){}

  async verify(token: string) {
    return this.jwtService.verifyAsync(token)
  }
}
