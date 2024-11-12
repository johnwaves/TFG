import { useState, useEffect } from "react"
import SanitarioCheck from "../checks/SanitarioCheck"

const PacienteForm = () => {
    const [dni, setDni] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")
    const [nombre, setNombre] = useState("")
    const [apellidos, setApellidos] = useState("")
    const [telefono, setTelefono] = useState("")
    const [fechaNac, setFechaNac] = useState("")
    const [direccion, setDireccion] = useState("")
    const [role, setRole] = useState("")
    const [idFarmacia, setIdFarmacia] = useState(null)
    const [pacientes, setPacientes] = useState([])
    const [selectedPacienteDni, setSelectedPacienteDni] = useState("")
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
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })

                    const data = await response.json()
                    if (response.ok) {
                        setIdFarmacia(data.idFarmacia)
                        if (role === "TUTOR") {
                            await fetchPacientesSinTutor(data.idFarmacia, token)
                        }
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
    }, [role])

    const fetchPacientesSinTutor = async (farmaciaId, token) => {
        try {
            const response = await fetch(`http://localhost:3000/api/farmacias/${farmaciaId}/pacientesnotutor`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await response.json()
            if (response.ok) {
                setPacientes(data)
            } else {
                setErrorMessage(data.error || "No se encontraron pacientes para esta farmacia.")
            }
        } catch (error) {
            console.error("Error al obtener los pacientes de la farmacia:", error)
            setErrorMessage("Error de conexión al obtener los pacientes de la farmacia.")
        }
    }

    const validateForm = () => {
        if (!dni || !password || !email || !nombre || !apellidos || !telefono || !fechaNac || !direccion || !role) {
            setErrorMessage("Todos los campos son obligatorios.")
            return false
        }
        if (!/^\d{8}[A-Z]$/.test(dni)) {
            setErrorMessage("DNI no válido.")
            return false
        }
        if (telefono.length !== 9 || !/^\d{9}$/.test(telefono)) {
            setErrorMessage("El teléfono debe contener 9 dígitos.")
            return false
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setErrorMessage("El email no es válido.")
            return false
        }
        const date = new Date(fechaNac)
        if (isNaN(date.getTime())) {
            setErrorMessage("Fecha de nacimiento no válida.")
            return false
        }
        if (role === "TUTOR" && !selectedPacienteDni) {
            setErrorMessage("Debe seleccionar un paciente para el tutor.")
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
            dni,
            password,
            email,
            nombre,
            apellidos,
            telefono,
            fechaNac,
            direccion,
            role,
            idFarmacia,

            // OJO: No asigna nada si se está creando un paciente y no un tutor
            dniPaciente: role === "TUTOR" ? selectedPacienteDni : null,
        }

        try {
            const response = await fetch("http://localhost:3000/api/users/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
                },
                body: JSON.stringify(data),
            })

            const responseData = await response.json()
            if (response.ok) {
                setSuccessMessage("Usuario creado con éxito")

                setTimeout(() => {
                    setSuccessMessage("")
                }, 3000)


                setDni("")
                setPassword("")
                setEmail("")
                setNombre("")
                setApellidos("")
                setTelefono("")
                setFechaNac("")
                setDireccion("")
                setRole("PACIENTE")
                setSelectedPacienteDni("")

            } else {
                setErrorMessage(responseData.error || "Error al crear el usuario")
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
                        <li><a href="/pacientes">Pacientes</a></li>
                        <li><a>Añadir paciente a farmacia</a></li>
                    </ul>
                </div>
            </div>

            <div className="flex items-center justify-center m-10">
                <div className="card bg-base-100 w-full max-w-md shadow-2xl p-8">

                    <form onSubmit={handleSubmit}>
                        <div className="form-control mb-4">
                            <label className="input input-bordered input-primary flex items-center gap-2">
                                <input
                                    type="text"
                                    className="grow"
                                    placeholder="DNI"
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value)}
                                    required
                                />
                            </label>
                        </div>

                        <div className="form-control mb-4">
                            <label className="input input-bordered input-primary flex items-center gap-2">
                                <input
                                    type="password"
                                    className="grow"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </label>
                        </div>

                        <div className="form-control mb-4">
                            <label className="input input-bordered input-primary flex items-center gap-2">
                                <input
                                    type="email"
                                    className="grow"
                                    placeholder="Correo electrónico"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </label>
                        </div>

                        <div className="form-control mb-4">
                            <label className="input input-bordered input-primary flex items-center gap-2">
                                <input
                                    type="text"
                                    className="grow"
                                    placeholder="Nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                />
                            </label>
                        </div>

                        <div className="form-control mb-4">
                            <label className="input input-bordered input-primary flex items-center gap-2">
                                <input
                                    type="text"
                                    className="grow"
                                    placeholder="Apellidos"
                                    value={apellidos}
                                    onChange={(e) => setApellidos(e.target.value)}
                                    required
                                />
                            </label>
                        </div>

                        <div className="form-control mb-4">
                            <label className="input input-bordered input-primary flex items-center gap-2">
                                <input
                                    type="tel"
                                    className="grow"
                                    placeholder="Teléfono"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    required
                                />
                            </label>
                        </div>

                        <div className="form-control mb-4">
                            <label className="input input-bordered input-primary flex items-center gap-2">
                                <input
                                    type="text"
                                    className="grow"
                                    placeholder="Dirección"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    required
                                />
                            </label>
                        </div>

                        <div className="form-control mb-4">
                            <span className="text-lg">Rol:</span>
                            <label className="label cursor-pointer">
                                <span className="label-text">Paciente</span>
                                <input
                                    type="radio"
                                    name="role"
                                    className="radio radio-primary"
                                    checked={role === "PACIENTE"}
                                    onChange={() => setRole("PACIENTE")}
                                />
                            </label>
                            <label className="label cursor-pointer">
                                <span className="label-text">Tutor</span>
                                <input
                                    type="radio"
                                    name="role"
                                    className="radio radio-primary"
                                    checked={role === "TUTOR"}
                                    onChange={() => setRole("TUTOR")}
                                />
                            </label>
                        </div>

                        <div className="form-control mb-4">
                            <span className="text-lg">Fecha de nacimiento:</span>
                            <label className="input input-bordered input-primary flex items-center gap-2 mt-2">
                                <input
                                    type="date"
                                    className="grow"
                                    placeholder="Fecha de nacimiento"
                                    value={fechaNac}
                                    onChange={(e) => setFechaNac(e.target.value)}
                                    required
                                />
                            </label>
                        </div>

                        {role === "TUTOR" && (
                            <div className="form-control mb-4">
                                <label className="text-lg mb-2">Seleccionar paciente:</label>
                                <select
                                    className="select select-primary w-full max-w-lg"
                                    value={selectedPacienteDni}
                                    onChange={(e) => setSelectedPacienteDni(e.target.value)}
                                >
                                    <option disabled value="">
                                        Pacientes en la farmacia
                                    </option>
                                    {pacientes.map((paciente, idx) => (
                                        <option key={idx} value={paciente.dni}>
                                            {paciente.apellidos}, {paciente.nombre} - {paciente.dni}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="h-6 flex items-center justify-center">
                            {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}
                            {successMessage && <p className="text-green-600 text-center">{successMessage}</p>}
                        </div>

                        <div className="form-control mt-4">
                            <button className="btn btn-primary text-white" disabled={isLoading}>
                                {isLoading ? (
                                    <span className="loading loading-dots loading-lg text-white"></span>
                                ) : (
                                    "Crear usuario"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SanitarioCheck>
    )
}

export default PacienteForm  
