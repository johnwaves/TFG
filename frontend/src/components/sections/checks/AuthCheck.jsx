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
          // alert('La sesión ha expirado. Por favor, inicie sesión nuevamente.');
          <dialog open className="modal modal-bottom sm:modal-middle">
            <div className="modal-box">
              <h3 className="font-bold text-lg text-warning">Aviso</h3>
              <p className="py-4">La sesión ha expirado. Por favor, inicie sesión nuevamente.</p>
              <div className="modal-action">
                <button className="btn">Cerrar</button>
              </div>
            </div>
          </dialog>
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
