# Requisitos

Los requisitos son especificaciones que el sistema debe cumplir para satisfacer las necesidades de los usuarios finales. El objetivo que plantean es guiar el diseño, el desarrollo y las pruebas y mantenimiento del software.

## Requisitos funcionales
Los requisitos funcionales especifican lo que debe realizar el sistema en cuanto a funciones o servicios. Los que se listan a continuación vienen nombrados por **RFXX**, donde **XX** es el número del requisito en orden creciente.

- **RF1: Registro de pacientes.** El sistema permitirá al personal sanitario registrar pacientes en la farmacia.
  - **RF1.1**: El farmacéutico y el técnico de farmacia podrán registrar nuevos pacientes en el sistema.
  - **RF1.2**: El sistema permitirá al farmacéutico y al técnico de farmacia actualizar la información de pacientes existentes.
  - **RF1.3**: El sistema permitirá registrar la información de contacto del tutor o acompañante del paciente, en caso de que el paciente sea un menor o una persona dependiente.

- **RF2: Dispensación de medicamentos.** El sistema permitirá la dispensación de medicamentos recetados a los pacientes.
  - **RF2.1**: El farmacéutico podrá registrar la dispensación de medicamentos recetados a los pacientes.
  - **RF2.2**: El técnico de farmacia podrá asistir en la dispensación de medicamentos, bajo la supervisión del farmacéutico.
  - **RF2.3**: El sistema registrará la fecha y hora de cada dispensación, así como la identidad del personal que realizó la dispensación.

- **RF3: Análisis de la adherencia.** El sistema permitirá al personal sanitario realizar el seguimiento de los tratamientos de los pacientes para determinar el nivel de adherencia.
  - **RF3.1**: El farmacéutico podrá registrar observaciones sobre el progreso del tratamiento de un paciente.
  - **RF3.2**: El técnico de farmacia podrá ingresar datos de seguimiento como constantes vitales y parámetros somatométricos del paciente.
  - **RF3.3**: El paciente, o su tutor o acompañante, podrá ingresar datos de seguimiento de un tratamiento y notificar problemas surgidos en el sistema.
  - **RF3.4**: El sistema generará alertas y recordatorios para el seguimiento de tratamientos a pacientes con condiciones críticas o crónicas.
  - **RF3.5**: El sistema realizará un análisis del seguimiento del tratamiento e informará sobre las estadísticas obtenidas para determinar el grado de adherencia.

- **RF4: Consulta de información médica.** El sistema permitirá al personal sanitario y a los pacientes consultar información sobre los tratamientos y medicamentos.
  - **RF4.1**: El farmacéutico podrá consultar el historial de tratamiento de un paciente.
  - **RF4.2**: El técnico de farmacia podrá acceder a la información relevante para la dispensación y seguimiento del tratamiento, bajo la supervisión del farmacéutico.
  - **RF4.3**: El paciente podrá consultar su historial de medicación y tratamiento en el sistema.
  - **RF4.4**: El acompañante del paciente, en caso de ser un menor o dependiente, podrá acceder a la información médica del paciente mediante un acceso autorizado.

- **RF5: Automatización de tareas administrativas.** El sistema automatizará ciertas tareas administrativas para mejorar la eficiencia del personal sanitario.
  - **RF5.1**: El sistema automatizará la generación de informes estadísticos sobre la dispensación de medicamentos.
  - **RF5.2**: El sistema permitirá la programación automática de seguimientos para tratamientos continuos o crónicos.

- **RF6: Gestión de usuarios del sistema.** El sistema permitirá la gestión de usuarios, incluyendo la creación, modificación y eliminación de cuentas para el personal sanitario y administrativo.
  - **RF6.1**: El administrador del sistema podrá crear, modificar y eliminar cuentas de usuarios para farmacéuticos y técnicos de farmacia.
  - **RF6.2**: El sistema permitirá asignar roles y permisos específicos según el perfil del usuario.

