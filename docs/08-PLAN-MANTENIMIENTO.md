# Plan de Mantenimiento de Software — PetCare

> **Basado en ISO/IEC/IEEE 14764:2022 — Software Engineering — Software Life Cycle Processes — Maintenance**
>
> **Versión del documento:** 1.0
> **Versión del software:** 1.3.0 (ver [Version History](../README.md#-version-history))
> **Fecha:** Mayo 2026
> **Responsable:** Equipo de Mantenimiento de Software

---

## Tabla de Contenidos

1. [Descripción del Sistema](#1-descripción-del-sistema)
2. [Proceso de Implementación](#2-proceso-de-implementación)
3. [Análisis de Modificación y Problemas](#3-análisis-de-modificación-y-problemas)
4. [Implementación de la Modificación](#4-implementación-de-la-modificación)
5. [Aceptación y Revisión del Mantenimiento](#5-aceptación-y-revisión-del-mantenimiento)
6. [Migración](#6-migración)
7. [Retiro](#7-retiro)

---

## 1. Descripción del Sistema

### 1.1. Identificación del Sistema

| Atributo | Valor |
|---|---|
| **Nombre** | PetCare Management System |
| **Propósito** | Sistema de gestión veterinaria para clínicas, dueños de mascotas y administradores |
| **Versión** | 1.0.0 |
| **Entorno de ejecución** | Serverless (Netlify) + Cliente Web |
| **Lenguajes** | TypeScript 5.5, React 18, Node.js 20 |
| **Base de datos** | Neon PostgreSQL (serverless) |

### 1.2. Arquitectura del Sistema

PetCare es una aplicación web moderna construida sobre una arquitectura serverless que separa claramente el frontend del backend:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE WEB (Frontend)                     │
│  React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui    │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ PetOwner │ │ Veterin. │ │   Admin  │ │ Auth (Login,  │  │
│  │ Dashboard│ │Dashboard │ │Dashboard │ │ PassReset...) │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Hooks React (usePets, useAppointments, useUsers…)  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  API Client (Axios) · React Query · Pusher (WS)     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP / JSON
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                NETLIFY (Serverless Backend)                   │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │   Auth   │ │  Users   │ │   Pets   │ │ Appointments │  │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────┤  │
│  │ Med.Rec. │ │ Vaccinat.│ │Medicat. │ │Clinical Rec. │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Edge Functions (api-cache) · JWT Validation          │  │
│  │  Conexión Neon · Helpers · Response                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │ SQL Queries
                      ▼
         ┌────────────────────────┐
         │  NEON PostgreSQL (DB)  │
         │  users · pets · appts  │
         │  med_recs · vaccines   │
         │  medications · clinic  │
         │  notifications · black │
         └────────────────────────┘
```

### 1.3. Componentes del Sistema

| Capa | Componente | Descripción | Tecnología |
|---|---|---|---|
| **Frontend** | Dashboards | 3 dashboards según rol (PetOwner, Veterinarian, Admin) | React 18 + TypeScript |
| | UI Components | Biblioteca de componentes reutilizables (shadcn/ui + Radix) | 60+ componentes |
| | Hooks | 11 hooks personalizados para datos y notificaciones | React + TanStack Query |
| | API Client | Cliente HTTP centralizado con manejo de JWT | Axios |
| | Autenticación | Login, registro, recuperación de contraseña | JWT + localStorage |
| | Internacionalización | Soporte multi-idioma (i18next) | i18next + react-i18next |
| **Backend** | Funciones Serverless | 9 módulos API REST | Netlify Functions |
| | Edge Functions | Cache de respuestas GET | Netlify Edge |
| | Utilidades | Auth JWT, conexión Neon, helpers DB, validación env | TypeScript |
| **Base de Datos** | Esquema | 9 tablas con soft-delete, RLS, índices | PostgreSQL (Neon) |
| **Notificaciones** | Tiempo real | Notificaciones push vía WebSocket | Pusher |

### 1.4. Tablas de la Base de Datos

| Tabla | Propósito | Claves foráneas |
|---|---|---|
| `users` | Usuarios del sistema (dueños, veterinarios, admins) | — |
| `pets` | Mascotas registradas | owner_id → users.id |
| `appointments` | Turnos agendados | pet_id, owner_id, veterinarian_id → users/pets |
| `medical_records` | Historial médico | pet_id → pets.id |
| `vaccinations` | Vacunación | pet_id → pets.id |
| `medications` | Medicación | pet_id → pets.id |
| `clinical_records` | Notas clínicas detalladas | pet_id → pets.id |
| `notifications` | Notificaciones del sistema | user_id → users.id |
| `token_blacklist` | Tokens JWT invalidados | user_id → users.id |

### 1.5. Stack Tecnológico Completo

| Categoría | Tecnología | Versión |
|---|---|---|
| Framework Frontend | React | 18.3.1 |
| Lenguaje | TypeScript | 5.5.3 |
| Build | Vite | 5.4.21 |
| Estilos | Tailwind CSS | 3.4.11 |
| UI Components | shadcn/ui + Radix | — |
| Formularios | React Hook Form + Zod | 7.53 / 3.23 |
| Data Fetching | TanStack React Query | 5.56 |
| Cliente HTTP | Axios | 1.13 |
| Testing | Vitest + React Testing Library | 3.2.4 |
| Backend | Netlify Functions | Node 20 |
| DB | Neon PostgreSQL | Serverless |
| Tiempo real | Pusher | 8.4 |
| I18n | i18next | 23.12 |
| Charts | Recharts | 2.12 |
| Íconos | Lucide React | 0.462 |

---

## 2. Proceso de Implementación

### 2.1. Introducción

Conforme a la cláusula 6.1 de ISO/IEC/IEEE 14764, el proceso de implementación del mantenimiento establece las políticas, recursos y procedimientos que gobiernan todas las actividades de mantenimiento del sistema PetCare. Este proceso se aplica tanto al mantenimiento correctivo como al preventivo.

### 2.2. Tipos de Mantenimiento

ISO/IEC 14764 define cuatro categorías de mantenimiento. Este plan abarca las dos primeras como eje principal, e incluye las otras dos como parte del alcance completo:

| Tipo | Categoría ISO | Descripción | Ejemplos en PetCare |
|---|---|---|---|
| **Correctivo** | *Corrective* | Reparación de defectos descubiertos | Bug en login, error 500 en appointments, datos incorrectos en dashboard |
| **Preventivo** | *Preventive* | Modificaciones para prevenir defectos futuros | Actualización de dependencias, refactors, mejora de tests, optimización de consultas |
| **Adaptativo** | *Adaptive* | Cambios por evolución del entorno | Nueva versión de Node, cambio en API de Netlify, migración de Neon |
| **Perfectivo** | *Perfective* | Mejoras de rendimiento/mantenibilidad | Code splitting, lazy loading, optimización de queries, mejora coverage |

### 2.3. Roles y Responsabilidades

| Rol | Responsabilidad | Participación |
|---|---|---|
| **Maintainer Líder** | Prioriza solicitudes, asigna tareas, revisa cambios | Todo el ciclo |
| **Desarrollador** | Implementa modificaciones, escribe tests, documenta | Análisis + Implementación |
| **QA / Tester** | Ejecuta pruebas de regresión, verifica fixes | Verificación + Aceptación |
| **Administrador del Sistema** | Gestiona despliegues, monitorea en producción | Migración + Operación |
| **Usuario Reportante** | Reporta problemas, valida soluciones | Reporte + Aceptación |

### 2.4. Ciclo de Vida de una Solicitud de Mantenimiento

```
 ┌─────────────────────────────────────────────────────────┐
 │                  1. REPORTE / DETECCIÓN                  │
 │   (Usuario reporta bug / Auditoría detecta mejora)      │
 └─────────────────────┬───────────────────────────────────┘
                       ▼
 ┌─────────────────────────────────────────────────────────┐
 │             2. REGISTRO Y CLASIFICACIÓN                  │
 │   (Tipo: correctivo/preventivo · Prioridad: alta/media/baja) │
 └─────────────────────┬───────────────────────────────────┘
                       ▼
 ┌─────────────────────────────────────────────────────────┐
 │           3. ANÁLISIS DE MODIFICACIÓN (Sec. 3)           │
 │   (Impacto · Esfuerzo · Riesgo · Alternativas)          │
 └─────────────────────┬───────────────────────────────────┘
                       ▼
 ┌─────────────────────────────────────────────────────────┐
 │         4. AUTORIZACIÓN (Según criticidad)               │
 │   (Alta → Maintainer Líder · Baja → Automática)         │
 └─────────────────────┬───────────────────────────────────┘
                       ▼
 ┌─────────────────────────────────────────────────────────┐
 │         5. IMPLEMENTACIÓN DE MODIFICACIÓN (Sec. 4)       │
 │   (Branch · TDD · Implementación · Tests · PR)          │
 └─────────────────────┬───────────────────────────────────┘
                       ▼
 ┌─────────────────────────────────────────────────────────┐
 │       6. REVISIÓN Y ACEPTACIÓN (Sec. 5)                  │
 │   (Code Review · Tests de regresión · Aprobación)       │
 └─────────────────────┬───────────────────────────────────┘
                       ▼
 ┌─────────────────────────────────────────────────────────┐
 │             7. DESPLIEGUE Y CIERRE                       │
 │   (Deploy · Verificación en prod · Actualizar doc)      │
 └─────────────────────────────────────────────────────────┘
```

### 2.5. Recursos y Herramientas

| Recurso | Detalle |
|---|---|
| **Repositorio** | Git (GitHub) — ramas `feature/*`, `fix/*`, `main` |
| **CI/CD** | Netlify Deploy — deploys automáticos en main |
| **Testing** | Vitest + React Testing Library — tests por componente |
| **Gestión** | GitHub Issues para reportes y seguimiento |
| **Documentación** | `docs/` en el repositorio + comentarios inline |
| **Monitoreo** | Netlify Analytics + logs de funciones serverless |
| **Entornos** | Local (dev) → Preview (Netlify Deploy Preview) → Producción |

### 2.6. Gestión de Configuración

Todo cambio de mantenimiento sigue este flujo de control de versiones:

1. **Branch**: Se crea una rama desde `main` con convención de nombres:
   - `fix/<id>-<descripcion>` — mantenimiento correctivo
   - `refactor/<id>-<descripcion>` — mantenimiento preventivo
   - `chore/<id>-<descripcion>` — mantenimiento preventivo (deps, tooling)
   - `perf/<id>-<descripcion>` — mantenimiento preventivo/perfectivo
2. **Commits**: Commits atómicos con mensajes convencionales (conventional commits)
3. **PR**: Pull Request con descripción del cambio, impacto, y resultados de tests
4. **Merge**: Squash merge a `main` tras aprobación
5. **Tag**: Opcional para releases (`v1.0.1`, `v1.1.0`)

---

## 3. Análisis de Modificación y Problemas

### 3.1. Proceso de Reporte de Problemas

Conforme a la cláusula 6.2 de ISO/IEC 14764, toda solicitud de mantenimiento debe ser registrada, analizada y clasificada antes de su implementación.

Los problemas se reportan a través de GitHub Issues con la siguiente plantilla:

```markdown
## Reporte de Problema / Solicitud de Mantenimiento

### Tipo
[ ] Correctivo — Bug / Error en producción
[ ] Preventivo — Mejora de calidad / Deuda técnica
[ ] Adaptativo — Cambio en el entorno
[ ] Perfectivo — Mejora de rendimiento

### Gravedad (solo correctivo)
[ ] Crítico — Sistema inaccesible, datos corruptos
[ ] Alto — Funcionalidad principal no opera
[ ] Medio — Funcionalidad secundaria afectada
[ ] Bajo — Problema cosmético / UX menor

### Prioridad (solo preventivo)
[ ] Alta — Riesgo de seguridad, vulnerabilidad conocida
[ ] Media — Deuda técnica con impacto medible
[ ] Baja — Mejora opcional, sin impacto inmediato

### Descripción
[Comportamiento esperado vs. real, pasos para reproducir]

### Entorno
- Navegador / Versión:
- Rol de usuario:
- Datos involucrados:

### Impacto estimado
- Archivos a modificar:
- Tiempo estimado:
```

### 3.2. Clasificación por Prioridad

| Prioridad | Tiempo de Respuesta | Tiempo de Resolución | Ejemplo |
|---|---|---|---|
| **Crítico** | Inmediato (< 1 h) | < 24 h | Error de autenticación, pérdida de datos, caída del sistema |
| **Alto** | < 4 h | < 72 h | Funcionalidad principal rota (ej: no se pueden crear turnos) |
| **Medio** | < 48 h | < 2 semanas | Funcionalidad secundaria afectada (ej: filtro no funciona) |
| **Bajo** | < 1 semana | < 1 mes | Problema cosmético, mejora menor de UX |

### 3.3. Análisis de Causa Raíz

Para cada problema correctivo, se realiza un análisis estructurado:

| Paso | Actividad | Técnica | Artefacto |
|---|---|---|---|
| 1 | Replicar el problema | Prueba manual / automatizada | Descripción de pasos |
| 2 | Identificar síntomas | Logs, stack traces, capturas | Evidencia |
| 3 | Aislar el componente responsable | Revisión de código, git bisect | Componente/s identificado/s |
| 4 | Determinar causa raíz | Análisis técnico (5 Whys) | Documentación de causa |
| 5 | Evaluar impacto | Análisis de dependencias | Matriz de impacto |
| 6 | Proponer solución | Diseño de la modificación | Propuesta técnica |

### 3.4. Análisis de Modificación Preventiva

Para cada acción preventiva, se evalúa:

| Factor | Descripción | Escala |
|---|---|---|
| **Riesgo actual** | Probabilidad de que ocurra un problema sin la acción | Alto / Medio / Bajo |
| **Impacto potencial** | Daño si el problema ocurre | Crítico / Alto / Medio / Bajo |
| **Costo de la acción** | Esfuerzo estimado de la modificación preventiva | Días-hombre |
| **Costo de no hacerla** | Costo estimado del problema si ocurre | Días-hombre |
| **ROI** | Relación costo de acción / costo de no hacerla | Numérico |

**Regla de decisión:** Se ejecuta si `ROI >= 1.5` o si el impacto potencial es `Crítico`.

### 3.5. Matriz de Riesgos — Componentes PetCare

| Componente | Riesgo Actual | Impacto Potencial | Acción Preventiva Recomendada | Frecuencia |
|---|---|---|---|---|
| Auth (JWT + login) | Bajo | Crítico | Auditoría de seguridad, rotación de secretos | Trimestral |
| API Client (Axios) | Bajo | Alto | Revisión de manejo de errores, timeouts | Semestral |
| Base de Datos (Neon) | Bajo | Crítico | Monitoreo de conexiones, índices, backups | Mensual |
| Dependencias npm | Medio | Alto | `pnpm audit`, actualización de dependencias | Mensual |
| Tests (Vitest) | Medio | Alto | Revisión de cobertura, tests flaky | Quincenal |
| i18n (traducciones) | Bajo | Medio | Revisión de keys faltantes, strings hardcodeados | Mensual |
| Pusher (WS) | Bajo | Medio | Monitoreo de conexiones, reconexión | Trimestral |
| Edge Cache | Bajo | Medio | Revisión de TTLs, limpieza de caché | Semestral |
| Componentes UI | Medio | Medio | Actualización de shadcn/ui, Radix | Mensual |
| React Query | Bajo | Alto | Revisión de stale times, invalidaciones | Semestral |

### 3.6. Criterios de Autorización

| Tipo de Cambio | Autorización Requerida |
|---|---|
| Fix crítico en producción | Maintainer Líder (aprobación inmediata) |
| Fix de alta prioridad | Maintainer Líder |
| Fix de media/baja prioridad | Auto-autorizado + Code Review |
| Refactor preventivo mayor (> 10 archivos) | Maintainer Líder |
| Refactor preventivo menor (≤ 10 archivos) | Auto-autorizado + Code Review |
| Actualización de dependencias | Auto-autorizado (si pasa tests) |
| Cambio en esquema de BD | Maintainer Líder + DBA |

---

## 4. Implementación de la Modificación

### 4.1. Flujo de Implementación

Conforme a la cláusula 6.3 de ISO/IEC 14764, toda modificación sigue este proceso:

```
 ┌──────────────┐
 │  Planificar  │ → Definir alcance, estimar esfuerzo, identificar archivos
 └──────┬───────┘
        ▼
 ┌──────────────┐
 │   Diseñar    │ → Diseñar la solución (solo cambios complejos)
 └──────┬───────┘
        ▼
 ┌──────────────┐
 │  Codificar   │ → TDD: Escribir test → Ver que falle → Implementar → Verificar
 └──────┬───────┘
        ▼
 ┌──────────────┐
 │  Test Unit.  │ → Ejecutar tests unitarios del componente modificado
 └──────┬───────┘
        ▼
 ┌──────────────┐
 │  Test Integ. │ → Ejecutar tests de integración (cuando aplique)
 └──────┬───────┘
        ▼
 ┌──────────────┐
 │  Code Review │ → Pull Request con revisión por par (obligatorio)
 └──────┬───────┘
        ▼
 ┌──────────────┐
 │  Regresión   │ → Todos los tests existentes deben pasar
 └──────┬───────┘
        ▼
 ┌──────────────┐
 │  Documentar  │ → Actualizar documentación si el cambio afecta API/UX
 └──────────────┘
```

### 4.2. Mantenimiento Correctivo — Procedimiento

#### 4.2.1. Hotfix Crítico (producción caída)

```bash
# 1. Branch desde main con el fix
git checkout main
git pull origin main
git checkout -b fix/crit-<id>-<descripcion-breve>

# 2. Implementar el fix con test que reproduzca el bug

# 3. Ejecutar tests del módulo afectado
pnpm test:run -- --reporter=verbose

# 4. Commit convencional
git add <archivos>
git commit -m "fix: <descripción del bug>

- Causa raíz: <explicación>
- Fix: <qué se cambió>
- Closes #<issue-id>"

# 5. PR directo a main con revisión exprés
git push origin fix/crit-<id>-<descripcion-breve>
```

#### 4.2.2. Fix No-Crítico

```bash
# 1. Branch desde main
git checkout main && git pull
git checkout -b fix/<id>-<descripcion>

# 2. TDD: escribir test que demuestre el bug
# 3. Implementar el fix
# 4. Verificar que el test pase y no haya regresión
pnpm test:run

# 5. Commit
git add <archivos>
git commit -m "fix: <descripción>

Closes #<issue-id>"

# 6. PR con revisión normal
git push origin fix/<id>-<descripcion>
```

### 4.3. Mantenimiento Preventivo — Procedimiento

#### 4.3.1. Refactor / Mejora de código

```bash
# 1. Branch desde main
git checkout main && git pull
git checkout -b refactor/<id>-<descripcion>

# 2. Asegurar cobertura de tests existentes en el área a refactorizar
pnpm test:run

# 3. Realizar el refactor en cambios atómicos
# 4. Después de CADA cambio atómico: tests deben pasar
# 5. No mezclar refactor con cambios funcionales

# 6. Commit
git add <archivos>
git commit -m "refactor: <qué se mejoró y por qué>

- Motivación: <por qué es necesario>
- Cambios: <qué se modificó>
- Beneficio esperado: <menor complejidad, mejor performance, etc.>"
```

#### 4.3.2. Actualización de Dependencias

```bash
# 1. Auditoría
pnpm audit

# 2. Actualización selectiva (no masiva)
pnpm update <paquete> --latest

# 3. Tests completos
pnpm test:run
pnpm build

# 4. Commit
git commit -m "chore(deps): actualizar <paquete> a <versión>

- Cambios relevantes: <changelog resumido>
- Riesgo: <bajo/medio/alto>"
```

### 4.4. Estándares de Codificación

| Aspecto | Estándar |
|---|---|
| **Estilo** | ESLint + TypeScript strict mode |
| **Tests** | Vitest, coverage mínimo 80% en módulos modificados |
| **Commits** | Conventional Commits — `fix:`, `feat:`, `refactor:`, `chore:`, `perf:` |
| **Types** | TypeScript estricto, sin `any`, interfaces explícitas |
| **UI** | Componentes shadcn/ui, Tailwind CSS, diseño responsive |
| **API** | REST serverless, manejo de errores con `response.ts` |
| **BD** | Soft-delete (`deleted_at`), transacciones, RLS |

### 4.5. Plantilla de Branch y PR

**Branch naming:**
```
fix/<issue-id>-<kebab-case-description>
refactor/<issue-id>-<kebab-case-description>
chore/<issue-id>-<kebab-case-description>
perf/<issue-id>-<kebab-case-description>
```

**PR template:**
```markdown
## Descripción
[Resumen del cambio]

## Tipo de mantenimiento
[ ] Correctivo — Fix #<issue>
[ ] Preventivo — Refactor / Mejora
[ ] Otro

## Checklist
- [ ] Tests unitarios escritos/pasando
- [ ] Tests de regresión pasan (`pnpm test:run`)
- [ ] Build exitoso (`pnpm build`)
- [ ] Cobertura >= 80% en módulos modificados
- [ ] Documentación actualizada (si aplica)
- [ ] Sin errores de ESLint/TypeScript

## Screenshots (si aplica)

## Notas adicionales
```

### 4.6. Control de Versiones y Release

| Release | Contenido | Frecuencia |
|---|---|---|
| **Patch** (`v1.0.1`) | Fixes correctivos | Cuando sea necesario |
| **Minor** (`v1.1.0`) | Preventivos, refactors, mejoras | Mensual / Bimensual |
| **Major** (`v2.0.0`) | Cambios disruptivos | Planificado |

---

## 5. Aceptación y Revisión del Mantenimiento

### 5.1. Criterios de Aceptación

Conforme a la cláusula 6.4 de ISO/IEC 14764, toda modificación debe ser verificada y aceptada antes de integrarse a producción.

| Criterio | Correctivo | Preventivo |
|---|---|---|
| Test que reproduce el bug pasa | ✅ Obligatorio | N/A |
| Tests unitarios del módulo | ✅ Pasan | ✅ Pasan |
| Tests de regresión completos | ✅ Pasan | ✅ Pasan |
| Build exitoso (`pnpm build`) | ✅ | ✅ |
| Code Review aprobado | ✅ (al menos 1 revisor) | ✅ (al menos 1 revisor) |
| Sin regresiones visuales | ✅ (verificación manual) | ✅ |
| Cobertura de tests no disminuye | ✅ | ✅ (o justificación) |
| Documentación actualizada | Si aplica | Si aplica |
| Sin vulnerabilidades nuevas | ✅ (`pnpm audit`) | ✅ |

### 5.2. Proceso de Code Review

```
 PR Creado
    │
    ├─ ¿Cambio crítico/alta prioridad?
    │     ├─ Sí → Revisión asíncrona exprés (< 4 h)
    │     └─ No → Revisión asíncrona normal (< 24 h)
    │
    ▼
Revisor asignado (automático o manual)
    │
    ▼
Revisión técnica:
  • ¿La solución es correcta?
  • ¿Hay tests adecuados?
  • ¿Cubre edge cases?
  • ¿Sigue los estándares del proyecto?
  • ¿Introduce deuda técnica?
    │
    ├─ Aprobado → Merge a main
    └─ Cambios solicitados → Iterar
```

### 5.3. Criterios de Revisión

| Aspecto a Revisar | Preguntas Guía |
|---|---|
| **Funcionalidad** | ¿Resuelve el problema reportado? ¿Cubre todos los casos? |
| **Tests** | ¿Hay test para el bug? ¿Cubre edge cases? ¿Pasan todos? |
| **Calidad** | ¿Sigue patrones del proyecto? ¿Código limpio? |
| **Seguridad** | ¿Introduce vulnerabilidades? ¿Manejo correcto de datos? |
| **Rendimiento** | ¿Impacto en performance? ¿Queries N+1? |
| **UX** | ¿Cambios visibles para el usuario? ¿Consistente? |
| **Documentación** | ¿Se actualizó docs/ si necesario? ¿Comentarios? |

### 5.4. Verificación en Producción

Posterior al despliegue, se realiza verificación en producción:

1. **Smoke test** (primeros 15 minutos): Login, dashboard principal, CRUD básico
2. **Monitoreo** (primeras 2 horas): Logs de funciones serverless, errores 5xx
3. **Confirmación del reportante** (24 h): El usuario que reportó el bug confirma la solución

### 5.5. Registro de Mantenimiento

Cada acción de mantenimiento se registra con:

```
ID: MNT-2026-001
Tipo: Correctivo
Componente: Auth — LoginForm
Problema: Error 500 al login con credenciales válidas
Causa Raíz: Token JWT expirado no manejado correctamente
Solución: Agregar manejo de error 401 con renovación de token
Archivos: frontend/src/lib/api.ts, frontend/src/App.tsx
Tests: frontend/src/lib/api.test.ts
Tiempo: 4 horas
Fecha: 2026-05-15
Responsable: [Desarrollador]
Revisor: [Maintainer Líder]
Estado: Cerrado
```

---

## 6. Migración

### 6.1. Estrategia de Migración

Conforme a la cláusula 6.5 de ISO/IEC 14764, la migración se refiere al traslado del sistema o datos a un nuevo entorno operativo o plataforma. En PetCare, esto puede ocurrir por:

| Escenario | Disparador | Riesgo |
|---|---|---|
| Migración de Neon a otra BD | Costos, performance, requisitos del cliente | Alto |
| Migración de Netlify a otro host | Escalabilidad, costos, requisitos | Alto |
| Migración de versión de Node | EOL, seguridad, nuevas features | Medio |
| Migración de React 18 → 19 | Nuevas features, soporte | Medio |
| Migración de datos (esquema) | Nuevos requisitos, normalización | Alto |

### 6.2. Proceso de Migración

```
 ┌──────────────────────────────────────────────────────┐
 │              1. PLANIFICACIÓN                          │
 │  • Evaluar plataforma destino                          │
 │  • Identificar diferencias y riesgos                   │
 │  • Definir estrategia (big bang /渐进 / paralela)    │
 │  • Estimar downtime y recursos                         │
 └──────────────────────┬───────────────────────────────┘
                        ▼
 ┌──────────────────────────────────────────────────────┐
 │              2. PREPARACIÓN                            │
 │  • Configurar entorno destino                          │
 │  • Crear scripts de migración                          │
 │  • Preparar rollback                                  │
 │  • Definir criterios de éxito                          │
 └──────────────────────┬───────────────────────────────┘
                        ▼
 ┌──────────────────────────────────────────────────────┐
 │              3. PRUEBAS                                │
 │  • Migración de prueba en staging                      │
 │  • Validación de datos (integridad, consistencia)     │
 │  • Tests funcionales completos                         │
 │  • Pruebas de performance                              │
 └──────────────────────┬───────────────────────────────┘
                        ▼
 ┌──────────────────────────────────────────────────────┐
 │              4. EJECUCIÓN                              │
 │  • Ventana de mantenimiento planificada                │
 │  • Ejecutar migración                                  │
 │  • Verificar integridad post-migración                 │
 │  • Smoke tests                                         │
 └──────────────────────┬───────────────────────────────┘
                        ▼
 ┌──────────────────────────────────────────────────────┐
 │              5. POST-MIGRACIÓN                         │
 │  • Monitoreo intensivo (primeras 24-48 h)             │
 │  • Corrección de issues detectados                     │
 │  • Documentar lecciones aprendidas                     │
 │  • Cerrar entorno anterior (tras período de solapamiento) │
 └──────────────────────────────────────────────────────┘
```

### 6.3. Plan de Rollback

Toda migración debe incluir un plan de rollback:

| Paso | Acción | Tiempo |
|---|---|---|
| 1 | Detener tráfico al nuevo entorno | 1 min |
| 2 | Restaurar DNS / balanceador al entorno anterior | 5 min |
| 3 | Restaurar BD desde backup pre-migración | Variable |
| 4 | Verificar funcionalidad del entorno anterior | 15 min |
| 5 | Notificar a usuarios del rollback | 5 min |

**Condiciones de rollback:**
- Más del 5% de requests con error
- Tiempo de respuesta degradado > 50% respecto al anterior
- Datos inconsistentes o pérdida de información
- Bug crítico no detectado en pruebas

### 6.4. Migraciones de Datos (Cambios de Esquema)

Para cambios en el esquema de base de datos:

```sql
-- Paso 1: Migración hacia adelante (forward migration)
-- Ejemplo: agregar columna con default
ALTER TABLE pets ADD COLUMN weight_unit VARCHAR(10) DEFAULT 'kg';
UPDATE pets SET weight_unit = 'kg' WHERE weight_unit IS NULL;

-- Paso 2: Migración hacia atrás (rollback migration)
ALTER TABLE pets DROP COLUMN weight_unit;
```

**Reglas:**
- Toda migración de BD debe tener forward y rollback
- Las migraciones se aplican en transacciones
- Se testean en staging antes de producción
- Período de solapamiento de 48 h entre old y new schema

### 6.5. Checklist de Migración

```markdown
## Pre-Migración
- [ ] Backup completo de BD verificado
- [ ] Scripts de migración probados en staging
- [ ] Plan de rollback definido
- [ ] Ventana de mantenimiento comunicada a stakeholders
- [ ] Monitoreo configurado para el nuevo entorno
- [ ] Tests de performance ejecutados

## Post-Migración
- [ ] Smoke test funcional completo
- [ ] Integridad de datos verificada
- [ ] Logs sin errores críticos
- [ ] Performance dentro de rangos aceptables
- [ ] Entorno anterior mantenido por 48 h
```

---

## 7. Retiro

### 7.1. Criterios de Retiro

Conforme a la cláusula 6.6 de ISO/IEC 14764, el retiro (*retirement*) es el proceso de dar de baja un sistema o componente software. Se considera retiro cuando:

| Criterio | Descripción |
|---|---|
| **Obsolescencia tecnológica** | Stack no soportado (Node < 18, React < 16) |
| **Reemplazo funcional** | Nueva versión del sistema reemplaza a PetCare |
| **Costo de mantenimiento insostenible** | Mantener el sistema cuesta más que reemplazarlo |
| **Fin de vida útil planificado** | Fecha de retiro definida en hoja de ruta |

### 7.2. Proceso de Retiro

```
 ┌─────────────────────────────────────────────────────────┐
 │              1. DECISIÓN DE RETIRO                       │
 │  • Evaluación técnica y de negocio                       │
 │  • Análisis de impacto en usuarios                       │
 │  • Propuesta aprobada por stakeholders                   │
 └──────────────────────┬──────────────────────────────────┘
                        ▼
 ┌─────────────────────────────────────────────────────────┐
 │              2. PLAN DE RETIRO                           │
 │  • Cronograma detallado                                  │
 │  • Plan de comunicación a usuarios                       │
 │  • Plan de migración de datos                            │
 │  • Período de solapamiento con reemplazo                 │
 └──────────────────────┬──────────────────────────────────┘
                        ▼
 ┌─────────────────────────────────────────────────────────┐
 │              3. NOTIFICACIÓN A USUARIOS                  │
 │  • Comunicación con 30-90 días de anticipación           │
 │  • Instrucciones para exportar datos                     │
 │  • Alternativas disponibles                              │
 └──────────────────────┬──────────────────────────────────┘
                        ▼
 ┌─────────────────────────────────────────────────────────┐
 │              4. MIGRACIÓN DE DATOS                       │
 │  • Exportar datos en formato portable (CSV, JSON)        │
 │  • Transferir a sistema reemplazante                     │
 │  • Verificar integridad de datos migrados                │
 └──────────────────────┬──────────────────────────────────┘
                        ▼
 ┌─────────────────────────────────────────────────────────┐
 │              5. ARCHIVO                                   │
 │  • Tomar snapshot final de la BD                         │
 │  • Archivar código fuente (tag final en Git)             │
 │  • Documentar estado final del sistema                   │
 │  • Preservar logs de auditoría (si requerido)            │
 └──────────────────────┬──────────────────────────────────┘
                        ▼
 ┌─────────────────────────────────────────────────────────┐
 │              6. DESMANTELAMIENTO                         │
 │  • Dar de baja infraestructura (Netlify, Neon, Pusher)  │
 │  • Revocar credenciales y API keys                       │
 │  • Remover DNS y certificados                            │
 │  • Notificar baja definitiva                              │
 └──────────────────────┬──────────────────────────────────┘
                        ▼
 ┌─────────────────────────────────────────────────────────┐
 │              7. CIERRE                                   │
 │  • Acta de retiro firmada por stakeholders               │
 │  • Lecciones aprendidas documentadas                     │
 │  • Archivo marcado como inaccesible / solo lectura        │
 └──────────────────────────────────────────────────────────┘
```

### 7.3. Preservación de Datos

| Dato | Período de Retención | Formato de Archivo |
|---|---|---|
| Registros médicos | 5 años post-retiro | PostgreSQL dump + CSV |
| Datos de usuarios | 2 años post-retiro | CSV anonimizado |
| Logs de auditoría | 3 años post-retiro | Logs comprimidos |
| Código fuente | Indefinido | Tag en Git + tarball |
| Configuración | 1 año post-retiro | Documentación + backups |

### 7.4. Archivo del Repositorio

```bash
# Tag final
git tag -a v2.0.0-final -m "PetCare v2.0.0 — Final release. System retired on YYYY-MM-DD."
git push origin v2.0.0-final

# Archivar repositorio (opcional, si se requiere preservación fuera de GitHub)
git bundle create petcare-app-final.bundle --all
```

### 7.5. Notificación a Terceros

| Dependencia Externa | Acción al Retirar |
|---|---|
| Netlify | Cancelar suscripción, exportar logs |
| Neon PostgreSQL | Backup final, eliminar instancia |
| Pusher | Revocar API keys, cancelar suscripción |
| Servicio de Email | Revocar credenciales |
| Proveedor de Dominio | Liberar DNS, redirigir o eliminar |

### 7.6. Carta de Cese de Servicio

```
┌──────────────────────────────────────────────────────────┐
│                    AVISO DE RETIRO                        │
│                    PetCare Management System              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Fecha de aviso:    [DD/MM/AAAA]                          │
│ Fecha de retiro:   [DD/MM/AAAA]                          │
│ Período de gracia: [90 días desde la fecha de aviso]     │
│                                                          │
│ El sistema PetCare finalizará su operación el            │
│ [DD/MM/AAAA]. Recomendamos a todos los usuarios:         │
│                                                          │
│ 1. Exportar sus datos antes de la fecha de retiro.       │
│ 2. Migrar al sistema alternativo [Nombre del reemplazo]. │
│ 3. Contactar a soporte para asistencia con la migración. │
│                                                          │
│ A partir de la fecha de retiro, el sistema no estará     │
│ disponible y todos los datos serán archivados.           │
│                                                          │
│ Para asistencia: [email/soporte]                         │
└──────────────────────────────────────────────────────────┘
```

---

## Apéndices

### A. Cronograma de Mantenimiento Preventivo

| Actividad | Frecuencia | Responsable | Duración Est. |
|---|---|---|---|
| Auditoría de dependencias (`pnpm audit`) | Mensual | Desarrollador | 1 h |
| Actualización de dependencias menores | Mensual | Desarrollador | 2 h |
| Revisión de logs y errores en producción | Semanal | Admin Sistema | 30 min |
| Revisión de cobertura de tests | Quincenal | Desarrollador | 1 h |
| Reparación de tests flaky | Quincenal | Desarrollador | 2 h |
| Revisión de consultas lentas en BD | Mensual | Desarrollador | 2 h |
| Análisis de vulnerabilidades de seguridad | Trimestral | Maintainer Líder | 4 h |
| Refactor de deuda técnica identificada | Mensual | Desarrollador | 8 h |
| Revisión de rendimiento frontend (Lighthouse) | Mensual | Desarrollador | 2 h |
| Rotación de secretos y JWT | Trimestral | Admin Sistema | 1 h |
| Actualización de shadcn/ui y Radix | Mensual | Desarrollador | 2 h |
| Revisión de bundles y code splitting | Semestral | Desarrollador | 4 h |
| Auditoría de accesibilidad (a11y) | Semestral | Desarrollador | 4 h |
| Actualización de documentación técnica | Mensual | Desarrollador | 2 h |
| Prueba de disaster recovery (backup/restore) | Trimestral | Admin Sistema | 4 h |

### B. Clasificación de Problemas Comunes en PetCare

| Área | Problema Potencial | Tipo | Gravedad |
|---|---|---|---|
| Auth | Token expirado no redirige a login | Correctivo | Alto |
| Auth | Error al renovar token | Correctivo | Alto |
| Pets | CRUD de mascota no actualiza correctamente | Correctivo | Medio |
| Appointments | Superposición de turnos con el mismo veterinario | Correctivo | Medio |
| Appointments | Error al cancelar turno con registros clínicos asociados | Correctivo | Alto |
| DB | Timeout en consultas sin índices | Preventivo | Medio |
| DB | Alto consumo de conexiones | Preventivo | Alto |
| Frontend | Componentes no responsive en mobile | Preventivo | Bajo |
| Frontend | Carga lenta en dashboard con muchos datos | Preventivo | Medio |
| i18n | Keys de traducción faltantes | Correctivo | Bajo |
| Notifications | Push notification no llega | Correctivo | Medio |
| Edge Cache | Cache sirve datos obsoletos | Correctivo | Medio |
| Dependencias | Vulnerabilidad en librería terceros | Preventivo | Alto |
| Build | Error al compilar por cambio en Vite/Node | Adaptativo | Alto |

### C. Glosario ISO/IEC 14764

| Término | Definición (según ISO/IEC 14764) |
|---|---|
| **Mantenimiento** | Modificación de un producto software después de su entrega para corregir defectos, mejorar rendimiento u otros atributos, o adaptarlo a un entorno cambiante |
| **Mantenimiento correctivo** | Modificación reactiva realizada después de la entrega para corregir problemas descubiertos |
| **Mantenimiento preventivo** | Modificación proactiva realizada después de la entrega para detectar y corregir defectos latentes antes de que se manifiesten como fallos |
| **Mantenimiento adaptativo** | Modificación para mantener un producto software utilizable en un entorno cambiante |
| **Mantenimiento perfectivo** | Modificación para mejorar rendimiento, mantenibilidad u otros atributos |
| **Solicitud de modificación** | Documento que propone un cambio al software |
| **Análisis de impacto** | Evaluación de los efectos de una modificación propuesta |
| **Migración** | Traslado de un sistema o componentes a un nuevo entorno operativo |
| **Retiro** | Baja definitiva de un sistema o componente del servicio activo |

### D. Referencias

1. ISO/IEC/IEEE 14764:2022 — *Software Engineering — Software Life Cycle Processes — Maintenance*
2. ISO/IEC/IEEE 12207:2017 — *Systems and Software Engineering — Software Life Cycle Processes*
3. ISO/IEC 25010:2011 — *Systems and Software Quality Requirements and Evaluation (SQuaRE)*
4. IEEE Std 1219-1998 — *Standard for Software Maintenance* (reemplazado por ISO/IEC 14764)
5. PetCare App — `docs/01-ARCHITECTURE.md`
6. PetCare App — `frontend/src/App.tsx`
7. PetCare App — `schema.sql`

---

> **Fin del documento — Plan de Mantenimiento PetCare v1.0**
>
> Este plan debe revisarse y actualizarse anualmente, o cuando ocurran cambios significativos en la arquitectura del sistema.
