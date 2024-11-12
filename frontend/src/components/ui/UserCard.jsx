import { useState, useEffect } from "react" 

const userCardContent = {
    mifarmacia: {
        content: ({ farmacia }) => (
            <>
                <h2 className="text-lg font-bold text-center mb-2">Mi farmacia</h2>
                <div className="flex items-center justify-center p-2">
                    <figure className="w-1/4 flex justify-center items-center mr-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1}
                            stroke="currentColor"
                            className="w-full h-full"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
                            />
                        </svg>
                    </figure>
                    <div className="flex flex-col">
                        <p className="text-md font-semibold">{farmacia?.nombre || "Nombre de la Farmacia"}</p>
                        <p className="text-sm text-gray-600">{farmacia?.direccion || "Dirección de la Farmacia"}</p>
                    </div>
                </div>
            </>
        ),
    },
    reloj: {
        content: ({ time, formatTime, formatDate }) => (
            <>
                <h2 className="text-lg font-bold text-center mb-2">Hora actual</h2>
                <div className="grid grid-flow-col gap-5 text-center auto-cols-max justify-center m-2 p-2">
                    <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
                        <span className="countdown font-mono text-5xl text-white">
                            {formatTime(time.getHours())}
                        </span>
                        horas
                    </div>
                    <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
                        <span className="countdown font-mono text-5xl text-white">
                            {formatTime(time.getMinutes())}
                        </span>
                        min
                    </div>
                    <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
                        <span className="countdown font-mono text-5xl text-white">
                            {formatTime(time.getSeconds())}
                        </span>
                        seg
                    </div>
                </div>
                <p className="text-center mt-4 text-lg font-semibold">
                    {formatDate(time)}
                </p>
            </>
        ),
    },
    default: {
        content: (
            <>
                <figure className="flex justify-center p-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1}
                        stroke="currentColor"
                        className="w-12 h-12"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                        />
                    </svg>
                </figure>
                <div className="card-body items-center text-center">
                    <h2 className="card-title text-lg font-bold">NO TITLE</h2>
                    <p className="text-sm text-gray-600 mt-2">NO DESCRIPTION</p>
                </div>
                <div className="card-actions">
                    <a href="/dashboard" className="btn btn-primary text-white min-w-56">
                        Explorar
                    </a>
                </div>
            </>
        ),
    },
} 

const UserCard = ({ title }) => {
    const [farmacia, setFarmacia] = useState(null) 
    const [loading, setLoading] = useState(true) 
    const [errorMessage, setErrorMessage] = useState("") 
    const [time, setTime] = useState(new Date()) 
    const token = sessionStorage.getItem("jwtToken") 
    const user = JSON.parse(sessionStorage.getItem("user")) 

    useEffect(() => {
        if (title === "mifarmacia") {
            
            const fetchFarmaciaData = async () => {
                try {
                    let userResponse = null

                    if (user.role === "PACIENTE") {
                        userResponse = await fetch(`http://localhost:3000/api/users/pacientes/${user.dni}`, {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }) 
                    } else if (user.role === "SANITARIO") {
                        userResponse = await fetch(`http://localhost:3000/api/users/sanitarios/${user.dni}`, {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }) 
                    }
    

                    if (!userResponse.ok) throw new Error("Error al obtener datos del usuario.") 

                    const userData = await userResponse.json() 
                    const farmaciaId = userData.idFarmacia 

                    if (!farmaciaId) {
                        throw new Error("El usuario no tiene una farmacia asignada.") 
                    }

                    const farmaciaResponse = await fetch(`http://localhost:3000/api/farmacias/${farmaciaId}`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }) 

                    if (!farmaciaResponse.ok) throw new Error("Error al obtener datos de la farmacia.") 

                    const farmaciaData = await farmaciaResponse.json() 
                    setFarmacia(farmaciaData) 

                } catch (error) {
                    setErrorMessage(error.message) 
                    
                } finally {
                    setLoading(false) 
                }
            } 

            fetchFarmaciaData() 
        }

        if (title === "reloj") {
            const timer = setInterval(() => setTime(new Date()), 1000) 
            return () => clearInterval(timer) 
        }
    }, [title, token, user.dni]) 

    const formatTime = (value) => String(value).padStart(2, "0") 

    const formatDate = (date) => {
        const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
        const months = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ] 
        const dayName = days[date.getDay()] 
        const day = date.getDate() 
        const monthName = months[date.getMonth()] 
        const year = date.getFullYear() 

        return `${dayName}, ${day} de ${monthName} de ${year}` 
        // return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${day} de ${monthName} de ${year}` 
    } 

    if (loading && title === "mifarmacia") return <span className="loading loading-ring loading-lg"></span>
    if (errorMessage && title === "mifarmacia") return <p>Error: {errorMessage}</p> 

    const content = title === "mifarmacia"
        ? userCardContent[title].content({ farmacia })
        : title === "reloj"
        ? userCardContent[title].content({ time, formatTime, formatDate })
        : userCardContent["default"].content 

    return <div className="card bg-base-100 shadow-md jsutify-center p-4 max-h-60 m-1">{content}</div> 
} 

export default UserCard 
