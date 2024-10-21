/*
  Warnings:

  - You are about to drop the column `email` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Sanitario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Paciente" DROP COLUMN "email";

-- AlterTable
ALTER TABLE "Sanitario" DROP COLUMN "email";

-- CreateTable
CREATE TABLE "User" (
    "dni" VARCHAR(9) NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("dni")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_dni_key" ON "User"("dni");

-- CreateIndex
CREATE INDEX "User_dni_idx" ON "User" USING HASH ("dni");

-- AddForeignKey
ALTER TABLE "Sanitario" ADD CONSTRAINT "Sanitario_dni_fkey" FOREIGN KEY ("dni") REFERENCES "User"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_dni_fkey" FOREIGN KEY ("dni") REFERENCES "User"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutor" ADD CONSTRAINT "Tutor_dni_fkey" FOREIGN KEY ("dni") REFERENCES "User"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;
