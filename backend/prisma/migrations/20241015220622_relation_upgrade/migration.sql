/*
  Warnings:

  - The primary key for the `Paciente` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `esDependiente` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `tutorId` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Paciente` table. All the data in the column will be lost.
  - The primary key for the `Sanitario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Sanitario` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Sanitario` table. All the data in the column will be lost.
  - The primary key for the `Tutor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Tutor` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Tutor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idUser]` on the table `Paciente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idUser]` on the table `Sanitario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idUser]` on the table `Tutor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idUser` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idUser` to the `Sanitario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idUser` to the `Tutor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefono` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Paciente" DROP CONSTRAINT "Paciente_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "Paciente" DROP CONSTRAINT "Paciente_userId_fkey";

-- DropForeignKey
ALTER TABLE "Sanitario" DROP CONSTRAINT "Sanitario_userId_fkey";

-- DropForeignKey
ALTER TABLE "Tratamiento" DROP CONSTRAINT "Tratamiento_idPaciente_fkey";

-- DropForeignKey
ALTER TABLE "Tratamiento" DROP CONSTRAINT "Tratamiento_idSanitario_fkey";

-- DropForeignKey
ALTER TABLE "Tutor" DROP CONSTRAINT "Tutor_userId_fkey";

-- DropIndex
DROP INDEX "Paciente_tutorId_key";

-- DropIndex
DROP INDEX "Paciente_userId_key";

-- DropIndex
DROP INDEX "Sanitario_userId_key";

-- DropIndex
DROP INDEX "Tutor_id_idx";

-- DropIndex
DROP INDEX "Tutor_userId_key";

-- AlterTable
ALTER TABLE "Paciente" DROP CONSTRAINT "Paciente_pkey",
DROP COLUMN "esDependiente",
DROP COLUMN "id",
DROP COLUMN "tutorId",
DROP COLUMN "userId",
ADD COLUMN     "idTutor" TEXT,
ADD COLUMN     "idUser" TEXT NOT NULL,
ADD CONSTRAINT "Paciente_pkey" PRIMARY KEY ("idUser");

-- AlterTable
ALTER TABLE "Sanitario" DROP CONSTRAINT "Sanitario_pkey",
DROP COLUMN "id",
DROP COLUMN "userId",
ADD COLUMN     "idUser" TEXT NOT NULL,
ADD CONSTRAINT "Sanitario_pkey" PRIMARY KEY ("idUser");

-- AlterTable
ALTER TABLE "Tratamiento" ALTER COLUMN "idPaciente" SET DATA TYPE TEXT,
ALTER COLUMN "idSanitario" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Tutor" DROP CONSTRAINT "Tutor_pkey",
DROP COLUMN "id",
DROP COLUMN "userId",
ADD COLUMN     "idUser" TEXT NOT NULL,
ADD CONSTRAINT "Tutor_pkey" PRIMARY KEY ("idUser");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "telefono" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_idUser_key" ON "Paciente"("idUser");

-- CreateIndex
CREATE INDEX "Paciente_idFarmacia_idx" ON "Paciente" USING HASH ("idFarmacia");

-- CreateIndex
CREATE UNIQUE INDEX "Sanitario_idUser_key" ON "Sanitario"("idUser");

-- CreateIndex
CREATE INDEX "Tratamiento_id_idx" ON "Tratamiento" USING HASH ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_idUser_key" ON "Tutor"("idUser");

-- CreateIndex
CREATE INDEX "Tutor_idUser_idx" ON "Tutor" USING HASH ("idUser");

-- AddForeignKey
ALTER TABLE "Sanitario" ADD CONSTRAINT "Sanitario_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "User"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "User"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_idTutor_fkey" FOREIGN KEY ("idTutor") REFERENCES "Tutor"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutor" ADD CONSTRAINT "Tutor_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "User"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_idSanitario_fkey" FOREIGN KEY ("idSanitario") REFERENCES "Sanitario"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_idPaciente_fkey" FOREIGN KEY ("idPaciente") REFERENCES "Paciente"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;
