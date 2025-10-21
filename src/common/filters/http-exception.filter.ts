import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); //context
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const res: any = exception.getResponse();

    const message =
      typeof res === 'string' ? res : res.message || 'An error occurred';

    response.status(status).json({
      status: 'error',
      message,
      errorCode: typeof res === 'string' ? 'ERROR' : res.error || 'UNKNOWN',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
