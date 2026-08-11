# Reporte de Cobertura de Pruebas — Línea Base Auditable

**Fecha de medición:** 2026-08-04
**Entorno reproducible:** Node 20.20.2 · pnpm 10.14.0 · Vitest 3.2.4 · coverage v8
**Comandos de reproducción:**
```bash
pnpm --filter ./frontend test:coverage      # frontend (jsdom)
pnpm --filter ./netlify/functions test:coverage  # functions (node)
```
**Artefactos de CI:** en cada ejecución de GitHub Actions se publica el artefacto `coverage-reports`
(`frontend/coverage/` y `netlify/functions/coverage/`, retención 30 días).

> Este reporte responde a la deuda D6 de `docs/ajustes/cambios.md`: la evidencia de los
> resultados de calidad ahora es **auditable y reproducible**, no solo declarativa.

---

## 1. Frontend (`frontend/`)

| Alcance | % Stmts | % Branch | % Funcs | % Lines |
|---|---|---|---|---|
| **Total** | **52.68** | **64.13** | **19.52** | **52.68** |
| components/ | 100 | 90.9 | 100 | 100 |
| components/Admin | 0 | 0 | 0 | 0 |
| components/Appointment | 69.25 | 50 | 18.18 | 69.25 |
| components/Auth | 54.92 | 61.53 | 19.04 | 54.92 |
| components/Dashboard | 64.61 | 39.28 | 9.67 | 64.61 |
| components/Medical | 29.61 | 65.62 | 3.77 | 29.61 |
| components/Notification | 86.01 | 63.63 | 87.5 | 86.01 |
| components/Pet | 70.81 | 33.33 | 5 | 70.81 |
| i18n | 100 | 64.7 | 100 | 100 |
| lib | 69.18 | 95 | 26.92 | 69.18 |

**Pruebas:** 28 archivos · 336/336 OK.
**Umbrales configurados (frontend/vite.config.ts):** líneas 40 · funciones 10 · ramas 50 → **cumplidos**.

## 2. Functions (`netlify/functions/`)

| Alcance | % Stmts | % Branch | % Funcs | % Lines |
|---|---|---|---|---|
| **Total** | **52.59** | **91.66** | **74.07** | **52.59** |
| functions (handlers) | 50.04 | 90.77 | 50 | 50.04 |
| — appointments.ts | 94 | 92.5 | 100 | 94 |
| — auth.ts | 97.66 | 93.22 | 100 | 97.66 |
| — pets.ts | 94.91 | 95.23 | 100 | 94.91 |
| — users.ts | 95.2 | 91.66 | 100 | 95.2 |
| — clinical/medical/medications/notifications/vaccinations | 0 | 0 | 0 | 0 |
| utils | 57.8 | 93.22 | 88.23 | 57.8 |
| — utils/auth.ts | 96.84 | 93.33 | 100 | 96.84 |
| — utils/db-helpers.ts | 100 | 97.91 | 100 | 100 |
| — utils/env-validation.ts | 100 | 100 | 100 | 100 |
| — utils/response.ts | 96.15 | 83.33 | 100 | 96.15 |
| — utils/database.ts · utils/notifications.ts | 0 | 0 | 0 | 0 |

**Pruebas:** 7 archivos · 190/190 OK.
**Umbrales configurados (netlify/vitest.config.ts):** líneas 50 · funciones 60 · ramas 80 → **cumplidos**.

## 3. Interpretación y deuda asociada

- La cobertura **global** (~52 % líneas en ambos paquetes) es la línea base honesta del proyecto;
  el objetivo documentado es ≥80 % (deuda D1).
- Los módulos al **0 %** son el mayor potencial de mejora:
  - Frontend: `components/Admin` (UserForm, UserDialogs).
  - Functions: 5 handlers (`clinical-records`, `medical-records`, `medications`, `notifications`,
    `vaccinations`) y 2 utils (`database`, `notifications`).
- Los módulos críticos de auth/API ya superan el 90 %: `pets`, `users`, `auth`, `appointments`
  (handlers) y `db-helpers`, `env-validation`, `response`, `utils/auth`.
- Próximo paso (D1): añadir pruebas por dominio empezando por los módulos al 0 % y por los hooks
  del frontend, subiendo umbrales gradualmente (52 → 60 → 70 → 80).
