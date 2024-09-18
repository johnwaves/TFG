# Historias de usuario

En este documento se listan los actores y las historias de usuario (user-stories) que permitirán realizar un desarrollo progresivo del proyecto.

Se definen tres categorías de actores:

- **Personal sanitario.** Dado que este proyecto está orientado de forma exclusiva a farmacias comunitarias[^1], se distinguen los siguientes tipos de personal sanitario:
  - **Farmacéutico.** Es la persona cualificada y encargada de elaborar y dispensar medicación, recomendar la implantación de hábitos de vida, dietas, controlar las recetas médicas dispensadas y realizar un seguimiento del tratamiento en los pacientes con el fin de determinar la adherencia y ofrecer recomendaciones para mejorarla. A los farmacéuticos se les atribuye más tareas y cargos dentro de una oficina de farmacia, pero las funciones anteriores serán las principales para el desarrollo de este proyecto.
  - **Técnico de farmacia.** Es una persona con formación en el campo de la farmacia que asiste al farmacéutico titular en diferentes tareas: dispensación de productos farmacéuticos junto con sus indicaciones de uso, toma de constantes vitales bajo la supervisión del facultativo, y parámetros somatométricos (como el peso y la altura), además de realizar tareas administrativas.

- **Clientes.** En esta categoría existen dos perfiles:
  - **Paciente.** Se trata del individuo que busca atención o recibe cuidados de salud debido a enfermedades, lesiones, para mejorar su bienestar, para prevenir otras enfermedades o para obtener diagnósticos sobre su estado de salud.[^2]
  - **Tutor o acompañante del paciente.** En el caso en que el paciente no sea una persona independiente, como un menor o un anciano, será el tutor, representante o acompañante del mismo quien realizará todas las tareas de recogida de medicación y de proporción de información en su lugar.

- **Administrador del sistema.** Será el encargado de llevar a cabo tareas de monitorización de la actividad de la plataforma final, ofrecer soporte y manejar la creación y eliminación de oficinas de farmacia dentro del proyecto.

A continuación se detallan las historias de usuario, las cuales irán nombradas de la forma **HU-XX**, siendo **XX** el número de historia en orden creciente:

- **HU-01: Farmacéutico.**  
  El farmacéutico titular de una farmacia atiende a una variedad de clientes a lo largo de un día. La mayoría de ellos acude a recoger la medicación prescrita, otros para que se les dispense una medicación personalizada y algunos llegan para aclarar sus dudas o incertidumbres sobre la toma de medicamentos y comunicar sus avances en cuanto a todo tipo de tratamientos.  
  El farmacéutico despacha a todas las personas de igual manera, aunque emplea un mayor tiempo en aquellas consultas más complejas, como es el caso del seguimiento de un tratamiento, su cumplimiento o el estudio del uso individualizado de los medicamentos, con el propósito de detectar reacciones adversas que puedan producirse. Para poder ser más eficiente en su jornada laboral, requiere que muchas de estas tareas se automaticen, pues algunos de los datos que recoge manualmente son de carácter estadístico y no se precisa su presencia obligatoria.

- **HU-02: Técnico de farmacia.**  
  El técnico de farmacia es añadido a una farmacia por su farmacéutico titular y no tiene las mismas responsabilidades que este, pero también puede dispensar medicamentos y atender consultas de los pacientes sobre sus tratamientos en curso.  
  El farmacéutico delega en el técnico varias funciones, como contribuir al análisis del cumplimiento de tratamientos, dietas o hábitos de vida, y medir constantes vitales y parámetros somatométricos. Además, el técnico es responsable de registrar a los pacientes en el sistema de la farmacia.

- **HU-03: Paciente.**  
  Un paciente llega a la farmacia para retirar su medicación recetada. Tras comenzar el tratamiento, puede regresar para que se le dispense nuevamente el medicamento necesario o para realizar un seguimiento de su tratamiento o hábito prescrito. Sin embargo, en algunas ocasiones no es necesaria la dispensación de nueva medicación y el paciente sólo necesita informar sobre el cumplimiento de lo prescrito.  
  Estas tareas son algo que el paciente puede, y a menudo prefiere, realizar desde su domicilio, sin necesidad de acudir presencialmente a la farmacia.

- **HU-04: Acompañante del paciente.**  
  Un paciente menor de edad debe informar sobre su estado de salud unos días después de iniciar su tratamiento. Sin embargo, debido a su corta edad, son sus padres quienes deben realizar esta tarea, ya que el menor no puede acudir solo a la farmacia.  
  Los padres preferirían que esta gestión pudiera realizarse desde su domicilio o desde cualquier lugar donde se encuentren, ya que es posible que estén lejos de la farmacia donde registraron el inicio del tratamiento.


[^1]: Las farmacias comunitarias son establecimientos sanitarios de carácter privado pero de interés público donde el farmacéutico titular-propietario, asistido, en su caso, de ayudantes o auxiliares, presta servicios básicos a la población: dispensación de los medicamentos y productos sanitarios, control y custodia de las recetas médicas dispensadas, seguimiento de los tratamientos farmacológicos y no farmacológicos a los pacientes, entre otros. [Ley 16/1997]
[^2]: [Universidad de Navarra](https://www.unav.edu)

