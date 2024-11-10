import { useState, useEffect } from "react"
import SanitarioCheck from "../checks/SanitarioCheck"

const TratamientosList = () => {
    const [pacientes, setPacientes] = useState([])
    const [selectedPaciente, setSelectedPaciente] = useState(null)
    const [pacienteHeader, setPacienteHeader] = useState("")
    const [tratamientos, setTratamientos] = useState([])
    const [sanitariosData, setSanitariosData] = useState({})
    const [activeTab, setActiveTab] = useState("activos")
    const [errorMessage, setErrorMessage] = useState("")
    const [editIndex, setEditIndex] = useState(null)
    const [selectedTratamientoIndex, setSelectedTratamientoIndex] = useState(null)
    const [editedTratamiento, setEditedTratamiento] = useState({})
    const [tratamientoToDelete, setTratamientoToDelete] = useState(null)
    const [noTratamientos, setNoTratamientos] = useState(false)
    const [showActionNotAllowed, setShowActionNotAllowed] = useState(false)


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
            console.error("Error fetching pacientes:", error)
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
                setTratamientos(data)
                setNoTratamientos(data.length === 0)
                fetchSanitariosData(data)
                if (selectedPaciente) {
                    setPacienteHeader(`${selectedPaciente.dni} - ${selectedPaciente.apellidos}, ${selectedPaciente.nombre}`)
                }
            } else {
                setErrorMessage(data.error || "Error al obtener los tratamientos.")
            }
        } catch (error) {
            console.error("Error al obtener los tratamientos:", error)
            setErrorMessage("Hubo un problema con la conexión. Inténtelo de nuevo más tarde.")
        }
    }

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

    const handleSearch = () => {
        if (selectedPaciente) {
            fetchTratamientos(selectedPaciente.dni)
        }
    }

    const handleEdit = (index, tratamiento) => {
        const today = new Date();
        const hasFinalizado = tratamiento.fecha_fin && new Date(tratamiento.fecha_fin) < today;

        if (!hasFinalizado) {
            setEditIndex(index);
            setSelectedTratamientoIndex(index);
            setEditedTratamiento({ ...tratamiento });
        } else {
            setShowActionNotAllowed(true);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setEditIndex(null);
        setSelectedTratamientoIndex(null);
    };

    const handleSave = async (tratamientoId) => {
        try {
            const payload = {
                descripcion: editedTratamiento.descripcion,
                tipo: editedTratamiento.tipo,
                fecha_fin: editedTratamiento.fecha_fin ? new Date(editedTratamiento.fecha_fin).toISOString().split('T')[0] : null,
            }

            if (editedTratamiento.tipo === "FARMACOLOGICO" && editedTratamiento.dosis) {
                payload.dosis = {
                    cantidad: editedTratamiento.dosis.cantidad,
                    intervalo: editedTratamiento.dosis.intervalo,
                    duracion: editedTratamiento.dosis.duracion
                }
            }

            const response = await fetch(`http://localhost:3000/api/tratamientos/${tratamientoId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json()
            if (response.ok) {
                const updatedTratamientos = [...tratamientos]
                updatedTratamientos[editIndex] = { ...updatedTratamientos[editIndex], ...editedTratamiento }
                setTratamientos(updatedTratamientos)
                setEditIndex(null)
                setSelectedTratamientoIndex(null)
                setErrorMessage("")
            } else {
                console.error("Error al actualizar el tratamiento:", data.error || "Unknown error")
                setErrorMessage(data.error || "Error al actualizar el tratamiento.")
            }
        } catch (error) {
            console.error("Error de conexión al actualizar el tratamiento:", error)
            setErrorMessage("Hubo un problema con la actualización. Inténtelo de nuevo más tarde.")
        }
    }


    const confirmDelete = (tratamiento) => {
        const today = new Date();
        const hasFinalizado = tratamiento.fecha_fin && new Date(tratamiento.fecha_fin) < today;

        if (!hasFinalizado) {
            setTratamientoToDelete(tratamiento);
            document.getElementById("delete_confirm_modal").showModal();
        } else {
            setShowActionNotAllowed(true);
        }
    };


    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/tratamientos/${tratamientoToDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}` },
            })
            if (response.ok) {
                setTratamientos(tratamientos.filter((tratamiento) => tratamiento.id !== tratamientoToDelete.id))
                setTratamientoToDelete(null)
                document.getElementById("delete_confirm_modal").close()
            } else {
                const data = await response.json()
                setErrorMessage(data.error || "Error al eliminar el tratamiento.")
            }
        } catch (error) {
            setErrorMessage("Hubo un problema con la eliminación. Inténtelo de nuevo más tarde.")
        }
    }

    const toggleTratamientoDetails = (index) => {
        setSelectedTratamientoIndex(selectedTratamientoIndex === index ? null : index)
        setEditIndex(null)
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

    return (
        <SanitarioCheck>
            <div className="flex justify-center text-center m-10">
                <div className="breadcrumbs text-xl">
                    <ul>
                        <li><a href="/dashboard">Panel de control</a></li>
                        <li><a href="/tratamientos">Tratamientos</a></li>
                        <li>Listado de tratamientos</li>
                    </ul>
                </div>
            </div>

            <div className="flex items-center justify-center mb-10">
                <select
                    className="select select-primary w-full max-w-xs"
                    value={selectedPaciente?.dni || ""}
                    onChange={(e) => {
                        const paciente = pacientes.find(p => p.dni === e.target.value)
                        setSelectedPaciente(paciente || null)
                    }}
                >
                    <option disabled value="">Seleccione un paciente</option>
                    {pacientes.map(paciente => (
                        <option key={paciente.dni} value={paciente.dni}>
                            {paciente.apellidos}, {paciente.nombre} - {paciente.dni}
                        </option>
                    ))}
                </select>
                <button onClick={handleSearch} className="btn btn-primary text-white ml-4">Buscar</button>
            </div>

            {noTratamientos && (
                <div role="alert" className="alert alert-warning flex justify-between items-center">
                    <div className="flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 shrink-0 stroke-current mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <span>No se han encontrado tratamientos para el usuario seleccionado.</span>
                    </div>
                    <button onClick={() => setNoTratamientos(false)} className="btn btn-sm ml-2">Aceptar</button>
                </div>
            )}

            {selectedPaciente && tratamientos.length > 0 && (
                <>
                    <div className="text-left text-xl font-bold uppercase mb-5">
                        {pacienteHeader}
                    </div>

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
                                    <th style={{ width: "400px" }}>Nombre</th>
                                    <th style={{ width: "150px" }}>Acciones</th>
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
                                                        checked={selectedTratamientoIndex === index}
                                                        onChange={() => toggleTratamientoDetails(index)}
                                                    />
                                                    <div className="collapse-title">
                                                        {tratamiento.nombre}
                                                    </div>
                                                    {selectedTratamientoIndex === index && (
                                                        <div className="collapse-content">
                                                            <div className="form-control mb-4">
                                                                <textarea
                                                                    className="textarea textarea-primary"
                                                                    placeholder="Descripción"
                                                                    value={editIndex === index ? editedTratamiento.descripcion : tratamiento.descripcion}
                                                                    onChange={(e) =>
                                                                        editIndex === index &&
                                                                        setEditedTratamiento({
                                                                            ...editedTratamiento,
                                                                            descripcion: e.target.value,
                                                                        })
                                                                    }
                                                                    disabled={editIndex !== index}
                                                                ></textarea>
                                                            </div>

                                                            <div className="form-control mb-4">
                                                                <label className="form-control w-full max-w-xs mb-4">
                                                                    <span className="label-text text-lg mb-2">Tipo:</span>
                                                                    <input type="text" className="input input-bordered w-full" value={tratamiento.tipo} disabled />
                                                                </label>
                                                            </div>

                                                            <div className="form-control mb-4">
                                                                <label className="form-control w-full max-w-xs mb-4">
                                                                    <span className="label-text font-bold">Fecha de inicio:</span>
                                                                    <input type="text"
                                                                        className="input input-bordered w-full"
                                                                        value={
                                                                            tratamiento.fecha_inicio
                                                                                ? new Date(tratamiento.fecha_inicio).toLocaleString('es-ES', {
                                                                                    day: '2-digit',
                                                                                    month: '2-digit',
                                                                                    year: 'numeric',
                                                                                    // hour: '2-digit',
                                                                                    // minute: '2-digit',
                                                                                    // second: '2-digit'
                                                                                })
                                                                                : "No iniciada"
                                                                        }
                                                                        disabled
                                                                    />
                                                                </label>
                                                            </div>

                                                            <div className="form-control mb-4">
                                                                <label className="form-control w-full max-w-xs mb-4">
                                                                    <span className="label-text font-bold">Fecha de fin:</span>
                                                                    <input
                                                                        type={editIndex === index && tratamiento.tipo === "NO_FARMACOLOGICO" ? "date" : "text"}
                                                                        className="input input-bordered w-full"
                                                                        value={
                                                                            editIndex === index && tratamiento.tipo === "NO_FARMACOLOGICO"
                                                                                ? editedTratamiento.fecha_fin
                                                                                : tratamiento.fecha_fin
                                                                                    ? new Date(tratamiento.fecha_fin).toLocaleString('es-ES', {
                                                                                        day: '2-digit',
                                                                                        month: '2-digit',
                                                                                        year: 'numeric',
                                                                                        // hour: '2-digit',
                                                                                        // minute: '2-digit',
                                                                                        // second: '2-digit'
                                                                                    })
                                                                                    : "No definida"
                                                                        }
                                                                        onChange={(e) =>
                                                                            editIndex === index &&
                                                                            tratamiento.tipo === "NO_FARMACOLOGICO" &&
                                                                            setEditedTratamiento({
                                                                                ...editedTratamiento,
                                                                                fecha_fin: e.target.value,
                                                                            })
                                                                        }
                                                                        disabled={editIndex !== index || tratamiento.tipo !== "NO_FARMACOLOGICO"}
                                                                    />
                                                                </label>
                                                            </div>

                                                            {tratamiento.dosis && (
                                                                <div className="form-control mb-4">
                                                                    <label className="text-lg mb-2">Dosis:</label>
                                                                    <div className="flex gap-4">
                                                                        <label className="input input-bordered input-primary flex items-center gap-2 flex-1">
                                                                            <input
                                                                                type="number"
                                                                                placeholder="Cantidad"
                                                                                className="w-full"
                                                                                value={editIndex === index ? editedTratamiento.dosis.cantidad : tratamiento.dosis.cantidad}
                                                                                onChange={(e) =>
                                                                                    setEditedTratamiento({
                                                                                        ...editedTratamiento,
                                                                                        dosis: {
                                                                                            ...editedTratamiento.dosis,
                                                                                            cantidad: parseInt(e.target.value) || 0,
                                                                                        },
                                                                                    })
                                                                                }
                                                                                required
                                                                                disabled={editIndex !== index}
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
                                                                                value={tratamiento.dosis.intervalo}
                                                                                style={{
                                                                                    MozAppearance: 'textfield',
                                                                                    WebkitAppearance: 'none',
                                                                                    appearance: 'textfield'
                                                                                }}
                                                                                disabled
                                                                            />
                                                                            <span className="text-gray-500">horas</span>
                                                                        </label>

                                                                        <label className="input input-bordered input-primary flex items-center gap-2 flex-1">
                                                                            <input
                                                                                type="number"
                                                                                placeholder="Duración"
                                                                                className="input-primary w-full"
                                                                                value={tratamiento.dosis.duracion}
                                                                                style={{
                                                                                    MozAppearance: 'textfield',
                                                                                    WebkitAppearance: 'none',
                                                                                    appearance: 'textfield'
                                                                                }}
                                                                                disabled
                                                                            />
                                                                            <span className="text-gray-500">días</span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {sanitario && (
                                                                <p><strong>Sanitario creador:</strong> {sanitario.apellidos}, {sanitario.nombre}</p>
                                                            )}
                                                            <p><strong>Fecha de creación:</strong> {new Date(tratamiento.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex">
                                                    {editIndex === index ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer" onClick={() => handleSave(tratamiento.id)} aria-label="Guardar cambios" title="Guardar cambios">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-6 cursor-pointer" onClick={() => handleEdit(index, tratamiento)} aria-label="Editar tratamiento" title="Editar tratamiento">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                                        </svg>
                                                    )}
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-6 cursor-pointer ml-2" onClick={() => confirmDelete(tratamiento)} aria-label="Eliminar tratamiento" title="Eliminar tratamiento">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <dialog id="delete_confirm_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Confirmar eliminación</h3>
                    <p className="py-4">
                        ¿Desea eliminar el tratamiento "{tratamientoToDelete?.nombre}"?
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

            {showActionNotAllowed && (
                <dialog open className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Acción no permitida</h3>
                        <p className="py-4">
                            No se puede editar o eliminar un tratamiento que ya ha finalizado.
                        </p>
                        <div className="modal-action">
                            <button onClick={() => setShowActionNotAllowed(false)} className="btn">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </dialog>
            )}


        </SanitarioCheck>
    )
}

export default TratamientosList
