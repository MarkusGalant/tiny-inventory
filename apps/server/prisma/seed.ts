import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

import { PrismaClient } from '../src/prisma/generated/client';

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.storeProduct.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();

  // Create all products first (without store associations)
  const allProducts = [
    {
      name: 'Wireless Mouse',
      category: 'Electronics',
      price: 29.99,
      stockQuantity: 45,
    },
    {
      name: 'USB-C Cable',
      category: 'Electronics',
      price: 19.99,
      stockQuantity: 120,
    },
    {
      name: 'Laptop Stand',
      category: 'Accessories',
      price: 49.99,
      stockQuantity: 30,
    },
    {
      name: 'Bluetooth Keyboard',
      category: 'Electronics',
      price: 79.99,
      stockQuantity: 25,
    },
    {
      name: 'Monitor 27"',
      category: 'Electronics',
      price: 299.99,
      stockQuantity: 15,
    },
    {
      name: 'Office Chair',
      category: 'Furniture',
      price: 199.99,
      stockQuantity: 20,
    },
    {
      name: 'Desk Lamp',
      category: 'Furniture',
      price: 39.99,
      stockQuantity: 50,
    },
    {
      name: 'Notebook Pack',
      category: 'Stationery',
      price: 12.99,
      stockQuantity: 100,
    },
    {
      name: 'Ballpoint Pens (12-pack)',
      category: 'Stationery',
      price: 8.99,
      stockQuantity: 200,
    },
    {
      name: 'Desk Organizer',
      category: 'Furniture',
      price: 24.99,
      stockQuantity: 40,
    },
    {
      name: 'Travel Adapter',
      category: 'Electronics',
      price: 24.99,
      stockQuantity: 60,
    },
    {
      name: 'Portable Charger',
      category: 'Electronics',
      price: 39.99,
      stockQuantity: 35,
    },
    {
      name: 'Travel Pillow',
      category: 'Travel',
      price: 19.99,
      stockQuantity: 80,
    },
    {
      name: 'Luggage Tag',
      category: 'Travel',
      price: 4.99,
      stockQuantity: 150,
    },
    {
      name: 'Phone Case',
      category: 'Accessories',
      price: 29.99,
      stockQuantity: 90,
    },
    {
      name: 'Screen Protector',
      category: 'Accessories',
      price: 14.99,
      stockQuantity: 5, // Low stock item
    },
    {
      name: 'Low Stock Item 1',
      category: 'Electronics',
      price: 99.99,
      stockQuantity: 3,
    },
    {
      name: 'Low Stock Item 2',
      category: 'Accessories',
      price: 49.99,
      stockQuantity: 7,
    },
  ];

  // Insert all products at once
  await prisma.product.createMany({
    data: allProducts,
  });

  console.log('Created all products');

  // Fetch all created products to get their IDs
  const createdProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
  });

  // Create stores first
  const store1 = await prisma.store.create({
    data: {
      name: 'Downtown Store',
      address: '123 Main Street, Downtown, CA 90210',
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Shopping Mall Branch',
      address: '456 Commerce Blvd, Shopping District, CA 90211',
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Airport Terminal',
      address: '789 Travel Way, Airport Plaza, CA 90212',
    },
  });

  // Create store-product relationships
  await prisma.storeProduct.createMany({
    data: [
      // Store 1: Products 0-7
      ...createdProducts.slice(0, 8).map((p) => ({
        storeId: store1.id,
        productId: p.id,
      })),
      // Store 2: Products 4-9 and product 17
      ...createdProducts.slice(4, 10).map((p) => ({
        storeId: store2.id,
        productId: p.id,
      })),
      {
        storeId: store2.id,
        productId: createdProducts[17].id,
      },
      // Store 3: Products 10-15
      ...createdProducts.slice(10, 16).map((p) => ({
        storeId: store3.id,
        productId: p.id,
      })),
    ],
  });
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
