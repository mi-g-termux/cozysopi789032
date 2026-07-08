import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

async function main() {
  console.log("\u{1F331} Seeding database...");

  // Settings (singleton)
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      storeName: "Cozy Bites",
      storeEmail: "hello@cozybites.example",
      currency: "USD",
      currencySymbol: "$",
      adminPath: "admin-panel",
      freeDeliveryAbove: 50
    }
  });

  // Delivery zones
  const zones = [
    { name: "City Center", areas: ["Downtown", "Main Square", "Central Park Area"], charge: 2.0, estimatedDays: "Same day", freeAbove: 50, sortOrder: 0 },
    { name: "Suburbs", areas: ["Greenfield", "Oak Hills", "Riverside"], charge: 5.0, estimatedDays: "1-2 days", freeAbove: 75, sortOrder: 1 },
    { name: "Outskirts", areas: ["Eastwood", "Northgate", "Far Valley"], charge: 10.0, estimatedDays: "2-3 days", freeAbove: null, sortOrder: 2 },
    { name: "Pick Up", areas: ["Self Pickup"], charge: 0.0, estimatedDays: "Ready in 1 hour", freeAbove: null, sortOrder: 3 }
  ];

  await prisma.deliveryZone.deleteMany();
  for (const z of zones) {
    await prisma.deliveryZone.create({ data: z });
  }

  // Products
  const products = [
    { name: "Bruschetta Trio", description: "Toasted sourdough topped with heirloom tomato, basil, and aged balsamic.", price: 9.5, category: "Cold Bites", stock: 40, featured: true, images: [UNSPLASH("1541529086526-db283c563270")] },
    { name: "Baked Brie Bites", description: "Golden puff pastry parcels filled with warm brie and fig jam.", price: 12.0, category: "Warm Bites", stock: 30, featured: true, images: [UNSPLASH("1481931098730-318b6f776db0")] },
    { name: "Caprese Skewers", description: "Cherry tomato, fresh mozzarella, and basil with olive oil drizzle.", price: 8.0, category: "Cold Bites", stock: 50, featured: false, images: [UNSPLASH("1512621776951-a57141f2eefd")] },
    { name: "Spiced Meatballs", description: "Herb-seasoned meatballs simmered in a smoky tomato glaze.", price: 11.5, category: "Warm Bites", stock: 35, featured: true, images: [UNSPLASH("1529042410759-befb1204b468")] },
    { name: "Stuffed Mushrooms", description: "Button mushrooms filled with garlic-herb cream cheese, baked golden.", price: 10.0, category: "Warm Bites", stock: 28, featured: false, images: [UNSPLASH("1546069901-ba9599a7e63c")] },
    { name: "Charcuterie Board", description: "Cured meats, artisan cheeses, olives, nuts, and seasonal fruit.", price: 24.0, category: "Boards", stock: 15, featured: true, images: [UNSPLASH("1452251889946-8ff5ea7b27ab")] },
    { name: "Deviled Eggs", description: "Classic creamy deviled eggs dusted with smoked paprika.", price: 7.5, category: "Cold Bites", stock: 45, featured: false, images: [UNSPLASH("1482049016688-2d3e1b311543")] },
    { name: "Mini Quiche Assortment", description: "Buttery mini quiches in spinach, mushroom, and cheddar.", price: 13.0, category: "Boards", stock: 22, featured: false, images: [UNSPLASH("1466637574441-749b8f19452f")] }
  ];

  await prisma.orderItem.deleteMany();
  await prisma.product.deleteMany();
  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log(`\u2705 Seeded ${zones.length} zones and ${products.length} products.`);
  console.log("\u2139\uFE0F  Run 'npm run setup:admin' to create your admin account.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
