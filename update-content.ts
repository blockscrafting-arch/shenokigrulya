import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COMPOSITION_TEXT = `Состав:
Мясо и субпродукты индейки (дегидрированное мясо индейки - 25%, свежее мясо индейки - 12,5%), цельнозерновой рис, картофель, жир индейки (консервированный витамином Е в форме альфа-токоферол ацетата), растительные волокна (натуральный источник клетчатки), дрожжи пивные (натуральный источник пребиотиков МОS), масло лососевых рыб, цельное семя льна (натуральные источники DHA и ARA), сушеный корень цикория (натуральный источник FOS и инулина), экстракт юкки шидигера, витамины и минералы.

Питательные вещества:
белок - 23%, жиры - 15%, клетчатка - 4,5%, зола - 5,5%, кальций - 1100 мг, фосфор - 880 мг, железо - 110 мг, медь - 13 мг, цинк - 130 мг, марганец - 10 мг, йод - 1,5 мг, селен - 46 мкг, витамин А - 19000 МЕ, витамин D - 1000 МЕ, витамин E - 160 мг, тиамин - 2,2 мг, рибофлавин - 6,8 мг, пантотеновая кислота - 20 мг, ниацин - 25 мг, пиридоксин - 1,4 мг, фолиевая кислота - 300 мкг, витамин B12 - 30 мкг, холин - 1800 мг, витамин C - 100 мг, Омега-3 - 0,4%, Омега-6 - 2,2%, влажность не более 10%

Энергетическая ценность:
391 ккал/1637,04 кДж`;

const IMAGES = [
  "/uploads/1.jpg",
  "/uploads/2.jpg",
  "/uploads/3.jpg",
  "/uploads/4.jpg",
  "/uploads/5.jpg",
  "/uploads/6.jpg",
];

const OZON_URL = "https://www.ozon.ru/product/gipoallergennyy-suhoy-korm-klassa-holistik-dlya-vzroslyh-sobak-krupnyh-i-srednih-porod-so-2796505026/";
const PRICE_KOPECKS = 233100;
const WEIGHT_G = 3000;
const LENGTH_MM = 370;
const WIDTH_MM = 130;
const HEIGHT_MM = 230;

async function main() {
  const product = await prisma.product.findFirst({
    where: { isActive: true },
  });

  if (!product) {
    console.log("Активный товар не найден.");
    return;
  }

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: {
      composition: COMPOSITION_TEXT,
      images: IMAGES,
      price: PRICE_KOPECKS,
      ozonUrl: OZON_URL,
      weight: WEIGHT_G,
      length: LENGTH_MM,
      width: WIDTH_MM,
      height: HEIGHT_MM,
    },
  });

  console.log("Товар успешно обновлен!");
  console.log("Состав, картинки, цена, Ozon, габариты и вес обновлены для:", updated.title);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
