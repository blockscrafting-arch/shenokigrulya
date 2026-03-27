import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEED_DEFAULT_PASSWORD = "admin123";

async function main() {
  const adminPassword = await bcrypt.hash(SEED_DEFAULT_PASSWORD, 12);
  await prisma.admin.upsert({
    where: { login: "admin" },
    update: {},
    create: {
      login: "admin",
      password: adminPassword,
    },
  });

  // ВАЖНО: после seed обязательно смените пароль через /admin/settings!
  // Пароль по умолчанию "admin123" — небезопасен для продакшена.
  console.warn(
    "⚠️  SEED DEFAULT PASSWORD:",
    SEED_DEFAULT_PASSWORD,
    "— смените через /admin/settings перед запуском в продакшене!"
  );

  await prisma.settings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });

  const product = await prisma.product.upsert({
    where: { id: "seed-product-1" },
    update: {
      images: [
        "/uploads/1.png",
        "/uploads/2.png",
        "/uploads/3.jpg",
        "/uploads/4.jpg",
        "/uploads/6.jpg",
        "/uploads/5.jpg",
      ],
    },
    create: {
      id: "seed-product-1",
      title: "Полнорационный корм класса холистик для взрослых собак крупных и средних пород",
      description: "Премиальный корм с натуральным составом.",
      composition: `Состав:
Мясо и субпродукты индейки (дегидрированное мясо индейки - 25%, свежее мясо индейки - 12,5%), цельнозерновой рис, картофель, жир индейки (консервированный витамином Е в форме альфа-токоферол ацетата), растительные волокна (натуральный источник клетчатки), дрожжи пивные (натуральный источник пребиотиков МОS), масло лососевых рыб, цельное семя льна (натуральные источники DHA и ARA), сушеный корень цикория (натуральный источник FOS и инулина), экстракт юкки шидигера, витамины и минералы.

Питательные вещества:
белок - 23%, жиры - 15%, клетчатка - 4,5%, зола - 5,5%, кальций - 1100 мг, фосфор - 880 мг, железо - 110 мг, медь - 13 мг, цинк - 130 мг, марганец - 10 мг, йод - 1,5 мг, селен - 46 мкг, витамин А - 19000 МЕ, витамин D - 1000 МЕ, витамин E - 160 мг, тиамин - 2,2 мг, рибофлавин - 6,8 мг, пантотеновая кислота - 20 мг, ниацин - 25 мг, пиридоксин - 1,4 мг, фолиевая кислота - 300 мкг, витамин B12 - 30 мкг, холин - 1800 мг, витамин C - 100 мг, Омега-3 - 0,4%, Омега-6 - 2,2%, влажность не более 10%

Энергетическая ценность:
391 ккал/1637,04 кДж`,
      price: 233100,
      ozonUrl: "https://www.ozon.ru/product/gipoallergennyy-suhoy-korm-klassa-holistik-dlya-vzroslyh-sobak-krupnyh-i-srednih-porod-so-2796505026/",
      badges: ["Гипоаллергенный", "Холистик", "Без глютена"],
      images: [
        "/uploads/1.png",
        "/uploads/2.png",
        "/uploads/3.jpg",
        "/uploads/4.jpg",
        "/uploads/6.jpg",
        "/uploads/5.jpg",
      ],
      weight: 3000,
      length: 370,
      width: 130,
      height: 230,
      isActive: true,
    },
  });

  console.log(`Seed: admin (admin / ${SEED_DEFAULT_PASSWORD}), settings, product`, product.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
