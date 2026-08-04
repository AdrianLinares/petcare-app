# Aplicación del Proceso Personal de Software (PSP) para Mejorar la Calidad del Software Desarrollado

> **Evidencia:** Aplicación de buenas prácticas de calidad documentadas en las disciplinas de calidad de software  
> **Proyecto:** PetCare — Sistema de Gestión de Clínicas Veterinarias  
> **Versión:** 1.0  
> **Fecha:** Julio 2026  

---

## Tabla de Contenidos

1. [¿Qué es el Proceso Personal de Software?](#1-qué-es-el-proceso-personal-de-software)
2. [Niveles del PSP](#2-niveles-del-psp)
3. [Métricas Fundamentales del PSP](#3-métricas-fundamentales-del-psp)
4. [PSP0 y PSP0.1: Línea Base Personal](#4-psp0-y-psp01-línea-base-personal)
5. [PSP1 y PSP1.1: Estimación y Planificación](#5-psp1-y-psp11-estimación-y-planificación)
6. [PSP2 y PSP2.1: Gestión de Defectos y Calidad Personal](#6-psp2-y-psp21-gestión-de-defectos-y-calidad-personal)
7. [Aplicación Integrada en PetCare](#7-aplicación-integrada-en-petcare)
8. [Resultados y Mejora del Proceso](#8-resultados-y-mejora-del-proceso)

---

## 1. ¿Qué es el Proceso Personal de Software?

El Proceso Personal de Software (PSP — Personal Software Process) es un marco de trabajo desarrollado por Watts Humphrey en el Software Engineering Institute (SEI) de Carnegie Mellon University. Su premisa fundamental es:

> **No se puede mejorar un proceso que no se mide, y no se puede medir un proceso que no se define.**

El PSP aplica a nivel individual los mismos principios de mejora de procesos que el CMMI aplica a nivel organizacional. Le da al desarrollador un método estructurado para:

1. **Medir** su propio trabajo (tiempo, tamaño, defectos)
2. **Analizar** los datos para identificar patrones
3. **Mejorar** su proceso personal basándose en evidencia, no en intuición

### 1.1. Principios del PSP Aplicados en PetCare

| Principio PSP | Interpretación | Aplicación en PetCare |
|--------------|---------------|----------------------|
| **Cada desarrollador es responsable de la calidad de su trabajo** | La calidad no se "agrega" en pruebas; se construye desde la primera línea de código | El DoD exige que el código pase TypeScript strict y ESLint antes de abrir un PR |
| **Los defectos deben encontrarse lo antes posible** | El costo de un defecto crece exponencialmente con cada fase que atraviesa | Tests unitarios locales antes del commit, CI ejecuta la suite completa en cada push |
| **Medir para conocer, conocer para mejorar** | Sin datos, la mejora es aleatoria | Registro de tiempo por tarea, conteo de defectos por fase, cobertura de pruebas |
| **La prevención es más barata que la corrección** | Invertir en revisión y testing temprano ahorra costo | Guía de Revisión de Código (GRC), TDD parcial (test-aware development) |

---

## 2. Niveles del PSP

El PSP se estructura en niveles progresivos, cada uno introduciendo nuevas técnicas y métricas. El desarrollador avanza de un nivel al siguiente cuando demuestra dominio del nivel actual.

```
Nivel 0: PSP0    ─── Línea base de medición
  │                  ▸ Registro de tiempo
  │                  ▸ Registro de defectos
  │
  ▼
Nivel 0.1: PSP0.1 ─── Estándares de codificación
  │                  ▸ Medición de tamaño (LOC)
  │                  ▸ Propuesta de mejora de proceso (PIP)
  │
  ▼
Nivel 1: PSP1    ─── Estimación de tamaño y esfuerzo
  │                  ▸ Método PROBE
  │                  ▸ Planificación de tareas
  │
  ▼
Nivel 1.1: PSP1.1 ─── Planificación de recursos y cronograma
  │                  ▸ Valor ganado (Earned Value)
  │
  ▼
Nivel 2: PSP2    ─── Gestión personal de calidad
  │                  ▸ Revisiones de diseño y código
  │                  ▸ Métricas de defectos por fase
  │
  ▼
Nivel 2.1: PSP2.1 ─── Principios de diseño (Design Templates)
  │
  ▼
Nivel 3: PSP3    ─── Desarrollo cíclico (Cyclic Development)
                     ▸ Escala PSP a proyectos grandes
                     ▸ Divide el trabajo en incrementos
```

Para PetCare, por ser un proyecto de escala media desarrollado por un equipo pequeño, se aplicaron los niveles **PSP0, PSP0.1, PSP1, PSP2 y PSP2.1**. El nivel PSP3 (desarrollo cíclico a gran escala) no fue necesario dado el alcance del proyecto.

---

## 3. Métricas Fundamentales del PSP

El PSP define tres métricas base que todo desarrollador debe registrar:

### 3.1. Tiempo

**Qué se mide:** Minutos dedicados a cada fase del desarrollo.

**Fases del PSP:**

| Fase | Descripción | Actividades típicas |
|------|-------------|-------------------|
| **Planificación** | Estimar y planificar el trabajo | Leer requisitos, estimar tamaño y esfuerzo, definir criterios de aceptación |
| **Diseño** | Definir la solución antes de codificar | Diseñar estructura de componentes, flujo de datos, esquema de BD |
| **Diseño detallado (DLD)** | Revisar el diseño | Revisión propia del diseño, identificación de riesgos |
| **Codificación** | Escribir el código | Implementación de componentes, funciones, hooks |
| **Revisión de código (CR)** | Revisar el propio código antes del commit | Auto-revisión sistemática usando checklist |
| **Compilación** | Verificar que el código compila/transpila | `tsc --noEmit`, `pnpm build` |
| **Pruebas unitarias (UT)** | Escribir y ejecutar tests | Vitest, React Testing Library |
| **Post-mortem** | Analizar datos y actualizar benchmarks | Completar formulario de resumen, actualizar PROBE |

### 3.2. Tamaño

**Qué se mide:** Líneas de código agregadas, modificadas y eliminadas (LOC — Lines of Code).

**Convención aplicada en PetCare:**
- Se cuentan solo líneas de código lógico (excluyendo comentarios y líneas en blanco).
- Las líneas de configuración (TypeScript config, ESLint, Vitest) se cuentan por separado.
- Se registra el delta neto (agregadas - eliminadas) por sesión de desarrollo.

### 3.3. Defectos

**Qué se mide:** Cada defecto encontrado, clasificado por fase de inyección y fase de remoción.

**Clasificación de defectos PSP:**

| Tipo de Defecto | Código | Descripción | Ejemplo en PetCare |
|----------------|:---:|-------------|-------------------|
| Documentación | 10 | Error en comentarios o documentación | Comentario que describe un comportamiento incorrecto |
| Sintaxis | 20 | Error de sintaxis detectado por el compilador | Variable mal escrita, tipo incorrecto |
| Build / Empaquetado | 30 | Error en el proceso de build | Dependencia no declarada en `package.json` |
| Asignación | 40 | Error en declaración o asignación de variables | `const` donde debía ser `let` |
| Interfaz | 50 | Error en llamadas a funciones, APIs o componentes | Props pasadas con nombre incorrecto a un componente |
| Chequeo | 60 | Error en validación de datos o condiciones | No validar que un email tiene formato correcto |
| Datos | 70 | Error en estructura o manipulación de datos | Array accedido con índice fuera de rango |
| Función | 80 | Error en la lógica de una función | Cálculo incorrecto de edad de mascota |
| Sistema | 90 | Error en configuración o entorno | Dependencia de `window` sin guard en entorno SSR |
| Ambiente | 100 | Error por diferencia entre entornos | Test que pasa en local pero falla en CI por diferencia en `localStorage` |

---

## 4. PSP0 y PSP0.1: Línea Base Personal

El objetivo del nivel PSP0 es establecer una **línea base de desempeño personal**: ¿cuánto tiempo me toma cada fase? ¿cuántos defectos introduzco y en qué fase los encuentro?

### 4.1. Registro de Tiempo (Time Recording Log)

**Formato aplicado en PetCare:**

| Fecha | Fase | Inicio | Fin | Interrupción | Tiempo neto | Tarea |
|-------|------|--------|-----|-------------|------------|-------|
| 2026-05-10 | Planificación | 09:00 | 09:30 | 5 min | 25 min | Leer requisitos del módulo de notificaciones |
| 2026-05-10 | Diseño | 09:30 | 10:15 | — | 45 min | Diseñar arquitectura de WebSockets con Pusher |
| 2026-05-10 | Codificación | 10:15 | 12:00 | 15 min | 90 min | Implementar `use-notifications` hook |
| 2026-05-10 | Pruebas | 13:00 | 14:30 | — | 90 min | Escribir `use-notifications.test.tsx` |
| 2026-05-10 | Post-mortem | 14:30 | 14:45 | — | 15 min | Resumen de la sesión |

**Herramienta:** Planilla Excel / Google Sheets compartida con timestamp automático.

### 4.2. Registro de Defectos (Defect Recording Log)

| ID | Fecha | Tipo | Fase Inyección | Fase Remoción | Tiempo corrección | Descripción |
|----|-------|:---:|:---:|:---:|:---:|------------|
| D001 | 2026-05-10 | 60 | Codificación | Pruebas | 5 min | `useNotifications` no validaba que `userId` no fuera null |
| D002 | 2026-05-10 | 50 | Codificación | Compilación | 2 min | Props `notification` → `notificationData` mal tipada |
| D003 | 2026-05-11 | 80 | Diseño | Revisión código | 15 min | La lógica de "marcar como leída" no consideraba notificaciones agrupadas |

### 4.3. Estándar de Codificación Personal (PSP0.1)

El PSP0.1 introduce la definición de un estándar de codificación personal. Este estándar recoge las prácticas que el desarrollador se compromete a seguir de manera consistente.

**Estándar de Codificación Personal para PetCare:**

```yaml
# PSP Coding Standard — PetCare
lenguaje: TypeScript (strict mode)
formateo:
  indentación: 2 espacios
  largo_máximo_línea: 120 caracteres
  punto_y_coma: obligatorio
  comillas: simples para strings, backticks solo cuando hay interpolación
nombres:
  componentes: PascalCase (Ej: PetOwnerDashboard)
  funciones: camelCase (Ej: getUserRole)
  hooks: use + PascalCase (Ej: useAppointments)
  constantes: UPPER_SNAKE_CASE (Ej: MAX_RETRY_ATTEMPTS)
  archivos: kebab-case para componentes (Ej: pet-management.tsx)
comentarios:
  - Usar JSDoc para funciones exportadas
  - Comentar el "POR QUÉ", no el "QUÉ"
  - No dejar código comentado; usar git history
estructura:
  - Máximo 50 líneas por función
  - Máximo 3 niveles de indentación por función
  - Un solo return por función (preferir early returns para casos borde)
validación:
  - Toda entrada de usuario se valida con Zod
  - Toda respuesta de API se valida antes de usarla en el estado
testing:
  - Todo hook personalizado tiene tests unitarios
  - Todo componente con lógica condicional tiene tests de comportamiento
  - Toda función de utilidad exportada tiene tests
```

### 4.4. Propuesta de Mejora del Proceso (PIP)

El PSP0.1 también introduce las PIPs (Process Improvement Proposals): documentos breves que registran un problema identificado en el proceso y proponen una mejora concreta.

**Ejemplo de PIP aplicada en PetCare:**

| Campo | Contenido |
|-------|----------|
| **PIP ID** | PIP-003 |
| **Fecha** | 2026-05-15 |
| **Problema** | Los tests de componentes que usan `localStorage` fallan en CI porque jsdom no persiste el storage entre tests. Se pierde tiempo debugueando falsos negativos. |
| **Causa** | `setupFiles` de Vitest no incluía un mock de `localStorage` que se reiniciara entre tests. |
| **Solución propuesta** | Agregar `beforeEach(() => localStorage.clear())` en `src/test/setup.ts`. |
| **Impacto esperado** | Reducir tiempo de debugging de falsos negativos en CI de ~15 min a 0. |
| **Estado** | ✅ Implementada el 2026-05-16 |

---

## 5. PSP1 y PSP1.1: Estimación y Planificación

El nivel PSP1 introduce el método **PROBE** (PROxy Based Estimation) para estimar el tamaño y esfuerzo de nuevas tareas basándose en datos históricos personales.

### 5.1. Método PROBE

El método PROBE usa el concepto de **proxies**: objetos o componentes cuyo tamaño ya se conoce (porque se midieron en el pasado) y que son similares al nuevo trabajo a estimar.

**Procedimiento:**

1. Identificar el proxy (ej: "componente de formulario con validación", "hook de gestión de estado", "página de dashboard").
2. Consultar el registro histórico de proxies: tamaño promedio, esfuerzo promedio.
3. Estimar el tamaño del nuevo trabajo en LOC usando los proxies como referencia.
4. Aplicar el intervalo de predicción basado en la desviación histórica.

**Base de Proxies para PetCare:**

| Proxy | LOC promedio | Tiempo promedio (min) | Defectos/KLOC | Cantidad medida |
|-------|:---:|:---:|:---:|:---:|
| Componente de formulario (Login, Reset) | 120 | 180 | 15 | 4 |
| Componente de dashboard | 350 | 480 | 22 | 3 |
| Hook personalizado (CRUD) | 80 | 150 | 18 | 8 |
| Hook personalizado (consulta) | 45 | 90 | 12 | 5 |
| Función de utilidad | 25 | 30 | 5 | 12 |
| Archivo de test (unitario) | 100 | 120 | 3 | 20 |
| Netlify Function (CRUD endpoint) | 90 | 200 | 20 | 5 |
| Esquema Zod | 30 | 25 | 2 | 8 |

### 5.2. Ejemplo de Estimación con PROBE

**Tarea a estimar:** Implementar el componente `AppointmentScheduling` con:
- Formulario de creación de cita (selección de mascota, veterinario, fecha, hora, tipo)
- Validación Zod de todos los campos
- Integración con el hook `useAppointments`
- Tests unitarios y de comportamiento

**Estimación:**

| Componente | Proxy | LOC estimado |
|-----------|-------|:---:|
| Formulario con validación (6 campos) | Componente de formulario × 1.5 | 180 |
| Integración con hook | Hook CRUD × 0.5 | 40 |
| Validación Zod (6 campos) | Esquema Zod × 2 | 60 |
| Tests unitarios y de comportamiento | Archivo de test × 2 | 200 |
| **Total estimado** | | **480 LOC** |

**Estimación de esfuerzo:**

| Fase | % del esfuerzo total (basado en histórico) | Tiempo estimado |
|------|:---:|:---:|
| Planificación | 10% | 50 min |
| Diseño | 20% | 100 min |
| Codificación | 35% | 175 min |
| Pruebas | 25% | 125 min |
| Post-mortem | 10% | 50 min |
| **Total** | **100%** | **500 min (~1 jornada)** |

### 5.3. Valor Ganado (Earned Value) — PSP1.1

El PSP1.1 introduce el concepto de valor ganado para hacer seguimiento del progreso planificado vs. real.

| Semana | Tareas planificadas (LOC) | Tareas completadas (LOC) | Valor ganado |
|--------|:---:|:---:|:---:|
| Semana 1 | 1200 | 1100 | 92% |
| Semana 2 | 800 | 950 | 119% |
| Semana 3 | 600 | 580 | 97% |

> La semana 2 superó el plan porque un componente resultó más simple de lo estimado (el proxy sobrestimó); esto se registró para refinar la base de proxies.

---

## 6. PSP2 y PSP2.1: Gestión de Defectos y Calidad Personal

El nivel PSP2 es donde el PSP entrega su mayor valor: introduce la **revisión personal de diseño y código** como fase obligatoria antes de la compilación y las pruebas. La premisa es:

> **Encontrar un defecto en revisión cuesta 10× menos que encontrarlo en pruebas, y 100× menos que encontrarlo en producción.**

### 6.1. Checklist de Revisión de Diseño (DLD)

Antes de codificar, el desarrollador revisa su propio diseño usando una checklist estructurada:

| # | Pregunta de revisión |
|---|---------------------|
| 1 | ¿El diseño cumple con todos los requisitos funcionales y no funcionales de la historia? |
| 2 | ¿La estructura de componentes sigue la separación Container-Presentational? |
| 3 | ¿El flujo de datos es unidireccional (props hacia abajo, eventos hacia arriba)? |
| 4 | ¿Los estados de UI (cargando, vacío, error, datos) están cubiertos para cada componente? |
| 5 | ¿El diseño maneja los casos borde identificados (sin datos, datos inválidos, timeout de API)? |
| 6 | ¿Las decisiones de rendimiento (memoización, lazy loading) están justificadas? |
| 7 | ¿El esquema de base de datos (si aplica) cumple con los criterios de la LV-BD? |
| 8 | ¿Se identificaron dependencias externas (Pusher, Neon, Netlify) y sus modos de fallo? |
| 9 | ¿El diseño es comprensible para otro desarrollador sin explicación adicional? |

### 6.2. Checklist de Revisión de Código (CR)

Antes de compilar/transpilar y antes de ejecutar tests, el desarrollador revisa su propio código:

| # | Pregunta de revisión |
|---|---------------------|
| 1 | ¿Todos los imports son necesarios y están en el orden correcto? |
| 2 | ¿Hay variables o funciones declaradas pero no utilizadas? |
| 3 | ¿Los nombres de variables, funciones y componentes son expresivos? |
| 4 | ¿Todas las entradas de usuario están validadas (Zod en frontend, validación en backend)? |
| 5 | ¿Las operaciones asíncronas tienen manejo de errores (try/catch, .catch)? |
| 6 | ¿Los efectos (useEffect) tienen cleanup cuando es necesario? |
| 7 | ¿Hay dependencias faltantes en los arrays de dependencias de hooks? |
| 8 | ¿Los secrets, tokens y claves están externalizados (variables de entorno)? |
| 9 | ¿Se respetó el estándar de codificación personal definido en PSP0.1? |
| 10 | ¿El código no introduce warnings nuevos de ESLint? |

### 6.3. Yield de Revisión Personal

Métrica clave del PSP2: **porcentaje de defectos encontrados en revisión personal vs. defectos totales**.

**Fórmula:**
```
Yield = (Defectos encontrados en DLD + CR) / (Defectos totales encontrados en el ciclo) × 100
```

**Datos de PetCare (muestra de 5 ciclos de desarrollo):**

| Ciclo | Defectos en DLD | Defectos en CR | Defectos en Compilación | Defectos en Pruebas | Yield DLD+CR |
|-------|:---:|:---:|:---:|:---:|:---:|
| Notificaciones (Pusher) | 2 | 4 | 1 | 3 | 60% |
| Dashboard Admin | 1 | 3 | 0 | 2 | 67% |
| i18n (i18next) | 3 | 5 | 2 | 4 | 57% |
| Recuperación de contraseña | 1 | 6 | 1 | 2 | 70% |
| ErrorBoundary | 2 | 3 | 0 | 1 | 83% |
| **Promedio** | | | | | **67%** |

**Interpretación:** En promedio, el 67% de los defectos fueron encontrados durante la revisión personal (DLD + CR), antes de que el código llegara a compilación o pruebas. Esto representa un ahorro significativo, ya que cada defecto encontrado en pruebas habría costado al menos 10× más en tiempo de corrección.

### 6.4. Tasa de Inyección y Remoción de Defectos (PSP2.1)

El PSP2.1 refina el análisis midiendo **en qué fase se inyectan** los defectos (dónde se originan) vs. **en qué fase se remueven** (dónde se encuentran).

| Fase | Defectos Inyectados | % | Defectos Removidos | % |
|------|:---:|:---:|:---:|:---:|
| Planificación | 1 | 3% | 0 | 0% |
| Diseño | 8 | 22% | 5 (en DLD) | 14% |
| Codificación | 25 | 69% | 19 (en CR) | 53% |
| Compilación | 2 | 6% | 4 | 11% |
| Pruebas | 0 | 0% | 8 | 22% |
| **Total** | **36** | **100%** | **36** | **100%** |

**Hallazgo clave:** El 69% de los defectos se inyectan durante la codificación. Esto es consistente con la literatura PSP (Humphrey reporta ~70% en codificación para desarrolladores con experiencia). La acción derivada es **reforzar la fase de revisión de código (CR)**, ya que es la más efectiva para remover defectos inyectados en codificación.

### 6.5. Densidad de Defectos (A/KLOC)

**Fórmula:**
```
A/KLOC = (Defectos totales encontrados en el ciclo) / (KLOC producidos en el ciclo)
```

Donde KLOC = miles de líneas de código (LOC / 1000).

| Módulo | LOC neto | Defectos | A/KLOC |
|--------|:---:|:---:|:---:|
| Sistema de Notificaciones | 580 | 10 | 17.2 |
| Dashboard Administrador | 890 | 8 | 9.0 |
| i18n (Internacionalización) | 420 | 14 | 33.3 |
| Recuperación de Contraseña | 650 | 12 | 18.5 |
| ErrorBoundary + QueryProvider | 310 | 6 | 19.4 |
| **Promedio del proyecto** | **2850** | **50** | **17.5** |

**Referencia de la industria (Humphrey, 1996):**
- PSP-trained engineers: 30-50 A/KLOC en pruebas (post-PSP: < 10 A/KLOC)
- Sin PSP: 50-100+ A/KLOC en pruebas

**Conclusión:** Con 17.5 A/KLOC, PetCare se encuentra en un rango razonable para un proyecto con PSP aplicado parcialmente. El objetivo de mejora continua es reducir a < 10 A/KLOC.

---

## 7. Aplicación Integrada en PetCare

La tabla siguiente consolida cómo se aplicó cada nivel del PSP en las distintas fases de desarrollo de PetCare:

| Nivel PSP | Técnica | Aplicación en PetCare | Herramienta / Artefacto |
|-----------|---------|----------------------|------------------------|
| **PSP0** | Registro de tiempo | Registro de minutos por fase (planificación, diseño, codificación, pruebas) para cada historia de usuario | Planilla de registro de tiempo |
| **PSP0** | Registro de defectos | Cada defecto encontrado en cualquier fase se registra con tipo, fase de inyección, fase de remoción y tiempo de corrección | Planilla de registro de defectos |
| **PSP0.1** | Estándar de codificación | Estándar documentado con reglas de nombres, formato, estructura, validación y testing | Documento de estándar de codificación + ESLint + Prettier |
| **PSP0.1** | PIPs | Propuestas de mejora derivadas del análisis de datos (ej: mock de localStorage en setup de tests) | Documento de PIPs |
| **PSP1** | PROBE | Estimación de tamaño y esfuerzo usando proxies históricos (componentes, hooks, funciones, tests) | Base de proxies + hoja de cálculo PROBE |
| **PSP1** | Planificación | Planificación semanal con valor ganado | Tablero de seguimiento |
| **PSP1.1** | Earned Value | Seguimiento semanal de LOC planificados vs. completados | Gráfica de valor ganado |
| **PSP2** | Revisión de diseño (DLD) | Checklist de 9 puntos aplicada antes de codificar | Checklist DLD |
| **PSP2** | Revisión de código (CR) | Checklist de 10 puntos aplicada antes de compilar y testear | Checklist CR |
| **PSP2** | Yield de revisión | Cálculo de % de defectos encontrados en DLD+CR vs. total | Métrica de yield |
| **PSP2.1** | Análisis de inyección/remoción | Tabla cruzada de defectos por fase de origen y fase de detección | Matriz inyección/remoción |
| **PSP2.1** | Densidad A/KLOC | Defectos por cada 1000 líneas de código, por módulo y total del proyecto | Métrica A/KLOC |

---

## 8. Resultados y Mejora del Proceso

### 8.1. Línea Base vs. Estado Actual

| Métrica | Línea base (inicio del proyecto) | Estado actual (post-PSP) | Mejora |
|---------|:---:|:---:|:---:|
| Yield de revisión personal (DLD+CR) | 0% (no se hacía) | 67% | Nueva práctica |
| Defectos/KLOC en pruebas | ~35 (estimado) | 17.5 | -50% |
| Tiempo de corrección de defectos en producción | N/A (sin datos) | < 30 min (con rollback) | Nueva capacidad |
| Precisión de estimación (plan vs. real) | ±60% | ±20% | Mejora 3× |
| Cobertura de pruebas | 0% | ≥ 80% (líneas) | Nueva práctica |

### 8.2. Lecciones Aprendidas

1. **La revisión personal de código (CR) es la práctica individual más rentable.** Con una inversión de ~15 minutos por sesión de codificación, se encontró el 53% de los defectos antes de que llegaran a compilación o pruebas. El retorno sobre la inversión es extraordinario.

2. **La base de proxies tarda en madurar, pero acelera las estimaciones futuras.** Las primeras 3-4 estimaciones con PROBE tuvieron un error del ±50%. A partir de la quinta, con suficientes datos históricos, el error bajó a ±20%.

3. **La mayor fuente de defectos no es la lógica compleja, sino la validación de entradas.** Los defectos de tipo "Chequeo" (código 60 en la clasificación PSP) —validaciones faltantes, condiciones no cubiertas— fueron los más frecuentes. La adopción de Zod como capa de validación estandarizada redujo este tipo de defectos significativamente.

4. **Medir incomoda al principio, pero empodera después.** Las primeras dos semanas de registro de tiempo y defectos se sintieron como burocracia. A partir de la tercera semana, los datos permitieron tomar decisiones informadas (ej: "este tipo de componente siempre me toma el doble de lo que estimo, necesito ajustar mi proxy").

### 8.3. Próximos Pasos en la Adopción del PSP

- [ ] Incorporar PSP2.1 completo con design templates formales para componentes reutilizables.
- [ ] Reducir A/KLOC de 17.5 a < 10 mediante mayor énfasis en revisión personal.
- [ ] Automatizar la captura de métricas de tiempo y defectos integrándolas al flujo de Git (ej: medir tiempo entre commit y PR approval).
- [ ] Extender la práctica de PIPs a todo el equipo, no solo al desarrollador que adoptó PSP.
- [ ] Evaluar la adopción de PSP3 (desarrollo cíclico) si el proyecto escala a múltiples módulos concurrentes.

---

## Referencias

- Humphrey, W. S. (1995). *A Discipline for Software Engineering*. Addison-Wesley.
- Humphrey, W. S. (1996). *Introduction to the Personal Software Process*. Addison-Wesley.
- Humphrey, W. S. (2000). *The Personal Software Process (PSP)*. Software Engineering Institute, CMU/SEI-2000-TR-022.
- Humphrey, W. S. (2005). *PSP: A Self-Improvement Process for Software Engineers*. Addison-Wesley.
- Software Engineering Institute. (2021). *Personal Software Process (PSP) Body of Knowledge*. Carnegie Mellon University.

---

> **Nota:** Este documento es parte de la evidencia de aplicación de buenas prácticas de calidad en el proyecto PetCare. La aplicación del PSP se complementa con los instrumentos de calidad ([documento 01](./01-diseno-instrumentos-calidad-software.md)), los fundamentos ([documento 02](./02-fundamentos-calidad-software.md)), los marcos de trabajo ([documento 03](./03-buenas-practicas-marcos-trabajo.md)) y la documentación del proceso ([documento 05](./05-documentacion-proceso-calidad.md)).
