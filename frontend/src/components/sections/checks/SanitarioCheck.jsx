import { useEffect } from 'react'

const SanitarioCheck = ({ children }) => {
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

			if (decodedToken.role !== 'SANITARIO') {
				// alert("Redirigiendo a /unauthorized: El rol no es SANITARIO.")
				window.location.href = '/unauthorized'
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

			// alert("Token válido y usuario autorizado como SANITARIO.")

		} catch (error) {
			console.error("Error al decodificar el token manualmente:", error)
			// alert("Error al decodificar el token manualmente.")
			window.location.href = '/login'
		}
	}, [])

	return <>{children}</>
}

export default SanitarioCheck