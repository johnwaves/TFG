import { useState, useEffect } from "react";
import Card from "../ui/Card";

const DashboardView = () => {
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
      <h2 className="text-2xl font-bold text-center m-10">PANEL DE CONTROL</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 place-items-center mt-10 mb-10">
        <Card title="farmacias" />
        <Card title="usuarios" />
        <Card title="default" />
        <Card title="default" />
        <Card title="default" />
      </div>
    </>
  );
};

export default DashboardView;
