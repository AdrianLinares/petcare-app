# PLAN DE CAPACITACIÓN Y PRUEBAS DE ACEPTACIÓN DEL CLIENTE

**Sistema:** PetCare — Sistema de Gestión de Clínicas Veterinarias  
**Versión:** 1.3.1  
**Fecha:** Junio 2026  
**Alcance:** Capacitación a los tres roles del sistema (Propietario, Veterinario, Administrador Básico / Recepcionista)  
**Duración total estimada:** 3 jornadas (1 por cada grupo de usuarios) + 1 jornada de pruebas de aceptación

---

## 1. OBJETIVO GENERAL

Garantizar que los usuarios finales del Sistema de Información PetCare —Propietarios de mascotas, Veterinarios y Personal Administrativo (recepcionistas)— adquieran las competencias necesarias para operar el sistema de forma autónoma y eficiente, y que el cliente validador certifique mediante pruebas de aceptación que el software cumple con los requisitos funcionales y de negocio establecidos.

---

## 2. OBJETIVOS ESPECÍFICOS

1. **Capacitar a los propietarios de mascotas** en el uso del portal de autogestión: registro, alta de mascotas, programación de citas, consulta de historial clínico y manejo de notificaciones.
2. **Capacitar a los veterinarios** en el flujo clínico completo: agenda del día, atención de pacientes, creación de notas clínicas, gestión de historial médico, vacunas y medicamentos.
3. **Capacitar al personal de recepción (administrador básico)** en la gestión administrativa: registro de nuevos usuarios, gestión de citas del sistema, consulta de mascotas y uso del panel de analítica.
4. **Ejecutar pruebas de aceptación** con casos de uso reales por cada rol, documentando resultados y conformidad del cliente.
5. **Producir un video tutorial** que sirva como material de consulta permanente para los tres roles.

---

## 3. ALCANCE DE LA CAPACITACIÓN

### 3.1. Roles incluidos

| Rol | Perfil del usuario | Funcionalidades cubiertas |
|-----|-------------------|--------------------------|
| **Propietario (Pet Owner)** | Dueño de mascotas, usuario externo | Registro, inicio de sesión, alta/edición de mascotas, agendamiento de citas, consulta de historia clínica, vacunas, medicamentos, notificaciones, cambio de idioma |
| **Veterinario (Veterinarian)** | Médico veterinario, usuario interno | Agenda del día, atención de citas, creación de notas clínicas, historial médico de pacientes, registro de vacunas y medicamentos, búsqueda de pacientes, analítica de consulta |
| **Administrador Básico (Administrator — Nivel Estándar)** | Recepcionista, usuario interno | Gestión de usuarios (crear/editar/eliminar propietarios y veterinarios), gestión de citas del sistema, consulta de mascotas, panel de resumen, cambio de idioma |

### 3.2. Funcionalidades excluidas de esta capacitación

- Configuración técnica del sistema (Netlify, Neon DB, variables de entorno).
- Administración de niveles Elevado y Súper Administrador (corresponden a TI).
- Desarrollo, mantenimiento de código o despliegue.

---

## 4. METODOLOGÍA DE CAPACITACIÓN

### 4.1. Enfoque pedagógico

- **Aprendizaje basado en flujos de trabajo reales:** cada sesión sigue el recorrido natural del usuario en su jornada laboral o de uso del sistema.
- **Demostración guiada + práctica supervisada:** el facilitador muestra cada funcionalidad en el sistema en vivo y luego los participantes la ejecutan por sí mismos.
- **Apoyo audiovisual:** el video tutorial construido se utiliza como material de refuerzo durante la sesión y queda disponible como consulta posterior.

### 4.2. Recursos didácticos

| Recurso | Descripción |
|---------|-------------|
| **Video tutorial** | Demo grabada de 25–30 minutos con las funcionalidades principales de los tres roles. Se reproduce por segmentos durante la capacitación. |
| **Guion de capacitación** | Documento con la secuencia de actividades, tiempos y pausas para práctica de la sesión presencial de 45 minutos. |
| **Manual de Usuario** | Documento de referencia completo (disponible en `docs/Manual_Usuario_PetCare.md`). |
| **Sistema en vivo** | Acceso al entorno de producción para práctica real. |
| **Datos de prueba** | Usuarios, mascotas y citas precargados para facilitar la práctica. |

### 4.3. Estructura de cada sesión de capacitación

Cada sesión de 45 minutos sigue esta estructura:

