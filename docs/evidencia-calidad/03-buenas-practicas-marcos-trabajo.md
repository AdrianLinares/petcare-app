# Selección de Buenas Prácticas de Calidad según Marcos de Trabajo

> **Evidencia:** Aplicación de buenas prácticas de calidad documentadas en las disciplinas de calidad de software  
> **Proyecto:** PetCare — Sistema de Gestión de Clínicas Veterinarias  
> **Versión:** 1.0  
> **Fecha:** Julio 2026  

---

## Tabla de Contenidos

1. [Introducción: Marcos de Trabajo y Calidad](#1-introducción-marcos-de-trabajo-y-calidad)
2. [ISO/IEC 12207 — Procesos del Ciclo de Vida](#2-isoiec-12207--procesos-del-ciclo-de-vida)
3. [CMMI-DEV — Modelo Integrado de Madurez](#3-cmmi-dev--modelo-integrado-de-madurez)
4. [Scrum — Calidad en Equipos Ágiles](#4-scrum--calidad-en-equipos-ágiles)
5. [Buenas Prácticas Técnicas](#5-buenas-prácticas-técnicas)
6. [CI/CD — Integración y Despliegue Continuo](#6-cicd--integración-y-despliegue-continuo)
7. [Matriz de Selección y Aplicación en PetCare](#7-matriz-de-selección-y-aplicación-en-petcare)

---

## 1. Introducción: Marcos de Trabajo y Calidad

Los marcos de trabajo y estándares de la industria proporcionan un lenguaje común y un conjunto de prácticas cuya efectividad ha sido validada en miles de proyectos. No se trata de adoptar un marco completo de manera dogmática, sino de **seleccionar las prácticas que aportan mayor valor** según el contexto del proyecto.

Para PetCare, un sistema de gestión veterinaria con arquitectura serverless, equipo reducido y ciclo de desarrollo iterativo, se evaluaron los siguientes referentes:

| Marco / Estándar | Tipo | Enfoque de Calidad | Pertinencia para PetCare |
|-----------------|------|-------------------|--------------------------|
| **ISO/IEC 12207** | Estándar internacional | Procesos del ciclo de vida | Alta — define procesos de verificación y validación |
| **CMMI-DEV** | Modelo de madurez | Madurez de procesos organizacionales | Media — buenas prácticas de gestión de requisitos y aseguramiento |
| **Scrum** | Marco ágil | Inspección y adaptación continua | Alta — sprints iterativos, retrospectivas, Definition of Done |
| **Extreme Programming (XP)** | Metodología ágil | Prácticas técnicas de ingeniería | Alta — TDD, integración continua, refactorización |
| **DevOps / CI-CD** | Cultura + Prácticas | Automatización del ciclo de entrega | Alta — Netlify CI/CD, tests automatizados |
| **ISO/IEC 25010** | Estándar internacional | Modelo de calidad del producto | Alta — define los atributos de calidad a medir |

---

## 2. ISO/IEC 12207 — Procesos del Ciclo de Vida

El estándar ISO/IEC/IEEE 12207:2017 — *Systems and software engineering — Software life cycle processes* — establece un marco de procesos para el ciclo de vida del software, desde la concepción hasta el retiro. Está estructurado en cuatro grupos de procesos:

### 2.1. Grupos de Procesos ISO 12207

| Grupo | Procesos Clave |
|-------|---------------|
| **Procesos de Acuerdo** | Adquisición, Suministro |
| **Procesos Organizacionales** | Gestión de modelo de ciclo de vida, Gestión de infraestructura, Gestión de cartera, Gestión de recursos humanos, Gestión de calidad |
| **Procesos Técnicos** | Análisis de negocio, Definición de requisitos, Diseño de arquitectura, Implementación, Integración, Verificación, Validación, Operación, Mantenimiento |
| **Procesos de Soporte Técnico** | Gestión de la configuración, Gestión de la calidad, Revisión, Auditoría, Resolución de problemas |

### 2.2. Prácticas Seleccionadas para PetCare

| Proceso ISO 12207 | Práctica concreta aplicada en PetCare |
|-------------------|--------------------------------------|
| **Definición de Requisitos** | Requisitos funcionales documentados por rol (Propietario, Veterinario, Administrador), con criterios de aceptación definidos |
| **Diseño de Arquitectura** | Arquitectura serverless documentada en `docs/01-ARCHITECTURE.md` con separación clara frontend/backend/capa de datos |
| **Verificación** | 28 archivos de test automatizados (Vitest + React Testing Library), análisis estático TypeScript + ESLint |
| **Validación** | Pruebas de aceptación con usuarios reales por rol, plan de capacitación documentado, protocolo UAT |
| **Gestión de la Configuración** | Control de versiones Git, convención semver, `.gitignore` estricto (incluye `.env`), historial documentado en README |
| **Revisión** | Guía de Revisión de Código (GRC), Pull Requests con revisión obligatoria, dimensiones de revisión ponderadas |
| **Resolución de Problemas** | Formulario FRD (Registro de Defectos), Análisis Causa-Raíz (ACR) con método de 5 Porqués |
| **Mantenimiento** | Plan de mantenimiento basado en ISO/IEC 14764 documentado en `docs/08-PLAN-MANTENIMIENTO.md` |

---

## 3. CMMI-DEV — Modelo Integrado de Madurez

CMMI-DEV (Capability Maturity Model Integration for Development) es un modelo desarrollado por el SEI (Software Engineering Institute) que proporciona a las organizaciones una guía para mejorar sus procesos de desarrollo.

### 3.1. Áreas de Proceso Relevantes

CMMI-DEV organiza sus prácticas en áreas de proceso. Para PetCare, se seleccionaron prácticas de las siguientes áreas de nivel de madurez 2 y 3:

| Área de Proceso (CMMI) | Nivel | Práctica | Aplicación en PetCare |
|------------------------|:---:|---------|----------------------|
| **REQM** (Requirements Management) | 2 | Mantener trazabilidad de requisitos | Matriz de Validación de Requisitos (MVR), historias de usuario por rol |
| **PPQA** (Process & Product QA) | 2 | Evaluar objetivamente procesos y productos | LV-C (Lista de Verificación de Código), LV-BD (Base de Datos), LV-D (Despliegue) |
| **CM** (Configuration Management) | 2 | Establecer y mantener integridad de artefactos | Git, `.gitignore` para secrets, tags de versión semver |
| **MA** (Measurement & Analysis) | 2 | Medir y analizar para apoyar decisiones | Tablero de Métricas de Calidad (TMC), registro de defectos |
| **VER** (Verification) | 3 | Verificar productos de trabajo seleccionados | Tests automatizados en CI, revisión de código, listas de verificación |
| **VAL** (Validation) | 3 | Validar productos en el entorno previsto | Sesiones UAT con usuarios reales, plan de capacitación |
| **RD** (Requirements Development) | 3 | Desarrollar requisitos del cliente | Refinamiento de requisitos con checklist LV-RQ |
| **TS** (Technical Solution) | 3 | Diseñar y construir la solución | Documentación de arquitectura, guía de código, TypeScript strict |
| **DAR** (Decision Analysis & Resolution) | 3 | Evaluar alternativas con criterios formales | Elección de stack: React vs Vue, Netlify vs Vercel, PostgreSQL vs MySQL |

### 3.2. Nivel de Madurez Alcanzable

Con las prácticas implementadas, PetCare se posiciona en un **nivel de capacidad 2 (Gestionado)** para las áreas de REQM, PPQA, CM y MA, y **nivel 3 (Definido)** para VER y VAL, lo cual es apropiado para un proyecto de esta escala.
El objetivo no es certificar, sino aprovechar la estructura del modelo como guía de mejora.

---

## 4. Scrum — Calidad en Equipos Ágiles

Scrum es el marco ágil más utilizado en la industria. Aunque su foco principal es la gestión del trabajo, incorpora mecanismos explícitos de calidad:

### 4.1. Definition of Done (DoD)

El DoD es el **contrato de calidad del equipo**: un checklist que todo incremento debe cumplir antes de considerarse terminado. No es negociable por sprint.

**DoD definido para PetCare:**

| Criterio | Verificación |
|----------|-------------|
| El código pasa `tsc --noEmit` sin errores de tipo | Automatizado (CI) |
| El código pasa ESLint sin errores | Automatizado (CI) |
| Todos los tests existentes pasan | Automatizado (CI: `pnpm test:run`) |
| Los nuevos componentes/funciones tienen tests unitarios | Revisión en PR |
| La cobertura de tests no disminuye respecto al sprint anterior | Automatizado (coverage thresholds en Vitest) |
| El cambio fue revisado y aprobado por al menos un par | Revisión en PR |
| El código no contiene secretos, tokens ni claves hardcodeadas | Revisión manual + `gitleaks` |
| La documentación relevante fue actualizada (README, Changelog, docs/) | Revisión en PR |
| El build de producción se genera sin errores | Automatizado (CI: `pnpm build`) |

### 4.2. Sprint Review (Revisión del Sprint)

**Propósito desde la perspectiva de calidad:** Validar el incremento con los stakeholders. Es una actividad de **validación**, no de verificación.

**Protocolo aplicado en PetCare:**
1. El equipo presenta las funcionalidades completadas en un ambiente de staging.
2. Los stakeholders (o usuarios representativos) interactúan con el sistema.
3. Se recopila feedback estructurado:
   - ¿Cumple con lo esperado? (Conformidad)
   - ¿Falta algo? (Completitud)
   - ¿Hay algo que sobra o confunde? (Usabilidad)
4. El feedback se convierte en ítems del Product Backlog para siguientes sprints.

### 4.3. Sprint Retrospective (Retrospectiva)

**Propósito desde la perspectiva de calidad:** Identificar qué prácticas del proceso están funcionando y cuáles necesitan ajuste. Es el mecanismo de **mejora continua** del proceso.

**Formato aplicado en PetCare:**

| Pregunta | Enfoque de Calidad |
|----------|-------------------|
| ¿Qué hicimos bien este sprint en términos de calidad? | Identificar prácticas a mantener |
| ¿Qué podríamos mejorar? | Identificar brechas en el proceso |
| ¿Qué acción concreta tomaremos en el próximo sprint? | Compromiso medible |

**Ejemplo de acción surgida de una retrospectiva en PetCare:**
- **Problema identificado:** Dos PRs llegaron a producción con tests que pasaban localmente pero fallaban en CI.
- **Causa:** Los tests dependían de `localStorage` sin mock adecuado en ambiente CI (jsdom vs. Node).
- **Acción:** Agregar `setup.ts` al `setupFiles` de Vitest que configure mocks de `localStorage` y `sessionStorage` para todos los entornos.

---

## 5. Buenas Prácticas Técnicas

Más allá de los marcos, existen prácticas técnicas específicas con respaldo empírico sólido. A continuación se presentan las seleccionadas para PetCare con su justificación.

### 5.1. Test-Driven Development (TDD)

**Ciclo Red-Green-Refactor:**

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  RED     │────▶│  GREEN   │────▶│ REFACTOR │
│ Escribir │     │ Escribir │     │ Mejorar  │
│ un test  │     │ el       │     │ el       │
│ que falle│     │ código   │     │ diseño   │
│          │◀────│ mínimo   │◀────│ sin      │
└──────────┘     └──────────┘     │ cambiar  │
                                  │ comport. │
                                  └──────────┘
```

**Aplicación en PetCare:**

Si bien no se siguió TDD estricto en cada línea de código, se aplicó un enfoque **test-aware development** donde:

- Las funciones de utilidad y la lógica de negocio en hooks siempre se escribieron con tests.
- Los componentes con lógica condicional (LoginForm, ResetPasswordForm, dashboards) tienen tests de comportamiento.
- La suite de 28 archivos de test se ejecuta en CI como parte del DoD.

**Evidencia en PetCare:**
- `frontend/src/lib/api-methods.test.ts` — tests para cada método del cliente API
- `frontend/src/hooks/use-appointments.test.tsx` — tests para el hook de gestión de citas
- `frontend/src/components/Auth/LoginForm.test.tsx` — tests de comportamiento para el formulario de login
- `frontend/src/components/ErrorBoundary.test.tsx` — tests del manejo de errores

### 5.2. Clean Code (Código Limpio)

Principios derivados de *Clean Code* (Martin, 2008) aplicados en PetCare:

| Principio | Regla | Aplicación en PetCare |
|-----------|-------|----------------------|
| **Nombres significativos** | El nombre de una variable debe revelar su intención | `getUserRole()`, no `getData()`; `isPasswordExpired()`, no `checkFlag()` |
| **Funciones pequeñas** | Una función debe hacer una sola cosa y hacerla bien | Hooks especializados: `useAppointments`, `usePets`, `useMedicalRecords` |
| **Un solo nivel de abstracción** | No mezclar lógica de negocio con detalles HTTP en la misma función | Capa `api.ts` (HTTP) separada de hooks (lógica de negocio) y componentes (UI) |
| **DRY (Don't Repeat Yourself)** | Cada pieza de conocimiento tiene una representación única | Zod schemas en `frontend/src/schemas/` como fuente única de verdad de validación |
| **Comentarios como último recurso** | El código debe ser autoexplicativo; comentar solo el "por qué", no el "qué" | La guía `docs/03-CODE_COMMENTS_GUIDE.md` documenta esta filosofía |

### 5.3. Patrones de Diseño

| Patrón | Propósito | Ubicación en PetCare |
|--------|----------|---------------------|
| **Container-Presentational** | Separar lógica de presentación | `Dashboard/VeterinarianDashboard.tsx` (container) + componentes UI (presentational) |
| **Custom Hooks** | Encapsular lógica de estado reutilizable | `hooks/use-pets.ts`, `hooks/use-appointments.ts`, `hooks/use-notifications.ts` |
| **Service Layer** | Aislar la capa de acceso a datos | `frontend/src/lib/api.ts` como cliente HTTP único |
| **Error Boundary** | Capturar errores no controlados en React | `components/ErrorBoundary.tsx` |

### 5.4. Revisión de Código (Code Review)

La revisión de código es, según McConnell (2004), la práctica individual más efectiva para encontrar defectos, superando incluso a las pruebas unitarias en tasa de detección.

**Proceso aplicado en PetCare:**

1. Todo cambio se realiza en una rama de feature (`feature/descripcion`).
2. Se abre un Pull Request hacia `main` con descripción del cambio.
3. El autor ejecuta `pnpm test:run` y adjunta el resultado.
4. Un revisor (no el autor) evalúa el código usando la Guía de Revisión de Código (GRC) del documento 01.
5. Los comentarios se clasifican como Bloqueante, Sugerencia o Elogio.
6. Si hay bloqueantes, se corrigen y se solicita re-revisión.
7. Al aprobar, se hace merge a `main` y se despliega automáticamente.

---

## 6. CI/CD — Integración y Despliegue Continuo

La integración y despliegue continuos son prácticas que automatizan la verificación y entrega del software, reduciendo el tiempo entre la escritura del código y su disponibilidad en producción.

### 6.1. Pipeline CI/CD de PetCare

```
┌─────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐
│  PUSH   │───▶│  BUILD  │───▶│   TEST   │───▶│  REVIEW  │───▶│ DEPLOY  │
│ a main  │    │ pnpm    │    │ pnpm     │    │ (manual  │    │ Netlify │
│         │    │ build   │    │ test:run │    │  PR app) │    │ auto    │
└─────────┘    └─────────┘    └──────────┘    └──────────┘    └─────────┘
     │              │               │               │               │
     │              │               │               │               │
     ▼              ▼               ▼               ▼               ▼
  Git push     Build de       28 tests       Revisión de     Prod
               frontend       ejecutados     código por     actualizado
               con Vite       en CI          pares
```

**Configuración en `netlify.toml` / Netlify UI:**

| Fase | Comando | Falla si... |
|------|---------|------------|
| Build | `pnpm build` | Hay errores de TypeScript o el bundle no se genera |
| Pre-build | `pnpm test:run \|\| true` | Ejecuta tests; no bloquea el deploy pero muestra warning |
| Deploy | Automático | El build fue exitoso |

### 6.2. Prácticas DevOps Seleccionadas

| Práctica | Descripción | PetCare |
|----------|-------------|---------|
| **Infraestructura como Código** | La configuración del entorno está versionada | `netlify.toml`, `pnpm-workspace.yaml`, `.nvmrc`, `.npmrc` |
| **Secretos externalizados** | Nunca en el código | `.env.example` documenta las variables requeridas; `.gitignore` bloquea `.env` |
| **Rollback inmediato** | Capacidad de revertir un despliegue roto | Netlify permite rollback con un clic; plan documentado en documento 01 |
| **Monitoreo post-deploy** | Verificar que el deploy no introdujo errores | Smoke tests manuales post-deploy en los tres dashboards |

---

## 7. Matriz de Selección y Aplicación en PetCare

La tabla siguiente consolida las prácticas seleccionadas de cada marco y su nivel de aplicación en PetCare:

| Marco | Práctica Seleccionada | Nivel de Aplicación | Evidencia |
|-------|----------------------|:---:|-----------|
| **ISO 12207** | Verificación de productos de trabajo | ●●● | 28 tests automatizados, ESLint, TypeScript strict |
| **ISO 12207** | Validación con stakeholders | ●●● | Sesiones UAT por rol, plan de capacitación |
| **ISO 12207** | Gestión de la configuración | ●●● | Git, tags semver, `.gitignore` robusto |
| **ISO 12207** | Mantenimiento estructurado | ●●○ | Plan ISO 14764 documentado en `docs/08-PLAN-MANTENIMIENTO.md` |
| **CMMI-DEV** | Gestión de requisitos (REQM) | ●●○ | Matriz de trazabilidad, checklist LV-RQ |
| **CMMI-DEV** | Aseguramiento de calidad (PPQA) | ●●● | Listas de verificación: LV-C, LV-BD, LV-D |
| **CMMI-DEV** | Medición y análisis (MA) | ●●○ | Tablero TMC, registro de defectos FRD |
| **Scrum** | Definition of Done | ●●● | DoD con 9 criterios, verificación automatizada en CI |
| **Scrum** | Sprint Review | ●●○ | Validación con stakeholders, feedback estructurado |
| **Scrum** | Sprint Retrospective | ●●○ | Mejora continua del proceso de calidad |
| **XP / Clean Code** | Test-Driven Development (TDD) | ●●○ | Enfoque test-aware: hooks y lógica de negocio con tests |
| **XP / Clean Code** | Código limpio (Clean Code) | ●●● | Nombres significativos, funciones pequeñas, DRY, separación de capas |
| **XP / Clean Code** | Integración continua | ●●● | CI vía Netlify: build + test + lint en cada push |
| **DevOps** | Despliegue continuo | ●●● | Netlify auto-deploy desde `main` |
| **DevOps** | Infraestructura como código | ●●● | `netlify.toml`, `pnpm-workspace.yaml`, `.nvmrc` |

**Leyenda de nivel de aplicación:**
- ●●● = Implementado de forma completa y verificable
- ●●○ = Implementado parcialmente o en proceso de maduración
- ●○○ = Planificado, no implementado aún

---

## Referencias

- ISO/IEC/IEEE 12207:2017 — Systems and software engineering — Software life cycle processes
- CMMI Institute. (2018). *CMMI for Development, Version 2.0*. CMMI Institute.
- Schwaber, K., & Sutherland, J. (2020). *The Scrum Guide*. Scrum.org.
- Beck, K., & Andres, C. (2004). *Extreme Programming Explained: Embrace Change* (2nd ed.). Addison-Wesley.
- Martin, R. C. (2008). *Clean Code: A Handbook of Agile Software Craftsmanship*. Prentice Hall.
- McConnell, S. (2004). *Code Complete* (2nd ed.). Microsoft Press.
- Kim, G., Humble, J., Debois, P., & Willis, J. (2016). *The DevOps Handbook*. IT Revolution Press.

---

> **Nota:** Este documento es parte de la evidencia de aplicación de buenas prácticas de calidad en el proyecto PetCare. Las prácticas aquí seleccionadas se materializan a través de los instrumentos diseñados en [01-diseno-instrumentos-calidad-software.md](./01-diseno-instrumentos-calidad-software.md) y se complementan con la aplicación del PSP en [04-proceso-personal-software-psp.md](./04-proceso-personal-software-psp.md).
