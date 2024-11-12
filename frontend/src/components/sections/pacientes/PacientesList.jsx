import { useState, useEffect } from "react"
import SanitarioCheck from "../checks/SanitarioCheck"

const PacientesList = () => {
    const [pacientes, setPacientes] = useState([])
    const [errorMessage, setErrorMessage] = useState("")
    const [editIndex, setEditIndex] = useState(null)
    const [adherenciaTotal, setAdherenciaTotal] = useState(0)
    const [selectedPacienteIndex, setSelectedPacienteIndex] = useState(null)
    const [editedPaciente, setEditedPaciente] = useState({
        dni: "",
        nombre: "",
        apellidos: "",
        telefono: "",
        fecha_nacimiento: "",
        direccion: "",
        email: "",
        tutor: null,
    })
    const [pacienteToDelete, setPacienteToDelete] = useState(null)
    const [idFarmacia, setIdFarmacia] = useState(null)
    const [newPassword, setNewPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [passwordSuccess, setPasswordSuccess] = useState("")

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

    const fetchAdherenciaTotal = async (pacienteDni) => {
        const user = JSON.parse(sessionStorage.getItem("user"))

        if (user && user.dni) {
            try {
                const token = sessionStorage.getItem("jwtToken")
                const adherenciaResponse = await fetch(`http://localhost:3000/api/tratamientos/adherencia/${pacienteDni}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                const adherenciaData = await adherenciaResponse.json()
                if (adherenciaResponse.ok) {
                    setAdherenciaTotal(adherenciaData.adherenciaTotal)
                } else {
                    console.error("Error al obtener la adherencia total:", adherenciaData.error)
                }

            } catch (error) {
                console.error("Error al obtener la adherencia total:", error)
            }
        }
    }

    const fetchPacientes = async (farmaciaId, token) => {
        if (!farmaciaId) return
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

    const handleEdit = (index, paciente) => {
        setEditIndex(index)
        setSelectedPacienteIndex(index)
        setEditedPaciente({
            dni: paciente.dni,
            nombre: paciente.nombre,
            apellidos: paciente.apellidos,
            telefono: paciente.telefono,
            fecha_nacimiento: paciente.fecha_nacimiento.slice(0, 10),
            direccion: paciente.direccion,
            email: paciente.email,
            tutor: paciente.tutor
                ? {
                    nombre: paciente.tutor.nombre,
                    apellidos: paciente.tutor.apellidos,
                    dni: paciente.tutor.dni,
                }
                : null,
        })
    }

    const handleSave = async (pacienteDni) => {
        try {
            const response = await fetch(`http://localhost:3000/api/users/${pacienteDni}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
                },
                body: JSON.stringify(editedPaciente),
            })
            const data = await response.json()
            if (response.ok) {
                const updatedPacientes = [...pacientes]
                updatedPacientes[editIndex] = { ...updatedPacientes[editIndex], ...editedPaciente }
                setPacientes(updatedPacientes)
                setEditIndex(null)
                setSelectedPacienteIndex(null)
                setErrorMessage("")
            } else {
                setErrorMessage(data.error || "Error al actualizar el paciente.")
            }
        } catch (error) {
            setErrorMessage("Hubo un problema con la actualización. Inténtelo de nuevo más tarde.")
        }
    }

    const confirmDelete = (paciente) => {
        setPacienteToDelete(paciente)
        document.getElementById("delete_confirm_modal").showModal()
    }

    const handleDelete = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/farmacias/${idFarmacia}/pacientes/${pacienteToDelete.dni}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}` },
                }
            )
            const data = await response.json()
            if (response.ok) {
                setPacientes(pacientes.filter((paciente) => paciente.dni !== pacienteToDelete.dni))
                setPacienteToDelete(null)
                document.getElementById("delete_confirm_modal").close()
            } else {
                setErrorMessage(data.error || "Error al eliminar el paciente.")
            }
        } catch (error) {
            setErrorMessage("Hubo un problema con la eliminación. Inténtelo de nuevo más tarde.")
        }
    }

    const handleResetPassword = async (pacienteDni) => {
        if (!newPassword || newPassword.length < 6) {
            setPasswordError("La contraseña debe tener al menos 6 caracteres.")
            return
        }
        try {
            const response = await fetch(`http://localhost:3000/api/users/${pacienteDni}/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`
                },
                body: JSON.stringify({ newPassword })
            })
            const data = await response.json()
            if (response.ok) {
                setPasswordSuccess("Contraseña restablecida con éxito.")
                setNewPassword("")
            } else {
                setPasswordError(data.error || "Error al restablecer la contraseña.")
            }
        } catch (error) {
            setPasswordError("Hubo un problema al restablecer la contraseña. Inténtelo más tarde.")
        }
    }

    const togglePacienteDetails = (index, pacienteDni) => {
        if (selectedPacienteIndex === index) {
            setSelectedPacienteIndex(null)
            setEditIndex(null)
            setAdherenciaTotal(0)
        } else {
            setSelectedPacienteIndex(index)
            fetchAdherenciaTotal(pacienteDni)
        }
    }

    const getProgressClass = (percentage) => {
        if (percentage < 33) return "progress-error"
        if (percentage < 66) return "progress-warning"
        return "progress-primary"
    }

    return (
        <SanitarioCheck>
            <div className="flex justify-center text-center m-10">
                <div className="breadcrumbs text-xl">
                    <ul>
                        <li><a href="/dashboard">Panel de control</a></li>
                        <li><a href="/pacientes">Pacientes</a></li>
                        <li>Listado de pacientes</li>
                    </ul>
                </div>
            </div>

            <div className="overflow-x-auto mb-10">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th style={{ width: "50px" }}></th>
                            <th style={{ width: "120px" }}>DNI</th>
                            <th style={{ width: "400px" }}>Apellidos y nombre</th>
                            <th style={{ width: "150px" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pacientes.map((paciente, index) => (
                            <tr key={paciente.dni} className="hover">
                                <th>{index + 1}</th>
                                <td>{paciente.dni}</td>
                                <td>
                                    <div className="collapse collapse-arrow">
                                        <input
                                            type="checkbox"
                                            checked={selectedPacienteIndex === index}
                                            onChange={() => togglePacienteDetails(index, paciente.dni)}
                                        />
                                        <div className="collapse-title">
                                            {paciente.apellidos}, {paciente.nombre}
                                        </div>
                                        {selectedPacienteIndex === index && (
                                            <div className="collapse-content">
                                                <label className="form-control w-full max-w-xs">
                                                    <div className="label">
                                                        <span className="label-text">Teléfono</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={editIndex === index ? editedPaciente.telefono : paciente.telefono}
                                                        onChange={(e) =>
                                                            setEditedPaciente({
                                                                ...editedPaciente,
                                                                telefono: e.target.value,
                                                            })
                                                        }
                                                        className="input input-bordered w-full max-w-xs"
                                                        disabled={editIndex !== index}
                                                    />
                                                </label>
                                                <label className="form-control w-full max-w-xs">
                                                    <div className="label">
                                                        <span className="label-text">Fecha de nacimiento</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={paciente.fecha_nacimiento.slice(0, 10)}
                                                        className="input input-bordered w-full max-w-xs"
                                                        disabled
                                                    />
                                                </label>
                                                <label className="form-control w-full max-w-xs">
                                                    <div className="label">
                                                        <span className="label-text">Dirección</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={editIndex === index ? editedPaciente.direccion : paciente.direccion}
                                                        onChange={(e) =>
                                                            setEditedPaciente({
                                                                ...editedPaciente,
                                                                direccion: e.target.value,
                                                            })
                                                        }
                                                        className="input input-bordered w-full max-w-xs"
                                                        disabled={editIndex !== index}
                                                    />
                                                </label>
                                                <label className="form-control w-full max-w-xs">
                                                    <div className="label">
                                                        <span className="label-text">Email</span>
                                                    </div>
                                                    <input
                                                        type="email"
                                                        value={editIndex === index ? editedPaciente.email : paciente.email}
                                                        onChange={(e) =>
                                                            setEditedPaciente({
                                                                ...editedPaciente,
                                                                email: e.target.value,
                                                            })
                                                        }
                                                        className="input input-bordered w-full max-w-xs"
                                                        disabled={editIndex !== index}
                                                    />
                                                </label>
                                                <label className="form-control w-full max-w-xs">
                                                    <div className="label">
                                                        <span className="label-text">Tutor</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={
                                                            paciente.tutor
                                                                ? `${paciente.tutor.nombre} ${paciente.tutor.apellidos}`
                                                                : "Sin tutor"
                                                        }
                                                        className="input input-bordered w-full max-w-xs"
                                                        disabled
                                                    />
                                                </label>
                                                <label className="form-control w-full max-w-xs">
                                                    <div className="label">
                                                        <span className="label-text">Nivel de adherencia:</span>
                                                    </div>
                                                    {adherenciaTotal ? (
                                                        <>
                                                            <div className="flex items-center">
                                                                <progress
                                                                    className={`progress ${getProgressClass(adherenciaTotal)} w-56`}
                                                                    value={adherenciaTotal}
                                                                    max={100}
                                                                ></progress>
                                                                <span className="ml-2">{adherenciaTotal}%</span>
                                                            </div>

                                                        </>
                                                    ) : (
                                                        <span>No definida</span>
                                                    )}
                                                </label>
                                                <label className="form-control w-full max-w-xs mt-4">
                                                    <div className="label">
                                                        <span className="label-text">Restablecer contraseña</span>
                                                    </div>
                                                    <input
                                                        type="password"
                                                        placeholder="Nueva contraseña"
                                                        value={newPassword}
                                                        onChange={(e) => {
                                                            setNewPassword(e.target.value)
                                                            setPasswordError("")
                                                            setPasswordSuccess("")
                                                        }}
                                                        className="input input-bordered w-full max-w-xs"
                                                    />
                                                </label>
                                                <button
                                                    className="btn btn-primary mt-2 text-white"
                                                    onClick={() => handleResetPassword(paciente.dni)}
                                                >
                                                    Restablecer contraseña
                                                </button>
                                                {passwordError && <p className="text-error mt-2">{passwordError}</p>}
                                                {passwordSuccess && <p className="text-success mt-2">{passwordSuccess}</p>}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex">
                                        {editIndex === index ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer" onClick={() => handleSave(paciente.dni)} aria-label="Guardar cambios" title="Guardar cambios">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-6 cursor-pointer" onClick={() => handleEdit(index, paciente)} aria-label="Editar paciente" title="Editar paciente">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                            </svg>
                                        )}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-6 cursor-pointer ml-2" onClick={() => confirmDelete(paciente)} aria-label="Eliminar paciente" title="Eliminar paciente">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <dialog id="delete_confirm_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Confirmar eliminación</h3>
                    <p className="py-4">
                        ¿Desea eliminar el paciente "{pacienteToDelete?.nombre} {pacienteToDelete?.apellidos}"?
                    </p>
                    <div className="modal-action">
                        <button className="btn btn-error" onClick={handleDelete}>
                            Aceptar
                        </button>
                        <button
                            className="btn"
                            onClick={() => document.getElementById("delete_confirm_modal").close()}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </dialog>

            {errorMessage && (
                <dialog open className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg text-error">Error</h3>
                        <p className="py-4">{errorMessage}</p>
                        <div className="modal-action">
                            <button onClick={() => setErrorMessage("")} className="btn">Cerrar</button>
                        </div>
                    </div>
                </dialog>
            )}
        </SanitarioCheck>
    )
}

export default PacientesList 
