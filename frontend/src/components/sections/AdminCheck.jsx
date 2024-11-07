import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const AdminCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('jwtToken');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);

      if (decodedToken.role !== 'ADMIN') {
        navigate('/unauthorized');
      }

      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        sessionStorage.removeItem('jwtToken');
        sessionStorage.removeItem('user');
        navigate('/login');
      } else
        navigate('/unauthorized');
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      navigate('/login');
    }
  }, [navigate]);
};

export default AdminCheck;
