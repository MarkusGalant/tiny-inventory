import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { EventBusService } from '../events/event-bus.service';
import { Prisma, Product } from '../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';

import {
  ProductDto,
  ProductListQueryDto,
  ProductListDto,
  CreateProductDto,
  UpdateProductDto,
} from './dto';
import { ProductCreatedEvent, ProductUpdatedEvent, ProductDeletedEvent } from './products.events';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  /**
   * Creates a new product with associated stores
   * @param createProductDto - Product creation data
   * @returns Created product with stores
   * @throws {BadRequestException} If duplicate store IDs are provided
   * @throws {NotFoundException} If any store ID doesn't exist
   */
  async create(createProductDto: CreateProductDto): Promise<ProductDto> {
    const createdProduct = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        category: createProductDto.category,
        price: createProductDto.price,
        stockQuantity: createProductDto.stockQuantity,
      },
    });

    const resource = this.createResource(createdProduct);
    await this.eventBus.emitEvent(new ProductCreatedEvent(resource));

    this.logger.log(`Product created successfully`, {
      productId: createdProduct.id,
    });

    return this.createResource(createdProduct);
  }

  /**
   * Lists products with filtering, sorting, and pagination
   * @param query - Query parameters for filtering and pagination
   * @returns Paginated list of products
   */
  async list(query: ProductListQueryDto): Promise<ProductListDto> {
    const {
      storeIds,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      skip = 1,
      take = 10,
    } = query;

    const where = this.buildWhereClause({
      storeIds,
      category,
      minPrice,
      maxPrice,
      search,
    });

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          storeProducts: {
            include: {
              store: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: data.map(this.createResource),
      total,
    };
  }

  /**
   * Finds a product by ID
   * @param id - Product UUID
   * @returns Product with store details
   * @throws {NotFoundException} If product doesn't exist
   */
  async findOne(id: string): Promise<ProductDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.createResource(product);
  }

  /**
   * Updates an existing product
   * @param id - Product UUID
   * @param updateProductDto - Product update data
   * @returns Updated product with stores
   * @throws {NotFoundException} If product or stores don't exist
   */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<void> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        name: updateProductDto.name,
        category: updateProductDto.category,
        price: updateProductDto.price,
        stockQuantity: updateProductDto.stockQuantity,
      },
    });

    const resource = this.createResource(updatedProduct);
    await this.eventBus.emitEvent(new ProductUpdatedEvent(resource));

    this.logger.log(`Product updated successfully`, {
      productId: id,
    });
  }

  /**
   * Deletes a product
   * @param id - Product UUID
   * @returns Success message
   * @throws {NotFoundException} If product doesn't exist
   */
  async remove(productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const deletedProduct = await this.prisma.product.delete({
      where: { id: productId },
    });

    const resource = this.createResource(deletedProduct);
    await this.eventBus.emitEvent(new ProductDeletedEvent(resource));

    this.logger.log(`Product deleted successfully`, {
      productId: productId,
    });
  }

  private createResource(product: Product): ProductDto {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      stockQuantity: product.stockQuantity,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      price: product.price.toNumber(),
    };
  }

  /**
   * Builds Prisma where clause from query parameters
   * @param filters - Filter parameters
   * @returns Prisma where input
   */
  private buildWhereClause(filters: {
    storeIds?: string[];
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};

    if (filters.storeIds) {
      where.storeProducts = {
        some: {
          storeId: { in: filters.storeIds },
        },
      };
    }

    if (filters.category) {
      where.category = {
        contains: filters.category,
        mode: 'insensitive',
      };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.search) {
      where.name = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    return where;
  }
}
