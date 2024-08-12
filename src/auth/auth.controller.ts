import { Controller, Get, Param, Query } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { RedisService } from 'src/redis/redis.service';

@Controller('auth')
export class AuthController {

    constructor(private jwtService: JwtService, private redis: RedisService){}

    @Get('/auth')
    async auth(@Query('code') code: string) {
      const access = await axios.get(`https://github.com/login/oauth/access_token?client_id=${process.env.GH_APP_CLIENT_ID}&client_secret=${process.env.GH_APP_CLIENT_SECRET_ID}&code=${code}`, { headers: { Accept: "application/json" } })
      const user = await axios.get("https://api.github.com/user", { headers: { Authorization: `Bearer ${access.data.access_token}` } })
      console.log(user.data)

      const { id, login, avatar_url } = user.data

      const userData = {
        id,
        login,
        avatar_url,
        created_at: new Date().toISOString()
      }

      try {
        const existingUser = await this.redis.client.hGet(`user:${id}`, 'id')
        
        if(!existingUser) await this.redis.client.hSet(`user:${id}`, userData)
      } catch(e) {
        console.log(e)
      }

      return {
        access_token: await this.jwtService.signAsync(userData),
      };
    }
  }
