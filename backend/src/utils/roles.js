export const ROLES = {
  ADMIN: "ADMIN",
  SANITARIO: "SANITARIO",
  PACIENTE: "PACIENTE",
  TUTOR: "TUTOR",
}

export const TIPO_SANITARIO = {
  FARMACEUTICO: "FARMACEUTICO",
  TECNICO: "TECNICO",
}

export const createUserPermissions = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.SANITARIO, ROLES.PACIENTE, ROLES.TUTOR, TIPO_SANITARIO.FARMACEUTICO, TIPO_SANITARIO.TECNICO], // Añade los tipos de sanitario aquí
  [TIPO_SANITARIO.FARMACEUTICO]: [ROLES.SANITARIO, ROLES.PACIENTE, ROLES.TUTOR],
  [TIPO_SANITARIO.TECNICO]: [ROLES.PACIENTE, ROLES.TUTOR],
}

export function checkPermissions(userModifier, userToUpdate) {
  if (userModifier.role === ROLES.ADMIN) return true // Permitir todo para ADMIN

  if (userModifier.role === ROLES.SANITARIO) {
    const tipoSanitario = userModifier.sanitario?.tipo

    if (tipoSanitario === TIPO_SANITARIO.FARMACEUTICO) {
      if ([ROLES.SANITARIO, ROLES.PACIENTE, ROLES.TUTOR].includes(userToUpdate.role))
        return true
    }

    if (tipoSanitario === TIPO_SANITARIO.TECNICO) {
      if ([ROLES.PACIENTE, ROLES.TUTOR].includes(userToUpdate.role) || userModifier.dni === userToUpdate.dni)
        return true
    }
  }

  if (userModifier.role === ROLES.PACIENTE && userModifier.dni === userToUpdate.dni)
    return true

  if (userModifier.role === ROLES.TUTOR) {
    if (userModifier.dni === userToUpdate.dni)
      return true

    if (userToUpdate.role === ROLES.PACIENTE && userToUpdate.paciente && userToUpdate.paciente.idTutor === userModifier.dni)
      return true
  }

  return false
}





