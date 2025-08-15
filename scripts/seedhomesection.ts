// scripts/seedHomeSection.js
const { prisma } = require('../lib/prisma');
const datos = require('../data/homesection.json');

async function main() {
  await prisma.homeSection.createMany({ data: datos });
  console.log('HomeSections sembradas');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());