# MANUAL DE USUARIO DEL SISTEMA DE INFORMACIÓN PETCARE

**CÓDIGO:** PETCARE-MU-001  
**VERSIÓN:** 1.0  
**FECHA:** Junio 2026  

---

## Control de Versiones

| Versión | Fecha | Descripción | Autores |
|---------|-------|-------------|---------|
| 1.0 | Junio 14 de 2026 | Versión inicial del Manual de Usuario | Equipo PetCare |

---

## Tabla de Contenido

1. [Objetivo del Manual](#1-objetivo-del-manual)
2. [Introducción al Sistema](#2-introducción-al-sistema)
3. [Alcance Funcional y Organizacional](#3-alcance-funcional-y-organizacional)
   - 3.1. Alcance Funcional
   - 3.2. Alcance Organizacional
4. [Prerrequisitos para el Uso del Sistema](#4-prerrequisitos-para-el-uso-del-sistema)
   - 4.1. Requerimientos de Hardware
   - 4.2. Requerimientos de Software
   - 4.3. Navegadores Compatibles
   - 4.4. Acceso al Sistema
   - 4.5. Permisos según el Rol de Usuario
5. [Configuración del Sistema](#5-configuración-del-sistema)
6. [Acceso al Sistema](#6-acceso-al-sistema)
   - 6.1. Registro de Usuario
   - 6.2. Inicio de Sesión
   - 6.3. Recuperación de Contraseña
   - 6.4. Cierre de Sesión
   - 6.5. Cambio de Idioma
7. [Funcionalidad y Servicios Ofrecidos](#7-funcionalidad-y-servicios-ofrecidos)
   - 7.1. Módulo de Autenticación y Gestión de Usuarios
   - 7.2. Módulo de Gestión de Mascotas
   - 7.3. Módulo de Historias Clínicas
   - 7.4. Módulo de Vacunación
   - 7.5. Módulo de Medicación
   - 7.6. Módulo de Citas
   - 7.7. Módulo de Notificaciones
   - 7.8. Módulo de Informes y Analítica
   - 7.9. Módulo de Administración
8. [Paso a Paso de Cada Opción del Sistema](#8-paso-a-paso-de-cada-opción-del-sistema)
   - 8.1. Funcionalidades para Propietario de Mascota
   - 8.2. Funcionalidades para Veterinario
   - 8.3. Funcionalidades para Administrador
9. [Flujos de Trabajo](#9-flujos-de-trabajo)
   - 9.1. Flujo 1: Propietario — Registro, Agregar Mascota y Agendar Cita
   - 9.2. Flujo 2: Veterinario — Gestión de Citas del Día
   - 9.3. Flujo 3: Administrador — Incorporación de Nuevo Veterinario
   - 9.4. Flujo 4: Recuperación de Contraseña
10. [Preguntas Frecuentes](#10-preguntas-frecuentes)
11. [Solución de Problemas](#11-solución-de-problemas)
12. [Datos de Contacto](#12-datos-de-contacto)
13. [Glosario](#13-glosario)

---

## 1. Objetivo del Manual

El presente manual tiene como propósito orientar a los usuarios finales del Sistema de Información PetCare sobre el uso correcto de sus módulos y funcionalidades. Este documento describe de manera detallada el acceso al sistema, la navegación por sus diferentes secciones, los procedimientos para el ingreso y consulta de información, y los flujos de trabajo que soportan los procesos de gestión de una clínica veterinaria.

El manual está dirigido a los tres perfiles de usuario del sistema: **Propietario de Mascota**, **Veterinario** y **Administrador**.

---

## 2. Introducción al Sistema

**PetCare** es una plataforma integral de gestión de clínicas veterinarias, desarrollada como aplicación web de página única (SPA) con arquitectura sin servidor (serverless). El sistema permite centralizar la administración de mascotas, historias clínicas, vacunación, medicación, agenda de citas y notificaciones en tiempo real, reemplazando los registros fragmentados en papel, hojas de cálculo y sistemas manuales de citas por una solución digital moderna.

El sistema está construido con tecnologías web modernas (React, TypeScript, Tailwind CSS) y se despliega sobre la infraestructura en la nube de Netlify con base de datos Neon PostgreSQL. Soporta internacionalización (español e inglés) y notificaciones en tiempo real mediante WebSockets (Pusher).

**Módulos principales:**

| Módulo | Descripción |
|--------|-------------|
| Autenticación | Registro, inicio de sesión y recuperación de contraseña con control de acceso basado en roles |
| Gestión de Mascotas | Alta, edición, consulta y eliminación de mascotas con perfil completo |
| Historia Clínica | Registro cronológico de eventos médicos, diagnósticos, tratamientos y notas clínicas |
| Vacunación | Seguimiento del esquema de vacunación con alertas de dosis próximas o vencidas |
| Medicación | Control de medicamentos activos y pasados, con dosis y fechas de administración |
| Citas | Programación, reagendamiento, cancelación y seguimiento de citas veterinarias |
| Notificaciones | Alertas en tiempo real sobre citas, cambios de estado y vencimientos |
| Administración | Gestión de usuarios, análisis del sistema y configuración de permisos |

---

## 3. Alcance Funcional y Organizacional

### 3.1. Alcance Funcional

PetCare cubre los siguientes procesos del ámbito de gestión veterinaria:

- **Registro y administración de pacientes (mascotas):** creación de perfiles completos que incluyen datos de identificación, especie, raza, edad, peso, color, género, número de microchip, alergias y condiciones médicas.
- **Gestión de la historia clínica:** documentación de consultas, diagnósticos, tratamientos, notas clínicas del veterinario y seguimiento de la evolución del paciente.
- **Control del esquema de vacunación:** registro de vacunas aplicadas, fechas de administración y fechas de próxima dosis, con alertas automáticas de vacunas vencidas o próximas a vencer.
- **Control de medicación:** registro de medicamentos recetados con dosis, fecha de inicio, fecha de finalización y estado (activo/finalizado).
- **Programación y gestión de citas:** agenda compartida entre propietarios y veterinarios, con funcionalidad de reagendamiento, cancelación y cambio de estado (programada, completada, cancelada).
- **Notificaciones en tiempo real:** comunicación instantánea de cambios de estado de citas, creación de registros clínicos, recordatorios de vacunación y vencimiento de medicamentos.
- **Administración del sistema:** gestión centralizada de usuarios (altas, bajas, modificaciones), asignación de roles y niveles de acceso, y visualización de analítica del sistema.

Estos procesos se alinean con las buenas prácticas de gestión de clínicas veterinarias y facilitan el cumplimiento de los requisitos de trazabilidad de la atención médica animal.

### 3.2. Alcance Organizacional

El sistema está dirigido a los siguientes grupos de interés:

| Grupo de Interés | Rol en el Sistema | Tipo |
|------------------|-------------------|------|
| Propietarios de mascotas | Propietario (pet_owner) | Externo |
| Médicos veterinarios | Veterinario (veterinarian) | Interno |
| Personal administrativo de la clínica | Administrador (administrator) | Interno |
| Administradores de TI | Super Administrador (super_admin) | Interno |

---

## 4. Prerrequisitos para el Uso del Sistema

### 4.1. Requerimientos de Hardware

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| Procesador | Doble núcleo a 1.6 GHz | Cuatro núcleos a 2.0 GHz o superior |
| Memoria RAM | 4 GB | 8 GB o superior |
| Disco Duro | 500 MB de espacio disponible | 1 GB de espacio disponible |
| Pantalla | Resolución 1024 × 768 | Resolución 1366 × 768 o superior |
| Conexión a Internet | Banda ancha de 2 Mbps | Banda ancha de 10 Mbps o superior |

### 4.2. Requerimientos de Software

- **Sistema Operativo:** Windows 10 o superior, macOS 11 (Big Sur) o superior, Linux (cualquier distribución moderna con entorno gráfico).
- No se requiere la instalación de software adicional en el equipo del usuario, ya que PetCare es una aplicación web que se ejecuta completamente en el navegador.

### 4.3. Navegadores Compatibles

| Navegador | Versión Mínima |
|-----------|---------------|
| Google Chrome | 90 o superior |
| Mozilla Firefox | 90 o superior |
| Microsoft Edge | 90 o superior |
| Safari | 14 o superior |
| Opera | 76 o superior |

Se recomienda mantener el navegador actualizado a su última versión estable para garantizar la compatibilidad y seguridad.

### 4.4. Acceso al Sistema

El acceso al sistema se realiza a través de la URL proporcionada por el administrador de la clínica veterinaria. En el entorno de producción, la URL tendrá un formato similar a:

```
https://petcare-app.netlify.app
```

> **Nota:** La URL exacta de acceso será suministrada por el administrador del sistema. No se requiere la instalación de ningún programa adicional.

### 4.5. Permisos según el Rol de Usuario

| Funcionalidad | Propietario | Veterinario | Administrador |
|--------------|:-----------:|:-----------:|:-------------:|
| Registrar y gestionar sus mascotas | ✅ | — | ✅ |
| Ver historial médico de sus mascotas | ✅ | ✅ | ✅ |
| Agregar registros de vacunación | ✅ | ✅ | ✅ |
| Agregar registros de medicación | ✅ | ✅ | ✅ |
| Agendar citas | ✅ | ✅ | ✅ |
| Crear notas clínicas | — | ✅ | ✅ |
| Ver agenda del día | — | ✅ | ✅ |
| Ver todos los pacientes | — | ✅ | ✅ |
| Gestionar usuarios | — | — | ✅ |
| Ver analítica del sistema | — | ✅ | ✅ |

---

## 5. Configuración del Sistema

PetCare es una aplicación completamente basada en la web, por lo que no requiere configuración adicional en el equipo del usuario. Basta con:

1. Disponer de un navegador web compatible (ver sección 4.3).
2. Contar con conexión activa a Internet.
3. Tener las credenciales de acceso (usuario y contraseña) suministradas por el administrador o creadas durante el registro.

En caso de que la red de la clínica utilice un firewall corporativo, se debe permitir el tráfico HTTPS (puerto 443) hacia los dominios de Netlify (`*.netlify.app` o el dominio personalizado configurado) y hacia los servidores de Pusher para las notificaciones en tiempo real (`*.pusher.com`).

---

## 6. Acceso al Sistema

### 6.1. Registro de Usuario

[Imagen: Pantalla de Registro de Usuario]

Para crear una cuenta nueva en PetCare:

1. Abra el navegador web e ingrese la URL del sistema.
2. En la pantalla de inicio de sesión, localice el botón **"¿No tienes cuenta? Regístrate"** en la parte inferior del formulario y haga clic en él.
3. El formulario cambiará al modo de registro, mostrando los campos adicionales para crear una cuenta. Tenga en cuenta que los campos previamente diligenciados se limpiarán. Complete los siguientes datos:
   - **Nombre completo:** Nombre y apellido del usuario.
   - **Correo electrónico:** Dirección de correo electrónico válida. Será el identificador de la cuenta.
   - **Teléfono:** Número de contacto (obligatorio).
   - **Dirección:** Domicilio o dirección de la clínica (opcional).
   - **Tipo de usuario:** Seleccione de la lista desplegable:
     - **Propietario de Mascota** (Pet Owner)
     - **Veterinario** (Veterinarian)
     - **Administrador** (Administrator)
   - **Contraseña:** Debe tener mínimo 8 caracteres, incluir al menos una letra mayúscula, una letra minúscula y un número.
   - **Confirmar contraseña:** Repita la misma contraseña.
4. Haga clic en el botón **"Crear Cuenta"**.
5. Si los datos son válidos, el sistema creará la cuenta e iniciará sesión automáticamente, redirigiéndolo al panel de control correspondiente según su rol.

### 6.2. Inicio de Sesión

[Imagen: Pantalla de Inicio de Sesión]

Para acceder a una cuenta existente:

1. Abra el navegador e ingrese la URL del sistema.
2. En el formulario de acceso (modo "Iniciar Sesión"), ingrese:
   - **Correo electrónico:** La dirección de correo registrada.
   - **Contraseña:** La contraseña de su cuenta.
3. Haga clic en el botón **"Iniciar Sesión"**.
4. Si las credenciales son correctas, el sistema lo redirigirá automáticamente al panel de control correspondiente a su rol:
   - **Propietario:** Panel de control de propietario con sus mascotas, citas y resumen de salud.
   - **Veterinario:** Panel de control de veterinario con la agenda del día y lista de pacientes.
   - **Administrador:** Panel de control de administrador con analítica del sistema y gestión de usuarios.

> **Nota:** La sesión se mantiene abierta durante 7 días. Al cabo de ese tiempo, el sistema cerrará la sesión automáticamente y deberá iniciar sesión de nuevo.

### 6.3. Recuperación de Contraseña

[Imagen: Pantalla de Recuperación de Contraseña]

Si olvidó su contraseña:

1. En la pantalla de inicio de sesión, haga clic en el enlace **"¿Olvidó su contraseña?"**.
2. Ingrese la dirección de correo electrónico asociada a su cuenta.
3. Haga clic en **"Enviar enlace de recuperación"**.
4. El sistema le enviará un mensaje al correo electrónico registrado con un enlace para restablecer la contraseña. Este enlace es válido por **1 hora** y solo puede usarse una vez.
5. Abra el enlace recibido. El sistema mostrará el formulario de restablecimiento de contraseña.
6. Ingrese la nueva contraseña (mínimo 8 caracteres, una mayúscula, una minúscula y un número).
7. Confirme la nueva contraseña y haga clic en **"Restablecer Contraseña"**.
8. Una vez restablecida, el sistema mostrará un mensaje de confirmación y lo redirigirá automáticamente a la pantalla de inicio de sesión después de 2 segundos para que acceda con su nueva contraseña.

### 6.4. Cierre de Sesión

Para cerrar sesión de forma segura:

1. En cualquier pantalla del sistema, ubique el botón **"Cerrar Sesión"** o **"Sign Out"** en la parte superior del panel.
2. Haga clic en el botón. El sistema eliminará la sesión activa y regresará a la pantalla de inicio de sesión.

### 6.5. Cambio de Idioma

[Imagen: Selector de Idioma]

PetCare soporta español e inglés. Para cambiar el idioma de la interfaz:

1. En la parte superior del panel, localice el selector de idioma (normalmente representado por un icono de globo terráqueo o las banderas de los idiomas disponibles).
2. Haga clic en el selector y elija el idioma deseado: **Español (ES)** o **English (EN)**.
3. La interfaz se actualizará inmediatamente al idioma seleccionado. La preferencia de idioma se conserva entre sesiones.

---

## 7. Funcionalidad y Servicios Ofrecidos

### 7.1. Módulo de Autenticación y Gestión de Usuarios

Permite el control de acceso al sistema con los siguientes servicios:

- **Registro de nuevos usuarios** con selección del tipo de usuario (Propietario, Veterinario, Administrador).
- **Inicio de sesión** mediante correo electrónico y contraseña.
- **Recuperación de contraseña** por correo electrónico con token de un solo uso y expiración de 1 hora.
- **Control de acceso basado en roles (RBAC):** las funcionalidades visibles dependen del tipo de usuario que inicia sesión.
- **Niveles de acceso para administradores:** Estándar, Elevado y Súper Administrador.

### 7.2. Módulo de Gestión de Mascotas

Permite a los propietarios, veterinarios y administradores gestionar la información de los pacientes (mascotas):

- **Crear mascota:** Registrar una nueva mascota con nombre, especie, raza, edad, peso, color, género y número de microchip.
- **Consultar mascota:** Ver el perfil completo con todos los datos registrados.
- **Editar mascota:** Modificar cualquier dato del perfil.
- **Eliminar mascota:** Dar de baja una mascota del sistema.
- **Gestionar alergias:** Agregar o eliminar alergias detectadas.
- **Agregar notas y condiciones:** Registrar condiciones médicas especiales o notas de cuidado.

### 7.3. Módulo de Historias Clínicas

Centraliza el registro cronológico de eventos médicos:

- **Crear registro médico:** Agregar un nuevo evento clínico con fecha, tipo de registro, descripción, diagnóstico, tratamiento y nombre del veterinario.
- **Consultar historia clínica:** Visualizar el historial médico completo de una mascota en orden cronológico.
- **Editar registro:** Modificar la información de un registro médico existente.
- **Eliminar registro:** Dar de baja un registro médico.
- **Crear nota clínica (veterinario):** Documentar síntomas, diagnóstico, tratamiento, medicamentos recetados y fecha de seguimiento. Exclusivo para el rol de veterinario.

### 7.4. Módulo de Vacunación

Lleva el control del esquema de vacunación de cada mascota:

- **Registrar vacuna:** Agregar una vacuna aplicada con nombre, fecha de administración y fecha de próxima dosis.
- **Consultar vacunas:** Ver todas las vacunas registradas para una mascota.
- **Editar vacuna:** Modificar los datos de una vacuna.
- **Eliminar vacuna:** Dar de baja un registro de vacunación.
- **Alertas de vencimiento:** El sistema identifica vacunas con fecha de próxima dosis vencida y lo muestra en el panel del propietario.

### 7.5. Módulo de Medicación

Gestiona los medicamentos prescritos a cada mascota:

- **Registrar medicamento:** Agregar un medicamento con nombre, dosis, fecha de inicio, fecha de finalización y veterinario que lo recetó.
- **Consultar medicamentos:** Ver lista de medicamentos activos y pasados.
- **Editar medicamento:** Actualizar información de un medicamento.
- **Eliminar medicamento:** Dar de baja un registro de medicación.
- **Seguimiento de tratamientos activos:** Los medicamentos con fecha de finalización posterior a la fecha actual se muestran como activos.

### 7.6. Módulo de Citas

Administra la agenda de consultas de la clínica:

- **Agendar cita:** Seleccionar mascota, veterinario, fecha, hora, tipo de cita y motivo de la consulta.
- **Consultar citas:** Ver citas próximas y pasadas, filtradas por estado.
- **Reagendar cita:** Cambiar la fecha u hora de una cita programada.
- **Cancelar cita:** Cambiar el estado de una cita a "cancelada".
- **Completar cita (veterinario):** Marcar una cita como "completada" después de la atención.
- **Buscar y filtrar citas:** Por mascota, propietario, veterinario, tipo o estado.

### 7.7. Módulo de Notificaciones

Sistema de alertas en tiempo real mediante WebSockets:

- **Notificaciones automáticas** para:
  - Recordatorio de cita próxima.
  - Cita cancelada o reagendada.
  - Cita completada.
  - Nota clínica creada.
  - Vacuna próxima a vencer.
  - Medicamento por vencer.
- **Niveles de prioridad:** Baja, Normal, Alta.
- **Campana de notificaciones:** Indicador visual con contador de notificaciones no leídas.
- **Marcar como leída:** Individual o todas a la vez.
- **Eliminar notificaciones:** Limpiar notificaciones antiguas.

### 7.8. Módulo de Informes y Analítica

Proporciona indicadores visuales de la actividad del sistema:

- **Panel de propietario:**
  - Cantidad de mascotas registradas.
  - Próximas citas.
  - Vacunas vencidas.
  - Resumen de salud.
- **Panel de veterinario:**
  - Citas del día.
  - Citas completadas.
  - Total de pacientes atendidos.
  - Agenda próxima.
- **Panel de administrador:**
  - Total de usuarios por tipo.
  - Total de citas con desglose por estado.
  - Total de mascotas.
  - Citas programadas para hoy.

### 7.9. Módulo de Administración

Funcionalidades exclusivas del rol administrador:

- **Gestión de usuarios:** Listar, buscar, filtrar, crear, editar y eliminar usuarios.
- **Asignación de roles y niveles de acceso:** Designar tipo de usuario y nivel administrativo (estándar, elevado, súper administrador).
- **Gestión de citas a nivel sistema:** Ver, buscar y gestionar todas las citas de la clínica.
- **Acceso a todas las mascotas:** Consultar el perfil y la historia clínica de cualquier mascota registrada.

---

## 8. Paso a Paso de Cada Opción del Sistema

A continuación, se detallan las funcionalidades del sistema organizadas por rol de usuario, indicando para cada una cómo acceder, qué información diligenciar y qué resultado se espera.

### 8.1. Funcionalidades para Propietario de Mascota

El panel de control del propietario se compone de tres secciones principales: **Mis Mascotas**, **Mis Citas** y **Resumen de Salud**.

---

#### 8.1.1. Agregar una Nueva Mascota

[Imagen: Botón "Agregar Mascota" en el panel de propietario]

**Acceso:** Panel de Propietario → Sección "Mis Mascotas" → Botón **"+ Agregar Mascota"** o **"+ Add New Pet"**.

**Procedimiento:**

1. Haga clic en el botón **"+ Agregar Mascota"**. Se abrirá un formulario.
2. Diligencie los siguientes campos:
   - **Nombre:** Nombre de la mascota (obligatorio).
   - **Especie:** Perro, Gato, Ave, etc. (obligatorio).
   - **Raza:** Raza de la mascota (opcional).
   - **Edad:** Edad en años (obligatorio).
   - **Peso:** Peso en kilogramos (opcional).
   - **Color:** Color predominante (opcional).
   - **Género:** Seleccione Macho (Male) o Hembra (Female) (obligatorio).
   - **Número de Microchip:** Código de identificación del microchip (opcional).
3. Haga clic en **"Guardar"** o **"Save"**.
4. La mascota se agregará a la base de datos y aparecerá en la lista "Mis Mascotas".

[Imagen: Formulario de creación de mascota]

---

#### 8.1.2. Ver y Editar el Perfil de una Mascota

**Acceso:** Panel de Propietario → Sección "Mis Mascotas" → Clic en la tarjeta de la mascota deseada.

**Procedimiento:**

1. Al hacer clic en la tarjeta de la mascota, se despliega el perfil completo con los datos registrados.
2. Para editar, haga clic en el botón **"Editar"** o **"Edit"**.
3. Modifique los campos necesarios y haga clic en **"Guardar Cambios"**.
4. Los datos actualizados se reflejarán inmediatamente.

[Imagen: Perfil de mascota con sus datos]

---

#### 8.1.3. Agregar Condiciones y Notas de Cuidado

**Acceso:** Perfil de la mascota → Sección de condiciones y notas.

**Procedimiento:**

1. En el formulario de edición de la mascota, ubique el campo **"Condiciones Preexistentes"**.
2. Escriba las condiciones médicas conocidas de su mascota, separando múltiples condiciones con comas (ej. "Displasia de cadera, Diabetes").
3. En el campo **"Notas Adicionales"**, puede escribir cualquier información de cuidado, instrucciones especiales u observaciones.
4. Haga clic en **"Actualizar Mascota"** para conservar los cambios.

---

#### 8.1.4. Agregar una Vacuna

[Imagen: Formulario de registro de vacuna]

**Acceso:** Perfil de la mascota → Sección "Historial Médico" → Botón **"+ Agregar Vacuna"**.

**Procedimiento:**

1. Haga clic en **"+ Agregar Vacuna"**. Se abrirá el formulario.
2. Diligencie:
   - **Nombre de la vacuna:** Ej. "Rabia", "Moquillo", "Parvovirus" (obligatorio).
   - **Fecha de aplicación:** Fecha en que se administró la vacuna (obligatorio).
   - **Fecha de próxima dosis:** Fecha en que se debe aplicar el refuerzo (opcional pero recomendado).
   - **Administrada por:** Nombre del veterinario que la aplicó (opcional).
3. Haga clic en **"Guardar"**.
4. La vacuna se agregará al historial y, si se registró la fecha de próxima dosis, el sistema generará una alerta cuando se acerque o supere la fecha.

---

#### 8.1.5. Agregar un Medicamento

**Acceso:** Perfil de la mascota → Sección "Historial Médico" → Botón **"+ Agregar Medicamento"**.

**Procedimiento:**

1. Haga clic en **"+ Agregar Medicamento"**.
2. Complete el formulario:
   - **Nombre del medicamento:** (obligatorio).
   - **Dosis:** Cantidad y unidad (ej. "10 mg", "1 tableta") (obligatorio).
   - **Fecha de inicio:** (obligatorio).
   - **Fecha de finalización:** (opcional; si no se indica, el medicamento permanece como activo).
   - **Recetado por:** Nombre del veterinario (opcional).
3. Haga clic en **"Guardar"**.
4. El medicamento aparecerá en la lista de medicamentos activos hasta que llegue su fecha de finalización.

---

#### 8.1.6. Consultar la Historia Clínica

**Acceso:** Perfil de la mascota → Sección "Historial Médico" o "Medical History".

**Procedimiento:**

1. El sistema muestra todos los registros médicos, vacunas, medicamentos y notas clínicas asociados a la mascota en orden cronológico.
2. Puede desplazarse por la lista para revisar el historial completo.
3. Cada registro muestra su fecha, tipo y una breve descripción. Haga clic en un registro para ver los detalles completos.

[Imagen: Vista del historial médico cronológico]

---

#### 8.1.7. Agendar una Cita

[Imagen: Formulario de programación de cita]

**Acceso:** Panel de Propietario → Sección "Mis Citas" → Botón **"+ Agendar Cita"**.

**Procedimiento:**

1. Haga clic en **"+ Agendar Cita"**. Se abrirá el formulario de programación.
2. Diligencie la información:
   - **Mascota:** Seleccione de la lista de sus mascotas registradas (obligatorio).
   - **Veterinario:** Seleccione de la lista de veterinarios disponibles (obligatorio).
   - **Fecha:** Use el selector de fecha para elegir el día deseado (obligatorio).
   - **Hora:** Seleccione la hora de la cita (obligatorio).
   - **Tipo de cita:** Seleccione de la lista desplegable: Chequeo de Rutina, Vacunación, Emergencia, Cirugía, Cuidado Dental, Peluquería, Seguimiento o Consulta (obligatorio).
   - **Motivo:** Describa brevemente el motivo de la consulta (obligatorio).
3. Haga clic en **"Agendar"** o **"Schedule"**.
4. La cita se registrará y aparecerá en la sección "Próximas Citas". El veterinario seleccionado recibirá una notificación en tiempo real.

---

#### 8.1.8. Gestionar Citas Existentes

**Acceso:** Panel de Propietario → Sección "Mis Citas".

**Acciones disponibles:**

- **Ver detalles:** Haga clic en una cita para ver toda la información (mascota, veterinario, fecha, hora, tipo, motivo y estado).
- **Reagendar:** Haga clic en **"Reagendar"** o **"Reschedule"**, modifique la fecha u hora, y confirme. El veterinario recibirá una notificación del cambio.
- **Cancelar:** Haga clic en **"Cancelar"** o **"Cancel"**, confirme la cancelación. La cita pasará a estado "Cancelada" y el veterinario recibirá la notificación correspondiente.

[Imagen: Lista de citas con opciones de acción]

---

### 8.2. Funcionalidades para Veterinario

El panel de control del veterinario se compone de cuatro pestañas: **Agenda de Hoy**, **Próximas**, **Gestionar Citas** e **Historial Médico**. En la parte superior de la pestaña Agenda de Hoy se muestran indicadores con las citas del día, pendientes, completadas y el total de pacientes.

---

#### 8.2.1. Ver la Agenda del Día

**Acceso:** Panel de Veterinario → Sección "Agenda de Hoy" o "Today's Schedule".

**Procedimiento:**

1. Al iniciar sesión, el panel muestra automáticamente las citas programadas para el día actual.
2. Cada cita muestra: hora, nombre de la mascota, nombre del propietario y tipo de cita.
3. La agenda se actualiza automáticamente al cambiar de pestaña o al regresar a la ventana del navegador, reflejando las citas más recientes. Las notificaciones de cambios de estado (cancelación, reagendamiento) se reciben en tiempo real a través de la campana de notificaciones.

[Imagen: Agenda del día del veterinario]

---

#### 8.2.2. Atender una Cita y Crear Registro Clínico

**Acceso:** Panel de Veterinario → Pestaña "Agenda de Hoy".

**Procedimiento:**

1. En la lista de citas del día, cada cita muestra dos botones: **"Agregar Registro Clínico"** y **"Marcar Completada"**.
2. Para crear el registro clínico de la consulta, haga clic en **"Agregar Registro Clínico"**. Se abrirá un formulario con los siguientes campos:
   - **Fecha:** Fecha de la consulta (prellenada con la fecha actual).
   - **Síntomas:** Describa los síntomas observados (obligatorio).
   - **Diagnóstico:** Diagnóstico del veterinario (obligatorio).
   - **Tratamiento:** Tratamiento indicado (obligatorio).
   - **Medicamentos:** Lista de medicamentos recetados, separados por coma (opcional).
   - **Notas adicionales:** Observaciones complementarias (opcional).
   - **Fecha de seguimiento:** Si se requiere una próxima revisión (opcional).
3. Haga clic en **"Agregar Registro Clínico"**. El registro se almacena en la historia clínica del paciente.
4. Para marcar la cita como finalizada, haga clic en **"Marcar Completada"**. La cita cambiará a estado "Completada".

[Imagen: Formulario de registro clínico del veterinario]

---

#### 8.2.3. Ver Próximas Citas

**Acceso:** Panel de Veterinario → Pestaña "Próximas".

**Procedimiento:**

1. La pestaña muestra las citas futuras asignadas al veterinario, ordenadas por fecha.
2. Cada cita muestra: fecha, hora, nombre de la mascota, tipo de cita, motivo de consulta y estado.

---

#### 8.2.4. Buscar y Filtrar Citas

**Acceso:** Panel de Veterinario → Pestaña "Gestionar Citas".

**Procedimiento:**

1. Use el filtro de estado para ver: **Todas las Citas**, **Programadas**, **Completadas** o **Canceladas**.
2. Use el campo de búsqueda para localizar citas por nombre de mascota, dueño o tipo de cita.
3. Las citas se muestran en orden cronológico inverso (más recientes primero).
4. Desde esta vista puede **reagendar** una cita programada, **marcarla como completada**, **cancelarla** o **editar el historial médico** de una cita ya completada.

---

#### 8.2.5. Consultar el Historial Médico de un Paciente

**Acceso:** Panel de Veterinario → Pestaña "Historial Médico".

**Procedimiento:**

1. El sistema muestra tarjetas con todos los pacientes (mascotas) registrados en la clínica, incluyendo especie, raza, edad, peso y dueño.
2. Use el campo de búsqueda para filtrar por nombre de mascota, especie o raza.
3. Haga clic en la tarjeta de una mascota para acceder a su historial médico completo, organizado en cuatro secciones:
   - **Médico:** Registros médicos generales (ver, agregar, editar, eliminar).
   - **Vacunas:** Registros de vacunación (ver, agregar, editar, eliminar).
   - **Medicamentos:** Medicamentos activos e inactivos (ver, agregar, editar, desactivar).
   - **Clínico:** Notas clínicas creadas por veterinarios (ver, agregar, eliminar).

[Imagen: Historial médico de un paciente]

---

### 8.3. Funcionalidades para Administrador

El panel de control del administrador se compone de seis pestañas: **Resumen**, **Gestión de Usuarios**, **Gestión de Citas**, **Gestión de Mascotas**, **Historial Médico** y **Reportes**.

---

#### 8.3.1. Ver el Resumen del Sistema

**Acceso:** Panel de Administrador → Sección "Resumen" o "System Overview".

**Indicadores disponibles:**

- Total de usuarios registrados, clasificados por tipo (Propietarios, Veterinarios, Administradores).
- Total de citas con desglose por estado (Programadas, Completadas, Canceladas).
- Total de mascotas registradas en el sistema.
- Citas programadas para el día actual.

[Imagen: Panel de resumen del administrador con tarjetas de indicadores]

---

#### 8.3.2. Gestionar Usuarios

**Acceso:** Panel de Administrador → Sección "Gestión de Usuarios" o "User Management".

**Procedimiento — Listar y buscar usuarios:**

1. El sistema muestra una tabla con todos los usuarios registrados.
2. Use los filtros superiores para acotar por tipo de usuario: Propietario, Veterinario o Administrador.
3. Use el campo de búsqueda para localizar usuarios por correo electrónico, nombre o teléfono.

**Procedimiento — Crear un nuevo usuario:**

1. Haga clic en **"+ Crear Usuario"**.
2. Diligencie el formulario:
   - Nombre completo, correo electrónico, teléfono, dirección.
   - **Tipo de usuario:** Propietario, Veterinario o Administrador.
   - **Si es Veterinario:** Puede agregar la especialización y el número de licencia.
   - **Si es Administrador:** Seleccione el nivel de acceso (Estándar, Elevado, Súper Administrador).
   - **Contraseña:** Genere una contraseña temporal o asígnela manualmente.
3. Haga clic en **"Crear Usuario"**.
4. El nuevo usuario aparecerá en la tabla.

[Imagen: Formulario de creación de usuario]

**Procedimiento — Editar un usuario:**

1. En la tabla de usuarios, haga clic en el botón **"Editar"** junto al usuario deseado.
2. Modifique los campos necesarios.
3. Haga clic en **"Guardar Cambios"**.

**Procedimiento — Eliminar un usuario:**

1. Haga clic en el botón **"Eliminar"** junto al usuario.
2. El sistema solicitará confirmación. Verifique que es el usuario correcto.
3. Haga clic en **"Confirmar Eliminación"**. El usuario se dará de baja del sistema.

---

#### 8.3.3. Gestionar Citas a Nivel Sistema

**Acceso:** Panel de Administrador → Sección "Gestión de Citas" o "Appointment Management".

**Procedimiento:**

1. La tabla muestra todas las citas del sistema con fecha, hora, mascota, propietario, veterinario y estado.
2. Utilice los filtros de estado (Todas, Programadas, Completadas, Canceladas) y el campo de búsqueda.
3. Haga clic en una cita para **ver los detalles** completos.
4. Desde el detalle puede:
   - **Cambiar el estado** de la cita.
   - **Eliminar la cita** (requiere confirmación).

---

#### 8.3.4. Acceder a las Mascotas del Sistema

**Acceso:** Panel de Administrador → Sección "Gestión de Mascotas" o "Pet Management".

**Procedimiento:**

1. Use el campo de búsqueda para localizar mascotas por nombre, especie o raza.
2. Haga clic en una mascota para acceder a su perfil completo y a la historia clínica.

---

## 9. Flujos de Trabajo

A continuación, se describen los flujos de trabajo principales del sistema desde la perspectiva funcional, es decir, cómo un usuario final completa un proceso de negocio utilizando PetCare.

### 9.1. Flujo 1: Propietario — Registro, Agregar Mascota y Agendar Cita

Este es el flujo más común para un nuevo propietario que ingresa al sistema.

**Paso 1 — Registro:**
1. El usuario accede a la URL del sistema.
2. Hace clic en "Crear cuenta" y selecciona el tipo de usuario "Propietario de Mascota".
3. Completa el formulario con sus datos personales (nombre, correo, teléfono, contraseña).
4. Hace clic en "Registrarse". El sistema lo autentica automáticamente y lo redirige al Panel de Propietario.

**Paso 2 — Agregar primera mascota:**
1. En el panel, hace clic en "+ Agregar Mascota".
2. Ingresa los datos de su mascota (nombre, especie, raza, edad, peso, color, género).
3. Hace clic en "Guardar". La mascota aparece en "Mis Mascotas".

**Paso 3 — Agendar una cita:**
1. Hace clic en la sección "Mis Citas" y luego en "+ Agendar Cita".
2. Selecciona la mascota, el veterinario de preferencia, la fecha, la hora, el tipo de cita (ej. "Chequeo de Rutina") y escribe el motivo de la consulta.
3. Hace clic en "Agendar". La cita queda registrada con estado "Programada".

**Paso 4 — Día de la cita:**
1. El propietario puede ver la cita en "Mis Citas → Próximas".
2. El veterinario atiende la consulta y marca la cita como "Completada".
3. El propietario recibe una notificación de que la cita fue completada.

**Paso 5 — Consultar resultado:**
1. El propietario hace clic en su mascota desde "Mis Mascotas".
2. Navega a "Historial Médico" y puede ver la nota clínica creada por el veterinario con el diagnóstico, tratamiento y recomendaciones.

---

### 9.2. Flujo 2: Veterinario — Gestión de Citas del Día

**Paso 1 — Inicio de jornada:**
1. El veterinario inicia sesión con sus credenciales.
2. El panel muestra automáticamente la "Agenda del Día" con todas las citas programadas para la fecha actual.

**Paso 2 — Atención de un paciente:**
1. El veterinario hace clic en la primera cita de la agenda.
2. Revisa la historia clínica del paciente: historial médico, vacunas, medicamentos y alergias.
3. Hace clic en "+ Agregar Nota Clínica".
4. Documenta: síntomas observados, diagnóstico, tratamiento, medicamentos recetados y fecha de seguimiento si aplica.
5. Hace clic en "Guardar Nota Clínica".

**Paso 3 — Actualizar vacunas o medicamentos (si aplica):**
1. Para agregar una vacuna o medicamento, diríjase a la pestaña **"Historial Médico"**, busque al paciente y acceda a su historial.
2. Haga clic en **"+ Agregar Vacuna"** y registre la vacuna con su fecha de próxima dosis, o en **"+ Agregar Medicamento"** para registrar dosis y fechas.

**Paso 4 — Cerrar la cita:**
1. Hace clic en "Marcar como Completada".
2. La cita pasa a estado "Completada" y desaparece de la agenda del día.
3. El propietario recibe una notificación de cita completada.

**Paso 5 — Continuar con el siguiente paciente:**
1. El veterinario repite los pasos 2 a 4 con la siguiente cita de la agenda.
2. Al final de la jornada, puede revisar en la sección "Analítica" cuántas citas completó.

---

### 9.3. Flujo 3: Administrador — Incorporación de Nuevo Veterinario

**Paso 1 — Ingreso al sistema:**
1. El administrador inicia sesión con sus credenciales.
2. El panel muestra el "Resumen del Sistema".

**Paso 2 — Crear el usuario veterinario:**
1. Hace clic en "Gestión de Usuarios".
2. Hace clic en "+ Crear Usuario".
3. Completa el formulario:
   - Nombre completo del veterinario.
   - Correo electrónico institucional.
   - Teléfono de contacto.
   - Tipo de usuario: "Veterinario".
   - Especialización (opcional).
   - Número de licencia (opcional).
4. Hace clic en "Crear Usuario".

**Paso 3 — Entregar credenciales:**
1. El sistema genera la cuenta. El administrador comparte con el nuevo veterinario el correo electrónico y la contraseña temporal para que pueda acceder.

**Paso 4 — El veterinario inicia sesión:**
1. El nuevo veterinario accede a la URL del sistema con sus credenciales.
2. Al iniciar sesión por primera vez, puede cambiar su contraseña si lo desea.
3. El veterinario ya puede ver su agenda, pacientes y comenzar a trabajar.

---

### 9.4. Flujo 4: Recuperación de Contraseña

**Paso 1 — Solicitar recuperación:**
1. En la pantalla de inicio de sesión, el usuario hace clic en "¿Olvidó su contraseña?".
2. Ingresa su correo electrónico registrado.
3. Hace clic en "Enviar enlace de recuperación".

**Paso 2 — Recibir enlace:**
1. El sistema envía un correo electrónico con un enlace único de restablecimiento. El enlace expira en 1 hora.

**Paso 3 — Restablecer contraseña:**
1. El usuario abre el enlace desde su correo.
2. El sistema muestra el formulario de restablecimiento.
3. El usuario ingresa la nueva contraseña (mínimo 8 caracteres, una mayúscula, una minúscula y un número) y la confirma.
4. Hace clic en "Restablecer Contraseña".

**Paso 4 — Iniciar sesión con nueva contraseña:**
1. El sistema redirige al usuario a la pantalla de inicio de sesión.
2. El usuario ingresa su correo y la nueva contraseña.
3. Accede normalmente al sistema.

---

## 10. Preguntas Frecuentes

### Sobre Resultados — ¿Qué puedo hacer con el sistema?

**P: ¿Qué puedo hacer como propietario de mascota en PetCare?**
R: Puede registrar sus mascotas con su información completa (especie, raza, edad, peso, alergias), consultar y mantener su historia clínica, llevar el control de vacunas y medicamentos, agendar citas con veterinarios, y recibir notificaciones en tiempo real sobre sus citas y el estado de salud de sus mascotas.

**P: ¿Qué puede hacer un veterinario en PetCare?**
R: Puede ver su agenda del día, acceder al historial médico completo de cualquier paciente, crear notas clínicas con diagnóstico y tratamiento, registrar vacunas y medicamentos, gestionar el estado de las citas, y consultar la analítica de su consulta.

**P: ¿Qué funciones tiene el administrador?**
R: Puede gestionar todos los usuarios de la clínica (crear, editar, eliminar), asignar roles y niveles de acceso, supervisar todas las citas y mascotas del sistema, y visualizar indicadores generales de uso de la plataforma.

---

### Sobre Conceptos o Términos — ¿Qué es y para qué sirve?

**P: ¿Qué es una nota clínica?**
R: Es el registro que crea el veterinario después de atender una consulta. Contiene los síntomas observados, el diagnóstico, el tratamiento indicado, los medicamentos recetados y una fecha de seguimiento si es necesaria. Solo los veterinarios pueden crear notas clínicas.

**P: ¿Qué significan los niveles de acceso de administrador?**
R: PetCare contempla tres niveles para el rol de administrador:
- **Estándar:** Puede gestionar propietarios y veterinarios.
- **Elevado:** Además de lo anterior, puede gestionar otros administradores estándar.
- **Súper Administrador:** Tiene acceso completo al sistema, incluyendo la gestión de todos los administradores y la configuración general.

**P: ¿Qué son las notificaciones en tiempo real?**
R: Son alertas que aparecen instantáneamente en el sistema sin necesidad de recargar la página. Por ejemplo, cuando un propietario agenda una cita, el veterinario recibe la notificación al momento.

---

### Sobre Procedimientos — ¿Cómo puedo...?

**P: ¿Cómo agrego una vacuna a mi mascota?**
R: Vaya a "Mis Mascotas", seleccione la mascota, diríjase a "Historial Médico" y haga clic en "+ Agregar Vacuna". Complete el formulario con el nombre de la vacuna, la fecha de aplicación y la fecha de la próxima dosis.

**P: ¿Cómo reagendo una cita?**
R: Vaya a "Mis Citas", busque la cita que desea modificar, haga clic en "Reagendar", seleccione la nueva fecha y hora, y confirme.

**P: ¿Cómo cambio mi contraseña?**
R: Utilice la opción **"¿Olvidaste tu contraseña?"** en la pantalla de inicio de sesión. Recibirá un enlace por correo electrónico para restablecerla.

---

### Sobre Interpretaciones — ¿Qué ocurre si...?

**P: ¿Qué ocurre si mi sesión expira?**
R: La sesión dura 7 días. Si expira, el sistema lo redirigirá a la pantalla de inicio de sesión. Deberá ingresar nuevamente su correo y contraseña para continuar.

**P: ¿Qué significa el indicador rojo en el icono de notificaciones?**
R: El número en rojo indica la cantidad de notificaciones nuevas que no ha leído. Haga clic en el icono de la campana para revisarlas.

**P: ¿Qué ocurre si una vacuna está vencida?**
R: En el panel del propietario, la sección "Resumen de Salud" muestra una alerta indicando cuántas vacunas tienen la fecha de próxima dosis vencida. Se recomienda agendar una cita para actualizar el esquema de vacunación.

---

### Sobre Navegación — ¿En qué fase me encuentro? ¿A dónde puedo seguir?

**P: ¿Cómo vuelvo al panel principal?**
R: El sistema está diseñado como una página única (SPA). El panel de control siempre está visible en la parte superior o lateral. Haga clic en el logo de PetCare o en el título del panel para regresar a la vista principal de su dashboard.

**P: ¿Cómo sé en qué sección estoy?**
R: La sección activa se resalta visualmente (cambio de color o subrayado) en la barra de navegación o en las pestañas del panel. El título de la sección actual también se muestra en la parte superior del área de contenido.

---

## 11. Solución de Problemas

### Problemas de Acceso

| Problema | Causa Probable | Solución |
|----------|---------------|----------|
| No puedo iniciar sesión (credenciales inválidas) | Correo o contraseña incorrectos | Verifique que el correo esté bien escrito y que la contraseña sea la correcta. Si el problema persiste, utilice la opción "¿Olvidó su contraseña?". |
| La página no carga (pantalla en blanco) | Problema de conexión a Internet o JavaScript deshabilitado | Verifique su conexión a Internet. Asegúrese de que JavaScript esté habilitado en el navegador. Recargue la página (F5). |
| Error "Token expirado" o cierre de sesión inesperado | La sesión de 7 días expiró | Inicie sesión nuevamente con sus credenciales. |
| El enlace de recuperación de contraseña no funciona | El enlace expiró (más de 1 hora) o ya fue utilizado | Solicite un nuevo enlace desde la opción "¿Olvidó su contraseña?". |

### Problemas de Funcionalidad

| Problema | Causa Probable | Solución |
|----------|---------------|----------|
| No veo la opción para crear notas clínicas | Su rol no es Veterinario o Administrador | Solo los veterinarios y administradores pueden crear notas clínicas. Verifique su tipo de usuario. |
| No puedo agregar una mascota | Ya alcanzó el límite o error de validación | Verifique que todos los campos obligatorios estén diligenciados (especialmente nombre, especie y edad). |
| La cita no aparece en la agenda del veterinario | La cita pudo ser cancelada o reagendada | Revise el estado de la cita en "Mis Citas". Las citas canceladas no aparecen en la agenda activa. |
| No recibo notificaciones | Pusher puede estar bloqueado o el navegador no soporta WebSockets | Verifique que el firewall no bloquee `*.pusher.com`. Use un navegador actualizado que soporte WebSockets. |
| La página se ve mal o los estilos no cargan | Caché del navegador desactualizada | Limpie la caché del navegador (Ctrl+Shift+Supr en Chrome/Edge, Cmd+Shift+Supr en Mac) y recargue la página. |

### Problemas de Datos

| Problema | Causa Probable | Solución |
|----------|---------------|----------|
| No encuentro una mascota en mi lista | La mascota pudo ser eliminada | Contacte al administrador de la clínica para verificar. |
| Los datos de una mascota no se actualizan | Error de red o sesión expirada | Recargue la página y verifique su conexión. Si el problema persiste, cierre sesión e inicie de nuevo. |
| Error al guardar un formulario | Campos inválidos o error del servidor | Revise que no haya campos marcados en rojo con errores de validación. Si todo está correcto, espere unos minutos e intente de nuevo. |

---

## 12. Datos de Contacto

Para soporte técnico, dudas funcionales o reporte de incidentes relacionados con el Sistema de Información PetCare, comuníquese a través de los siguientes canales:

| Canal | Información de Contacto |
|-------|------------------------|
| **Correo electrónico** | soporte@petcareapp.com |
| **Teléfono** | +57 (1) XXX-XXXX |
| **Horario de atención** | Lunes a viernes, 8:00 a.m. a 6:00 p.m. (hora Colombia) |
| **Sitio web** | https://petcare-app.netlify.app |

> **Nota:** Los datos de contacto específicos (correo, teléfono y URL) deben ser actualizados por el administrador del sistema con la información de contacto real de la clínica u organización que despliega PetCare.

Para solicitudes relacionadas con la administración de usuarios (creación de cuentas, cambio de roles, eliminación de cuentas), contacte al administrador del sistema de su clínica.

---

## 13. Glosario

| Término | Definición |
|---------|------------|
| **Administrador** | Usuario con permisos para gestionar otros usuarios, ver analítica del sistema y administrar las citas y mascotas de toda la clínica. |
| **Cita** | Registro de una consulta veterinaria programada. Tiene una fecha, hora, mascota, veterinario, tipo y estado. |
| **Cita completada** | Estado de una cita después de que el veterinario la ha atendido y la ha marcado como finalizada. |
| **Cita programada** | Estado de una cita agendada que aún no se ha llevado a cabo. |
| **Especie** | Clasificación biológica de la mascota: perro, gato, ave, reptil, etc. |
| **Historia clínica** | Registro cronológico de todos los eventos médicos de una mascota: consultas, diagnósticos, vacunas, medicamentos y notas clínicas. |
| **Mascota** | Animal de compañía registrado en el sistema. También denominado "paciente". |
| **Microchip** | Dispositivo electrónico de identificación implantado en la mascota. Su número es único y sirve para identificarla. |
| **Navegador web** | Programa utilizado para acceder a Internet y a la plataforma PetCare (Chrome, Firefox, Edge, Safari). |
| **Nota clínica** | Registro creado por el veterinario durante o después de una consulta. Contiene síntomas, diagnóstico, tratamiento, medicamentos y seguimiento. |
| **Notificación en tiempo real** | Mensaje de alerta que aparece instantáneamente en el sistema gracias a la tecnología WebSocket (Pusher), sin necesidad de recargar la página. |
| **Paciente** | Sinónimo de mascota en el contexto clínico. |
| **Propietario** | Usuario dueño de una o varias mascotas. Puede gestionar sus mascotas, agendar citas y consultar historias clínicas. |
| **RBAC (Role-Based Access Control)** | Sistema de control de acceso basado en roles. Determina qué funcionalidades ve cada tipo de usuario según su rol. |
| **Rol** | Tipo de usuario en el sistema: Propietario, Veterinario o Administrador. Define los permisos y funcionalidades disponibles. |
| **SPA (Single Page Application)** | Tipo de aplicación web que carga una sola página y actualiza el contenido dinámicamente sin recargar la página completa. |
| **Veterinario** | Profesional de la salud animal que atiende consultas, crea notas clínicas y gestiona el historial médico de los pacientes. |
| **WebSocket** | Tecnología que permite la comunicación bidireccional en tiempo real entre el navegador y el servidor. Utilizada en PetCare para las notificaciones instantáneas. |

---

## Anexo: Marcadores de Posición para Capturas de Pantalla

Para completar el manual de acuerdo con la guía del DNP, se deben incluir capturas de pantalla representativas de las siguientes pantallas del sistema:

1. Pantalla de inicio de sesión
2. Pantalla de registro de usuario con selector de tipo de usuario
3. Pantalla de recuperación de contraseña
4. Panel de control del Propietario (Mis Mascotas, Mis Citas, Resumen de Salud)
5. Formulario de creación de mascota
6. Perfil de mascota con datos completos
7. Historial médico cronológico de una mascota
8. Formulario de programación de cita con selectores de fecha y hora
9. Lista de citas con opciones de acción (Reagendar, Cancelar)
10. Panel de control del Veterinario (Agenda del Día)
11. Formulario de nota clínica (síntomas, diagnóstico, tratamiento)
12. Lista de pacientes del veterinario con búsqueda
13. Panel de control del Administrador (Resumen del Sistema)
14. Tabla de gestión de usuarios con filtros
15. Formulario de creación de usuario administrador
16. Selector de idioma (Español / English)
17. Campana de notificaciones con contador de no leídas
18. Lista de notificaciones en tiempo real

**Instrucciones para la captura:** Utilice la herramienta de captura de pantalla de su sistema operativo. Se recomienda una resolución de 1366 × 768 píxeles o superior. Recorte la imagen para mostrar únicamente la ventana del navegador con la interfaz de PetCare. Inserte las imágenes en la ubicación indicada por los marcadores `[Imagen: ...]` a lo largo del documento.

---

*Documento elaborado conforme a la "Guía para la Elaboración del Manual de Usuario de los Sistemas de Información" del Departamento Nacional de Planeación (DNP), versión 1.0, 2020.*

*F-GP-23 — Oficina de Tecnologías y Sistemas de Información — Grupo de Gestión de Sistemas de Información*
