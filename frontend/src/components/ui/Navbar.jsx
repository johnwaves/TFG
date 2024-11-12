import { useState, useEffect } from "react";

const Navbarreact = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      if (user) {
        setUserName(user.name);
        const fullName = `${user.name} ${user.surname}`;
        {/* setUserName(fullName.length > 25 ? `${fullName.slice(0, 25)}...` : fullName); */ }
      }
    } catch (error) {
      console.error("Error loading user data from sessionStorage:", error);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("jwtToken");
    sessionStorage.removeItem("user");

    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 flex w-full justify-center px-4">
      <div className="navbar max-w-screen-xl mx-auto mt-4 rounded-[36px] bg-primary shadow-lg border-gray dark:border-gray-100 dark:backdrop-blur-xl">
        <div className="flex-1">
          <a href="/dashboard" className="btn btn-ghost text-xl text-white">PharmAD</a>
        </div>
        <div className="flex-none">
          {/* 
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              <div className="indicator">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="badge badge-md badge-error indicator-item text-white">
                  8
                </span>
              </div>
            </div>
            <div
              tabIndex={0}
              className="card card-compact dropdown-content bg-base-100 z-[1] mt-3 w-52 shadow"
            >
              <div className="card-body">
                <span className="text-lg font-bold">8 Items</span>
                <span className="text-info">Subtotal: $999</span>
                <div className="card-actions">
                  <button className="btn btn-primary btn-block">
                    View cart
                  </button>
                </div>
              </div>
            </div>
          </div> */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost flex items-center"
            >
              <span className="text-lg text-white font-semibold overflow-hidden whitespace-nowrap">
                ¡Hola, {userName}!
              </span>
              <div className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="white"
                  className="size-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </div>

            </div>
            <ul
              tabIndex={0}
              className="menu menu-md dropdown-content bg-white rounded-box z-[1] mt-3 w-64 p-2 shadow"
            >
              <li>
                <a className="justify-between">
                  Perfil
                  {/* <span className="badge">New</span> */}
                </a>
              </li>

              <li>
                <button onClick={handleLogout}>Cerrar sesión</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbarreact;
