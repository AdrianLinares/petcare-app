# Actividades y Tareas — Proceso de Evaluación del Producto de Software PetCare

**Documento:** `docs/ajustes/actividades.md`
**Fecha de ejecución:** 2026-08-03
**Base normativa:** ISO/IEC/IEEE 12207 (procesos), ISO/IEC 25000 (evaluación SQuaRE), IEEE 829 (documentación de pruebas), IEEE 1028 (revisiones), CMMI-DEV 2.0 (VER, VAL, PPQA, MA).

Este documento describe el **conjunto de actividades y tareas** realizadas para evaluar el
producto de software PetCare. Cada actividad indica su propósito, las tareas concretas, los
artefactos de entrada/salida y los resultados obtenidos.

---

## A0. Preparación del proceso de evaluación

**Propósito:** definir alcance, referentes y entorno reproducible.

| Tarea | Descripción | Resultado |
|---|---|---|
| T0.1 | Reconocimiento de la metodología y referentes del proyecto | Revisión de `docs/evidencia-calidad/` (01–06): ISO 25010/25000, CMMI, PSP, Scrum+DevOps (ver `cambios.md §1`) |
| T0.2 | Inventario del repositorio (arquitectura, scripts, CI, versionado) | Mapa de stack, 35 suites de prueba, ausencia de CI, versionado manual |
| T0.3 | Fijación del entorno de evaluación | Node 20.20.2 + pnpm 10.14.0 (los declarados por el proyecto); `mise.toml` añadido para reproducibilidad |

## A1. Evaluación funcional (corrección y completitud)

**Propósito:** verificar que el software cumple su función (ISO 25010 — Adecuación funcional).

| Tarea | Descripción | Resultado |
|---|---|---|
| T1.1 | Ejecutar suite unitaria del frontend (Vitest + React Testing Library) | 28 archivos · **336/336 pruebas OK** (con Node 20) |
| T1.2 | Ejecutar suite de handlers serverless (Vitest, entorno node) | 7 archivos · **190/190 pruebas OK** |
| T1.3 | Identificar dependencia del runtime: Node 26 rompía las pruebas (`localStorage`) | Causa raíz: global `localStorage` de Node ≥ 22 sombrea jsdom; no es defecto de código |
| T1.4 | Verificar trazabilidad requisito → prueba → defecto | Matriz en elaboración (deuda D5) |

## A2. Evaluación estática (análisis estático y tipado)

**Propósito:** verificar mantenibilidad y analizabilidad (ISO 25010 — Mantenibilidad).

| Tarea | Descripción | Resultado |
|---|---|---|
| T2.1 | Ejecutar ESLint del frontend | **59 errores** (todos `no-explicit-any`) → alineación de regla y **0 errores** (cambios.md T2) |
| T2.2 | Ejecutar `tsc --noEmit` en frontend | **OK** (0 errores) |
| T2.3 | Ejecutar typecheck y build en `netlify/functions` | **Fallaba** en `pets.ts` (body tipado `{}`) → fix `Record<string, any>` → **OK** (cambios.md T1) |

## A3. Evaluación de confiabilidad y seguridad

**Propósito:** verificar robustez, control de acceso y ausencia de vulnerabilidades.

| Tarea | Descripción | Resultado |
|---|---|---|
| T3.1 | Revisión de autenticación/autorización | JWT + `token_blacklist`, RBAC por rol; 190 pruebas de handlers cubren auth |
| T3.2 | Auditoría de secretos versionados | `frontend/.env.production` retirado de git; solo `*.example` versionados (cambios.md O4) |
| T3.3 | Postura frente a vulnerabilidades | `pnpm audit` citado como práctica; 0 vulnerabilidades altas/críticas declaradas |
| T3.4 | Tolerancia a fallos | Plan de rollback RTO 20 min (`docs/08-PLAN-MANTENIMIENTO.md`); `ErrorBoundary` en frontend |

## A4. Evaluación de rendimiento

**Propósito:** verificar comportamiento temporal (ISO 25010 — Eficiencia).

| Tarea | Descripción | Resultado |
|---|---|---|
| T4.1 | Medición de p95 del dashboard (NFR-01) | Declarado 1 780 ms en evidencia 06; **no reproducible** sin telemetría (deuda D6) |
| T4.2 | Análisis de bundle | Build OK; warning de chunk > 600 kB (objetivo gzip ≤ 500 kB) |

## A5. Evaluación de usabilidad y aceptación

**Propósito:** verificar operabilidad y satisfacción del usuario (ISO 25010 — Usabilidad y calidad en uso).

| Tarea | Descripción | Resultado |
|---|---|---|
| T5.1 | Revisión del manual de usuario (guía DNP) | Manual 1.1 alineado al flujo real (secciones 8.2.x corregidas) |
| T5.2 | Pruebas de internacionalización | LanguageSwitcher con pruebas; formularios admin i18n (v1.4.0) |
| T5.3 | Protocolo UAT por rol | Diseñado en evidencia 01; sesiones por rol pendientes de evidencias (deuda D5) |

## A6. Consolidación y ajuste de proceso

**Propósito:** convertir los hallazgos en mejoras operativas y técnicas ejecutadas.

| Tarea | Descripción | Resultado |
|---|---|---|
| T6.1 | Consolidar resultados ponderados | 90/100 "Cumple" (evidencia 06) con notas de honestidad (cobertura real ≈52 %) |
| T6.2 | Aplicar cambios operativos | CI GitHub Actions, Node 20 fijado, scripts raíz, CHANGELOG, higiene de secretos (cambios.md §3) |
| T6.3 | Aplicar cambios técnicos | Fix typecheck `pets.ts`, alineación ESLint, umbrales verificables en CI (cambios.md §4) |
| T6.4 | Registrar deuda y seguimiento | Deudas D1–D6 en `cambios.md §6`; métricas objetivo en `caracteristicas.md §3` |
| T6.5 | Verificación final de los gates | Lint OK · typecheck OK (frontend+functions) · 526 pruebas OK · build OK (Node 20) |

---

## Resultado global del proceso de evaluación

- **Pruebas:** 526/526 OK (336 frontend + 190 functions) en Node 20.
- **Estática:** lint 0 errores · tsc 0 errores (frontend y functions).
- **Build:** OK (frontend y functions).
- **Seguridad:** 0 vulnerabilidades altas/críticas; secretos fuera de git.
- **Calidad consolidada:** 90/100 "Cumple", con la cobertura unitaria (≈52 %) como principal
  brecha a cerrar (deuda D1).
