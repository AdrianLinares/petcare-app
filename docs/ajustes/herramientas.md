# Herramientas de Medición, Evaluación y Visualización — PetCare

**Documento:** `docs/ajustes/herramientas.md`
**Fecha:** 2026-08-03

Este documento describe el **conjunto de herramientas software** que permitieron automatizar la
medición, la aplicación de criterios de evaluación y la visualización de los resultados del
producto PetCare. Se clasifican por función dentro del proceso de evaluación.

---

## 1. Herramientas de ejecución y medición de pruebas

| Herramienta | Versión | Función en la evaluación | Evidencia |
|---|---|---|---|
| **Vitest** | 3.2.4 | Runner de pruebas unitarias (frontend y functions); genera resultados por archivo y test | 28+7 archivos, 526 pruebas |
| **React Testing Library** | 16.x | Pruebas de componentes React (render, eventos, accesibilidad) | `src/components/**/*.test.*` |
| **MSW** (Mock Service Worker) | — | Intercepta peticiones HTTP en pruebas para aislar el frontend de la API | suites de hooks/componentes |
| **@vitest/coverage-v8** | 3.2.4 | Proveedor de cobertura (frontend **y functions** desde 2026-08-04): líneas, ramas, funciones | Reporte text/html/lcov |
| **jsdom** | 24.x | Entorno DOM para pruebas de componentes | `environment: "jsdom"` |

## 2. Herramientas de análisis estático y tipado

| Herramienta | Versión | Función en la evaluación | Resultado |
|---|---|---|---|
| **ESLint** | 9.x | Aplicación de criterios de calidad de código (mantenibilidad) en frontend **y netlify/functions** | 0 errores en ambos (7 corregidos en functions) |
| **typescript-eslint** | 8.x | Reglas TS (incluye `no-explicit-any`, hoy desactivado por deuda D4) | Gate de CI |
| **TypeScript / tsc** | 5.x | Verificación estática de tipos (`--noEmit`) en frontend y functions | 0 errores tras fix de `pets.ts` |
| **Vite** | 5.4 | Bundler de build; emite warning de tamaño de chunk (> 600 kB) | Build OK |

## 3. Herramientas de integración continua (automatización de criterios)

| Herramienta | Función | Criterio que automatiza |
|---|---|---|
| **GitHub Actions** (nuevo) | Pipeline `ci.yml` en push/PR | Ejecuta lint (frontend+functions), typecheck, tests, cobertura (frontend+functions) y build de forma bloqueante (cambios.md O2) |
| **actions/upload-artifact** (nuevo) | Publica `coverage-reports` por ejecución | Hace auditable la cobertura en cada CI (deuda D6) |
| **pnpm** | 10.14.0 | Gestor de paquetes del monorepo; scripts `test`, `test:run`, `test:coverage`, `lint`, `typecheck` |
| **Netlify** | Build/deploy | Despliegue automático desde `main` (`netlify.toml`, Functions, Edge caching) |

## 4. Herramientas de visualización de resultados

| Herramienta | Función | Resultado visualizado |
|---|---|---|
| **Reporte de cobertura v8** | Texto + HTML + LCOV | Cobertura frontend ≈ 52 % líneas / 64 % ramas / 19 % funciones |
| **Salida verbose de Vitest** | Reporte por archivo/prueba | 526/526 OK |
| **GitHub Actions UI** | Vista de jobs/pasos y logs | Gates verdes/rojos en cada push/PR |
| **SonarQube** (referencia) | Tablero de deuda técnica (objetivo ≤ 10) | No integrado aún (referido en evidencia) |
| **Tablero TMC** (declarativo) | Métricas de seguimiento (CMMI MA) | Métricas objetivo en `caracteristicas.md §3` |

## 5. Herramientas de análisis y apoyo al proceso

| Herramienta | Función en la evaluación |
|---|---|
| **CodeGraph** | Grafo de conocimiento del código: exploración estructural, símbolos y blast-radius para la revisión |
| **Engram (memoria persistente)** | Trazabilidad de decisiones, hallazgos y sesiones previas del proyecto |
| **git / gh** | Control de versiones, historial, tags semver y auditoría del cambio |
| **`pnpm audit` / gitleaks** (citadas como práctica) | Auditoría de dependencias y de secretos (pase de higiene aplicado en cambios.md O4) |
| **Neon (PostgreSQL)** + **schema.sql** | Verificación de esquema y datos (base de la evaluación funcional) |

## 6. Cobertura por criterio de evaluación

| Criterio | Herramienta que lo aplica/visualiza |
|---|---|
| Adecuación funcional | Vitest + React Testing Library + MSW |
| Eficiencia de desempeño | Vite (build/analizador de chunk); telemetría pendiente (D6) |
| Confiabilidad | Suites de handlers + plan de rollback (ISO 14764) |
| Seguridad | RBAC/JWT en handlers; higiene de secretos en git; `pnpm audit` |
| Mantenibilidad | ESLint + `tsc` + cobertura v8 |
| Usabilidad | i18n tests + UAT + manual DNP |

## 7. Herramientas añadidas en el segundo batch (2026-08-04)

- `@vitest/coverage-v8` en `netlify/functions` (cobertura del backend medible y gateada — deuda D2 resuelta).
- `eslint.config.js` + script `lint` para `netlify/functions` — deuda D3 resuelta.
- Reporte versionado `docs/evidencia-calidad/reportes/2026-08-04-cobertura.md` + artefacto `coverage-reports` en CI — deuda D6 resuelta.

## 8. Herramientas propuestas (siguiente ciclo)

- Cobertura frontend → 80 % (módulos al 0 %: `components/Admin`, hooks): ampliar pruebas por dominio (deuda D1).
- Re-activar `@typescript-eslint/no-explicit-any` (como `warn`) en frontend y functions (deuda D4).
- Telemetría de p95 del dashboard (NFR-01 auditable, deuda D5/D6).
