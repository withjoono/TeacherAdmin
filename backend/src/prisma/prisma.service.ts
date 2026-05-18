import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
        });
    }

    async onModuleInit() {
        if (!process.env.DATABASE_URL) {
            this.logger.error('DATABASE_URL이 설정되지 않았습니다. 모든 DB 쿼리가 실패합니다.');
            return;
        }

        try {
            await this.$connect();
            this.logger.log('Teacher Admin 데이터베이스 연결 성공');
        } catch (error) {
            this.logger.error(`데이터베이스 연결 실패 (앱은 계속 실행됨): ${error.message}`);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
