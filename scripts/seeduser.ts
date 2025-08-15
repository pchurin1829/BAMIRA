// scripts/seedUser.js
const { prisma } = require('../lib/prisma');
const datos = require('../data/user.json');

async function main() {
  await prisma.user.createMany({ data: datos });
  console.log('Usuarios sembrados');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());