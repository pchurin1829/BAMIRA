// scripts/seedProducto.js
const { prisma } = require('../lib/prisma');
const datos = require('../data/producto.json');

async function main() {
  await prisma.producto.createMany({ data: datos });
  console.log('Productos sembrados');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());