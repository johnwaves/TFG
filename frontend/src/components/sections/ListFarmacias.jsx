import { useState, useEffect } from "react"  
import AdminCheck from "./AdminCheck"

const splitTextByLength = (text, length) => {
    const lines = []  
    for (let i = 0; i < text.length; i += length) 
        lines.push(text.slice(i, i + length))  
    
    return lines  
}  

const ListFarmacias = () => {
    const [farmacias, setFarmacias] = useState([])  
    const [errorMessage, setErrorMessage] = useState("")  
    const [editIndex, setEditIndex] = useState(null)  
    const [editedFarmacia, setEditedFarmacia] = useState({
        nombre: "",
        direccion: "",
    })  

    const [farmaciaToDelete, setFarmaciaToDelete] = useState(null)  

    useEffect(() => {
        const fetchFarmacias = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/farmacias", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
                    },
                })  
                const data = await response.json()  

                if (response.ok) {
                    setFarmacias(data)  
                } else {
                    setErrorMessage("Error al obtener las farmacias.")  
                }
            } catch (error) {
                setErrorMessage(
                    "Hubo un problema con la conexión. Inténtelo de nuevo más tarde."
                )  
            }
        }  

        fetchFarmacias()  
    }, [])  

    useEffect(() => {
        if (errorMessage) {
            document.getElementById("update_error_modal").showModal()  
        }
    }, [errorMessage])  

    const handleEdit = (index, farmacia) => {
        setEditIndex(index)  
        setEditedFarmacia({
            nombre: farmacia.nombre,
            direccion: farmacia.direccion,
        })  
    }  

    const handleSave = async (farmaciaId) => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/farmacias/${farmaciaId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
                    },
                    body: JSON.stringify(editedFarmacia),
                }
            )  
            const data = await response.json()  

            if (response.ok) {
                const updatedFarmacias = [...farmacias]  
                updatedFarmacias[editIndex] = {
                    ...updatedFarmacias[editIndex],
                    ...editedFarmacia,
                }  
                setFarmacias(updatedFarmacias)  
                setEditIndex(null)  
                setErrorMessage("")  
            } else if (response.status === 400) {
                setErrorMessage("Ya existe una farmacia con ese nombre o dirección.")  
            } else {
                setErrorMessage(data.error || "Error al actualizar la farmacia.")  
            }
        } catch (error) {
            setErrorMessage(
                "Hubo un problema con la actualización. Inténtelo de nuevo más tarde."
            )  
        }
    }  

    const confirmDelete = (farmacia) => {
        setFarmaciaToDelete(farmacia)  
        document.getElementById("delete_confirm_modal").showModal()  
    }  

    const handleDelete = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/farmacias/${farmaciaToDelete.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
                    },
                }
            )  

            if (response.ok) {
                setFarmacias(
                    farmacias.filter((farmacia) => farmacia.id !== farmaciaToDelete.id)
                )  
                setFarmaciaToDelete(null)  
                document.getElementById("delete_confirm_modal").close()  
            } else {
                const data = await response.json()  
                setErrorMessage(data.error || "Error al eliminar la farmacia.")  
            }
        } catch (error) {
            setErrorMessage(
                "Hubo un problema con la eliminación. Inténtelo de nuevo más tarde."
            )  
        }
    }  

    return (
        <AdminCheck> 
            <div className="flex justify-center text-center m-10">
                <div className="breadcrumbs text-xl">
                    <ul>
                        <li>
                            <a href="/dashboard">Panel de control</a>
                        </li>
                        <li>
                            <a href="/farmacias">Farmacias</a>
                        </li>
                        <li>Listado de farmacias</li>
                    </ul>
                </div>
            </div>

            <div className="overflow-x-auto mb-10">
                <table className="table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Nombre</th>
                            <th>Dirección</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {farmacias.map((farmacia, index) => (
                            <tr key={farmacia.id} className="hover">
                                <th>{index + 1}</th>
                                <td>
                                    {editIndex === index ? (
                                        <input
                                            type="text"
                                            value={editedFarmacia.nombre}
                                            onChange={(e) =>
                                                setEditedFarmacia({
                                                    ...editedFarmacia,
                                                    nombre: e.target.value,
                                                })
                                            }
                                            className="input input-bordered w-full max-w-xs"
                                        />
                                    ) : (
                                        splitTextByLength(farmacia.nombre, 50).map(
                                            (line, lineIndex) => <div key={lineIndex}>{line}</div>
                                        )
                                    )}
                                </td>
                                <td>
                                    {editIndex === index ? (
                                        <input
                                            type="text"
                                            value={editedFarmacia.direccion}
                                            onChange={(e) =>
                                                setEditedFarmacia({
                                                    ...editedFarmacia,
                                                    direccion: e.target.value,
                                                })
                                            }
                                            className="input input-bordered w-full max-w-xs"
                                        />
                                    ) : (
                                        splitTextByLength(farmacia.direccion, 50).map(
                                            (line, lineIndex) => <div key={lineIndex}>{line}</div>
                                        )
                                    )}
                                </td>
                                <td>
                                    <div className="flex">
                                        {editIndex === index ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="size-6 cursor-pointer"
                                                onClick={() => handleSave(farmacia.id)}
                                                aria-label="Guardar cambios"
                                                title="Guardar cambios"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m4.5 12.75 6 6 9-13.5"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1}
                                                stroke="currentColor"
                                                className="size-6 cursor-pointer"
                                                onClick={() => handleEdit(index, farmacia)}
                                                aria-label="Editar farmacia"
                                                title="Editar farmacia"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                                                />
                                            </svg>
                                        )}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1}
                                            stroke="currentColor"
                                            className="size-6 cursor-pointer ml-2"
                                            onClick={() => confirmDelete(farmacia)}
                                            aria-label="Eliminar farmacia"
                                            title="Eliminar farmacia"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                            />
                                        </svg>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <dialog
                id="update_error_modal"
                className="modal modal-bottom sm:modal-middle"
            >
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Error de actualización</h3>
                    <p className="py-4">{errorMessage}</p>
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={() => {
                                setErrorMessage("")  
                                document.getElementById("update_error_modal").close()  
                            }}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog
                id="delete_confirm_modal"
                className="modal modal-bottom sm:modal-middle"
            >
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Confirmar eliminación</h3>
                    <p className="py-4">
                        ¿Desea eliminar la farmacia "{farmaciaToDelete?.nombre}"?
                    </p>
                    <div className="modal-action">
                        <button className="btn btn-error" onClick={handleDelete}>
                            Aceptar
                        </button>
                        <button
                            className="btn"
                            onClick={() =>
                                document.getElementById("delete_confirm_modal").close()
                            }
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </dialog>
        </AdminCheck>
    )  
}  

export default ListFarmacias  
