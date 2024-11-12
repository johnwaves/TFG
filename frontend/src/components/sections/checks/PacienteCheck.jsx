import { useEffect } from 'react' 

const PacienteTutorCheck = ({ children }) => {
    useEffect(() => {
        const token = sessionStorage.getItem('jwtToken') 

        if (!token) {
			// alert("Redirigiendo a /login: No se encontró token en sessionStorage.")
            window.location.href = '/login' 
            return 
        }

        try {
            const payload = token.split('.')[1] 
            const decodedToken = JSON.parse(atob(payload)) 

            if (decodedToken.role !== 'PACIENTE') {
				// alert("Redirigiendo a /unauthorized: El rol no es PACIENTE.")
                window.location.href = '/dashboard' 
                return 
            }

            const currentTime = Date.now() / 1000 
            if (decodedToken.exp < currentTime) {
				// alert("Redirigiendo a /login: El token ha expirado.")
                sessionStorage.removeItem('jwtToken') 
                sessionStorage.removeItem('user') 
                window.location.href = '/login' 
                return 
            }

			// alert("Token válido y usuario autorizado como PACIENTE.")

        } catch (error) {
            console.error("Error decoding the token:", error) 
            // Redirect to login if there's an error decoding the token
            window.location.href = '/login' 
        }
    }, []) 

    return <>{children}</> 
} 

export default PacienteTutorCheck 
