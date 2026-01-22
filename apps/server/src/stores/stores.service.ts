import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';

import { EventBusService } from '../events/event-bus.service';
import { Prisma, Store } from '../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';

import {
  StoreDto,
  StoreListQueryDto,
  StoreListDto,
  CreateStoreDto,
  UpdateStoreDto,
  AddProductDto,
  RemoveProductDto,
  StoreStatisticsDto,
} from './dto';
import {
  StoreResource,
  StoreCreatedEvent,
  StoreUpdatedEvent,
  StoreDeletedEvent,
  StoreProductAddedEvent,
  StoreProductRemovedEvent,
} from './stores.events';

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  /**
   * Creates a new store
   * @param createStoreDto - Store creation data
   * @returns Created store
   */
  async create(createStoreDto: CreateStoreDto): Promise<StoreDto> {
    const createdStore = await this.prisma.store.create({
      data: {
        name: createStoreDto.name,
        address: createStoreDto.address,
      },
    });

    const resource = this.createResource(createdStore);
    await this.eventBus.emitEvent(new StoreCreatedEvent(resource));

    this.logger.log(`Store created successfully`, {
      storeId: createdStore.id,
    });

    return this.createResource(createdStore);
  }

  /**
   * Finds all stores with filtering, sorting, and pagination
   * @param query - Query parameters for filtering and pagination
   * @returns Paginated list of stores
   */
  async findAll(query: StoreListQueryDto): Promise<StoreListDto> {
    const { search, sortBy = 'updatedAt', sortOrder = 'desc', skip = 1, take = 10 } = query;

    const where = this.buildWhereClause({ search });

    const [data, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take,
      }),
      this.prisma.store.count({ where }),
    ]);

    return {
      items: data.map(this.createResource),
      total,
    };
  }

  /**
   * Finds a single store by ID
   * @param id - Store UUID
   * @returns Store details
   * @throws {NotFoundException} If store doesn't exist
   */
  async findOne(id: string): Promise<StoreDto> {
    const store = await this.prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return this.createResource(store);
  }

  /**
   * Updates an existing store
   * @param id - Store UUID
   * @param updateStoreDto - Store update data
   * @returns Updated store
   * @throws {NotFoundException} If store doesn't exist
   */
  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<void> {
    const existingStore = await this.prisma.store.findUnique({
      where: { id },
    });

    if (!existingStore) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    const updatedStore = await this.prisma.store.update({
      where: { id },
      data: {
        name: updateStoreDto.name,
        address: updateStoreDto.address,
      },
    });

    const event = new StoreUpdatedEvent(this.createResource(updatedStore));
    await this.eventBus.emitEvent(event);

    this.logger.log(`Store updated successfully`, {
      storeId: id,
    });
  }

  /**
   * Deletes a store
   * @param storeId - Store UUID
   * @returns Success message
   * @throws {NotFoundException} If store doesn't exist
   */
  async remove(storeId: string): Promise<void> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const deletedStore = await this.prisma.store.delete({
      where: { id: storeId },
    });

    const event = new StoreDeletedEvent(this.createResource(deletedStore));
    await this.eventBus.emitEvent(event);

    this.logger.log(`Store deleted successfully`, {
      storeId,
    });
  }

  /**
   * Adds a product to a store
   * @param storeId - Store UUID
   * @param addProductDto - Product addition data
   * @throws {NotFoundException} If store doesn't exist
   * @throws {ConflictException} If product already in store
   */
  async addProduct(storeId: string, addProductDto: AddProductDto): Promise<void> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const existingRelation = await this.prisma.storeProduct.findUnique({
      where: {
        storeId_productId: {
          storeId,
          productId: addProductDto.productId,
        },
      },
    });

    if (existingRelation) {
      throw new ConflictException(`Product already in store`);
    }

    await this.prisma.storeProduct.create({
      data: {
        storeId,
        productId: addProductDto.productId,
      },
    });

    const updatedStore = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    const resource = this.createResource(updatedStore!);

    await this.eventBus.emitEvent(new StoreProductAddedEvent(resource, addProductDto.productId));
  }

  /**
   * Removes a product from a store
   * @param storeId - Store UUID
   * @param removeProductDto - Product removal data
   * @throws {NotFoundException} If store or product doesn't exist
   * @throws {ConflictException} If product not in store
   */
  async removeProduct(storeId: string, removeProductDto: RemoveProductDto): Promise<void> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    const existingRelation = await this.prisma.storeProduct.findUnique({
      where: {
        storeId_productId: {
          storeId,
          productId: removeProductDto.productId,
        },
      },
    });

    if (!existingRelation) {
      throw new ConflictException(`Product not in store`);
    }

    await this.prisma.storeProduct.delete({
      where: {
        storeId_productId: {
          storeId,
          productId: removeProductDto.productId,
        },
      },
    });

    await this.eventBus.emitEvent(
      new StoreProductRemovedEvent(storeId, removeProductDto.productId),
    );
  }

  /**
   * Calculates statistics for a store
   * @param storeId - Store UUID
   * @returns Inventory statistics including total value, product count, stock quantity, and average price
   * @throws {NotFoundException} If store doesn't exist
   */
  async statistics(storeId: string): Promise<StoreStatisticsDto> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    // Define result type for better type safety
    type StatisticsResult = {
      total_inventory_value: number | null;
      total_product_count: bigint | string | number;
      total_stock_quantity: bigint | string | number | null;
      average_product_price: number | null;
    };

    const statisticsResult = await this.prisma.$queryRaw<StatisticsResult[]>`
      SELECT 
        COALESCE(SUM(p.price * p."stockQuantity"), 0)::numeric as total_inventory_value,
        COUNT(DISTINCT p.id)::bigint as total_product_count,
        COALESCE(SUM(p."stockQuantity"), 0)::bigint as total_stock_quantity,
        COALESCE(AVG(p.price), 0)::numeric as average_product_price
      FROM products p
      INNER JOIN store_products sp ON p.id = sp."productId"
      WHERE sp."storeId"::text = ${storeId}
    `;

    // Validate result exists and extract first row
    if (!statisticsResult || statisticsResult.length === 0) {
      this.logger.error(`No statistics found for store ${storeId}`);

      return {
        totalInventoryValue: 0,
        totalProductCount: 0,
        totalStockQuantity: 0,
        averageProductPrice: 0,
      };
    }

    const stats = statisticsResult[0];

    // Safely convert database types to JavaScript numbers
    // Handle bigint conversion and null values with proper fallbacks
    const totalInventoryValue = stats.total_inventory_value ?? 0;
    const totalProductCount = Number(stats.total_product_count) || 0;
    const totalStockQuantity = Number(stats.total_stock_quantity) || 0;
    const averageProductPrice = stats.average_product_price ?? 0;

    this.logger.log(`Inventory statistics calculated for store`, {
      storeId,
      totalInventoryValue,
      totalProductCount,
    });

    return {
      totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      totalProductCount,
      totalStockQuantity,
      averageProductPrice: Number(averageProductPrice.toFixed(2)),
    };
  }

  private createResource(store: Store): StoreResource {
    return {
      id: store.id,
      name: store.name,
      address: store.address,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    };
  }

  /**
   * Builds Prisma where clause from query parameters
   * @param filters - Filter parameters
   * @returns Prisma where input
   */
  private buildWhereClause(filters: { search?: string }): Prisma.StoreWhereInput {
    const where: Prisma.StoreWhereInput = {};

    if (filters.search) {
      where.name = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    return where;
  }
}
