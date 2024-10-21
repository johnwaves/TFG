-- DropForeignKey
ALTER TABLE "Tratamiento" DROP CONSTRAINT "Tratamiento_idDosis_fkey";

-- DropIndex
DROP INDEX "RegistroTratamiento_idTratamiento_key";

-- AlterTable
ALTER TABLE "RegistroTratamiento" ALTER COLUMN "detalles" DROP NOT NULL,
ALTER COLUMN "detalles" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Tratamiento" ALTER COLUMN "fecha_inicio" DROP NOT NULL,
ALTER COLUMN "fecha_fin" DROP NOT NULL,
ALTER COLUMN "idDosis" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_idDosis_fkey" FOREIGN KEY ("idDosis") REFERENCES "Dosis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
