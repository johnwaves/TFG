import Card from "../ui/Card"
import UserRole from "./UserRole"

const DashboardView = () => {
  const userRole = UserRole()

  if (!userRole) return null

  return (
    <>
      <h2 className="text-2xl font-bold text-center m-10">PANEL DE CONTROL</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 place-items-center mt-10 mb-10">
        {userRole === "ADMIN" && (
          <>
						<Card title="farmacias" />
            <Card title="usuarios" />
            <Card title="reportes" />
            <Card title="configuraciones" />
          </>
        )}
        {userRole === "SANITARIO" && (
          <>
            <Card title="pacientes" />
            <Card title="tratamientos" />
          </>
        )}
        {userRole === "PACIENTE" && (
          <>
            <Card title="mis tratamientos" />
            <Card title="cumplimiento" />
            <Card title="contacto con farmacia" />
          </>
        )}
        {userRole === "TUTOR" && (
          <>
            <Card title="pacientes a cargo" />
            <Card title="tratamientos de pacientes" />
            <Card title="informes de cumplimiento" />
          </>
        )}
      </div>
    </>
  )
}

export default DashboardView
