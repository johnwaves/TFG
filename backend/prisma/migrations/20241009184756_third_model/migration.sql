/*
  Warnings:

  - The values [TECNICO_FARMACIA] on the enum `TipoSanitario` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Paciente` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `apellidos` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `direccion` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `dni` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_nacimiento` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `id_farmacia` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `tutorDni` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `id_tratamiento` on the `RegistroTratamiento` table. All the data in the column will be lost.
  - The primary key for the `Sanitario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `apellidos` on the `Sanitario` table. All the data in the column will be lost.
  - You are about to drop the column `dni` on the `Sanitario` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_nacimiento` on the `Sanitario` table. All the data in the column will be lost.
  - You are about to drop the column `id_farmacia` on the `Sanitario` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Sanitario` table. All the data in the column will be lost.
  - You are about to drop the column `dni_paciente` on the `Tratamiento` table. All the data in the column will be lost.
  - You are about to drop the column `dni_sanitario` on the `Tratamiento` table. All the data in the column will be lost.
  - You are about to drop the column `dosisId` on the `Tratamiento` table. All the data in the column will be lost.
  - The primary key for the `Tutor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `apellidos` on the `Tutor` table. All the data in the column will be lost.
  - You are about to drop the column `direccion` on the `Tutor` table. All the data in the column will be lost.
  - You are about to drop the column `dni` on the `Tutor` table. All the data in the column will be lost.
  - You are about to drop the column `dni_paciente` on the `Tutor` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_nacimiento` on the `Tutor` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Tutor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Paciente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tutorId]` on the table `Paciente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idTratamiento]` on the table `RegistroTratamiento` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Sanitario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idDosis]` on the table `Tratamiento` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Tutor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idTratamiento` to the `RegistroTratamiento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idFarmacia` to the `Sanitario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Sanitario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idDosis` to the `Tratamiento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idPaciente` to the `Tratamiento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idSanitario` to the `Tratamiento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Tutor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellidos` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direccion` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_nacimiento` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SANITARIO', 'PACIENTE', 'TUTOR');

-- AlterEnum
BEGIN;
CREATE TYPE "TipoSanitario_new" AS ENUM ('FARMACEUTICO', 'TECNICO');
ALTER TABLE "Sanitario" ALTER COLUMN "tipo" TYPE "TipoSanitario_new" USING ("tipo"::text::"TipoSanitario_new");
ALTER TYPE "TipoSanitario" RENAME TO "TipoSanitario_old";
ALTER TYPE "TipoSanitario_new" RENAME TO "TipoSanitario";
DROP TYPE "TipoSanitario_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Paciente" DROP CONSTRAINT "Paciente_dni_fkey";

-- DropForeignKey
ALTER TABLE "Paciente" DROP CONSTRAINT "Paciente_id_farmacia_fkey";

-- DropForeignKey
ALTER TABLE "Paciente" DROP CONSTRAINT "Paciente_tutorDni_fkey";

-- DropForeignKey
ALTER TABLE "RegistroTratamiento" DROP CONSTRAINT "RegistroTratamiento_id_tratamiento_fkey";

-- DropForeignKey
ALTER TABLE "Sanitario" DROP CONSTRAINT "Sanitario_dni_fkey";

-- DropForeignKey
ALTER TABLE "Sanitario" DROP CONSTRAINT "Sanitario_id_farmacia_fkey";

-- DropForeignKey
ALTER TABLE "Tratamiento" DROP CONSTRAINT "Tratamiento_dni_paciente_fkey";

-- DropForeignKey
ALTER TABLE "Tratamiento" DROP CONSTRAINT "Tratamiento_dni_sanitario_fkey";

-- DropForeignKey
ALTER TABLE "Tratamiento" DROP CONSTRAINT "Tratamiento_dosisId_fkey";

-- DropForeignKey
ALTER TABLE "Tutor" DROP CONSTRAINT "Tutor_dni_fkey";

-- DropIndex
DROP INDEX "Paciente_dni_idx";

-- DropIndex
DROP INDEX "Paciente_dni_key";

-- DropIndex
DROP INDEX "Paciente_id_farmacia_key";

-- DropIndex
DROP INDEX "Paciente_tutorDni_key";

-- DropIndex
DROP INDEX "RegistroTratamiento_id_tratamiento_key";

-- DropIndex
DROP INDEX "Sanitario_dni_idx";

-- DropIndex
DROP INDEX "Sanitario_dni_key";

-- DropIndex
DROP INDEX "Sanitario_id_farmacia_key";

-- DropIndex
DROP INDEX "Tratamiento_dni_sanitario_key";

-- DropIndex
DROP INDEX "Tratamiento_dosisId_key";

-- DropIndex
DROP INDEX "Tutor_dni_idx";

-- DropIndex
DROP INDEX "Tutor_dni_key";

-- DropIndex
DROP INDEX "Tutor_dni_paciente_key";

-- AlterTable
ALTER TABLE "Farmacia" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Paciente" DROP CONSTRAINT "Paciente_pkey",
DROP COLUMN "apellidos",
DROP COLUMN "direccion",
DROP COLUMN "dni",
DROP COLUMN "fecha_nacimiento",
DROP COLUMN "id_farmacia",
DROP COLUMN "nombre",
DROP COLUMN "tutorDni",
ADD COLUMN     "esDependiente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "idFarmacia" INTEGER,
ADD COLUMN     "tutorId" INTEGER,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "RegistroTratamiento" DROP COLUMN "id_tratamiento",
ADD COLUMN     "idTratamiento" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Sanitario" DROP CONSTRAINT "Sanitario_pkey",
DROP COLUMN "apellidos",
DROP COLUMN "dni",
DROP COLUMN "fecha_nacimiento",
DROP COLUMN "id_farmacia",
DROP COLUMN "nombre",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "idFarmacia" INTEGER NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "Sanitario_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Tratamiento" DROP COLUMN "dni_paciente",
DROP COLUMN "dni_sanitario",
DROP COLUMN "dosisId",
ADD COLUMN     "idDosis" INTEGER NOT NULL,
ADD COLUMN     "idPaciente" INTEGER NOT NULL,
ADD COLUMN     "idSanitario" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Tutor" DROP CONSTRAINT "Tutor_pkey",
DROP COLUMN "apellidos",
DROP COLUMN "direccion",
DROP COLUMN "dni",
DROP COLUMN "dni_paciente",
DROP COLUMN "fecha_nacimiento",
DROP COLUMN "nombre",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "Tutor_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "apellidos" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "direccion" TEXT NOT NULL,
ADD COLUMN     "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "foto" TEXT,
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "role" "UserRole" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_userId_key" ON "Paciente"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_tutorId_key" ON "Paciente"("tutorId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroTratamiento_idTratamiento_key" ON "RegistroTratamiento"("idTratamiento");

-- CreateIndex
CREATE UNIQUE INDEX "Sanitario_userId_key" ON "Sanitario"("userId");

-- CreateIndex
CREATE INDEX "Sanitario_idFarmacia_idx" ON "Sanitario" USING HASH ("idFarmacia");

-- CreateIndex
CREATE UNIQUE INDEX "Tratamiento_idDosis_key" ON "Tratamiento"("idDosis");

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_userId_key" ON "Tutor"("userId");

-- CreateIndex
CREATE INDEX "Tutor_id_idx" ON "Tutor" USING HASH ("id");

-- AddForeignKey
ALTER TABLE "Sanitario" ADD CONSTRAINT "Sanitario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sanitario" ADD CONSTRAINT "Sanitario_idFarmacia_fkey" FOREIGN KEY ("idFarmacia") REFERENCES "Farmacia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_idFarmacia_fkey" FOREIGN KEY ("idFarmacia") REFERENCES "Farmacia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutor" ADD CONSTRAINT "Tutor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_idDosis_fkey" FOREIGN KEY ("idDosis") REFERENCES "Dosis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_idSanitario_fkey" FOREIGN KEY ("idSanitario") REFERENCES "Sanitario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_idPaciente_fkey" FOREIGN KEY ("idPaciente") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroTratamiento" ADD CONSTRAINT "RegistroTratamiento_idTratamiento_fkey" FOREIGN KEY ("idTratamiento") REFERENCES "Tratamiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
