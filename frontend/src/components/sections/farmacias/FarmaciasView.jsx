import { useState, useEffect } from "react"  
import Card from "../../../components/ui/Card"  
import AdminCheck from "../checks/AdminCheck"  

const FarmaciasView = () => {

  return (
    <AdminCheck>
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
        <Card title="editfarmacia" />
        <Card title="editPersonalFarmacia" />
      </div>
    </AdminCheck>
  )  
}  

export default FarmaciasView  
