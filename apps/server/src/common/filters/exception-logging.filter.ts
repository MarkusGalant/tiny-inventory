import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import { Request, Response } from 'express';

@Catch()
export class ExceptionLoggingFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionLoggingFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };
    const message = exception instanceof Error ? exception.message : 'Unknown error';

    const traceId = trace.getActiveSpan()?.spanContext().traceId;
    const correlationId = request['correlationId'] || traceId || 'unknown';

    if (status >= 500) {
      this.logger.error({
        message,
        status,
        path: request.originalUrl,
        correlationId,
        traceId,
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    }

    if (status >= 400 && status < 500) {
      this.logger.warn({
        message,
        status,
        path: request.originalUrl,
        correlationId,
        traceId,
      });
    }

    response
      .status(status)
      .json(typeof errorResponse === 'object' ? { ...errorResponse } : { message: errorResponse });
  }
}
