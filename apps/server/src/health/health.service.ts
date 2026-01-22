import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'unknown' as 'ok' | 'error' | 'unknown',
    };

    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;
      status.database = 'ok';
    } catch (error) {
      status.database = 'error';
      status.status = 'error';
    }

    return status;
  }
}
