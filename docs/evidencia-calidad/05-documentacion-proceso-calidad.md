# Documentación del Proceso de Calidad de Software

> **Evidencia:** Aplicación de buenas prácticas de calidad documentadas en las disciplinas de calidad de software  
> **Proyecto:** PetCare — Sistema de Gestión de Clínicas Veterinarias  
> **Versión:** 1.0  
> **Fecha:** Julio 2026  

---

## Tabla de Contenidos

1. [La Documentación como Disciplina de Calidad](#1-la-documentación-como-disciplina-de-calidad)
2. [Plan de Calidad de Software](#2-plan-de-calidad-de-software)
3. [Estándares de Documentación Aplicados](#3-estándares-de-documentación-aplicados)
4. [Matriz de Trazabilidad](#4-matriz-de-trazabilidad)
5. [Documentación de Pruebas](#5-documentación-de-pruebas)
6. [Registros de Calidad](#6-registros-de-calidad)
7. [Gestión Documental](#7-gestión-documental)
8. [Mapa de Artefactos de Calidad en PetCare](#8-mapa-de-artefactos-de-calidad-en-petcare)

---

## 1. La Documentación como Disciplina de Calidad

La documentación técnica adecuada hace que la información sea de fácil acceso y reduce la curva de aprendizaje. En el contexto de la calidad de software, la documentación cumple cuatro funciones esenciales:

| Función | Descripción | Consecuencia de no documentar |
|---------|-------------|------------------------------|
| **Memoria institucional** | El conocimiento no se pierde cuando una persona deja el equipo | Dependencia de "la persona que sabe", riesgo de conocimiento tribal |
| **Trazabilidad** | Cada decisión de calidad puede rastrearse hasta el requisito, estándar o incidente que la originó | Imposibilidad de auditar, repetir errores ya corregidos |
| **Reproducibilidad** | Cualquier miembro del equipo puede ejecutar el proceso de calidad y obtener resultados equivalentes | Resultados inconsistentes, calidad dependiente de la persona |
| **Mejora continua** | Los datos históricos permiten identificar tendencias y oportunidades de mejora | Mejora basada en intuición, no en evidencia |

### 1.1. Principios de Documentación de Calidad

| Principio | Significado |
|-----------|------------|
| **Documentar "por qué", no "qué"** | El código dice qué hace. La documentación explica por qué se tomó esa decisión y qué alternativas se descartaron. |
| **Cercanía al artefacto** | La documentación debe vivir lo más cerca posible del artefacto que describe: tests junto al código, arquitectura en el README, decisions en commits. |
| **Documentación viva** | Un documento desactualizado es peor que ningún documento, porque genera confianza falsa. Todo documento debe tener un responsable y una fecha de revisión. |
| **Mínimo viable** | No documentar por documentar. Cada documento debe responder una pregunta concreta que alguien realmente necesita responder. |

---

## 2. Plan de Calidad de Software

El Plan de Calidad de Software (Software Quality Plan — SQP) es el documento rector que establece **qué** actividades de calidad se realizarán, **quién** las ejecutará, **cuándo** y **con qué criterios de aceptación**. Está inspirado en el estándar IEEE 730-2014 (*Software Quality Assurance Processes*).

### 2.1. Estructura del Plan de Calidad de PetCare

#### 2.1.1. Propósito y Alcance

**Propósito:** Definir las actividades de aseguramiento y control de calidad para el proyecto PetCare, garantizando que el producto cumple con los requisitos funcionales y no funcionales establecidos, y que el proceso de desarrollo incorpora prácticas de prevención de defectos.

**Alcance:** Aplica a todas las fases del ciclo de vida —requisitos, diseño, codificación, pruebas, despliegue y mantenimiento— y a todos los artefactos producidos —código fuente, esquema de base de datos, documentación, configuración de infraestructura y scripts de despliegue.

#### 2.1.2. Documentos de Referencia

| Documento | Versión | Propósito |
|-----------|:---:|-----------|
| ISO/IEC 25010:2023 | — | Modelo de calidad del producto |
| ISO/IEC 12207:2017 | — | Procesos del ciclo de vida |
| IEEE 730-2014 | — | Procesos de aseguramiento de calidad |
| `docs/01-ARCHITECTURE.md` | 1.0 | Arquitectura del sistema |
| `docs/08-PLAN-MANTENIMIENTO.md` | 1.0 | Plan de mantenimiento ISO 14764 |
| `schema.sql` | — | Esquema de base de datos |

#### 2.1.3. Organización de la Calidad

| Rol | Responsabilidades de Calidad |
|-----|-----------------------------|
| **Desarrollador** | Aplicar PSP (registro de tiempo y defectos), ejecutar auto-revisión de código (CR), escribir tests unitarios, cumplir el estándar de codificación |
| **Revisor (Peer)** | Ejecutar revisión de código usando la Guía de Revisión de Código (GRC), clasificar hallazgos (Bloqueante / Sugerencia / Elogio) |
| **QA / Tester** | Ejecutar pruebas de aceptación siguiendo el protocolo UAT, registrar defectos en el FRD, mantener la matriz de trazabilidad |
| **Líder Técnico** | Aprobar el DoD de cada sprint, revisar métricas de calidad (TMC), facilitar retrospectivas, mantener actualizado el plan de calidad |

#### 2.1.4. Actividades de Calidad por Fase

| Fase | Actividad de QA (Prevención) | Actividad de QC (Detección) | Criterio de Aceptación |
|------|----------------------------|---------------------------|----------------------|
| **Requisitos** | Checklist LV-RQ para cada requisito | Revisión de requisitos con stakeholders | 100% de requisitos pasan LV-RQ |
| **Diseño** | Checklist DLD (PSP2) antes de codificar | Revisión de arquitectura | El diseño pasa la checklist DLD de 9 puntos |
| **Codificación** | Estándar de codificación (PSP0.1), ESLint, Prettier, TypeScript strict | Revisión de código (CR) con GRC, checklist CR de 10 puntos | 0 errores de linting, 0 `any` injustificados, revisión aprobada |
| **Pruebas** | TDD parcial (test-aware), Vitest config con coverage thresholds | Ejecución de suite de tests en CI, pruebas de aceptación (UAT) | 100% tests pasan, cobertura ≥ 80%, escenarios UAT aprobados |
| **Despliegue** | LV-D (Checklist pre-despliegue), plan de rollback | Smoke tests post-deploy en producción | Build exitoso, checklist LV-D completa, smoke tests pasan |
| **Mantenimiento** | Plan ISO 14764, registro de defectos (FRD), análisis causa-raíz (ACR) | Revisión periódica de métricas (TMC) | MTBF > 720h, defectos en producción = 0 en el mes |

#### 2.1.5. Métricas y Reportes

| Métrica | Frecuencia de Medición | Frecuencia de Reporte | Audiencia |
|---------|:---:|:---:|-----------|
| Cobertura de pruebas | Por commit (CI) | Por sprint | Equipo de desarrollo |
| Defectos/KLOC (A/KLOC) | Por módulo completado | Por release | Líder técnico |
| Yield de revisión personal | Por ciclo de desarrollo | Por sprint | Desarrollador (PSP) |
| Tiempo de ciclo (commit → deploy) | Por PR | Por sprint | Equipo |
| Defectos en producción | Mensual | Mensual | Stakeholders |
| Cobertura de requisitos implementados | Por sprint | Por sprint | Product Owner |

#### 2.1.6. Gestión de Riesgos de Calidad

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|:---:|:---:|-----------|
| Regresión por cambio no probado | Media | Alto | Suite de tests en CI, coverage thresholds |
| Fuga de secretos en el repositorio | Baja | Crítico | `.gitignore`, `gitleaks`, variables de entorno externalizadas |
| Defecto en producción sin plan de rollback | Baja | Crítico | Plan de rollback documentado, Netlify rollback instantáneo |
| Documentación desactualizada | Alta | Medio | Revisión de docs como parte del DoD, responsable asignado por documento |
| Error en historia clínica o medicación | Baja | Muy Crítico | Validación Zod en frontend y backend, tests específicos para datos clínicos, UAT con veterinario real |

---

## 3. Estándares de Documentación Aplicados

### 3.1. IEEE 829-2008 — Documentación de Pruebas

El estándar IEEE 829 (*Standard for Software and System Test Documentation*) define un conjunto de documentos para el proceso de pruebas. PetCare aplica los siguientes:

| Documento IEEE 829 | Propósito | Equivalente en PetCare |
|--------------------|----------|------------------------|
| **Plan de Pruebas (Test Plan)** | Define alcance, enfoque, recursos y cronograma de las pruebas | Estrategia de Pruebas por Nivel (EPN) — Documento 01, Sección 6.1 |
| **Especificación de Caso de Prueba** | Describe cada caso de prueba: entradas, pasos, resultado esperado | Plantilla de Caso de Prueba (PCP) — Documento 01, Sección 6.2 |
| **Registro de Incidentes** | Reporta cualquier evento que requiera investigación | Formulario de Registro de Defectos (FRD) — Documento 01, Sección 4.2 |
| **Reporte de Pruebas (Test Report)** | Resume los resultados de las pruebas y las conclusiones | Este documento en su conjunto + reportes de CI |

### 3.2. ISO/IEC 26514:2022 — Documentación de Usuario

El estándar ISO/IEC 26514 establece lineamientos para la documentación orientada al usuario. PetCare lo aplica en los siguientes artefactos:

| Documento de Usuario | Propósito | Ubicación |
|---------------------|----------|-----------|
| **Manual de Usuario** | Guía de operación para los tres roles | `docs/Manual_Usuario_PetCare.md` |
| **Guía de Inicio Rápido** | Instalación y primera ejecución | `docs/04-QUICK-START.md` |
| **Guía de Despliegue** | Instrucciones para publicar en producción | `docs/05-DEPLOYMENT.md` |
| **Guía para Principiantes** | Explicación de la arquitectura y código para nuevos desarrolladores | `docs/02-BEGINNER_GUIDE.md` |
| **Video Tutorial** | Material audiovisual de capacitación | `docs/Libreto_Video_Tutorial_PetCare.md` (guion) |

### 3.3. Convención de Documentación Técnica

PetCare adopta las siguientes convenciones para mantener consistencia en todos los artefactos técnicos:

| Elemento | Convención |
|----------|-----------|
| **Idioma** | Documentación técnica en español (evidencias SENA). Código, comentarios inline, mensajes de commit, variables y nombres de archivos en inglés. |
| **Formato** | Markdown (`.md`) versionado en Git. Un solo formato para toda la documentación. |
| **Nomenclatura de archivos** | `NN-NOMBRE-DESCRIPTIVO.md` donde NN es el orden de lectura recomendado (ej: `01-ARCHITECTURE.md`). |
| **Encabezados** | Numeración jerárquica con `#`. Máximo 4 niveles de profundidad. |
| **Tablas** | Toda tabla tiene encabezado, todas las columnas tienen título, alineación explícita de columnas numéricas con `:---:`. |
| **Referencias cruzadas** | Enlaces relativos entre documentos (ej: `[documento 01](./01-diseno-instrumentos-calidad-software.md)`). |
| **Control de versiones** | Cada documento tiene un bloque de metadatos al inicio con: título del documento, versión, fecha y proyecto. |
| **Responsable** | Cada documento del plan de calidad tiene un responsable asignado para su mantenimiento. |

---

## 4. Matriz de Trazabilidad

La trazabilidad es la capacidad de seguir la "vida" de un requisito a través de todas las fases del desarrollo. La matriz de trazabilidad conecta: **requisito → diseño → implementación → prueba → defecto → validación**.

### 4.1. Estructura de la Matriz

| ID Requisito | Descripción | Componente | Archivo(s) | Test(s) asociado(s) | Defectos relacionados | UAT | Estado |
|-------------|-------------|-----------|-----------|-------------------|---------------------|:---:|:---:|
| PET-RQ-01 | Registrar mascota con datos básicos | `PetForm` | `components/Pet/PetManagement.tsx` | `PetManagement.test.tsx` | — | ✅ Aprobado | ✅ |
| PET-RQ-02 | Ver historial clínico de mascota | `MedicalHistory` | `components/Medical/MedicalHistoryManagement.tsx` | `MedicalHistoryManagement.test.tsx` | DEF-015 (fechas mal ordenadas) | ✅ Aprobado | ✅ |
| VET-RQ-01 | Ver agenda del día | `VetAgenda` | `Dashboard/VeterinarianDashboard.tsx` | `VeterinarianDashboard.test.tsx` | — | ✅ Aprobado | ✅ |
| VET-RQ-03 | Crear nota clínica | `ClinicalNoteForm` | `hooks/use-clinical-records.ts` | `use-clinical-records.test.tsx` | DEF-022 (diagnóstico no se guardaba con formato) | ✅ Aprobado | ✅ |
| ADM-RQ-01 | Crear usuario de cualquier rol | `UserForm` | `hooks/use-users.ts` | `use-users.test.tsx` | — | ✅ Aprobado | ✅ |
| ADM-RQ-04 | Ver analíticas del sistema | `AdminAnalytics` | `Dashboard/AdminDashboard.tsx` | `AdminDashboard.test.tsx` | DEF-031 (conteo incluía usuarios eliminados) | ✅ Aprobado | ✅ |
| NFR-01 | Tiempo de respuesta dashboard < 2s (p95) | — | Netlify Functions + Neon | — | — | ⬜ Pendiente | 🔲 |

### 4.2. Trazabilidad Inversa

Ante un defecto encontrado en producción, la matriz permite responder en segundos:

1. **¿Qué requisito está fallando?** → Seguir la traza desde el defecto hacia el requisito.
2. **¿Qué componentes están afectados?** → Identificar archivos de la columna "Componente".
3. **¿Tenemos tests que cubran este caso?** → Ver columna "Test(s) asociado(s)". Si no existe, crear test de regresión.
4. **¿Este defecto ya había ocurrido antes?** → Ver columna "Defectos relacionados".

---

## 5. Documentación de Pruebas

### 5.1. Documentación de Pruebas Unitarias y de Integración

Para pruebas automatizadas, la documentación **es el código mismo de los tests**. Cada archivo de test sigue una estructura que lo hace autodocumentado:

```typescript
// Archivo: frontend/src/hooks/use-appointments.test.tsx
// Módulo: Gestión de Citas (Appointment Management)
// Requisitos cubiertos: PET-RQ-03, VET-RQ-01, ADM-RQ-02

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAppointments } from './use-appointments';

describe('useAppointments', () => {
  // ==========================================
  // GRUPO 1: Inicialización
  // ==========================================
  describe('inicialización', () => {
    it('debe comenzar con lista de citas vacía cuando no hay datos', () => { ... });
    it('debe indicar estado de carga inicial (loading = true)', () => { ... });
  });

  // ==========================================
  // GRUPO 2: Operaciones CRUD
  // ==========================================
  describe('crear cita (createAppointment)', () => {
    it('debe agregar una nueva cita al estado', () => { ... });
    it('debe validar que la mascota pertenece al dueño antes de crear', () => { ... });
    it('debe mostrar error si el veterinario no está disponible en ese horario', () => { ... });
  });

  describe('cancelar cita (cancelAppointment)', () => {
    it('debe cambiar el estado de la cita a "cancelled"', () => { ... });
    it('no debe permitir cancelar una cita ya completada', () => { ... });
  });

  // ==========================================
  // GRUPO 3: Casos Borde y Errores
  // ==========================================
  describe('casos borde', () => {
    it('debe manejar error de red al cargar citas', () => { ... });
    it('debe manejar respuesta vacía de la API (sin citas)', () => { ... });
    it('no debe fallar si el usuario no tiene mascotas registradas', () => { ... });
  });
});
```

**Principio aplicado:** Un `describe` por grupo funcional, un `it` por caso, nombres de tests que describen el comportamiento esperado en lenguaje natural.

### 5.2. Documentación de Pruebas de Aceptación (UAT)

Cada sesión UAT produce un reporte que se archiva como registro de calidad:

**Estructura del Reporte UAT:**

```markdown
# Reporte de Pruebas de Aceptación — UAT-{ROL}-{FECHA}-{NÚMERO}

## Datos de la sesión
- **Rol validado:** {Pet Owner | Veterinarian | Administrator}
- **Participante:** {Nombre y perfil}
- **Fecha:** {FECHA}
- **Duración:** {MINUTOS} minutos
- **Ambiente:** Staging / Producción

## Escenarios ejecutados
| ID Escenario | Descripción | Resultado | Observaciones |
|-------------|-------------|:---:|---------------|
| UAT-VET-01 | Iniciar sesión como veterinario | ✅ | Sin observaciones |
| UAT-VET-02 | Ver agenda del día | ✅ | El participante sugirió filtro por tipo de cita |
| UAT-VET-03 | Atender una cita y crear nota clínica | ✅ | El flujo fue intuitivo |
| UAT-VET-04 | Buscar paciente por nombre | ⚠️ | La búsqueda no encontró "Luna" porque esperaba mayúscula exacta |
| UAT-VET-05 | Registrar vacuna aplicada | ✅ | Sin observaciones |

## Hallazgos
| ID | Severidad | Descripción | Acción |
|----|:---:|------------|--------|
| H-001 | Menor | Búsqueda de pacientes es sensible a mayúsculas/minúsculas | Crear ticket de mejora: búsqueda case-insensitive |

## Conformidad
- [x] El sistema cumple con los requisitos funcionales del rol Veterinario.
- [x] Los hallazgos identificados no son bloqueantes para la puesta en producción.

**Firma del participante:** __________________  
**Fecha:** __________________
```

---

## 6. Registros de Calidad

Los registros de calidad son la evidencia objetiva de que las actividades planificadas se ejecutaron. Sin registros, no hay auditoría posible.

### 6.1. Tipos de Registros en PetCare

| Tipo de Registro | Formato | Ubicación | Responsable |
|-----------------|---------|-----------|-------------|
| **Registro de tiempo PSP** | Planilla | Carpeta del proyecto | Desarrollador |
| **Registro de defectos PSP** | Planilla | Carpeta del proyecto | Desarrollador |
| **Reporte de revisión de código (PRR)** | Markdown / Comentario en PR | GitHub Pull Request | Revisor |
| **Reporte de sesión UAT** | Markdown | `docs/evidencia-calidad/uat/` | QA |
| **Resultados de tests en CI** | Log de Netlify | Netlify Deploy Logs | Automatizado |
| **Checklist pre-despliegue (LV-D)** | Markdown | Adjunto a cada release | Desarrollador |
| **Análisis Causa-Raíz (ACR)** | Markdown | `docs/evidencia-calidad/acr/` | Desarrollador |
| **Propuesta de Mejora (PIP)** | Markdown | `docs/evidencia-calidad/pip/` | Desarrollador |
| **Reporte de auditoría interna** | Markdown | `docs/evidencia-calidad/auditorias/` | Líder Técnico |

### 6.2. Política de Retención de Registros

| Tipo de Registro | Retención mínima | Justificación |
|-----------------|:---:|---------------|
| Registros PSP (tiempo, defectos) | Duración del proyecto + 6 meses | Necesarios para refinar estimaciones PROBE |
| Reportes UAT | 1 año después del cierre del proyecto | Evidencia de conformidad del cliente |
| Reportes de revisión de código | Duración del proyecto | Historial de decisiones técnicas |
| Logs de CI | 90 días | Troubleshooting de regresiones recientes |
| Análisis Causa-Raíz (ACR) | Duración del proyecto + 1 año | Prevención de recurrencia de defectos graves |
| Checklists de despliegue | Duración del proyecto | Auditoría de cumplimiento de proceso |

---

## 7. Gestión Documental

### 7.1. Estructura del Repositorio de Documentación

```
docs/
├── evidencia-calidad/                    # Esta evidencia
│   ├── 01-diseno-instrumentos-calidad-software.md
│   ├── 02-fundamentos-calidad-software.md
│   ├── 03-buenas-practicas-marcos-trabajo.md
│   ├── 04-proceso-personal-software-psp.md
│   ├── 05-documentacion-proceso-calidad.md
│   ├── uat/                              # Reportes de sesiones UAT
│   │   ├── UAT-PETOWNER-2026-06-15-01.md
│   │   ├── UAT-VETERINARIAN-2026-06-16-01.md
│   │   └── UAT-ADMIN-2026-06-17-01.md
│   ├── acr/                              # Análisis Causa-Raíz
│   └── pip/                              # Propuestas de Mejora de Proceso
├── 01-ARCHITECTURE.md                    # Documentación técnica general
├── 02-BEGINNER_GUIDE.md
├── 03-CODE_COMMENTS_GUIDE.md
├── 04-QUICK-START.md
├── 05-DEPLOYMENT.md
├── 06-REALTIME-NOTIFICATIONS.md
├── 07-DEPENDENCY-FIX.md
├── 08-PLAN-MANTENIMIENTO.md              # Plan ISO/IEC 14764
├── Manual_Usuario_PetCare.md
├── Plan_Capacitacion_Pruebas_Aceptacion.md
├── Guion_Capacitacion_45min_PetCare.md
└── Libreto_Video_Tutorial_PetCare.md
```

### 7.2. Control de Versiones de Documentos

Cada documento del plan de calidad sigue un ciclo de vida controlado:

| Estado | Significado | Transición permitida |
|--------|------------|---------------------|
| **Borrador** | El documento está en elaboración | → En Revisión |
| **En Revisión** | El documento fue completado por el autor y está siendo revisado | → Aprobado / → Borrador (con correcciones) |
| **Aprobado** | El documento fue revisado y autorizado para su uso | → Obsoleto (cuando se reemplaza por una nueva versión) |
| **Obsoleto** | El documento fue reemplazado por una versión más reciente | — (se archiva, no se modifica) |

**Regla de versionado de documentos:** `MAJOR.MINOR`

- **MAJOR:** Cambio estructural (reorganización de secciones, cambio en el alcance del documento, actualización por cambio en el estándar de referencia).
- **MINOR:** Corrección de errores, mejora de redacción, adición de ejemplos, actualización de datos.

### 7.3. Repositorio Central

Todos los documentos de calidad se versionan en Git junto con el código fuente. Esto garantiza:

1. **Sincronización código-documentación:** Un cambio en el código que afecta la documentación se commitea junto con el código.
2. **Historial completo:** `git log` muestra quién modificó qué documento, cuándo y por qué.
3. **Revisión en PR:** Los cambios en documentación se revisan con el mismo rigor que los cambios en código.
4. **Backup y distribución:** El repositorio remoto (GitHub) actúa como backup y mecanismo de distribución al equipo.

---

## 8. Mapa de Artefactos de Calidad en PetCare

La tabla siguiente consolida todos los artefactos de calidad producidos durante el proyecto, su propósito y su relación con los marcos de referencia:

| # | Artefacto | Tipo | Marco de Referencia | Estado |
|---|----------|------|-------------------|:---:|
| 1 | Lista de Verificación de Requisitos (LV-RQ) | Instrumento de verificación | IEEE 830, CMMI REQM | ✅ |
| 2 | Lista de Verificación de Código (LV-C) | Instrumento de verificación | PSP0.1 (Coding Standard) | ✅ |
| 3 | Lista de Verificación de Base de Datos (LV-BD) | Instrumento de verificación | Buenas prácticas SQL | ✅ |
| 4 | Matriz de Validación de Requisitos (MVR) | Instrumento de validación | CMMI VAL | ✅ |
| 5 | Protocolo de Pruebas de Aceptación (UAT) | Instrumento de validación | IEEE 829, Scrum (Sprint Review) | ✅ |
| 6 | Tablero de Métricas de Calidad (TMC) | Instrumento de medición | PSP, CMMI MA | ✅ |
| 7 | Formulario de Registro de Defectos (FRD) | Instrumento de medición | PSP (Defect Recording Log) | ✅ |
| 8 | Análisis Causa-Raíz (ACR) | Instrumento de medición | PSP (Post-mortem), Six Sigma DMAIC | ✅ |
| 9 | Guía de Revisión de Código (GRC) | Instrumento de revisión | PSP2 (Code Review Checklist), XP | ✅ |
| 10 | Plantilla de Reporte de Revisión (PRR) | Instrumento de revisión | IEEE 1028 | ✅ |
| 11 | Estrategia de Pruebas por Nivel (EPN) | Instrumento de prueba | IEEE 829, ISO 29119 | ✅ |
| 12 | Plantilla de Caso de Prueba (PCP) | Instrumento de prueba | IEEE 829 | ✅ |
| 13 | Lista de Verificación Pre-Despliegue (LV-D) | Instrumento de despliegue | DevOps, ISO 12207 | ✅ |
| 14 | Plan de Rollback | Instrumento de despliegue | DevOps, ITIL | ✅ |
| 15 | Definition of Done (DoD) | Contrato de calidad | Scrum | ✅ |
| 16 | Base de Proxies PROBE | Herramienta PSP | PSP1 (PROBE Method) | ✅ |
| 17 | Checklist de Revisión de Diseño (DLD) | Instrumento PSP2 | PSP2 (Design Review) | ✅ |
| 18 | Checklist de Revisión de Código (CR) | Instrumento PSP2 | PSP2 (Code Review) | ✅ |
| 19 | Propuesta de Mejora de Proceso (PIP) | Instrumento PSP0.1 | PSP0.1 (Process Improvement) | ✅ |
| 20 | Estándar de Codificación Personal | Documento PSP0.1 | PSP0.1 (Coding Standard) | ✅ |
| 21 | Plan de Calidad de Software (SQP) | Documento rector | IEEE 730 | ✅ |
| 22 | Matriz de Trazabilidad | Documento de gestión | CMMI REQM, ISO 12207 | 🔲 |
| 23 | Plan de Mantenimiento ISO 14764 | Documento técnico | ISO/IEC 14764 | ✅ |
| 24 | Manual de Usuario | Documento de usuario | ISO/IEC 26514 | ✅ |
| 25 | Plan de Capacitación y UAT | Documento de usuario | ISO/IEC 26514 | ✅ |

**Leyenda:** ✅ Completado | 🔲 En elaboración / Por completar

---

## Referencias

- IEEE 730-2014 — Standard for Software Quality Assurance Processes
- IEEE 829-2008 — Standard for Software and System Test Documentation
- IEEE 1028-2008 — Standard for Software Reviews and Audits
- ISO/IEC/IEEE 26514:2022 — Systems and software engineering — Requirements for designers and developers of user documentation
- ISO/IEC 12207:2017 — Systems and software engineering — Software life cycle processes
- Humphrey, W. S. (1995). *A Discipline for Software Engineering*. Addison-Wesley.
- Pressman, R. S., & Maxim, B. R. (2019). *Software Engineering: A Practitioner's Approach* (9th ed.). McGraw-Hill.

---

> **Nota:** Este documento cierra la evidencia de aplicación de buenas prácticas de calidad en el proyecto PetCare. Los documentos que lo complementan son: [01 — Instrumentos de Calidad](./01-diseno-instrumentos-calidad-software.md), [02 — Fundamentos](./02-fundamentos-calidad-software.md), [03 — Marcos de Trabajo](./03-buenas-practicas-marcos-trabajo.md) y [04 — PSP](./04-proceso-personal-software-psp.md).
