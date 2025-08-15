// scripts/seedCategoria.js
const { prisma } = require('../lib/prisma');
const datos = require('../data/categoria.json');

async function main() {
  await prisma.categoria.createMany({ data: datos });
  console.log('Categorias sembradas');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());