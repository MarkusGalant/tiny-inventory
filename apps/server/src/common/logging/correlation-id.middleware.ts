import { Injectable, NestMiddleware } from '@nestjs/common';
import { context, propagation, trace } from '@opentelemetry/api';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const parentContext = propagation.extract(context.active(), req.headers);
    context.with(parentContext, () => {
      const traceId = trace.getActiveSpan()?.spanContext().traceId || 'unknown';
      req['correlationId'] = traceId;
      res.setHeader('x-correlation-id', traceId);
      propagation.inject(context.active(), res.getHeaders());
      next();
    });
  }
}
