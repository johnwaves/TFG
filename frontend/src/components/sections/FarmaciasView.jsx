import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import AdminCheck from "../../components/sections/AdminCheck";

const FarmaciasView = () => {

  <AdminCheck />

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
      setUser(storedUser);

      if (storedUser.role !== "ADMIN") {
        window.location.href = "/unauthorized";
      }
    }
  }, []);

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="flex justify-center text-center m-10">
        <div className="breadcrumbs text-xl">
          <ul>
            <li><a href="/dashboard">Panel de control</a></li>
            <li><a>Farmacias</a></li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 place-items-center mt-10 mb-10">
        <Card title="addfarmacia" />
      </div>
    </>
  );
};

export default FarmaciasView;
