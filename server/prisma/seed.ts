import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const stores = [
  {
    name: 'Downtown Electronics Hub',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    phone: '(415) 555-0100',
    email: 'downtown@tinyinventory.com',
  },
  {
    name: 'Suburban Home & Garden',
    address: '456 Oak Avenue',
    city: 'Palo Alto',
    state: 'CA',
    zipCode: '94301',
    phone: '(650) 555-0200',
    email: 'suburban@tinyinventory.com',
  },
  {
    name: 'Sports & Outdoors Warehouse',
    address: '789 Industrial Blvd',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94607',
    phone: '(510) 555-0300',
    email: 'warehouse@tinyinventory.com',
  },
];

const productTemplates = {
  Electronics: [
    { name: 'Wireless Bluetooth Headphones', price: 79.99, minStock: 15 },
    { name: 'USB-C Charging Cable 6ft', price: 14.99, minStock: 50 },
    { name: 'Portable Power Bank 10000mAh', price: 34.99, minStock: 25 },
    { name: 'Mechanical Gaming Keyboard', price: 129.99, minStock: 10 },
    { name: 'Wireless Mouse', price: 29.99, minStock: 30 },
    { name: '4K HDMI Cable 10ft', price: 19.99, minStock: 40 },
  ],
  Clothing: [
    { name: 'Cotton T-Shirt Basic', price: 19.99, minStock: 50 },
    { name: 'Denim Jeans Classic Fit', price: 49.99, minStock: 25 },
    { name: 'Hooded Sweatshirt', price: 39.99, minStock: 30 },
    { name: 'Athletic Running Shorts', price: 24.99, minStock: 35 },
    { name: 'Wool Blend Socks 3-Pack', price: 12.99, minStock: 60 },
  ],
  'Home & Garden': [
    { name: 'Stainless Steel Water Bottle', price: 24.99, minStock: 40 },
    { name: 'LED Desk Lamp Adjustable', price: 44.99, minStock: 20 },
    { name: 'Indoor Plant Pot Ceramic', price: 18.99, minStock: 35 },
    { name: 'Garden Tool Set 5-Piece', price: 32.99, minStock: 15 },
    { name: 'Throw Blanket Fleece', price: 29.99, minStock: 25 },
  ],
  Sports: [
    { name: 'Yoga Mat Premium', price: 34.99, minStock: 20 },
    { name: 'Resistance Bands Set', price: 19.99, minStock: 30 },
    { name: 'Foam Roller 18-inch', price: 24.99, minStock: 25 },
    { name: 'Jump Rope Speed', price: 12.99, minStock: 40 },
    { name: 'Dumbbell Set 20lb', price: 54.99, minStock: 10 },
  ],
  Books: [
    { name: 'Programming Fundamentals Guide', price: 39.99, minStock: 15 },
    { name: 'Modern Web Development', price: 44.99, minStock: 12 },
    { name: 'Data Science Handbook', price: 49.99, minStock: 10 },
    { name: 'Business Strategy Essentials', price: 29.99, minStock: 20 },
    { name: 'Creative Writing Workshop', price: 24.99, minStock: 18 },
  ],
};

function generateSKU(category: string, index: number, storeIndex: number): string {
  const prefix = category.substring(0, 3).toUpperCase();
  return `${prefix}-${String(storeIndex + 1).padStart(2, '0')}-${String(index + 1).padStart(4, '0')}`;
}

function randomQuantity(minStock: number): number {
  // 70% chance of being above minStock, 30% chance of being at or below
  if (Math.random() < 0.7) {
    return minStock + Math.floor(Math.random() * 50) + 1;
  }
  return Math.floor(Math.random() * minStock);
}

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();

  // Create stores
  const createdStores = await Promise.all(
    stores.map((store) => prisma.store.create({ data: store }))
  );

  console.log(`Created ${createdStores.length} stores`);

  // Create products for each store
  let totalProducts = 0;
  for (let storeIndex = 0; storeIndex < createdStores.length; storeIndex++) {
    const store = createdStores[storeIndex];
    const products = [];

    for (const [category, templates] of Object.entries(productTemplates)) {
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        products.push({
          name: template.name,
          description: `High-quality ${template.name.toLowerCase()} for everyday use.`,
          sku: generateSKU(category, i, storeIndex),
          category,
          price: template.price,
          quantity: randomQuantity(template.minStock),
          minStock: template.minStock,
          storeId: store.id,
        });
      }
    }

    await prisma.product.createMany({ data: products });
    totalProducts += products.length;
    console.log(`Created ${products.length} products for ${store.name}`);
  }

  console.log(`Seeding complete! Created ${createdStores.length} stores and ${totalProducts} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
