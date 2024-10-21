-- CreateEnum
CREATE TYPE "TipoSanitario" AS ENUM ('FARMACEUTICO', 'TECNICO_FARMACIA');

-- CreateEnum
CREATE TYPE "TipoTratamiento" AS ENUM ('FARMACOLOGICO', 'NO_FARMACOLOGICO');

-- CreateTable
CREATE TABLE "Farmacia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,

    CONSTRAINT "Farmacia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sanitario" (
    "dni" VARCHAR(9) NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tipo" "TipoSanitario" NOT NULL,
    "id_farmacia" INTEGER NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sanitario_pkey" PRIMARY KEY ("dni")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "dni" VARCHAR(9) NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "id_farmacia" INTEGER NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "direccion" TEXT NOT NULL,
    "tutorDni" VARCHAR(9),

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("dni")
);

-- CreateTable
CREATE TABLE "Tutor" (
    "dni" VARCHAR(9) NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "dni_paciente" VARCHAR(9) NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "direccion" TEXT NOT NULL,

    CONSTRAINT "Tutor_pkey" PRIMARY KEY ("dni")
);

-- CreateTable
CREATE TABLE "Dosis" (
    "id" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "intervalo" INTEGER NOT NULL,
    "duracion" INTEGER NOT NULL,

    CONSTRAINT "Dosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tratamiento" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo" "TipoTratamiento" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" VARCHAR(500) NOT NULL,
    "dosisId" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "dni_sanitario" VARCHAR(9) NOT NULL,
    "dni_paciente" VARCHAR(9) NOT NULL,
    "puntuacion" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Tratamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroTratamiento" (
    "id" SERIAL NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cumplimiento" BOOLEAN NOT NULL,
    "detalles" TEXT[],
    "id_tratamiento" INTEGER NOT NULL,

    CONSTRAINT "RegistroTratamiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Farmacia_id_key" ON "Farmacia"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Farmacia_nombre_key" ON "Farmacia"("nombre");

-- CreateIndex
CREATE INDEX "Farmacia_id_idx" ON "Farmacia" USING HASH ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Sanitario_dni_key" ON "Sanitario"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Sanitario_id_farmacia_key" ON "Sanitario"("id_farmacia");

-- CreateIndex
CREATE INDEX "Sanitario_dni_idx" ON "Sanitario" USING HASH ("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_dni_key" ON "Paciente"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_id_farmacia_key" ON "Paciente"("id_farmacia");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_tutorDni_key" ON "Paciente"("tutorDni");

-- CreateIndex
CREATE INDEX "Paciente_dni_idx" ON "Paciente" USING HASH ("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_dni_key" ON "Tutor"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_dni_paciente_key" ON "Tutor"("dni_paciente");

-- CreateIndex
CREATE INDEX "Tutor_dni_idx" ON "Tutor" USING HASH ("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Dosis_id_key" ON "Dosis"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Tratamiento_id_key" ON "Tratamiento"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Tratamiento_dosisId_key" ON "Tratamiento"("dosisId");

-- CreateIndex
CREATE UNIQUE INDEX "Tratamiento_dni_sanitario_key" ON "Tratamiento"("dni_sanitario");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroTratamiento_id_key" ON "RegistroTratamiento"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroTratamiento_id_tratamiento_key" ON "RegistroTratamiento"("id_tratamiento");

-- AddForeignKey
ALTER TABLE "Sanitario" ADD CONSTRAINT "Sanitario_id_farmacia_fkey" FOREIGN KEY ("id_farmacia") REFERENCES "Farmacia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_id_farmacia_fkey" FOREIGN KEY ("id_farmacia") REFERENCES "Farmacia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_tutorDni_fkey" FOREIGN KEY ("tutorDni") REFERENCES "Tutor"("dni") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_dosisId_fkey" FOREIGN KEY ("dosisId") REFERENCES "Dosis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_dni_sanitario_fkey" FOREIGN KEY ("dni_sanitario") REFERENCES "Sanitario"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tratamiento" ADD CONSTRAINT "Tratamiento_dni_paciente_fkey" FOREIGN KEY ("dni_paciente") REFERENCES "Paciente"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroTratamiento" ADD CONSTRAINT "RegistroTratamiento_id_tratamiento_fkey" FOREIGN KEY ("id_tratamiento") REFERENCES "Tratamiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
