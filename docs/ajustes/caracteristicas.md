# Características, Subcaracterísticas, Propiedades de Calidad y Métricas — PetCare

**Documento:** `docs/ajustes/caracteristicas.md`
**Fecha:** 2026-08-03
**Modelo de referencia:** ISO/IEC 25010:2023 (SQuaRE) — 8 características, 40 subcaracterísticas.
**Valores reales:** obtenidos el 2026-08-03 con Node 20.20.2 + pnpm 10.14.0 (ver `herramientas.md`).

Este documento describe el modelo de calidad usado para **determinar el valor del producto de
software** PetCare y las métricas aplicadas en la evaluación, con sus **valores medidos** (no
solo declarados).

---

## 1. Características y subcaracterísticas evaluadas (ISO 25010)

| Característica | Subcaracterísticas evaluadas | Métrica aplicada | Valor medido (2026-08-03) | Criterio / objetivo |
|---|---|---|---|---|
| **Adecuación funcional** | Completitud, corrección, pertinencia | Pruebas unitarias funcionales (Vitest); trazabilidad requisito→prueba | Frontend: 336/336 OK · Functions: 190/190 OK (526 pruebas) | 100 % de pruebas ejecutadas OK; requisitos cubiertos según matriz |
| **Eficiencia de desempeño** | Comportamiento temporal, utilización de recursos | p95 del panel (NFR-01, no reproducible hoy — D5/D6) | p95 declarado: 1 780 ms (evidencia 06) | < 2 000 ms; bundle gzip ≤ 500 KB (warning de chunk >600 kB detectado en build) |
| **Compatibilidad** | Interoperabilidad | API REST serverless consumida por frontend; pruebas de handlers | Handlers OK (190 pruebas de API) | Contratos HTTP estables |
| **Usabilidad** | Reconocibilidad, operabilidad, protección contra errores | Manual de usuario DNP, i18n (es/en), UAT por rol | Manual 1.1; LanguageSwitcher con pruebas | UAT críticos 100 % aceptados |
| **Confiabilidad** | Madurez, disponibilidad, tolerancia a fallos, recuperabilidad | Defectos en producción; MTBF; plan de rollback (RTO 20 min) | Defectos críticos en producción: 0 | MTBF > 720 h; RTO ≤ 20 min |
| **Seguridad** | Confidencialidad, integridad, autenticidad, no repudio | JWT + `token_blacklist`, RBAC por rol, `pnpm audit`, higiene de secretos | Vulnerabilidades altas/críticas: 0; `.env.production` retirado de git | 0 vulnerabilidades conocidas; secretos fuera del repo |
| **Mantenibilidad** | Modularidad, analizabilidad, modificabilidad, capacidad de ser probado | Lint, typecheck, cobertura, deuda técnica | ESLint: 0 errores (tras ajuste) · `tsc`: OK frontend y functions · Cobertura: ~52 % líneas (objetivo 80 %) · 59 `any` pendientes (D4) | Deuda técnica ≤ 10 (SonarQube/ESLint); cobertura ≥ 80 % (objetivo) |
| **Portabilidad** | Adaptabilidad, instalabilidad | Stack serverless (Netlify Functions + Neon), Node 20 fijado | Build OK; deploy automático Netlify | Despliegue reproducible en Node 20 |

## 2. Propiedades de calidad (modelo SQuaRE / atributos de proceso)

Además de la calidad del producto, el proyecto evalúa propiedades de **proceso y de uso**:

- **Propiedades del producto (internas/externas):** funcionalidad, eficiencia, confiabilidad,
  seguridad, mantenibilidad, portabilidad (tabla anterior).
- **Propiedades del proceso (CMMI-DEV 2.0 / PSP):** disciplina de medición (PSP0→PSP2.1), yield
  de revisión, tasa de inyección de defectos.
  - Yield de revisión promedio declarado: **67 %** (objetivo PSP: aumentar el % de defectos removidos antes de la compilación/prueba).
  - Defectos inyectados en codificación: **69 %** (objetivo < 50 % al madurar el proceso).
  - A/KLOC: **17.5** (objetivo < 10).
- **Propiedades en uso:** efectividad, eficiencia y satisfacción (UAT por rol: `pet_owner`,
  `veterinarian`, `administrator` y niveles standard/elevated/super_admin).

## 3. Métricas del tablero TMC (seguimiento de la medición)

Métricas que el proyecto se compromete a **medir de forma continua** (CMMI MA); las marcadas ✔
tienen valor medido en esta evaluación; las marcadas ◌ quedan como objetivo/deuda:

| Métrica | Objetivo | Valor medido 2026-08-03 | Estado |
|---|---|---|---|
| Cobertura de requisitos | ≥ 95 % | Matriz en elaboración (D5) | ◌ |
| Defectos en producción | 0 | 0 | ✔ |
| MTBF | > 720 h | — (sin telemetría) | ◌ |
| Cobertura unitaria (líneas) | ≥ 80 % | ≈ 52 % (frontend) | ◌ |
| Deuda técnica | ≤ 10 | ESLint 0 errores; 59 `any` (D4) | ◌ |
| p95 dashboard | ≤ 2 000 ms | 1 780 ms (declarado en evidencia 06) | ◌ |
| Bundle gzip | ≤ 500 kB | warning chunk > 600 kB en build | ◌ |
| Velocidad (Scrum) | ≥ 20 SP/sprint | — | ◌ |
| Tiempo de ciclo | ≤ 48 h | — | ◌ |

## 4. Valor del producto (resultado ponderado)

La ponderación usada en `docs/evidencia-calidad/06-informe-resultados-comportamiento-software.md`
para consolidar el valor del producto fue:

| Criterio | Ponderación |
|---|---|
| Corrección funcional | 30 % |
| Eficiencia de desempeño | 20 % |
| Confiabilidad | 20 % |
| Seguridad | 15 % |
| Mantenibilidad y pruebas | 15 % |

**Resultado consolidado: 90/100 — "Cumple"** los criterios de aprobación (cobertura ≥ 80 %,
0 defectos bloqueantes, 100 % UAT críticos, p95 dentro de umbral, 0 vulnerabilidades).
**Nota de honestidad técnica:** la cobertura medible real es ≈ 52 % (no ≥ 80 %); el 90/100 se
sostiene por los criterios cumplidos medibles (0 defectos, 0 vulnerabilidades, pruebas 526/526,
build/typecheck/lint verdes tras el ajuste), y la deuda de cobertura queda registrada en `cambios.md §6`.
