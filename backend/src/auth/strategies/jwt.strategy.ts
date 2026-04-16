import { Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadType } from '../types/jwt-payload.type';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(configService: ConfigService) {
        const secret = configService.get<string>('AUTH_SECRET') || 'teacher-admin-secret-key';
        // Hub Backend는 secret을 base64 디코딩한 Buffer로 서명하므로 동일하게 처리
        const secretBuffer = Buffer.from(secret, 'base64');
        super({
            jwtFromRequest: JwtStrategy.extractJwtFromRequestOrCookie,
            secretOrKey: secretBuffer,
            algorithms: ['HS512'],
        });
    }

    private static extractJwtFromRequestOrCookie(req: Request): string | null {
        const authHeader = req.headers?.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        if (req.cookies?.access_token) {
            return req.cookies.access_token;
        }
        return null;
    }

    public validate(payload: JwtPayloadType): JwtPayloadType | never {
        if (!payload.jti) {
            throw new UnauthorizedException('Invalid token payload');
        }
        return payload;
    }
}
