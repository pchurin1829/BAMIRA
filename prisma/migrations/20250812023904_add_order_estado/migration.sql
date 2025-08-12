-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "localRetiro" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'pendiente'
);
INSERT INTO "new_Order" ("apellido", "creadoEn", "email", "id", "localRetiro", "metodoPago", "nombre", "telefono") SELECT "apellido", "creadoEn", "email", "id", "localRetiro", "metodoPago", "nombre", "telefono" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
