import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(
    Prisma.PrismaClientKnownRequestError,
    Prisma.PrismaClientUnknownRequestError,
    Prisma.PrismaClientRustPanicError,
    Prisma.PrismaClientInitializationError,
    Prisma.PrismaClientValidationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(PrismaExceptionFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = '데이터베이스 오류가 발생했습니다.';

        if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2002':
                    status = HttpStatus.CONFLICT;
                    message = '이미 존재하는 데이터입니다.';
                    break;
                case 'P2025':
                    status = HttpStatus.NOT_FOUND;
                    message = '데이터를 찾을 수 없습니다.';
                    break;
                case 'P2003':
                    status = HttpStatus.BAD_REQUEST;
                    message = '연관된 데이터가 존재하지 않습니다.';
                    break;
                default:
                    this.logger.error(`Prisma error ${exception.code}: ${exception.message}`);
            }
        } else if (exception instanceof Prisma.PrismaClientInitializationError) {
            this.logger.error(`DB 연결 실패: ${exception.message}`);
            message = '데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.';
        } else if (exception instanceof Prisma.PrismaClientValidationError) {
            status = HttpStatus.BAD_REQUEST;
            message = '잘못된 데이터 형식입니다.';
            this.logger.warn(`Prisma validation error: ${exception.message}`);
        } else {
            this.logger.error(`Unknown Prisma error: ${exception.message}`);
        }

        response.status(status).json({
            statusCode: status,
            message,
            error: HttpStatus[status],
        });
    }
}
