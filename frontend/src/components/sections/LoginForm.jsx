import { useState, useEffect } from "react";
import AuthCheck from "./AuthCheck";

const LoginForm = () => {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const data = { dni, password };

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      setTimeout(() => {
        if (response.ok) {
          console.log("Autenticación con éxito:", responseData);
          sessionStorage.setItem("jwtToken", responseData.token);
          sessionStorage.setItem("user", JSON.stringify(responseData.user));
          window.location.href = "/dashboard";
          
        } else {
          if (response.status === 404) {
            setErrorMessage("No existe el usuario.");
          } else if (response.status === 401) {
            setErrorMessage("Contraseña incorrecta.");
          } else {
            setErrorMessage(
              responseData.message ||
              "Ha ocurrido un error. Por favor, inténtelo de nuevo más tarde."
            );
          }
        }
        setIsLoading(false);
      }, 500);
      
    } catch (error) {
        console.error("Hubo un error de conexión:", error);
        setErrorMessage(
          "Hubo un problema con la conexión. Inténtalo de nuevo más tarde."
        );
        setIsLoading(false);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[92.3vh] bg-base-200">
      <div className="hero-content flex-col lg:flex-row items-center justify-center w-full max-w-4xl">
        <div className="text-center lg:text-right">
          <h1 className="text-5xl font-bold">Iniciar sesión</h1>
          <p className="py-6 max-w-md">
            En su perfil de usuario podrá ver sus tratamientos, registrar el
            cumplimiento, obtener un informe de la adherencia terapéutica y
            mucho más.
          </p>
        </div>

        <div className="divider lg:divider-horizontal"></div>

        <div className="card bg-base-100 w-full max-w-sm shadow-2xl">
          <form className="card-body" onSubmit={handleLogin}>
            <div className="form-control">
              <label className="input input-bordered input-primary flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70"
                >
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                </svg>
                <input
                  type="text"
                  className="grow"
                  placeholder="Introduzca su DNI / NIE / TIE"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="form-control">
              <label className="input input-bordered input-primary flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="password"
                  className="grow"
                  placeholder="Introduzca su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              <label className="label justify-center">
                <div
                  className="tooltip tooltip-bottom mt-2"
                  data-tip="Diríjase a su farmacia para realizar cualquiera de estas operaciones."
                >
                  <a href="#" className="label-text-alt link link-hover">
                    ¿No tiene cuenta o no recuerda la contraseña?
                  </a>
                </div>
              </label>
            </div>

            <div className="h-6 flex items-center justify-center">
              {errorMessage && (
                <p className="text- text-red-600 text-center">{errorMessage}</p>
              )}
            </div>

            <div className="form-control mt-10">
              <button
                className="btn btn-primary text-white flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-dots loading-lg text-white"></span>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
