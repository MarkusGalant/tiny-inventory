import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);

    jest.clearAllMocks();
    jest.spyOn(process, 'uptime').mockReturnValue(12345);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('check', () => {
    it('should return healthy status when database is connected', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.check();

      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: 12345,
        database: 'ok',
      });
      expect(new Date(result.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should return error status when database connection fails', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('Database connection failed'));

      const result = await service.check();

      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
      expect(result).toEqual({
        status: 'error',
        timestamp: expect.any(String),
        uptime: 12345,
        database: 'error',
      });
    });

    it('should include valid ISO timestamp', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.check();

      expect(() => new Date(result.timestamp)).not.toThrow();
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
