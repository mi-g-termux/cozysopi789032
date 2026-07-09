import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\u{1F366} Seeding database...");

  // Settings (singleton)
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      storeName: "Creamy",
      storeEmail: "hello@creamy.example",
      currency: "USD",
      currencySymbol: "$",
      adminPath: "admin-panel",
      freeDeliveryAbove: 30,
      aboutTitle: "Our story",
      aboutBody:
        "Creamy began with a simple idea: capture the joy of summer in every scoop. We make small-batch ice cream with the finest ingredients and real fruit, then deliver it fresh to your door.",
    },
  });

  // Delivery zones
  const zones = [
    {
      name: "City Center",
      areas: ["Downtown", "Main Square", "Central Park Area"],
      charge: 2.0,
      estimatedDays: "Same day",
      freeAbove: 30,
      sortOrder: 0,
    },
    {
      name: "Suburbs",
      areas: ["Greenfield", "Oak Hills", "Riverside"],
      charge: 5.0,
      estimatedDays: "1-2 days",
      freeAbove: 45,
      sortOrder: 1,
    },
    {
      name: "Outskirts",
      areas: ["Eastwood", "Northgate", "Far Valley"],
      charge: 10.0,
      estimatedDays: "2-3 days",
      freeAbove: null,
      sortOrder: 2,
    },
    {
      name: "Pick Up",
      areas: ["Self Pickup"],
      charge: 0.0,
      estimatedDays: "Ready in 1 hour",
      freeAbove: null,
      sortOrder: 3,
    },
  ];

  await prisma.deliveryZone.deleteMany();
  for (const z of zones) {
    await prisma.deliveryZone.create({ data: z });
  }

  // Products \u2014 ice cream flavours using the bundled tub artwork in /public/creamy.
  const products = [
    {
      name: "Swedish Vanilla",
      description:
        "Pure Madagascar vanilla folded into slow-churned Swedish cream. 240 calories per scoop.",
      price: 6.5,
      category: "Classic",
      stock: 60,
      featured: true,
      costPrice: 2.5,
      images: ["/creamy/tub-vanilla.png"],
    },
    {
      name: "Mint Chocochip",
      description:
        "Cool fresh mint meets shards of dark chocolate. The scoop that wakes you up. 270 calories.",
      price: 6.9,
      category: "Classic",
      stock: 55,
      featured: true,
      costPrice: 2.7,
      images: ["/creamy/tub-mint.png"],
    },
    {
      name: "Apple Pie",
      description:
        "Warm cinnamon apples, buttery crumble and cold creamy caramel. Dessert reimagined. 290 calories.",
      price: 7.2,
      category: "Signature",
      stock: 40,
      featured: true,
      costPrice: 3.0,
      images: ["/creamy/tub-apple.png"],
    },
    {
      name: "Strawberry Fields",
      description:
        "Sun-ripened strawberries swirled through velvety cream. Bright, fruity and refreshing. 250 calories.",
      price: 6.9,
      category: "Classic",
      stock: 50,
      featured: true,
      costPrice: 2.7,
      images: ["/creamy/tub-strawberry.png"],
    },
    {
      name: "Cookies & Cream",
      description:
        "Loaded with crunchy chocolate cookie pieces in a smooth vanilla base. 300 calories.",
      price: 7.2,
      category: "Signature",
      stock: 45,
      featured: true,
      costPrice: 3.0,
      images: ["/creamy/tub-cookies.png"],
    },
  ];

  await prisma.orderItem.deleteMany();
  await prisma.product.deleteMany();
  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  // Categories
  const categories = [
    { name: "Classic", slug: "classic", sortOrder: 0 },
    { name: "Signature", slug: "signature", sortOrder: 1 },
  ];
  await prisma.category.deleteMany();
  for (const c of categories) {
    await prisma.category.create({ data: c });
  }

  // A sample welcome coupon (10% off) to demonstrate the promo-code system.
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "percent",
      value: 10,
      active: true,
      minSubtotal: 0,
    },
  });

  console.log(
    `\u2705 Seeded ${zones.length} zones and ${products.length} products.`,
  );
  console.log(
    "\u2139\uFE0F  Run 'npm run setup:admin' to create your admin account.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
