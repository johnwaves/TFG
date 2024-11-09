import { useState } from "react";
import AdminCheck from "./AdminCheck";

const FarmaciaForm = () => {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    if (nombre.trim() === "" || direccion.trim() === "") {
      setErrorMessage("Todos los campos son obligatorios.");
      return false;
    }
    if (nombre.length > 100) {
      setErrorMessage("El nombre no puede tener más de 100 caracteres.");
      return false;
    }
    if (direccion.length > 200) {
      setErrorMessage("La dirección no puede tener más de 200 caracteres.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
  
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
  
    const data = { nombre, direccion };
  
    try {
      const response = await fetch(
        "http://localhost:3000/api/farmacias/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
          },
          body: JSON.stringify(data),
        }
      );
  
      const responseData = await response.json();
      
      if (response.ok) {
        setSuccessMessage("Farmacia creada con éxito");
        setNombre("");
        setDireccion("");
        
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        if (response.status === 400) {
          setErrorMessage("Existe una farmacia con ese nombre o dirección.");
        } else {
          setErrorMessage(responseData.error || "Error al crear la farmacia");
        }
      }
    } catch (error) {
      console.error("Hubo un error de conexión:", error);
      setErrorMessage(
        "Hubo un problema con la conexión. Inténtelo de nuevo más tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <>
      <div className="flex justify-center text-center m-10">
        <div className="breadcrumbs text-xl">
          <ul>
            <li>
              <a href="/dashboard">Panel de control</a>
            </li>
            <li>
              <a href="/farmacias">Farmacias</a>
            </li>
            <li>Crear farmacia</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="card bg-base-100 w-full max-w-md shadow-2xl p-10">
          <p className="text-2xl text-center mb-5">
            Datos de la nueva farmacia
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="input input-bordered input-primary flex items-center gap-2">
                <input
                  type="text"
                  className="grow"
                  placeholder="Nombre de la farmacia"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    setSuccessMessage("");
                  }}
                  required
                  maxLength={100}
                />
              </label>
            </div>

            <div className="form-control mb-4">
              <label className="input input-bordered input-primary flex items-center gap-2">
                <input
                  type="text"
                  className="grow"
                  placeholder="Dirección de la farmacia"
                  value={direccion}
                  onChange={(e) => {
                    setDireccion(e.target.value);
                    setSuccessMessage("");
                  }}
                  required
                  maxLength={200}
                />
              </label>
            </div>

            <div role="alert" className="alert mt-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="h-6 w-6 shrink-0 stroke-current"
              >
                personal
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <p className="text text-xs justify-center">
                Tenga en cuenta que las farmacias se crean sin personal. Será
                durante el proceso de creación de usuarios donde podrá añadir 
                sanitarios a una farmacia. Para añadir pacientes, diríjase a 
                la sección para la administración de usuarios de farmacias. 
              </p>
            </div>

            <div className="h-6 flex items-center justify-center m-10">
              {errorMessage && (
                <p className="text-red-600 text-center">{errorMessage}</p>
              )}
              {successMessage && (
                <p className="text-green-600 text-center">{successMessage}</p>
              )}
            </div>

            <div className="form-control mt-4">
              <button
                className="btn btn-primary text-white flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-dots loading-lg text-white"></span>
                ) : (
                  "Crear farmacia"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default FarmaciaForm;
