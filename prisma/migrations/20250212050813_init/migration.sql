-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_purchase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "price" REAL NOT NULL,
    "custormerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "debt" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    CONSTRAINT "purchase_custormerId_fkey" FOREIGN KEY ("custormerId") REFERENCES "customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_purchase" ("createdAt", "custormerId", "debt", "id", "name", "price", "status") SELECT "createdAt", "custormerId", "debt", "id", "name", "price", "status" FROM "purchase";
DROP TABLE "purchase";
ALTER TABLE "new_purchase" RENAME TO "purchase";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
