import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data: unknown) => {
        let message = 'Request successful';
        let payload: unknown = data;

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const obj = data as Record<string, unknown>;
          const m = obj.message;
          if (typeof m === 'string') {
            message = m;
          }
          if (Object.prototype.hasOwnProperty.call(obj, 'data')) {
            payload = obj.data;
          }
        }

        return {
          status: 'success',
          message,
          data: payload,
          timestamp: new Date().toISOString(),
          path: req.url,
        };
      }),
    );
  }
}
