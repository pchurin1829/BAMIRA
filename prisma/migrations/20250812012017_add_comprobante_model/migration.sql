-- CreateTable
CREATE TABLE "Comprobante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "archivoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendiente_subida',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    "expiraEn" DATETIME NOT NULL,
    CONSTRAINT "Comprobante_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Comprobante_orderId_key" ON "Comprobante"("orderId");
