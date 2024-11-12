import { useState, useEffect } from "react"
import PacienteCheck from "../checks/PacienteCheck"

const AdherenciaView = () => {
    const [user, setUser] = useState({})
    const [adherenciaTotal, setAdherenciaTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAdherenciaTotal = async () => {
            const user = JSON.parse(sessionStorage.getItem("user"))
            setUser(user)

            if (user && user.dni) {
                try {
                    const token = sessionStorage.getItem("jwtToken")

                    const adherenciaResponse = await fetch(`http://localhost:3000/api/tratamientos/adherencia/${user.dni}`, {
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
                } finally {
                    setIsLoading(false)
                }
            }
        }

        fetchAdherenciaTotal()
    }, [])

    const getProgressColor = () => {
        let color = null

        if (adherenciaTotal >= 0 && adherenciaTotal <= 50) color = "text-error"
        if (adherenciaTotal > 50 && adherenciaTotal <= 90) color = "text-warning"
        if (adherenciaTotal > 90) color = "text-primary"

        return color
    }

    const getNivel = () => {
        let nivel = null

        if (adherenciaTotal > 90) nivel = "ALTO"
        if (adherenciaTotal > 50 && adherenciaTotal <= 90) nivel = "MEDIO"
        if (adherenciaTotal >= 0 && adherenciaTotal <= 50) nivel = "BAJO"

        return nivel
    }

    const getMensajeInformativo = () => {
        switch (getNivel()) {
            case "ALTO":
                return (
                    <p className="mt-4 text-justify">
                        ¡Muy bien! Estás siguiendo el tratamiento de manera consistente, lo cual es clave para obtener buenos
                        resultados y cuidar tu salud a largo plazo. Sigue así, y recuerda que si en algún momento tienes dudas
                        o necesitas ajustar algo, siempre puedes contar con el equipo de la farmacia.
                    </p>
                ) 
            case "MEDIO":
                return (
                    <p className="mt-4 text-justify">
                        Tu nivel de adherencia es medio, lo que indica que podrías estar dejando pasar algunas dosis o no
                        siguiendo el tratamiento al completo. Esto puede hacer que los resultados no sean tan efectivos. Si te
                        cuesta seguir el tratamiento, o tienes dudas, acude a la farmacia y habla con un profesional para recibir
                        ayuda. A veces, pequeños cambios en la rutina pueden marcar la diferencia.
                    </p>
                ) 
            case "BAJO":
                return (
                    <p className="mt-4 text-justify">
                        Tu nivel de adherencia es bajo, y esto puede afectar negativamente tu salud. Es común que a veces olvidar
                        la toma de ciertas dosis o sufrir desmotivación, pero esto puede hacer que el tratamiento no haga efecto. 
                        Puedes acudir a la farmacia para hablar con el personal y ver cómo puedes recibir ayuda para mantener 
                        una rutina que sea más fácil de seguir. Recuerda que están ahí para apoyarte.
                    </p>
                ) 
            default:
                return null 
        }
    } 

    return (
        <PacienteCheck>
            <div className="flex justify-center text-center m-10">
                <div className="breadcrumbs text-xl">
                    <ul>
                        <li><a href="/dashboard">Panel de control</a></li>
                        <li>Adherencia</li>
                    </ul>
                </div>
            </div>
            <div className="flex flex-col items-center m-10 p-10 bg-gray-100 rounded-lg shadow-md">
                <div className="flex w-full justify-between items-start">
                    <div className="flex flex-col items-start w-2/3 p-10">
                        <h2 className="text-2xl font-bold">Informe de adherencia terapéutica</h2>
                        <p className="text-md mt-4 text-justify">
                            La adherencia terapéutica es el grado en que la conducta de un paciente, en relación con la toma
                            de medicación, el seguimiento de una dieta o la modificación en los hábitos de vida, se ajusta o
                            corresponde con las recomendaciones acordadas con los profesionales sanitarios.
                        </p>
                    </div>
                    <div className="w-1/3 flex flex-col items-center justify-center p-10">
                        {isLoading ? (
                            <span className="loading loading-ring loading-lg w-20 h-20"></span>
                        ) : (
                            <div
                                className={`radial-progress ${getProgressColor()}`}
                                style={{ "--value": adherenciaTotal }}
                                role="progressbar"
                                aria-valuenow={adherenciaTotal}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            >
                                {adherenciaTotal}%
                            </div>
                        )}
                        <div className="text-center mt-4 w-full">
                            {isLoading ? (
                                <div className="skeleton h-6 w-full"></div>
                            ) : (
                                <p className={`text-lg font-bold ${getProgressColor()}`}>Nivel de adherencia {getNivel()}</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-full p-10">
                    {isLoading ? (
                        <div className="skeleton h-32 w-full"></div>
                    ) : (
                        <div role="alert" className="alert alert-base-100">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="stroke-info h-6 w-6 shrink-0">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>{getMensajeInformativo()}</span>
                        </div>
                    )}
                </div>
            </div>
        </PacienteCheck>
    )
}

export default AdherenciaView
