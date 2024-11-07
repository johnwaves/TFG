import { useState } from "react";

const UsuarioForm = () => {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNac, setFechaNac] = useState("");
  const [direccion, setDireccion] = useState("");
  const [role, setRole] = useState("");
  const [idFarmacia, setIdFarmacia] = useState(null);
  const [nombreFarmacia, setNombreFarmacia] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    if (
      !dni ||
      !password ||
      !email ||
      !nombre ||
      !apellidos ||
      !telefono ||
      !fechaNac ||
      !direccion ||
      !role ||
      !nombreFarmacia
    ) {
      setErrorMessage("Todos los campos son obligatorios.");
      return false;
    }
    if (!/^\d{8}[A-Z]$/.test(dni)) {
      setErrorMessage("DNI no válido.");
      return false;
    }
    if (telefono.length !== 9 || !/^\d{9}$/.test(telefono)) {
      setErrorMessage("El teléfono debe contener 9 dígitos.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMessage("El email no es válido.");
      return false;
    }
    const date = new Date(fechaNac);
    if (isNaN(date.getTime())) {
      setErrorMessage("Fecha de nacimiento no válida.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const fetchFarmaciaId = async () => {
    try {
      const token = sessionStorage.getItem("jwtToken");
      console.log("Token JWT:", token); 
  
      const response = await fetch(
        `http://localhost:3000/api/farmacias/nombre/${nombreFarmacia}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const responseData = await response.json();
      if (response.ok && responseData.id) {
        setIdFarmacia(responseData.id);
        return true;
      } else if (response.status === 401) {
        setErrorMessage("No autorizado. Verifique sus credenciales.");
        return false;
      } else {
        setErrorMessage(responseData.error || "No se encontró una farmacia con ese nombre.");
        return false;
      }
    } catch (error) {
      console.error("Error al buscar la farmacia:", error);
      setErrorMessage("Error de conexión al buscar la farmacia.");
      return false;
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    const farmaciaFound = await fetchFarmaciaId();
    if (!farmaciaFound) return;
  
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
  
    const data = {
      dni,
      password,
      email,
      nombre,
      apellidos,
      telefono,
      fechaNac,
      direccion,
      role,
      idFarmacia,
    };
  
    console.log("Payload enviado:", data); // Verificar el payload antes de enviarlo
  
    try {
      const response = await fetch("http://localhost:3000/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify(data),
      });
  
      const responseData = await response.json();
      if (response.ok) {
        setSuccessMessage("Usuario creado con éxito");
        setDni("");
        setPassword("");
        setEmail("");
        setNombre("");
        setApellidos("");
        setTelefono("");
        setFechaNac("");
        setDireccion("");
        setRole("");
        setNombreFarmacia("");
      } else {
        setErrorMessage(responseData.error || "Error al crear el usuario");
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
    <div className="flex items-center justify-center min-h-screen">
      <div className="card bg-base-100 w-full max-w-md shadow-2xl p-8">
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="input input-bordered input-primary flex items-center gap-2">
              <input
                type="text"
                className="grow"
                placeholder="DNI"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="form-control mb-4">
            <label className="input input-bordered input-primary flex items-center gap-2">
              <input
                type="password"
                className="grow"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="form-control mb-4">
            <label className="input input-bordered input-primary flex items-center gap-2">
              <input
                type="email"
                className="grow"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="form-control mb-4">
            <label className="input input-bordered input-primary flex items-center gap-2">
              <input
                type="text"
                className="grow"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="form-control mb-4">
            <label className="input input-bordered input-primary flex items-center gap-2">
              <input
                type="text"
                className="grow"
                placeholder="Apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="form-control mb-4">
            <label className="input input-bordered input-primary flex items-center gap-2">
              <input
                type="tel"
                className="grow"
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="form-control mb-4">
            <label className="input input-bordered input-primary flex items-center gap-2">
              <input
                type="date"
                className="grow"
                value={fechaNac}
                onChange={(e) => setFechaNac(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="form-control mb-4">
            <label className="input input-bordered input-primary flex items-center gap-2">
              <input
                type="text"
                className="grow"
                placeholder="Dirección"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="form-control mb-4">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="select select-primary w-full max-w-md"
            >
              <option disabled value="" >
                Seleccione un rol
              </option>
              <option value="PACIENTE">Paciente</option>
              <option value="FARMACEUTICO">Farmacéutico</option>
              <option value="TECNICO">Técnico de farmacia</option>
            </select>
          </div>

          <div className="form-control mb-4">
            <label className="input input-bordered input-primary flex items-center gap-2">
              <input
                type="text"
                className="grow"
                placeholder="Nombre de la farmacia"
                value={nombreFarmacia}
                onChange={(e) => setNombreFarmacia(e.target.value)}
                required
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
                "Crear usuario"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsuarioForm;
