import { useState, useEffect } from "react" 
import Card from "../ui/Card" 
import UserCard from "../ui/UserCard" 
import UserRole from "./UserRole" 

const DashboardView = () => {
  const userRole = UserRole() 
  const [patientData, setPatientData] = useState(null) 
  const [errorMessage, setErrorMessage] = useState("") 

  useEffect(() => {
    const fetchPatientData = async () => {
      const user = JSON.parse(sessionStorage.getItem("user")) 
      if (user && userRole === "PACIENTE") {
        try {
          const token = sessionStorage.getItem("jwtToken") 
          const response = await fetch(`http://localhost:3000/api/users/pacientes/${user.dni}`, {
            headers: { Authorization: `Bearer ${token}` },
          }) 
          const data = await response.json() 
          if (response.ok) {
            setPatientData(data) 
          } else {
            setErrorMessage(data.error || "Error fetching patient data.") 
          }
        } catch (error) {
          console.error("Error fetching patient data:", error) 
          setErrorMessage("Connection error while fetching patient data.") 
        }
      }
    } 
    fetchPatientData() 
  }, [userRole]) 

  if (!userRole) return null 

  return (
    <>
      <h2 className="text-2xl font-bold text-center m-10">PANEL DE CONTROL</h2>

      <div
  className={`grid gap-4 p-4 mt-10 w-full ${
    userRole !== "ADMIN" ? "lg:grid-cols-2" : "lg:grid-cols-1 flex justify-center"
  }`}
>
  {userRole !== "ADMIN" && <UserCard title="mifarmacia" />}
  <UserCard title="reloj" />
</div>

      {userRole === "ADMIN" && (
        <div className="grid lg:grid-cols-3 gap-6 p-4 place-items-center mb-10">
          <>
            <Card title="farmacias" />
            <Card title="usuarios" />
          </>
        </div>
      )}
      {userRole === "SANITARIO" && (
        <>
          <div className="grid lg:grid-cols-3 gap-6 p-4 place-items-center mb-10">

            <Card title="pacientes" />
            <Card title="tratamientos" />
            <Card title="addregistro" />
          </div>
        </>
      )}
      {userRole === "PACIENTE" && (
        <>
          <div className="grid lg:grid-cols-3 gap-6 p-4 place-items-center mb-10">

            <Card title="mistratamientos" />
            <Card title="registro" />
            <Card title="adherencia" />
          </div>
        </>
      )}
      {userRole === "TUTOR" && (
        <>
          <div className="grid lg:grid-cols-3 gap-6 p-4 place-items-center mb-10">

            <Card title="pacientes a cargo" />
            <Card title="tratamientos de pacientes" />
            <Card title="informes de cumplimiento" />
          </div>
        </>

      )}

      {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}
    </>
  ) 
} 

export default DashboardView 
