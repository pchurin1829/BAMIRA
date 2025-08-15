// scripts/seedPromoCard.js
const { prisma } = require('../lib/prisma');
const datos = require('../data/promocard.json');

async function main() {
  await prisma.promoCard.createMany({ data: datos });
  console.log('PromoCards sembradas');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());