| Fase | Duración | Actividad |
|------|----------|-----------|
| **1. Introducción** | 5 min | Presentación del sistema, objetivos de la sesión, contexto del rol |
| **2. Demostración con video** | 15 min | Reproducción del segmento del video tutorial correspondiente al rol, con pausas para comentarios del facilitador |
| **3. Práctica guiada** | 15 min | Los participantes ejecutan las funcionalidades en el sistema con supervisión del facilitador |
| **4. Preguntas y resolución de dudas** | 5 min | Espacio abierto para consultas |
| **5. Cierre** | 5 min | Resumen de lo aprendido, entrega de materiales de consulta, indicaciones para la sesión de pruebas de aceptación |

---

## 5. CRONOGRAMA DE CAPACITACIÓN

| Jornada | Día | Horario | Grupo | Contenido |
|---------|-----|---------|-------|-----------|
| **1** | Día 1 | 9:00–9:45 a.m. | Propietarios (grupo de 5–10) | Registro, mascotas, citas, historial médico, notificaciones |
| **2** | Día 1 | 11:00–11:45 a.m. | Veterinarios (grupo de 3–5) | Agenda del día, notas clínicas, historial médico, vacunas, medicamentos |
| **3** | Día 1 | 2:00–2:45 p.m. | Recepción (1–2 personas) | Gestión de usuarios, citas del sistema, consulta de mascotas, panel de resumen |
| **4** | Día 2 | 9:00–11:00 a.m. | Todos los roles | **Pruebas de aceptación del cliente** (ver sección 7) |

---

## 6. CONTENIDO POR ROL

### 6.1. Capacitación para Propietarios de Mascotas (45 min)

**Objetivo:** El propietario podrá registrarse, gestionar sus mascotas, agendar citas y consultar el historial médico de forma autónoma.

| Tema | Subtemas |
|------|----------|
| Acceso al sistema | URL, registro de cuenta, inicio de sesión, cambio de idioma |
| Gestión de mascotas | Agregar mascota, editar perfil, ver datos completos, condiciones y notas |
| Agendamiento de citas | Agendar cita: seleccionar mascota, veterinario, fecha, hora, tipo y motivo. Ver citas próximas y pasadas. Reagendar y cancelar. |
| Historial médico | Ver registros médicos, vacunas aplicadas, medicamentos activos. Agregar vacunas y medicamentos. |
| Notificaciones | Campana de notificaciones, leer y eliminar notificaciones |

### 6.2. Capacitación para Veterinarios (45 min)

**Objetivo:** El veterinario podrá gestionar su agenda diaria, atender pacientes creando notas clínicas, y administrar el historial médico completo.

| Tema | Subtemas |
|------|----------|
| Inicio de sesión y panel | Acceso con credenciales de veterinario, vista general del panel |
| Agenda del día | Ver citas programadas para hoy, orden por hora, buscar y filtrar citas |
| Atención de un paciente | Revisar historia clínica previa, crear nota clínica (síntomas, diagnóstico, tratamiento, medicamentos, seguimiento), marcar cita como completada |
| Historial médico | Buscar pacientes, ver historial completo (médico, vacunas, medicamentos, clínico), agregar vacunas y medicamentos |
| Analítica | Consultar citas completadas y carga de trabajo del día |

### 6.3. Capacitación para Recepción — Administrador Básico (45 min)

**Objetivo:** El recepcionista podrá registrar nuevos usuarios (propietarios y veterinarios), gestionar citas del sistema, consultar mascotas y utilizar el panel de resumen.

| Tema | Subtemas |
|------|----------|
| Inicio de sesión y panel | Acceso con credenciales de administrador, vista del panel de resumen |
| Gestión de usuarios | Buscar usuarios, crear nuevo propietario, crear nuevo veterinario, editar datos, eliminar usuarios |
| Gestión de citas | Ver todas las citas del sistema, filtrar por estado, cambiar estado de citas, eliminar citas |
| Gestión de mascotas | Buscar mascotas por nombre/especie/raza, acceder al perfil completo |
| Panel de resumen | Interpretar indicadores del sistema |

---

## 7. PLAN DE PRUEBAS DE ACEPTACIÓN DEL CLIENTE

### 7.1. Objetivo de las pruebas

Verificar que el sistema PetCare cumple con los requisitos funcionales definidos y que los usuarios finales, tras la capacitación, pueden ejecutar los flujos de trabajo principales de forma correcta y sin asistencia.

### 7.2. Metodología

