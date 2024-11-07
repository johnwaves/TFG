import { useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

function AuthCheck() {
  useEffect(() => {
    const token = sessionStorage.getItem('jwtToken');
    
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          alert('La sesión ha expirado. Por favor, inicie sesión nuevamente.');
          sessionStorage.removeItem('jwtToken');
          sessionStorage.removeItem('user');
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        sessionStorage.removeItem('jwtToken');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else {
      window.location.href = '/login';
    }
  }, []);
}

export default AuthCheck;
