import { NotFoundException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EventBusService } from '../events/event-bus.service';
import { Store } from '../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';

import { CreateStoreDto, UpdateStoreDto, AddProductDto, RemoveProductDto } from './dto';
import {
  StoreCreatedEvent,
  StoreUpdatedEvent,
  StoreDeletedEvent,
  StoreProductAddedEvent,
  StoreProductRemovedEvent,
} from './stores.events';
import { StoresService } from './stores.service';

describe('StoresService', () => {
  let service: StoresService;

  const mockStore: Store = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Store',
    address: '123 Test St',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPrismaService = {
    store: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    storeProduct: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  const mockEventBusService = {
    emitEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
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

    service = module.get<StoresService>(StoresService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a store and emit StoreCreatedEvent', async () => {
      const createStoreDto: CreateStoreDto = {
        name: 'Test Store',
        address: '123 Test St',
      };

      mockPrismaService.store.create.mockResolvedValue(mockStore);
      mockEventBusService.emitEvent.mockResolvedValue(undefined);

      const result = await service.create(createStoreDto);

      expect(mockPrismaService.store.create).toHaveBeenCalledWith({
        data: {
          name: createStoreDto.name,
          address: createStoreDto.address,
        },
      });

      expect(mockEventBusService.emitEvent).toHaveBeenCalledWith(expect.any(StoreCreatedEvent));

      expect(result).toEqual({
        id: mockStore.id,
        name: mockStore.name,
        address: mockStore.address,
        createdAt: mockStore.createdAt,
        updatedAt: mockStore.updatedAt,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated list of stores', async () => {
      const query = {
        skip: 0,
        take: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      mockPrismaService.store.findMany.mockResolvedValue([mockStore]);
      mockPrismaService.store.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(mockPrismaService.store.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: {
          [query.sortBy]: query.sortOrder,
        },
        skip: query.skip,
        take: query.take,
      });

      expect(result).toEqual({
        items: [
          {
            id: mockStore.id,
            name: mockStore.name,
            address: mockStore.address,
            createdAt: mockStore.createdAt,
            updatedAt: mockStore.updatedAt,
          },
        ],
        total: 1,
      });
    });

    it('should apply search filter when provided', async () => {
      const query = {
        search: 'Test',
        skip: 0,
        take: 10,
      };

      mockPrismaService.store.findMany.mockResolvedValue([mockStore]);
      mockPrismaService.store.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(mockPrismaService.store.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            name: {
              contains: 'Test',
              mode: 'insensitive',
            },
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a store by id', async () => {
      const storeId = mockStore.id;

      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);

      const result = await service.findOne(storeId);

      expect(mockPrismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: storeId },
      });

      expect(result).toEqual({
        id: mockStore.id,
        name: mockStore.name,
        address: mockStore.address,
        createdAt: mockStore.createdAt,
        updatedAt: mockStore.updatedAt,
      });
    });

    it('should throw NotFoundException when store does not exist', async () => {
      const storeId = 'non-existent-id';

      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.findOne(storeId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(storeId)).rejects.toThrow(`Store with ID ${storeId} not found`);
    });
  });

  describe('update', () => {
    it('should update a store and emit StoreUpdatedEvent', async () => {
      const storeId = mockStore.id;
      const updateStoreDto: UpdateStoreDto = {
        name: 'Updated Store',
        address: '456 Updated St',
      };

      const updatedStore = {
        ...mockStore,
        name: 'Updated Store',
        address: '456 Updated St',
      };

      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.store.update.mockResolvedValue(updatedStore);
      mockEventBusService.emitEvent.mockResolvedValue(undefined);

      await service.update(storeId, updateStoreDto);

      expect(mockPrismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: storeId },
      });

      expect(mockPrismaService.store.update).toHaveBeenCalledWith({
        where: { id: storeId },
        data: {
          name: updateStoreDto.name,
          address: updateStoreDto.address,
        },
      });

      expect(mockEventBusService.emitEvent).toHaveBeenCalledWith(expect.any(StoreUpdatedEvent));
    });

    it('should throw NotFoundException when store does not exist', async () => {
      const storeId = 'non-existent-id';
      const updateStoreDto: UpdateStoreDto = {
        name: 'Updated Store',
      };

      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.update(storeId, updateStoreDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a store and emit StoreDeletedEvent', async () => {
      const storeId = mockStore.id;

      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.store.delete.mockResolvedValue(mockStore);
      mockEventBusService.emitEvent.mockResolvedValue(undefined);

      await service.remove(storeId);

      expect(mockPrismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: storeId },
      });

      expect(mockPrismaService.store.delete).toHaveBeenCalledWith({
        where: { id: storeId },
      });

      expect(mockEventBusService.emitEvent).toHaveBeenCalledWith(expect.any(StoreDeletedEvent));
    });

    it('should throw NotFoundException when store does not exist', async () => {
      const storeId = 'non-existent-id';

      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.remove(storeId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(storeId)).rejects.toThrow('Store not found');
    });
  });

  describe('addProduct', () => {
    it('should add a product to a store and emit StoreProductAddedEvent', async () => {
      const storeId = mockStore.id;
      const addProductDto: AddProductDto = {
        productId: 'product-id-123',
      };

      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.storeProduct.findUnique.mockResolvedValue(null);
      mockPrismaService.storeProduct.create.mockResolvedValue({});
      mockPrismaService.store.findUnique
        .mockResolvedValueOnce(mockStore)
        .mockResolvedValueOnce(mockStore);
      mockEventBusService.emitEvent.mockResolvedValue(undefined);

      await service.addProduct(storeId, addProductDto);

      expect(mockPrismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: storeId },
      });

      expect(mockPrismaService.storeProduct.findUnique).toHaveBeenCalledWith({
        where: {
          storeId_productId: {
            storeId,
            productId: addProductDto.productId,
          },
        },
      });

      expect(mockPrismaService.storeProduct.create).toHaveBeenCalledWith({
        data: {
          storeId,
          productId: addProductDto.productId,
        },
      });

      expect(mockEventBusService.emitEvent).toHaveBeenCalledWith(
        expect.any(StoreProductAddedEvent),
      );
    });

    it('should throw NotFoundException when store does not exist', async () => {
      const storeId = 'non-existent-id';
      const addProductDto: AddProductDto = {
        productId: 'product-id-123',
      };

      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.addProduct(storeId, addProductDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when product already in store', async () => {
      const storeId = mockStore.id;
      const addProductDto: AddProductDto = {
        productId: 'product-id-123',
      };

      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.storeProduct.findUnique.mockResolvedValue({
        storeId,
        productId: addProductDto.productId,
      });

      await expect(service.addProduct(storeId, addProductDto)).rejects.toThrow(ConflictException);
      await expect(service.addProduct(storeId, addProductDto)).rejects.toThrow(
        'Product already in store',
      );
    });
  });

  describe('removeProduct', () => {
    it('should remove a product from a store and emit StoreProductRemovedEvent', async () => {
      const storeId = mockStore.id;
      const removeProductDto: RemoveProductDto = {
        productId: 'product-id-123',
      };

      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.storeProduct.findUnique.mockResolvedValue({
        storeId,
        productId: removeProductDto.productId,
      });
      mockPrismaService.storeProduct.delete.mockResolvedValue({});
      mockEventBusService.emitEvent.mockResolvedValue(undefined);

      await service.removeProduct(storeId, removeProductDto);

      expect(mockPrismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: storeId },
      });

      expect(mockPrismaService.storeProduct.findUnique).toHaveBeenCalledWith({
        where: {
          storeId_productId: {
            storeId,
            productId: removeProductDto.productId,
          },
        },
      });

      expect(mockPrismaService.storeProduct.delete).toHaveBeenCalledWith({
        where: {
          storeId_productId: {
            storeId,
            productId: removeProductDto.productId,
          },
        },
      });

      expect(mockEventBusService.emitEvent).toHaveBeenCalledWith(
        expect.any(StoreProductRemovedEvent),
      );
    });

    it('should throw NotFoundException when store does not exist', async () => {
      const storeId = 'non-existent-id';
      const removeProductDto: RemoveProductDto = {
        productId: 'product-id-123',
      };

      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.removeProduct(storeId, removeProductDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when product not in store', async () => {
      const storeId = mockStore.id;
      const removeProductDto: RemoveProductDto = {
        productId: 'product-id-123',
      };

      mockPrismaService.store.findUnique.mockResolvedValue(mockStore);
      mockPrismaService.storeProduct.findUnique.mockResolvedValue(null);

      await expect(service.removeProduct(storeId, removeProductDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.removeProduct(storeId, removeProductDto)).rejects.toThrow(
        'Product not in store',
      );
    });
  });

  describe('statistics', () => {
    it('should return store statistics', async () => {
      const storeId = mockStore.id;
      const mockStatistics = [
        {
          total_inventory_value: 1000.5,
          total_product_count: BigInt(10),
          total_stock_quantity: BigInt(100),
          average_product_price: 100.05,
        },
      ];

      mockPrismaService.store.findUnique.mockResolvedValue({ id: storeId });
      mockPrismaService.$queryRaw.mockResolvedValue(mockStatistics);

      const result = await service.statistics(storeId);

      expect(mockPrismaService.store.findUnique).toHaveBeenCalledWith({
        where: { id: storeId },
        select: { id: true },
      });

      expect(result).toEqual({
        totalInventoryValue: 1000.5,
        totalProductCount: 10,
        totalStockQuantity: 100,
        averageProductPrice: 100.05,
      });
    });

    it('should return zero statistics when no products in store', async () => {
      const storeId = mockStore.id;
      const mockStatistics = [
        {
          total_inventory_value: null,
          total_product_count: BigInt(0),
          total_stock_quantity: null,
          average_product_price: null,
        },
      ];

      mockPrismaService.store.findUnique.mockResolvedValue({ id: storeId });
      mockPrismaService.$queryRaw.mockResolvedValue(mockStatistics);

      const result = await service.statistics(storeId);

      expect(result).toEqual({
        totalInventoryValue: 0,
        totalProductCount: 0,
        totalStockQuantity: 0,
        averageProductPrice: 0,
      });
    });

    it('should throw NotFoundException when store does not exist', async () => {
      const storeId = 'non-existent-id';

      mockPrismaService.store.findUnique.mockResolvedValue(null);

      await expect(service.statistics(storeId)).rejects.toThrow(NotFoundException);
      await expect(service.statistics(storeId)).rejects.toThrow(
        `Store with ID ${storeId} not found`,
      );
    });

    it('should handle empty statistics result', async () => {
      const storeId = mockStore.id;

      mockPrismaService.store.findUnique.mockResolvedValue({ id: storeId });
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      const result = await service.statistics(storeId);

      expect(result).toEqual({
        totalInventoryValue: 0,
        totalProductCount: 0,
        totalStockQuantity: 0,
        averageProductPrice: 0,
      });
    });
  });
});