- **Tipo de prueba:** Pruebas de aceptación de usuario (UAT) basadas en casos de uso.
- **Entorno:** Producción con datos reales o datos de prueba representativos.
- **Participantes:** Un representante de cada rol (1 propietario, 1 veterinario, 1 recepcionista) + el facilitador como observador.
- **Duración:** 2 horas.
- **Criterio de aprobación:** El 100% de los casos de prueba críticos deben ser ejecutados exitosamente. Los casos no críticos admiten un 80% de aprobación.

### 7.3. Casos de prueba por rol

#### 7.3.1. Casos de prueba — Propietario

| ID | Caso de prueba | Flujo esperado | Prioridad |
|----|---------------|----------------|-----------|
| PA-01 | Registro de nuevo propietario | Acceder a la URL → clic en "Registrarse" → completar formulario → clic en "Crear Cuenta" → redirección al panel de propietario | Crítico |
| PA-02 | Inicio de sesión | Ingresar correo y contraseña → clic en "Iniciar Sesión" → panel de propietario visible | Crítico |
| PA-03 | Agregar una mascota | Clic en "+ Agregar Mascota" → completar formulario → clic en "Guardar" → mascota aparece en "Mis Mascotas" | Crítico |
| PA-04 | Agendar una cita | Ir a "Mis Citas" → clic en "+ Agendar Cita" → seleccionar mascota, veterinario, fecha, hora, tipo, motivo → clic en "Agendar" → cita visible en "Próximas" | Crítico |
| PA-05 | Consultar historial médico | Clic en mascota → pestaña "Historial Médico" → ver registros, vacunas y medicamentos | Normal |
| PA-06 | Reagendar una cita | En "Mis Citas", clic en "Reagendar" → seleccionar nueva fecha/hora → confirmar | Normal |
| PA-07 | Cancelar una cita | En "Mis Citas", clic en "Cancelar" → confirmar → cita en estado "Cancelada" | Normal |
| PA-08 | Agregar una vacuna | Perfil de mascota → "Historial Médico" → "+ Agregar Vacuna" → completar → guardar | Normal |
| PA-09 | Cambiar idioma | Clic en selector de idioma → elegir "English" → interfaz cambia → volver a "Español" | Bajo |
| PA-10 | Cerrar sesión | Clic en "Cerrar Sesión" → redirección a pantalla de inicio de sesión | Crítico |

#### 7.3.2. Casos de prueba — Veterinario

| ID | Caso de prueba | Flujo esperado | Prioridad |
|----|---------------|----------------|-----------|
| VA-01 | Inicio de sesión como veterinario | Ingresar credenciales de veterinario → panel de veterinario visible con agenda del día | Crítico |
| VA-02 | Ver agenda del día | Panel muestra las citas del día actual con hora, mascota, tipo y motivo | Crítico |
| VA-03 | Atender cita y crear nota clínica | Clic en cita de la agenda → revisar historia → clic en "Agregar Registro Clínico" → completar síntomas, diagnóstico, tratamiento → guardar | Crítico |
| VA-04 | Marcar cita como completada | Después de crear nota clínica → clic en "Marcar Completada" → cita desaparece de la agenda | Crítico |
| VA-05 | Buscar paciente por nombre | Ir a "Historial Médico" → buscar mascota por nombre → clic en tarjeta → ver historial completo | Normal |
| VA-06 | Agregar vacuna a paciente | En historial del paciente → "+ Agregar Vacuna" → completar → guardar | Normal |
| VA-07 | Agregar medicamento a paciente | En historial del paciente → "+ Agregar Medicamento" → completar → guardar | Normal |
| VA-08 | Ver próximas citas | Ir a pestaña "Próximas" → ver lista de citas futuras ordenadas por fecha | Normal |
| VA-09 | Filtrar citas por estado | Ir a "Gestionar Citas" → seleccionar filtro "Completadas" → ver solo citas completadas | Bajo |
| VA-10 | Cerrar sesión | Clic en "Cerrar Sesión" → redirección a pantalla de inicio de sesión | Crítico |

#### 7.3.3. Casos de prueba — Administrador Básico (Recepción)

