// scripts/seedFeaturedProduct.js
const { prisma } = require('../lib/prisma');
const datos = require('../data/featuredproduct.json');

async function main() {
  await prisma.featuredProduct.createMany({ data: datos });
  console.log('FeaturedProducts sembrados');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());