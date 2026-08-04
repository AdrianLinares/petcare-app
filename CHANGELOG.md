# Changelog

Todos los cambios notables de **PetCare** se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto
adhiere a [Versionado Semántico](https://semver.org/) — `MAJOR.minor.patch`:
`MAJOR` = cambios disruptivos de API/BD · `minor` = nuevas funcionalidades · `patch` = fixes y refactors.

> Hasta esta versión el historial vivía en el `README.md`; se migra aquí a partir del
> ajuste de proceso documentado en `docs/ajustes/cambios.md`.

## [Unreleased]

### Ajustes de proceso de calidad (2026-08-03)
- **Añadido** GitHub Actions CI (`.github/workflows/ci.yml`) con gates de lint, typecheck, unit tests, cobertura y build en cada push/PR.
- **Añadido** `mise.toml` fijando Node 20 (alineado con `engines`, `.nvmrc` y Netlify).
- **Añadido** scripts raíz unificados: `lint`, `typecheck`, `test:run`, `test:coverage`.
- **Fijado**: typecheck/build de `netlify/functions` roto por tipado de `body` en `pets.ts` (`Record<string, any>`).
- **Añadido** `CHANGELOG.md`.
- **Corregido** higiene de secretos: `frontend/.env.production` fuera de control de versiones (solo `*.example` versionados); requiere cargar `VITE_PUSHER_KEY`/`VITE_API_URL` en el repositorio remoto / Netlify.

## [1.4.0] - 2026-07

### Añadido
- Manual de Usuario PetCare según guía DNP (`docs/Manual_Usuario_PetCare.md`).
- Libreto de video tutorial y plan de capacitación (45 min y pruebas de aceptación).

### Cambiado
- Ampliación de horarios de citas de 07:00 a.m. a 07:00 p.m.; se permiten citas para el día actual.
- Internacionalización (i18n) aplicada al formulario de creación/edición de usuarios del admin.

### Corregido
- Manejo de `veterinarian` indefinido en la búsqueda del panel admin.
- Secciones 8.2.2–8.2.5 del manual para reflejar el flujo real del veterinario.

## [1.3.1] - 2026-05
### Corregido
- Empaquetado de `vitest.config.ts` fuera de `netlify/functions/` (rompía el deploy).
- Reemplazo de `bcrypt` por `bcryptjs` para compatibilidad con Netlify/Lambda (bundler esbuild).

## [1.3.0] - 2026-05
### Añadido
- Migración a React Query, `ErrorBoundary`, validación de entorno (env validation) y suite de pruebas del backend.
- Fixes de `schema.sql` (incluye `token_blacklist`) y resiliencia de auth.
- pnpm como gestor de paquetes.

## [1.2.0] - 2026
### Añadido
- Internacionalización (i18next), `LanguageSwitcher`, dashboards traducidos y pruebas de traducción.

## [1.1.0] - Feb–Abr 2026
### Añadido
- Notificaciones en tiempo real con Pusher, edge caching, framework de pruebas con Vitest.
- Nivel de acceso `super_admin`.

## [1.0.0] - Nov 2025
### Añadido
- Lanzamiento serverless: migración a Neon PostgreSQL + Netlify Functions.
- Autenticación JWT y API REST completa, despliegue en producción.

## [0.2.0] - Nov 2025
### Añadido
- RBAC: roles `pet_owner`, `veterinarian`, `administrator` y niveles de admin; capa de servicios API.

## [0.1.0] - Sep–Oct 2025
### Añadido
- Fundamentos: CRUD de mascotas, turnos, records médicos, recuperación de contraseña y datos de prueba.