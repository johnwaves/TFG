import { useState, useEffect } from "react" 
import PacienteCheck from "../checks/PacienteCheck" 

const TratamientosPaciente = () => {
    const [tratamientos, setTratamientos] = useState([]) 
    const [sanitariosData, setSanitariosData] = useState({}) 
    const [activeTab, setActiveTab] = useState("activos") 
    const [noTratamientos, setNoTratamientos] = useState(false) 
    const [expandedIndex, setExpandedIndex] = useState(null) 

    useEffect(() => {
        const fetchTratamientos = async () => {
            const user = JSON.parse(sessionStorage.getItem("user")) 
            if (user && user.dni) {
                try {
                    const token = sessionStorage.getItem("jwtToken") 
                    const response = await fetch("http://localhost:3000/api/tratamientos/paciente", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ dniSolicitante: user.dni, dniSolicitado: user.dni })
                    }) 
                    const data = await response.json() 
                    if (response.ok) {
                        setTratamientos(data) 
                        setNoTratamientos(data.length === 0) 
                        fetchSanitariosData(data) 
                    } else {
                        console.error("Error al obtener los tratamientos:", data.error) 
                    }
                } catch (error) {
                    console.error("Error al obtener los tratamientos:", error) 
                }
            }
        } 
        fetchTratamientos() 
    }, []) 

    const fetchSanitariosData = async (tratamientos) => {
        const token = sessionStorage.getItem("jwtToken") 
        const newSanitariosData = {} 
        for (const tratamiento of tratamientos) {
            const sanitarioId = tratamiento.idSanitario 
            if (!sanitariosData[sanitarioId]) {
                try {
                    const response = await fetch(`http://localhost:3000/api/users/${sanitarioId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }) 
                    const data = await response.json() 
                    if (response.ok) {
                        newSanitariosData[sanitarioId] = data 
                    } else {
                        console.error(`Error fetching user ${sanitarioId}: ${data.error}`) 
                    }
                } catch (error) {
                    console.error(`Error fetching user ${sanitarioId}:`, error) 
                }
            }
        }
        setSanitariosData((prevSanitariosData) => ({ ...prevSanitariosData, ...newSanitariosData })) 
    } 

    const filteredTratamientos = () => {
        const today = new Date() 
        if (activeTab === "activos") {
            return tratamientos.filter(t => new Date(t.fecha_inicio) <= today && new Date(t.fecha_fin) >= today) 
        } else if (activeTab === "no_empezados") {
            return tratamientos.filter(t => !t.fecha_inicio && !t.fecha_fin) 
        } else if (activeTab === "finalizados") {
            return tratamientos.filter(t => t.fecha_fin && new Date(t.fecha_fin) < today) 
        }
        return tratamientos 
    } 

    const handleTabChange = (tab) => {
        setActiveTab(tab) 
        setExpandedIndex(null)  
    } 

    const toggleDetails = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index) 
    } 

    return (
        <PacienteCheck>
            <div className="flex justify-center text-center m-10">
                <div className="breadcrumbs text-xl">
                    <ul>
                        <li><a href="/dashboard">Panel de control</a></li>
                        <li>Mis tratamientos</li>
                    </ul>
                </div>
            </div>

            {noTratamientos ? (
                <div role="alert" className="alert alert-warning">
                    <p>No tienes tratamientos asignados actualmente.</p>
                </div>
            ) : (
                <>
                    <div role="tablist" className="tabs tabs-lifted mb-5">
                        <a
                            role="tab"
                            className={`tab ${activeTab === "activos" ? "tab-active" : ""}`}
                            onClick={() => handleTabChange("activos")}
                        >
                            Tratamientos activos
                        </a>
                        <a
                            role="tab"
                            className={`tab ${activeTab === "no_empezados" ? "tab-active" : ""}`}
                            onClick={() => handleTabChange("no_empezados")}
                        >
                            Tratamientos no empezados
                        </a>
                        <a
                            role="tab"
                            className={`tab ${activeTab === "finalizados" ? "tab-active" : ""}`}
                            onClick={() => handleTabChange("finalizados")}
                        >
                            Tratamientos finalizados
                        </a>
                    </div>

                    <div className="overflow-x-auto mb-10">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th style={{ width: "50px" }}></th>
                                    <th style={{ width: "300px" }}>Nombre</th>
                                    <th style={{ width: "100px" }}>Fecha de inicio</th>
                                    <th style={{ width: "100px" }}>Fecha de fin</th>
                                    <th style={{ width: "150px" }}>Prescito por</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTratamientos().map((tratamiento, index) => {
                                    const sanitario = sanitariosData[tratamiento.idSanitario] 
                                    return (
                                        <tr key={tratamiento.id} className="hover">
                                            <th>{index + 1}</th>
                                            <td>
                                                <div className="collapse collapse-arrow">
                                                    <input
                                                        type="checkbox"
                                                        checked={expandedIndex === index}
                                                        onChange={() => toggleDetails(index)}
                                                    />
                                                    <div className="collapse-title font-medium">
                                                        {tratamiento.nombre}
                                                    </div>
                                                    {expandedIndex === index && (
                                                        <div className="collapse-content">
                                                            <p><strong>Descripción:</strong> {tratamiento.descripcion}</p>
                                                            {tratamiento.tipo === "FARMACOLOGICO" && tratamiento.dosis && (
                                                                <div className="mt-2">
                                                                    <p><strong>Dosis:</strong></p>
                                                                    <ul className="list-disc pl-6">
                                                                        <li><strong>Cantidad:</strong> {tratamiento.dosis.cantidad} mg</li>
                                                                        <li><strong>Intervalo:</strong> cada {tratamiento.dosis.intervalo} horas</li>
                                                                        <li><strong>Duración:</strong> {tratamiento.dosis.duracion} días</li>
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {tratamiento.fecha_inicio
                                                    ? new Date(tratamiento.fecha_inicio).toLocaleDateString('es-ES')
                                                    : "No iniciada"}
                                            </td>
                                            <td>
                                                {tratamiento.fecha_fin
                                                    ? new Date(tratamiento.fecha_fin).toLocaleDateString('es-ES')
                                                    : "No definida"}
                                            </td>
                                            <td>{sanitario ? `${sanitario.apellidos}, ${sanitario.nombre}` : "No disponible"}</td>
                                        </tr>
                                    ) 
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </PacienteCheck>
    ) 
} 

export default TratamientosPaciente 
