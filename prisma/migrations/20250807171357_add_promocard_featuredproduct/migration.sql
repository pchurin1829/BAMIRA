-- CreateTable
CREATE TABLE "PromoCard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "bgColor" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FeaturedProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productoId" INTEGER NOT NULL,
    CONSTRAINT "FeaturedProduct_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FeaturedProduct_productoId_key" ON "FeaturedProduct"("productoId");
