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
    const responseBody = exception.getResponse() as unknown;

    let message = 'An error occurred';
    // Default for string response bodies was 'ERROR' previously
    let errorCode = 'ERROR';

    if (typeof responseBody === 'string') {
      message = responseBody;
    } else if (responseBody && typeof responseBody === 'object') {
      const obj = responseBody as Record<string, unknown>;
      const m = obj.message;
      // When object, default to UNKNOWN unless explicit 'error' provided
      errorCode = 'UNKNOWN';
      if (typeof m === 'string') {
        message = m;
      } else if (Array.isArray(m)) {
        message = m.join(', ');
      }
      const e = obj.error;
      if (typeof e === 'string') {
        errorCode = e;
      }
    }

    response.status(status).json({
      status: 'error',
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
