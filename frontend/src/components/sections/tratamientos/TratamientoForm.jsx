import { useState, useEffect } from "react" 
import SanitarioCheck from "../checks/SanitarioCheck" 

const TratamientoForm = () => {
    const [nombre, setNombre] = useState("") 
    const [descripcion, setDescripcion] = useState("") 
    const [tipo, setTipo] = useState("") 
    const [dosis, setDosis] = useState({ cantidad: "", intervalo: "", duracion: "" }) 
    const [fechaFin, setFechaFin] = useState("") 
    const [idFarmacia, setIdFarmacia] = useState(null) 
    const [pacientes, setPacientes] = useState([]) 
    const [idPaciente, setIdPaciente] = useState("") 
    const [isLoading, setIsLoading] = useState(false) 
    const [errorMessage, setErrorMessage] = useState("") 
    const [successMessage, setSuccessMessage] = useState("") 

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
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            }) 
            const data = await response.json() 
            if (response.ok) {
                setPacientes(data) 
            } else {
                setErrorMessage(data.error || "Error al obtener los pacientes.") 
            }
        } catch (error) {
            console.error("Error fetching pacientes:", error) 
            setErrorMessage("Hubo un problema con la conexión. Inténtelo de nuevo más tarde.") 
        }
    } 

    const validateForm = () => {
        if (!nombre || !descripcion || !tipo || !idPaciente) {
            setErrorMessage("Todos los campos son obligatorios.") 
            return false 
        }
        if (tipo === "FARMACOLOGICO" && (!dosis.cantidad || !dosis.intervalo || !dosis.duracion)) {
            setErrorMessage("Todos los campos de dosis son obligatorios para un tratamiento farmacológico.") 
            return false 
        }
        if (tipo === "NO_FARMACOLOGICO" && !fechaFin) {
            setErrorMessage("La fecha de fin es obligatoria para un tratamiento no farmacológico.") 
            return false 
        }
        setErrorMessage("") 
        return true 
    } 

    const handleSubmit = async (e) => {
        e.preventDefault() 
        if (!validateForm()) return 

        setIsLoading(true) 
        setErrorMessage("") 
        setSuccessMessage("") 

        const data = {
            nombre,
            descripcion,
            tipo,
            idPaciente,
            dosis: tipo === "FARMACOLOGICO" ? dosis : null,
            fecha_fin: tipo === "NO_FARMACOLOGICO" ? fechaFin : null,
        } 

        try {
            const response = await fetch("http://localhost:3000/api/tratamientos/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
                },
                body: JSON.stringify(data),
            }) 

            const responseData = await response.json() 
            if (response.ok) {
                setSuccessMessage("Tratamiento creado con éxito") 
                setTimeout(() => setSuccessMessage(""), 3000) 
                setNombre("") 
                setDescripcion("") 
                setTipo("") 
                setDosis({ cantidad: "", intervalo: "", duracion: "" }) 
                setFechaFin("") 
                setIdPaciente("") 
            } else {
                setErrorMessage(responseData.error || "Error al crear el tratamiento") 
            }
        } catch (error) {
            console.error("Hubo un error de conexión:", error) 
            setErrorMessage("Hubo un problema con la conexión. Inténtelo de nuevo más tarde.") 
        } finally {
            setIsLoading(false) 
        }
    } 

    return (
        <SanitarioCheck>
            <div className="flex justify-center text-center m-10">
                <div className="breadcrumbs text-xl">
                    <ul>
                        <li><a href="/dashboard">Panel de control</a></li>
                        <li><a href="/tratamientos">Tratamientos</a></li>
                        <li>Crear tratamiento a paciente</li>
                    </ul>
                </div>
            </div>

            <div className="flex items-center justify-center m-10">
                <div className="card bg-base-100 w-full max-w-xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="form-control mb-4">
                            <input
                                type="text"
                                className="input input-bordered input-primary"
                                placeholder="Nombre del tratamiento"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-control mb-4">
                            <textarea
                                className="textarea textarea-primary"
                                placeholder="Descripción"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                required
                            ></textarea>
                        </div>


                        <div className="form-control mb-4">
                            <span className="text-lg">Tipo:</span>
                            <label className="label cursor-pointer">
                                <span className="label-text">Farmacológico</span>
                                <input
                                    type="radio"
                                    name="tipo"
                                    className="radio radio-primary"
                                    checked={tipo === "FARMACOLOGICO"}
                                    onChange={() => setTipo("FARMACOLOGICO")}
                                />
                            </label>
                            <label className="label cursor-pointer">
                                <span className="label-text">No Farmacológico</span>
                                <input
                                    type="radio"
                                    name="tipo"
                                    className="radio radio-primary"
                                    checked={tipo === "NO_FARMACOLOGICO"}
                                    onChange={() => setTipo("NO_FARMACOLOGICO")}
                                />
                            </label>
                        </div>

                        {tipo === "FARMACOLOGICO" && (
                            <div className="form-control mb-4">
                                <label className="text-lg mb-2">Dosis:</label>
                                <div className="flex gap-4">
                                    <label className="input input-bordered input-primary flex items-center gap-2 flex-1">
                                        <input
                                            type="number"
                                            placeholder="Cantidad"
                                            className="w-full"
                                            value={dosis.cantidad}
                                            onChange={(e) => setDosis({ ...dosis, cantidad: parseInt(e.target.value) || 0 })}
                                            required
                                            style={{
                                                MozAppearance: 'textfield',
                                                WebkitAppearance: 'none',
                                                appearance: 'textfield'
                                            }}
                                        />
                                        <span className="text-gray-500">mg</span>
                                    </label>

                                    <label className="input input-bordered input-primary flex items-center gap-2 flex-1">
                                        <input
                                            type="number"
                                            placeholder="Intervalo"
                                            className="input-primary w-full"
                                            value={dosis.intervalo}
                                            onChange={(e) => setDosis({ ...dosis, intervalo: parseInt(e.target.value) || 0 })}
                                            required
                                            style={{
                                                MozAppearance: 'textfield',
                                                WebkitAppearance: 'none',
                                                appearance: 'textfield'
                                            }}
                                        />
                                        <span className="text-gray-500">horas</span>
                                    </label>

                                    <label className="input input-bordered input-primary flex items-center gap-2 flex-1">
                                        <input
                                            type="number"
                                            placeholder="Duración"
                                            className="input-primary w-full"
                                            value={dosis.duracion}
                                            onChange={(e) => setDosis({ ...dosis, duracion: parseInt(e.target.value) || 0 })}
                                            required
                                            style={{
                                                MozAppearance: 'textfield',
                                                WebkitAppearance: 'none',
                                                appearance: 'textfield'
                                            }}
                                        />
                                        <span className="text-gray-500">días</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {tipo === "NO_FARMACOLOGICO" && (
                            <div className="form-control mb-4">
                                <label className="text-lg mb-2">Fecha de fin:</label>
                                <input
                                    type="date"
                                    className="input input-bordered input-primary"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="form-control mb-4">
                            <label className="text-lg mb-2">Seleccionar paciente:</label>
                            <select
                                className="select select-primary w-full max-w-lg"
                                value={idPaciente}
                                onChange={(e) => setIdPaciente(e.target.value)}
                                required
                            >
                                <option disabled value="">
                                    Pacientes en la farmacia
                                </option>
                                {pacientes.map((paciente, idx) => (
                                    <option key={idx} value={paciente.dni}>
                                        {paciente.dni} - {paciente.apellidos}, {paciente.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="h-6 flex items-center justify-center">
                            {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}
                            {successMessage && <p className="text-green-600 text-center">{successMessage}</p>}
                        </div>

                        <div className="form-control mt-4">
                            <button className="btn btn-primary text-white" disabled={isLoading}>
                                {isLoading ? (
                                    <span className="loading loading-dots loading-lg text-white"></span>
                                ) : (
                                    "Crear tratamiento"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SanitarioCheck>
    ) 
} 

export default TratamientoForm 
