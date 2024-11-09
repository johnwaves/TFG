import { useState, useEffect } from "react"
import AdminCheck from "./AdminCheck"

const PersonalFarmacia = () => {
    const [farmacias, setFarmacias] = useState([])
    const [selectedFarmacia, setSelectedFarmacia] = useState(null)
    const [sanitariosByFarmacia, setSanitariosByFarmacia] = useState({})
    const [pacientesByFarmacia, setPacientesByFarmacia] = useState({})
    const [pacientesSinFarmacia, setPacientesSinFarmacia] = useState([])
    const [selectedPacienteDniByFarmacia, setSelectedPacienteDniByFarmacia] = useState({})
    const [selectedPacienteSinFarmaciaByFarmacia, setSelectedPacienteSinFarmaciaByFarmacia] = useState({})
    const [errorMessage, setErrorMessage] = useState("")
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [pacienteToDelete, setPacienteToDelete] = useState(null)

    useEffect(() => {
        fetchFarmacias()
        fetchPacientesSinFarmacia()
    }, [])

    const fetchFarmacias = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/farmacias", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`
                }
            })

            const data = await response.json()
            if (response.ok) setFarmacias(data)
            else setErrorMessage("Error al obtener las farmacias.")

        } catch (error) {
            console.error("Hubo un error de conexión:", error)
            setErrorMessage("Hubo un problema con la conexión. Inténtelo de nuevo más tarde.")
        }
    }

    const fetchPacientesSinFarmacia = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/users/pacientes/sinfarmacia", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`
                }
            })

            const data = await response.json()
            if (response.ok) setPacientesSinFarmacia(data)
            else setErrorMessage("Error al obtener los pacientes sin farmacia.")

        } catch (error) {
            console.error("Error fetching pacientes sin farmacia:", error)
            setErrorMessage("Hubo un problema al obtener los pacientes sin farmacia. Inténtelo más tarde.")
        }
    }

    const handleFarmaciaSelect = async (farmaciaId) => {
        setSelectedFarmacia(farmaciaId)
        await fetchSanitarios(farmaciaId)
        await fetchPacientes(farmaciaId)
    }

    const fetchSanitarios = async (farmaciaId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/farmacias/${farmaciaId}/sanitarios`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`
                }
            })

            const data = await response.json()
            if (response.ok)
                setSanitariosByFarmacia(prev => ({ ...prev, [farmaciaId]: data }))
            else
                setErrorMessage("Error al obtener los sanitarios de la farmacia.")

        } catch (error) {
            console.error("Error fetching sanitarios:", error)
            setErrorMessage("Hubo un problema al obtener los sanitarios.")
        }
    }

    const fetchPacientes = async (farmaciaId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/farmacias/${farmaciaId}/pacientes`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`
                }
            })

            const data = await response.json()
            if (response.ok)
                setPacientesByFarmacia(prev => ({ ...prev, [farmaciaId]: data }))
            else
                setErrorMessage("Error al obtener los pacientes de la farmacia.")

        } catch (error) {
            console.error("Error fetching pacientes:", error)
            setErrorMessage("Hubo un problema al obtener los pacientes.")
        }
    }

    const openDeleteModal = (farmaciaId, pacienteDni) => {
        setPacienteToDelete({ farmaciaId, pacienteDni })
        setIsDeleteModalOpen(true)
    }

    const closeDeleteModal = () => {
        setPacienteToDelete(null)
        setIsDeleteModalOpen(false)
    }

    const handleDeleteConfirm = () => {
        if (pacienteToDelete) {
            handleRemovePaciente(pacienteToDelete.farmaciaId, pacienteToDelete.pacienteDni)
            closeDeleteModal()
        }
    }

    const handleRemovePaciente = async (farmaciaId, pacienteDni) => {
        if (!pacienteDni) {
            setErrorMessage("No se ha seleccionado ningún paciente para borrar.")
            return
        }

        try {
            const response = await fetch(`http://localhost:3000/api/farmacias/${farmaciaId}/pacientes/${pacienteDni}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`
                }
            })

            if (response.ok) {
                await fetchPacientes(farmaciaId)
                await fetchPacientesSinFarmacia()
                setSelectedPacienteDniByFarmacia((prev) => ({ ...prev, [farmaciaId]: "" }))
            } else {
                setErrorMessage("Error al eliminar el paciente de la farmacia.")
            }

        } catch (error) {
            console.error("Error deleting paciente:", error)
            setErrorMessage("Hubo un problema al eliminar el paciente de la farmacia.")
        }
    }

    const handleAddPaciente = async (farmaciaId) => {
        const selectedPacienteSinFarmacia = selectedPacienteSinFarmaciaByFarmacia[farmaciaId]

        if (!selectedPacienteSinFarmacia) {
            setErrorMessage("No se ha seleccionado ningún paciente para añadir.")
            return
        }

        try {
            const response = await fetch(`http://localhost:3000/api/farmacias/${farmaciaId}/pacientes/${selectedPacienteSinFarmacia}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`
                }
            })

            if (response.ok) {
                await fetchPacientes(farmaciaId)
                await fetchPacientesSinFarmacia()
                setSelectedPacienteSinFarmaciaByFarmacia((prev) => ({ ...prev, [farmaciaId]: "" }))
            } else {
                setErrorMessage("Error al añadir el paciente a la farmacia.")
            }

        } catch (error) {
            console.error("Error adding paciente:", error)
            setErrorMessage("Hubo un problema al añadir el paciente a la farmacia.")
        }
    }

    return (
        <AdminCheck>
            <div className="flex justify-center text-center m-10">
                <div className="breadcrumbs text-xl">
                    <ul>
                        <li><a href="/dashboard">Panel de control</a></li>
                        <li><a href="/farmacias">Farmacias</a></li>
                        <li>Personal sanitario en farmacias</li>
                    </ul>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Farmacia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {farmacias.map((farmacia, index) => (
                            <tr key={farmacia.id}>
                                <th>{index + 1}</th>
                                <td>
                                    <div className="collapse collapse-arrow bg-base-100">
                                        <input type="checkbox" onChange={() => handleFarmaciaSelect(farmacia.id)} />
                                        <div className="collapse-title text-xl font-medium">
                                            {farmacia.nombre}
                                        </div>

                                        <div className="collapse-content">
                                            <div className="flex">
                                                <select className="select select-primary w-full max-w-lg">
                                                    <option disabled selected>Sanitarios en la farmacia</option>
                                                    <option disabled></option>
                                                    <option disabled className="font-bold text-gray-500">FARMACÉUTICOS</option>
                                                    {(sanitariosByFarmacia[farmacia.id] || [])
                                                        .filter(sanitario => sanitario.tipo === 'FARMACEUTICO')
                                                        .map((sanitario, idx) => (
                                                            <option key={`farmaceutico-${idx}`}>
                                                                {sanitario.apellidos}, {sanitario.nombre} - {sanitario.dni}
                                                            </option>
                                                        ))}
                                                    <option disabled></option>
                                                    <option disabled className="font-bold text-gray-500 mt-2">TÉCNICOS DE FARMACIA</option>
                                                    {(sanitariosByFarmacia[farmacia.id] || [])
                                                        .filter(sanitario => sanitario.tipo === 'TECNICO')
                                                        .map((sanitario, idx) => (
                                                            <option key={`tecnico-${idx}`}>
                                                                {sanitario.apellidos}, {sanitario.nombre} - {sanitario.dni}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div className="flex mt-10">
                                                <select
                                                    className="select select-primary w-full max-w-lg"
                                                    onChange={(e) => setSelectedPacienteDniByFarmacia(prev => ({
                                                        ...prev, [farmacia.id]: e.target.value
                                                    }))}
                                                    value={selectedPacienteDniByFarmacia[farmacia.id] || ""}
                                                >
                                                    <option disabled value="">Pacientes en la farmacia</option>
                                                    {(pacientesByFarmacia[farmacia.id] || []).map((paciente, idx) => (
                                                        <option key={idx} value={paciente.dni}>
                                                            {paciente.apellidos}, {paciente.nombre} - {paciente.dni}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => openDeleteModal(farmacia.id, selectedPacienteDniByFarmacia[farmacia.id])}
                                                    className="btn btn-outline btn-error ml-5"
                                                >
                                                    Borrar
                                                </button>
                                            </div>

                                            <div className="flex mt-10">
                                                <select
                                                    className="select select-primary w-full max-w-lg"
                                                    onChange={(e) => setSelectedPacienteSinFarmaciaByFarmacia(prev => ({
                                                        ...prev, [farmacia.id]: e.target.value
                                                    }))}
                                                    value={selectedPacienteSinFarmaciaByFarmacia[farmacia.id] || ""}
                                                >
                                                    <option disabled selected value="">
                                                        Pacientes no asignados a farmacias
                                                    </option>
                                                    {pacientesSinFarmacia.map((paciente, idx) => (
                                                        <option key={idx} value={paciente.user.dni}>
                                                            {paciente.user.apellidos}, {paciente.user.nombre} - {paciente.user.dni}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleAddPaciente(farmacia.id)}
                                                    className="btn btn-outline btn-success ml-5"
                                                >
                                                    Añadir
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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

            <dialog
                id="delete_confirm_modal"
                className={`modal modal-bottom sm:modal-middle ${isDeleteModalOpen ? 'modal-open' : ''}`}
            >
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Confirmar eliminación</h3>
                    <p className="py-4">
                        ¿Desea eliminar al paciente con DNI {pacienteToDelete?.pacienteDni} de la farmacia?
                    </p>
                    <div className="modal-action">
                        <button className="btn btn-error" onClick={handleDeleteConfirm}>
                            Aceptar
                        </button>
                        <button className="btn" onClick={closeDeleteModal}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </dialog>
        </AdminCheck>
    )
}

export default PersonalFarmacia 
