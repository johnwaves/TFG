import { useState, useEffect } from "react" 
import SanitarioCheck from "../checks/SanitarioCheck" 

const TratamientoRegistro = () => {
    const [pacientes, setPacientes] = useState([]) 
    const [tratamientos, setTratamientos] = useState([]) 
    const [selectedPaciente, setSelectedPaciente] = useState("") 
    const [selectedTratamiento, setSelectedTratamiento] = useState("") 
    const [detalles, setDetalles] = useState("") 
    const [errorMessage, setErrorMessage] = useState("") 
    const [successMessage, setSuccessMessage] = useState("") 
    const [nextRegistro, setNextRegistro] = useState(null) 
    const [isLoading, setIsLoading] = useState(false) 
    const [showNoTratamientosDialog, setShowNoTratamientosDialog] = useState(false) 
    const [idFarmacia, setIdFarmacia] = useState(null) 
    const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 }) 

    useEffect(() => {
        const fetchSanitarioData = async () => {
            const user = JSON.parse(sessionStorage.getItem("user")) 
            if (user && user.dni) {
                try {
                    const token = sessionStorage.getItem("jwtToken") 
                    const response = await fetch(`http://localhost:3000/api/users/sanitarios/${user.dni}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }) 
                    const data = await response.json() 
                    if (response.ok) {
                        setIdFarmacia(data.idFarmacia) 
                        fetchPacientes(data.idFarmacia, token) 
                    } else {
                        setErrorMessage(data.error || "No se pudo obtener el ID de la farmacia.") 
                    }
                } catch (error) {
                    console.error("Error al obtener los datos del sanitario:", error) 
                    setErrorMessage("Error de conexión al obtener los datos del sanitario.") 
                }
            } else {
                setErrorMessage("No se pudo obtener el DNI del usuario logeado.") 
            }
        } 
        fetchSanitarioData() 
    }, []) 

    const fetchPacientes = async (farmaciaId, token) => {
        try {
            const response = await fetch(`http://localhost:3000/api/farmacias/${farmaciaId}/pacientes`, {
                headers: { Authorization: `Bearer ${token}` },
            }) 
            const data = await response.json() 
            if (response.ok) {
                setPacientes(data) 
            } else {
                setErrorMessage(data.error || "Error al obtener los pacientes.") 
            }
        } catch (error) {
            setErrorMessage("Hubo un problema con la conexión. Inténtelo de nuevo más tarde.") 
        }
    } 

    const fetchTratamientos = async (dniPaciente) => {
        try {
            const user = JSON.parse(sessionStorage.getItem("user")) 
            const response = await fetch("http://localhost:3000/api/tratamientos/paciente", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`
                },
                body: JSON.stringify({
                    dniSolicitante: user.dni,
                    dniSolicitado: dniPaciente
                })
            }) 
            const data = await response.json() 
            if (response.ok) {
                const noFarmacologicos = data.filter(tratamiento => tratamiento.tipo === "NO_FARMACOLOGICO") 
                if (noFarmacologicos.length === 0) {
                    setShowNoTratamientosDialog(true) 
                } else {
                    setTratamientos(noFarmacologicos) 
                }
            } else {
                setErrorMessage(data.error || "Error al obtener los tratamientos.") 
            }
        } catch (error) {
            setErrorMessage("Hubo un problema con la conexión. Inténtelo de nuevo más tarde.") 
        }
    } 

    const handlePacienteChange = (e) => {
        const pacienteDni = e.target.value 
        setSelectedPaciente(pacienteDni) 
        setSelectedTratamiento("") 
        setDetalles("") 
        setNextRegistro(null) 
        setTratamientos([]) 
        fetchTratamientos(pacienteDni) 
    } 

    const handleTratamientoChange = async (e) => {
        const tratamientoId = e.target.value 
        setSelectedTratamiento(tratamientoId) 
        setDetalles("") 
        setSuccessMessage("") 
        setErrorMessage("") 

        try {
            const token = sessionStorage.getItem("jwtToken") 
            const response = await fetch(`http://localhost:3000/api/tratamientos/${tratamientoId}/lastregistro`, {
                headers: { Authorization: `Bearer ${token}` }
            }) 
            const data = await response.json() 

            if (response.ok) {
                if (data.nextAvailable) {
                    // Contador y desaparece descripción
                    setNextRegistro(new Date(data.nextAvailable)) 
                } else {
                    setNextRegistro(null) 
                }
            } else {
                setErrorMessage(data.error || "Error al verificar el tiempo para el próximo registro.") 
            }

        } catch (error) {
            setErrorMessage("Error al verificar el tiempo para el próximo registro.") 
        }
    } 


    useEffect(() => {
        let intervalId 

        if (nextRegistro) {
            intervalId = setInterval(() => {
                const now = new Date() 
                const diff = nextRegistro - now 

                if (diff <= 0) {
                    setNextRegistro(null) 
                    clearInterval(intervalId) 
                } else {
                    const hours = Math.floor(diff / (1000 * 60 * 60)) 
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)) 
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000) 
                    setCountdown({ hours, minutes, seconds }) 
                }
            }, 1000) 
        }

        return () => clearInterval(intervalId) 
    }, [nextRegistro]) 

    const handleSubmit = async (e) => {
        e.preventDefault() 
        setIsLoading(true) 
        const token = sessionStorage.getItem("jwtToken") 
        const user = JSON.parse(sessionStorage.getItem("user")) 

        const data = {
            cumplimiento: true,
            detalles,
            fecha_registro: new Date().toISOString(),
        } 

        try {
            const response = await fetch(`http://localhost:3000/api/tratamientos/registro`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    dnisolicitante: user.dni,
                    idtratamiento: selectedTratamiento,
                },
                body: JSON.stringify(data),
            }) 

            const responseData = await response.json() 
            if (response.ok) {
                setSuccessMessage("Registro añadido con éxito.") 
                setNextRegistro(null) 
                setDetalles("") 
                setTimeout(() => setSuccessMessage(""), 3000) 
            } else {
                setErrorMessage(responseData.error || "Error al registrar tratamiento.") 
                if (responseData.error.includes("un registro al día")) {
                    const nextTime = new Date() 
                    nextTime.setHours(23, 59, 59, 999) 
                    setNextRegistro(nextTime) 
                }
            }
        } catch (error) {
            setErrorMessage("Error de conexión.") 
        } finally {
            setIsLoading(false) 
        }
    } 

    const renderCountdown = () => {
        if (!nextRegistro) return null 
        const { hours, minutes, seconds } = countdown 

        return (
            <div className="grid grid-flow-col gap-5 text-center auto-cols-max">
                <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
                    <span className="countdown font-mono text-5xl">
                        <span style={{ "--value": hours }}></span>
                    </span>
                    hours
                </div>
                <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
                    <span className="countdown font-mono text-5xl">
                        <span style={{ "--value": minutes }}></span>
                    </span>
                    min
                </div>
                <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
                    <span className="countdown font-mono text-5xl">
                        <span style={{ "--value": seconds }}></span>
                    </span>
                    sec
                </div>
            </div>
        ) 
    } 

    return (
        <SanitarioCheck>
            <div className="flex justify-center text-center m-10">
                <div className="breadcrumbs text-xl">
                    <ul>
                        <li><a href="/dashboard">Panel de control</a></li>
                        <li><a href="/tratamientos">Tratamientos</a></li>
                        <li>Añadir registro de cumplimiento</li>
                    </ul>
                </div>
            </div>

            <div className="flex items-center justify-center m-10">
                <div className="card bg-base-100 w-full max-w-xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="flex flex-col items-center">
                        <div className="form-control mb-4 w-full">
                            <select
                                className="select select-primary w-full"
                                value={selectedPaciente}
                                onChange={handlePacienteChange}
                                required
                            >
                                <option disabled value="">Seleccione un paciente</option>
                                {pacientes.map(paciente => (
                                    <option key={paciente.dni} value={paciente.dni}>
                                        {paciente.apellidos}, {paciente.nombre} - {paciente.dni}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-control mb-4 w-full">
                            <select
                                className="select select-primary w-full"
                                value={selectedTratamiento}
                                onChange={handleTratamientoChange}
                                required
                            >
                                <option disabled value="">Seleccione un tratamiento</option>
                                {tratamientos.map(tratamiento => (
                                    <option key={tratamiento.id} value={tratamiento.id}>
                                        {tratamiento.nombre} - {tratamiento.descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {nextRegistro ? (
                            <><p className="text text-center mb-4">
                                Tiempo restante hasta el próximo registro:
                            </p>
                                {renderCountdown()}
                                <p className="text-red-600 mt-4 text-center">
                                    Sólo se puede añadir un registro al día para este tipo de tratamiento.
                                </p>
                            </>
                        ) : (
                            <div className="form-control mb-4 w-full">
                                <textarea
                                    className="textarea textarea-primary w-full"
                                    placeholder="Detalles del registro"
                                    value={detalles}
                                    onChange={(e) => setDetalles(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                        )}

                        {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}
                        {successMessage && <p className="text-green-600 text-center">{successMessage}</p>}

                        <div className="form-control w-full">
                            <button className="btn btn-primary w-full text-white mt-10" type="submit" disabled={isLoading || nextRegistro}>
                                {isLoading ? "Registrando..." : "Registrar cumplimiento"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showNoTratamientosDialog && (
                <dialog open className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Sin tratamientos no farmacológicos</h3>
                        <p className="py-4">Este paciente no tiene tratamientos no farmacológicos activos.</p>
                        <div className="modal-action">
                            <button onClick={() => setShowNoTratamientosDialog(false)} className="btn">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
        </SanitarioCheck>
    ) 
} 

export default TratamientoRegistro 
