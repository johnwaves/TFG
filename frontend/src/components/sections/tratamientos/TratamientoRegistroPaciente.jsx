import { useState, useEffect } from "react" 
import PacienteCheck from "../checks/PacienteCheck" 

const TratamientoRegistroPaciente = () => {
    const [tratamientos, setTratamientos] = useState([]) 
    const [selectedTratamiento, setSelectedTratamiento] = useState("") 
    const [selectedTratamientoTipo, setSelectedTratamientoTipo] = useState("") 
    const [detalles, setDetalles] = useState("") 
    const [errorMessage, setErrorMessage] = useState("") 
    const [successMessage, setSuccessMessage] = useState("") 
    const [nextRegistro, setNextRegistro] = useState(null) 
    const [isLoading, setIsLoading] = useState(false) 
    const [showNoTratamientosDialog, setShowNoTratamientosDialog] = useState(false) 
    const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 }) 

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
                        body: JSON.stringify({
                            dniSolicitante: user.dni,
                            dniSolicitado: user.dni
                        })
                    }) 
                    const data = await response.json() 
                    if (response.ok) {
                        const today = new Date() 
                        const activeTratamientos = data.filter(tratamiento => {
                            const endDate = new Date(tratamiento.fecha_fin) 
                            return !tratamiento.fecha_fin || endDate >= today 
                        }) 

                        if (activeTratamientos.length === 0) {
                            setShowNoTratamientosDialog(true) 
                        } else {
                            setTratamientos(activeTratamientos) 
                        }
                    } else {
                        setErrorMessage(data.error || "Error al obtener los tratamientos.") 
                    }
                } catch (error) {
                    setErrorMessage("Hubo un problema con la conexión. Inténtelo de nuevo más tarde.") 
                }
            }
        } 
        fetchTratamientos() 
    }, []) 

    const fetchLastRegistro = async (tratamientoId, tipo, intervalo = 0) => {
        try {
            const token = sessionStorage.getItem("jwtToken") 
            const response = await fetch(`http://localhost:3000/api/tratamientos/${tratamientoId}/lastregistro`, {
                headers: { Authorization: `Bearer ${token}` }
            }) 
            const data = await response.json() 
            
            if (response.ok) {
                const lastRegistroDate = new Date(data.lastRegistroDate) 
                
                // alert(`Último registro: ${lastRegistroDate.toLocaleString()}`) 
    
                if (tipo === "FARMACOLOGICO" && intervalo > 0) {
                    const nextDoseTime = new Date(lastRegistroDate.getTime() + intervalo * 60 * 60 * 1000) 
                    // alert(`Intervalo de dosis: ${intervalo} horas`) 
                    // alert(`Siguiente toma permitida: ${nextDoseTime.toLocaleString()}`) 
                    
                    setNextRegistro(nextDoseTime > new Date() ? nextDoseTime : null) 
                } else if (tipo === "NO_FARMACOLOGICO") {
                    const today = new Date() 
                    today.setHours(0, 0, 0, 0) 
                    const lastRegistroDay = new Date(lastRegistroDate) 
                    lastRegistroDay.setHours(0, 0, 0, 0)  
    
                    if (lastRegistroDay.getTime() === today.getTime()) {
                        const nextAvailableDate = new Date(today) 
                        nextAvailableDate.setDate(today.getDate() + 1) 
                        // alert(`Siguiente registro permitido para NO_FARMACOLOGICO: ${nextAvailableDate.toLocaleString()}`) 
                        setNextRegistro(nextAvailableDate) 
                    } else {
                        setNextRegistro(null) 
                    }
                }
            } else {
                // alert(`Error al verificar el tiempo para el próximo registro: ${data.error}`) 
                setErrorMessage(data.error || "Error al verificar el tiempo para el próximo registro.") 
            }
        } catch (error) {
            // alert("Error de conexión al intentar verificar el tiempo para el próximo registro.") 
            setErrorMessage("Error al verificar el tiempo para el próximo registro.") 
        }
    } 
      
    const handleTratamientoChange = (e) => {
        const tratamientoId = e.target.value 
        const selectedTratamientoData = tratamientos.find(t => t.id === parseInt(tratamientoId)) 
        setSelectedTratamiento(tratamientoId) 
        setDetalles("") 
        setSuccessMessage("") 
        setErrorMessage("") 
    
        if (selectedTratamientoData) {
            const { tipo, dosis } = selectedTratamientoData 
            setSelectedTratamientoTipo(tipo) 
            const intervalo = tipo === "FARMACOLOGICO" && dosis ? dosis.intervalo : 0 
            fetchLastRegistro(tratamientoId, tipo, intervalo) 
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
            // alert(`Respuesta del backend: ${JSON.stringify(responseData)}`)   
    
            if (response.ok) {
                setSuccessMessage("Registro añadido con éxito.") 
                setNextRegistro(null) 
                setDetalles("") 
                setTimeout(() => setSuccessMessage(""), 3000) 
            } else {
                setErrorMessage(responseData.error || "Error al registrar tratamiento.") 
                // alert(`Error del backend: ${responseData.error || "Error al registrar tratamiento."}`)  
                if (responseData.error.includes("un registro al día") || responseData.error.includes("intervalo")) {
                    const nextTime = new Date() 
                    nextTime.setHours(23, 59, 59, 999) 
                    setNextRegistro(nextTime)   
                }
            }
        } catch (error) {
            setErrorMessage("Error de conexión.") 
            // alert("Error de conexión al intentar registrar tratamiento.") 
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
                    horas
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
                    seg
                </div>
            </div>
        ) 
    } 
    
    
    const getMessageForTratamientoTipo = () => {
        if (selectedTratamientoTipo === "NO_FARMACOLOGICO") {
            return "Sólo se puede añadir un registro al día." 
        } else if (selectedTratamientoTipo === "FARMACOLOGICO") {
            return "Se puede añadir un registro en el intervalo de dosis." 
        }
        return "" 
    } 

    return (
        <PacienteCheck>
            <div className="flex justify-center text-center m-10">
                <div className="breadcrumbs text-xl">
                    <ul>
                        <li><a href="/dashboard">Panel de control</a></li>
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
                            <>
                                <p className="text text-center mb-4">
                                    Tiempo restante hasta el próximo registro:
                                </p>
                                {renderCountdown()}
                                <p className="text-red-600 mt-4 text-center">
                                    {getMessageForTratamientoTipo()}
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
                        <h3 className="font-bold text-lg">Sin tratamientos activos</h3>
                        <p className="py-4">No tienes tratamientos activos actualmente.</p>
                        <div className="modal-action">
                            <button onClick={() => setShowNoTratamientosDialog(false)} className="btn">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
        </PacienteCheck>
    ) 
    
    
} 

export default TratamientoRegistroPaciente 
