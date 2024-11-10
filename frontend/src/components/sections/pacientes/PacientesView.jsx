import Card from "../../ui/Card"
import SanitarioCheck from "../checks/SanitarioCheck"

const PacientesView = () => {

    return (
        <SanitarioCheck>
            <div className="flex justify-center text-center m-10">
                <div className="breadcrumbs text-xl">
                    <ul>
                        <li><a href="/dashboard">Panel de control</a></li>
                        <li><a>Pacientes</a></li>
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 place-items-center mt-10 mb-10">
                <Card title="addpaciente" />
                <Card title="editpaciente" />
            </div>
        </SanitarioCheck>

    )
}

export default PacientesView