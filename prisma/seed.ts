import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create Warehouses
  const bangaloreWarehouse = await prisma.warehouse.create({
    data: {
      name: "Bangalore Warehouse",
      location: "Bangalore",
    },
  });

  const mumbaiWarehouse = await prisma.warehouse.create({
    data: {
      name: "Mumbai Warehouse",
      location: "Mumbai",
    },
  });

  // Create Products
  const iphone = await prisma.product.create({
    data: {
      name: "iPhone 15",
      description: "Apple smartphone",
    },
  });

  const headphones = await prisma.product.create({
    data: {
      name: "Sony WH-1000XM5",
      description: "Noise cancelling headphones",
    },
  });

  // Create Inventory
  await prisma.inventory.createMany({
    data: [
      {
        productId: iphone.id,
        warehouseId: bangaloreWarehouse.id,
        totalStock: 5,
      },
      {
        productId: iphone.id,
        warehouseId: mumbaiWarehouse.id,
        totalStock: 3,
      },
      {
        productId: headphones.id,
        warehouseId: bangaloreWarehouse.id,
        totalStock: 10,
      },
    ],
  });

  console.log("Seed data inserted successfully");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });