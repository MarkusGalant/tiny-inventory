import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import {
  StoreDto,
  StoreListDto,
  StoreListQueryDto,
  CreateStoreDto,
  UpdateStoreDto,
  AddProductDto,
  StoreStatisticsDto,
} from './dto';
import { StoresService } from './stores.service';

@ApiTags('stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new store', operationId: 'create' })
  @ApiResponse({ status: 201, description: 'Store created successfully', type: StoreDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  @ApiOperation({ summary: 'List of stores with pagination', operationId: 'list' })
  @ApiResponse({ status: 200, description: 'List of stores with pagination', type: StoreListDto })
  list(@Query() query: StoreListQueryDto) {
    return this.storesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a store by ID', operationId: 'findOne' })
  @ApiResponse({ status: 200, description: 'Store found', type: StoreDto })
  @ApiResponse({ status: 404, description: 'Store not found' })
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a store', operationId: 'delete' })
  @ApiResponse({ status: 200, description: 'Store updated successfully' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a store', operationId: 'deleteStore' })
  @ApiResponse({ status: 204, description: 'Store deleted successfully' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  remove(@Param('id') id: string) {
    return this.storesService.remove(id);
  }

  @Post(':id/products')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add a product to a store', operationId: 'addProduct' })
  @ApiResponse({ status: 204, description: 'Product added to store successfully' })
  @ApiResponse({ status: 404, description: 'Store or product not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  addProduct(@Param('id') id: string, @Body() addProductDto: AddProductDto) {
    return this.storesService.addProduct(id, addProductDto);
  }

  @Delete(':id/products/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a product from a store', operationId: 'removeProduct' })
  @ApiResponse({ status: 204, description: 'Product removed from store successfully' })
  @ApiResponse({ status: 404, description: 'Store or product not found' })
  removeProduct(@Param('id') id: string, @Param('productId') productId: string) {
    return this.storesService.removeProduct(id, { productId });
  }

  @Get(':id/statistics')
  @ApiOperation({
    summary: 'Get inventory statistics for a store',
    description:
      'Returns comprehensive inventory metrics including total value, product counts, stock quantities, and average price. This is a non-trivial operation that performs aggregations and computations using raw SQL queries.',
    operationId: 'statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory statistics retrieved successfully',
    type: StoreStatisticsDto,
  })
  @ApiResponse({ status: 404, description: 'Store not found' })
  statistics(@Param('id') id: string) {
    return this.storesService.statistics(id);
  }
}
