import { Controller, Get, Post, Body, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private readonly jwtService: JwtService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * SSO 코드 교환 (Backend Token Exchange)
   * Hub에서 받은 SSO 코드를 Hub Backend에 검증하고 로컬 토큰을 발급합니다.
   */
  @Post('auth/sso/exchange')
  async exchangeSsoCode(@Body() body: { code: string }) {
    const { code } = body;
    if (!code) throw new BadRequestException('SSO 코드가 필요합니다.');

    const hubBaseUrl = process.env.HUB_BASE_URL || 'https://ts-back-nest-479305.du.r.appspot.com';

    try {
      this.logger.log(`[SSO] Hub Backend에 코드 검증 요청: ${code.substring(0, 20)}...`);

      const response = await fetch(`${hubBaseUrl}/auth/sso/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, serviceId: 'teacheradmin' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new UnauthorizedException(result.message || 'SSO 코드가 유효하지 않습니다.');
      }

      const hubData = result.data || result;
      const memberId = hubData.memberId;

      if (!memberId) {
        throw new UnauthorizedException('SSO 인증 정보가 올바르지 않습니다.');
      }

      // TeacherAdmin 전용 토큰 직접 발급
      const accessToken = this.jwtService.sign({ jti: memberId, sub: 'ATK' });
      const refreshToken = this.jwtService.sign({ jti: memberId, sub: 'RTK' }, { expiresIn: '7d' });

      this.logger.log(`[SSO] TeacherAdmin 토큰 발급 완료 (memberId=${memberId})`);

      return {
        accessToken,
        refreshToken,
        tokenExpiry: 7200,
      };
    } catch (error) {
      this.logger.error(`[SSO] 코드 교환 에러: ${error.message}`);
      if (error instanceof UnauthorizedException) throw error;
      throw new BadRequestException('SSO 인증 처리 중 오류가 발생했습니다.');
    }
  }
}
