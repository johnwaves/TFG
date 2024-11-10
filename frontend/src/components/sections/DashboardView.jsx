import { useState, useEffect } from "react";
import Card from "../ui/Card";
import UserRole from "./UserRole";

const DashboardView = () => {
  const userRole = UserRole();
  const [patientData, setPatientData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchPatientData = async () => {
      const user = JSON.parse(sessionStorage.getItem("user"));
      if (user && userRole === "PACIENTE") {
        try {
          const token = sessionStorage.getItem("jwtToken");
          const response = await fetch(`http://localhost:3000/api/users/pacientes/${user.dni}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (response.ok) {
            setPatientData(data);
          } else {
            setErrorMessage(data.error || "Error fetching patient data.");
          }
        } catch (error) {
          console.error("Error fetching patient data:", error);
          setErrorMessage("Connection error while fetching patient data.");
        }
      }
    };
    fetchPatientData();
  }, [userRole]);

  if (!userRole) return null;

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

                <Card title="mistratamientos" />
                <Card title="registro" />
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
      {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}
    </>
  );
};

export default DashboardView;