| ID | Caso de prueba | Flujo esperado | Prioridad |
|----|---------------|----------------|-----------|
| AA-01 | Inicio de sesión como administrador | Ingresar credenciales de administrador → panel de resumen visible con indicadores | Crítico |
| AA-02 | Crear nuevo propietario | Ir a "Gestión de Usuarios" → "+ Crear Usuario" → tipo "Propietario" → completar datos → guardar → aparece en tabla | Crítico |
| AA-03 | Crear nuevo veterinario | Ir a "Gestión de Usuarios" → "+ Crear Usuario" → tipo "Veterinario" → completar datos → guardar → aparece en tabla | Crítico |
| AA-04 | Buscar usuario | En tabla de usuarios, escribir en campo de búsqueda → resultados filtrados | Normal |
| AA-05 | Filtrar usuarios por tipo | Seleccionar "Veterinario" en filtro → tabla muestra solo veterinarios | Normal |
| AA-06 | Editar datos de un usuario | Clic en "Editar" en fila de usuario → modificar campo → "Guardar Cambios" | Normal |
| AA-07 | Eliminar un usuario | Clic en "Eliminar" → confirmar → usuario desaparece de la tabla | Normal |
| AA-08 | Ver todas las citas del sistema | Ir a "Gestión de Citas" → ver tabla con todas las citas, filtros por estado | Normal |
| AA-09 | Cambiar estado de una cita | Clic en cita → cambiar estado a "Cancelada" → confirmar | Normal |
| AA-10 | Consultar mascota del sistema | Ir a "Gestión de Mascotas" → buscar mascota → clic para ver perfil completo | Normal |
| AA-11 | Ver panel de resumen | Panel muestra total de usuarios por tipo, citas por estado, mascotas y citas del día | Normal |
| AA-12 | Cerrar sesión | Clic en "Cerrar Sesión" → redirección a pantalla de inicio de sesión | Crítico |

### 7.4. Formato de registro de resultados

Para cada caso de prueba se registra:

| Campo | Descripción |
|-------|-------------|
| ID | Código del caso de prueba |
| Ejecutado por | Nombre del participante |
| Fecha y hora | Momento de la ejecución |
| Resultado | ✅ Aprobado / ❌ Fallido |
| Observaciones | Descripción del resultado, errores encontrados, comentarios del usuario |
| Evidencia | Captura de pantalla o referencia al minuto del video de la sesión |

### 7.5. Criterios de aceptación final

El sistema se considera **aceptado por el cliente** cuando:

1. Todos los casos de prueba críticos (8 en total) son ejecutados exitosamente.
2. Al menos el 80% de los casos normales y bajos son ejecutados exitosamente.
3. Los tres representantes de rol manifiestan que pueden operar el sistema sin asistencia para sus tareas diarias.
4. El acta de aceptación es firmada por el responsable del cliente.

---

## 8. MATERIAL DE APOYO

### 8.1. Video tutorial

- **Título:** "PetCare — Tutorial Completo para Propietarios, Veterinarios y Recepción"
- **Duración:** 25–30 minutos
- **Formato:** MP4, resolución 1080p
- **Estructura:**
  1. Introducción al sistema (2 min)
  2. Funcionalidades para Propietarios (10 min)
  3. Funcionalidades para Veterinarios (8 min)
  4. Funcionalidades para Recepción / Administrador Básico (7 min)
  5. Cierre y recomendaciones (3 min)
- **Libreto:** Documento adjunto (`docs/Libreto_Video_Tutorial_PetCare.md`)

### 8.2. Guion de capacitación

- **Documento:** `docs/Guion_Capacitacion_45min_PetCare.md`
- **Uso:** El facilitador sigue este guion durante cada sesión de 45 minutos. Incluye los momentos exactos donde se pausa el video tutorial y se da paso a la práctica guiada.

### 8.3. Manual de Usuario

- **Documento de referencia:** `docs/Manual_Usuario_PetCare.md`
- **Uso:** Se entrega copia digital a cada participante al finalizar la capacitación.

---

## 9. RESPONSABLES

| Rol | Responsable |
|-----|-------------|
| Facilitador / Capacitador | Aprendiz SENA (instructor designado) |
| Validación de aceptación | Cliente (director de la clínica veterinaria o responsable designado) |
| Soporte técnico | Equipo de desarrollo PetCare |
| Participantes | Usuarios finales de cada rol (propietarios, veterinarios, recepcionistas) |

---

## 10. ANEXOS

- Anexo A: Libreto del Video Tutorial (`docs/Libreto_Video_Tutorial_PetCare.md`)
- Anexo B: Guion de Capacitación de 45 minutos (`docs/Guion_Capacitacion_45min_PetCare.md`)
- Anexo C: Manual de Usuario PetCare (`docs/Manual_Usuario_PetCare.md`)
- Anexo D: Acta de Aceptación del Cliente (formato a diligenciar el día de las pruebas)

---

*Documento elaborado como evidencia de la competencia "Elaborar plan de capacitación y realización de pruebas de aceptación del cliente" del programa de formación SENA.*

*F-GP-23 — Oficina de Tecnologías y Sistemas de Información*
