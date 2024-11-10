import Card from "../../ui/Card"
import SanitarioCheck from "../checks/SanitarioCheck"

const TratamientosView = () => {

    return (
        <SanitarioCheck>
            <div className="flex justify-center text-center m-10">
                <div className="breadcrumbs text-xl">
                    <ul>
                        <li><a href="/dashboard">Panel de control</a></li>
                        <li><a>Tratamientos</a></li>
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 place-items-center mt-10 mb-10">
                <Card title="addtratamiento" />
                <Card title="editratamiento" />
                <Card title="addregistro" />
            </div>
        </SanitarioCheck>

    )
}

export default TratamientosView