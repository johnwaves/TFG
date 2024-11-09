import { useState, useEffect } from "react"

const UserRole = () => {
    const [role, setRole] = useState(null)

    useEffect(() => {
        const token = sessionStorage.getItem("jwtToken")  
        if (token) {
            try {
                const payload = token.split(".")[1]  
                const decoded = JSON.parse(atob(payload))  
                setRole(decoded.role) 
            } catch (error) {
                console.error("Error al decodificar el token:", error)  
            }
        }
    }, [])  

    return role  
}

export default UserRole;