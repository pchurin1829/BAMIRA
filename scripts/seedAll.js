// scripts/seedAll.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Carga tus archivos JSON
const categorias = require('../data/categoria.json');
const productos  = require('../data/producto.json');
const promocards = require('../data/promocard.json');
const usuarios         = require('../data/user.json');
const homeSections     = require('../data/homesection.json');
const featuredProducts = require('../data/featuredproduct.json');

async function main() {
  console.log('⏳ Reseteando esquema y aplicando migraciones');
  // Omitido: asume que ya corriste `npx prisma migrate reset --force`
  
  console.log('✔️ Sembrando Categorias');
  await prisma.categoria.createMany({ data: categorias });
  
  console.log('✔️ Sembrando Productos');
  // Omitimos 'creadoEn' para usar default now()
  const productosClean = productos.map(({ creadoEn, ...rest }) => rest);
  await prisma.producto.createMany({ data: productosClean });
  
  console.log('✔️ Sembrando PromoCards');
  await prisma.promoCard.createMany({ data: promocards });
  
  console.log('✔️ Sembrando Usuarios');
  await prisma.user.createMany({ data: usuarios });
  
  console.log('✔️ Sembrando HomeSections');
  await prisma.homeSection.createMany({ data: homeSections });
  
  console.log('✔️ Sembrando FeaturedProducts');
  await prisma.featuredProduct.createMany({ data: featuredProducts });
  
  // ... semillas para order, orderitem, comprobante, etc.
  
  console.log('🎉 Seed completo');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });