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
  
    <AdminCheck />

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
      setTimeout(() => {
      if (response.ok) {
        setSuccessMessage("Farmacia creada con éxito");
        setNombre("");
        setDireccion("");
      } else {
        setErrorMessage(responseData.error || "Error al crear la farmacia");
      }
    }, 1000);
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
    <div className="flex items-center justify-center min-h-screen">
      <div className="card bg-base-100 w-full max-w-md shadow-2xl p-8">
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="input input-bordered input-primary flex items-center gap-2">
              <input
                type="text"
                className="grow"
                placeholder="Nombre de la farmacia"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
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
                onChange={(e) => setDireccion(e.target.value)}
                required
                maxLength={200}
              />
            </label>
          </div>

          <div className="h-6 flex items-center justify-center">
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
  );
};

export default FarmaciaForm;
