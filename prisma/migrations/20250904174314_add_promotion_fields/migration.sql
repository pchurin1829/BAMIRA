-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "descuento" DOUBLE PRECISION,
ADD COLUMN     "precioOriginal" DOUBLE PRECISION,
ADD COLUMN     "promoExpira" TIMESTAMP(3),
ADD COLUMN     "promocion" BOOLEAN NOT NULL DEFAULT false;
