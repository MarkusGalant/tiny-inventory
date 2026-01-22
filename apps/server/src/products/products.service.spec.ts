import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EventBusService } from '../events/event-bus.service';
import { Product } from '../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';

import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductCreatedEvent, ProductUpdatedEvent, ProductDeletedEvent } from './products.events';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProduct: Product = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    category: 'Electronics',
    price: { toNumber: () => 99.99 } as any,
    stockQuantity: 10,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockEventBusService = {
    emitEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EventBusService,
          useValue: mockEventBusService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product and emit ProductCreatedEvent', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        category: 'Electronics',
        price: 99.99,
        stockQuantity: 10,
      };

      mockPrismaService.product.create.mockResolvedValue(mockProduct);
      mockEventBusService.emitEvent.mockResolvedValue(undefined);

      const result = await service.create(createProductDto);

      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          name: createProductDto.name,
          category: createProductDto.category,
          price: createProductDto.price,
          stockQuantity: createProductDto.stockQuantity,
        },
      });

      expect(mockEventBusService.emitEvent).toHaveBeenCalledWith(expect.any(ProductCreatedEvent));

      expect(result).toEqual({
        id: mockProduct.id,
        name: mockProduct.name,
        category: mockProduct.category,
        stockQuantity: mockProduct.stockQuantity,
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
        price: 99.99,
      });
    });
  });

  describe('list', () => {
    it('should return paginated list of products', async () => {
      const query = {
        skip: 0,
        take: 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc' as const,
      };

      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
      mockPrismaService.product.count.mockResolvedValue(1);

      const result = await service.list(query);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          storeProducts: {
            include: {
              store: true,
            },
          },
        },
        orderBy: {
          [query.sortBy]: query.sortOrder,
        },
        skip: query.skip,
        take: query.take,
      });

      expect(result).toEqual({
        items: [
          {
            id: mockProduct.id,
            name: mockProduct.name,
            category: mockProduct.category,
            stockQuantity: mockProduct.stockQuantity,
            createdAt: mockProduct.createdAt,
            updatedAt: mockProduct.updatedAt,
            price: 99.99,
          },
        ],
        total: 1,
      });
    });

    it('should apply filters when provided', async () => {
      const query = {
        category: 'Electronics',
        minPrice: 50,
        maxPrice: 100,
        search: 'Test',
        skip: 0,
        take: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
      mockPrismaService.product.count.mockResolvedValue(1);

      await service.list(query);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: {
              contains: 'Electronics',
              mode: 'insensitive',
            },
            price: {
              gte: 50,
              lte: 100,
            },
            name: {
              contains: 'Test',
              mode: 'insensitive',
            },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const productId = mockProduct.id;

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne(productId);

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });

      expect(result).toEqual({
        id: mockProduct.id,
        name: mockProduct.name,
        category: mockProduct.category,
        stockQuantity: mockProduct.stockQuantity,
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
        price: 99.99,
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      const productId = 'non-existent-id';

      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne(productId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(productId)).rejects.toThrow(
        `Product with ID ${productId} not found`,
      );
    });
  });

  describe('update', () => {
    it('should update a product and emit ProductUpdatedEvent', async () => {
      const productId = mockProduct.id;
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 149.99,
      };

      const updatedProduct = {
        ...mockProduct,
        name: 'Updated Product',
        price: { toNumber: () => 149.99 } as any,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);
      mockEventBusService.emitEvent.mockResolvedValue(undefined);

      await service.update(productId, updateProductDto);

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: {
          name: updateProductDto.name,
          category: updateProductDto.category,
          price: updateProductDto.price,
          stockQuantity: updateProductDto.stockQuantity,
        },
      });

      expect(mockEventBusService.emitEvent).toHaveBeenCalledWith(expect.any(ProductUpdatedEvent));
    });

    it('should throw NotFoundException when product does not exist', async () => {
      const productId = 'non-existent-id';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.update(productId, updateProductDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a product and emit ProductDeletedEvent', async () => {
      const productId = mockProduct.id;

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);
      mockEventBusService.emitEvent.mockResolvedValue(undefined);

      await service.remove(productId);

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });

      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });

      expect(mockEventBusService.emitEvent).toHaveBeenCalledWith(expect.any(ProductDeletedEvent));
    });

    it('should throw NotFoundException when product does not exist', async () => {
      const productId = 'non-existent-id';

      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.remove(productId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(productId)).rejects.toThrow(
        `Product with ID ${productId} not found`,
      );
    });
  });
});