- **RF7: Seguimiento de tratamientos no farmacológicos.** El sistema permitirá al personal sanitario registrar y realizar el seguimiento de tratamientos no farmacológicos.
  - **RF7.1**: El farmacéutico podrá registrar recomendaciones de hábitos de vida saludables, como dietas, ejercicio físico, y otros tratamientos no farmacológicos.
  - **RF7.2**: El técnico de farmacia podrá asistir en el seguimiento del cumplimiento de estos hábitos de vida por parte del paciente.
  - **RF7.3**: El sistema permitirá al paciente o su tutor registrar su progreso en la adopción de estos hábitos de vida en el mismo.
  - **RF7.4**: El sistema generará alertas o recordatorios para el paciente sobre el cumplimiento de los tratamientos no farmacológicos, como recordar la realización de ejercicios o adherencia a una dieta específica.

## Requisitos no funcionales

- **RFN1: Seguridad de la información.** El sistema garantizará la seguridad y confidencialidad de la información médica y personal de los pacientes.
  - **RFN1.1**: El sistema utilizará un cifrado seguro para proteger los datos sensibles almacenados y transmitidos.
  - **RFN1.2**: Solo el personal autorizado, como farmacéuticos, técnicos de farmacia, y administradores del sistema, tendrán acceso a la información médica y personal de los pacientes. Los pacientes también tendrán acceso a dicha información, pero no podrán consultar la información de otros pacientes si no son tutores o acompañantes autorizados.
  - **RFN1.3**: El sistema requerirá autenticación para acceder a funciones administrativas o a información confidencial.

- **RFN2: Disponibilidad del sistema.** El sistema deberá estar disponible para su uso en las farmacias comunitarias en todo momento.
  - **RFN2.1**: El sistema garantizará una alta disponibilidad para asegurar que los servicios no se vean interrumpidos durante el horario de atención de las farmacias.
  - **RFN2.2**: El sistema deberá contar con mecanismos de respaldo y recuperación ante fallos o desastres, para minimizar el tiempo de inactividad.

- **RFN3: Rendimiento.** El sistema deberá ser capaz de manejar un alto volumen de transacciones y consultas sin afectar su rendimiento.
  - **RFN3.1**: El sistema deberá procesar la dispensación de medicamentos y la asignación de tratamientos no farmacológicos en un tiempo mínimo por transacción.
  - **RFN3.2**: El sistema deberá soportar la gestión simultánea de un número elevado de usuarios sin degradación en el rendimiento.

- **RFN4: Usabilidad.** El sistema deberá ser fácil de usar para todo el personal sanitario, considerando su nivel de familiaridad con las tecnologías.
  - **RFN4.1**: La interfaz de usuario deberá ser intuitiva, permitiendo a los usuarios realizar con fluidez sus tareas.
  - **RFN4.3**: El sistema deberá ser compatible con una amplia gama de dispositivos, permitiendo a los usuarios acceder a sus funciones de manera flexible y desde cualquier lugar.

- **RFN5: Escalabilidad.** El sistema deberá ser escalable para adaptarse al crecimiento del número de usuarios y farmacias integradas.
  - **RFN5.1**: El sistema deberá poder integrar nuevas farmacias comunitarias sin necesidad de interrupciones en el servicio.
  - **RFN5.2**: El sistema deberá poder integrar nuevo personal sanitario y nuevos pacientes sin necesidad de interrupciones en el servicio.

- **RFN6: Cumplimiento normativo.** El sistema deberá cumplir con todas las normativas y regulaciones vigentes en el sector de la salud y la farmacia.
  - **RFN6.1**: El sistema deberá cumplir con las normativas de protección de datos personales, como el Reglamento General de Protección de Datos (GDPR) en Europa.
  - **RFN6.2**: El sistema deberá cumplir con las normativas de almacenamiento y dispensación de medicamentos impuestas por las autoridades sanitarias locales.

- **RFN7: Mantenimiento.** El sistema deberá ser fácilmente mantenible para asegurar su operación continua y eficiente.
  - **RFN7.1**: El sistema deberá permitir actualizaciones y parches sin necesidad de detener las operaciones críticas.
  - **RFN7.2**: El sistema deberá proporcionar herramientas de diagnóstico y monitoreo para detectar y corregir problemas rápidamente.
