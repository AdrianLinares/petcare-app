# Fundamentos de Calidad de Software

> **Evidencia:** Aplicación de buenas prácticas de calidad documentadas en las disciplinas de calidad de software  
> **Proyecto:** PetCare — Sistema de Gestión de Clínicas Veterinarias  
> **Versión:** 1.0  
> **Fecha:** Julio 2026  

---

## Tabla de Contenidos

1. [¿Qué es la Calidad de Software?](#1-qué-es-la-calidad-de-software)
2. [Dimensiones de la Calidad](#2-dimensiones-de-la-calidad)
3. [Modelo ISO/IEC 25010 (SQuaRE)](#3-modelo-isoiec-25010-squarer)
4. [Aseguramiento vs. Control de Calidad](#4-aseguramiento-vs-control-de-calidad)
5. [Verificación vs. Validación](#5-verificación-vs-validación)
6. [Costo de la Calidad](#6-costo-de-la-calidad)
7. [Cultura de Calidad](#7-cultura-de-calidad)
8. [Aplicación en PetCare](#8-aplicación-en-petcare)

---

## 1. ¿Qué es la Calidad de Software?

La calidad de software es el grado en el que un producto de software satisface las necesidades explícitas e implícitas de sus stakeholders, cumpliendo con los requisitos funcionales y no funcionales establecidos, y entregando valor al negocio de forma consistente a lo largo del tiempo.

Existen dos perspectivas complementarias desde las cuales se puede evaluar la calidad:

### 1.1. Calidad del Producto

Se enfoca en las características inherentes del software como artefacto entregable. Responde preguntas como:

- ¿El sistema hace lo que debe hacer? (Funcionalidad)
- ¿Funciona sin fallar bajo condiciones normales y adversas? (Confiabilidad)
- ¿Un usuario nuevo puede aprender a usarlo en un tiempo razonable? (Usabilidad)
- ¿Responde en tiempos aceptables? (Eficiencia)
- ¿Puedo corregir un defecto sin romper tres funcionalidades? (Mantenibilidad)
- ¿Funciona en distintos navegadores y dispositivos? (Portabilidad)

### 1.2. Calidad del Proceso

Se enfoca en cómo se construye el software. La premisa fundamental es: **un proceso de calidad produce un producto de calidad**. Responde preguntas como:

- ¿Los requisitos están documentados y son trazables?
- ¿El código es revisado por pares antes de integrarse?
- ¿Existen pruebas automatizadas que se ejecutan en cada cambio?
- ¿El despliegue es repetible y auditable?
- ¿Los defectos encontrados se analizan para prevenir su recurrencia?

> **Principio fundamental:** No se puede probar la calidad en un producto; la calidad debe construirse desde el inicio. Las pruebas encuentran defectos, no los previenen.

---

## 2. Dimensiones de la Calidad

La calidad de software no es un concepto monolítico. Se descompone en dimensiones o atributos que permiten evaluarla de manera objetiva. Las dimensiones clásicas, derivadas de los modelos de McCall (1977), Boehm (1978) y el estándar ISO/IEC 25010, son:

### 2.1. Corrección (Correctness)

**Definición:** El grado en que el software cumple con sus especificaciones funcionales y produce resultados exactos.

**Cómo se mide:**
- Densidad de defectos (defectos por KLOC — miles de líneas de código)
- Tasa de aprobación de pruebas de aceptación
- Requisitos implementados vs. requisitos planificados

**PetCare:** La corrección se garantiza mediante los 28 archivos de prueba automatizada que validan cada flujo funcional, desde el login hasta la creación de notas clínicas, complementados con pruebas de aceptación con usuarios reales de los tres roles (Propietario, Veterinario, Administrador).

### 2.2. Confiabilidad (Reliability)

**Definición:** La capacidad del software de mantener un nivel de desempeño especificado bajo condiciones definidas durante un período de tiempo.

**Cómo se mide:**
- MTBF (Mean Time Between Failures — Tiempo medio entre fallos)
- Disponibilidad (% de tiempo que el sistema está operativo)
- Tasa de fallos en producción

**PetCare:** La arquitectura serverless en Netlify proporciona alta disponibilidad sin intervención manual. El plan de rollback documentado garantiza un RTO (Recovery Time Objective) de 20 minutos ante cualquier regresión en producción.

### 2.3. Usabilidad (Usability)

**Definición:** El grado en que el producto puede ser utilizado por usuarios específicos para alcanzar metas concretas con efectividad, eficiencia y satisfacción.

**Cómo se mide:**
- Tiempo de finalización de tareas clave
- Tasa de errores del usuario
- Net Promoter Score (NPS) o encuestas de satisfacción

**PetCare:** La interfaz fue diseñada con un enfoque mobile-first usando Tailwind CSS y componentes shadcn/ui accesibles. El sistema de roles (tres dashboards distintos) asegura que cada tipo de usuario vea solo lo que necesita. La internacionalización (i18n) con i18next permite que el sistema se use en múltiples idiomas sin refactorización.

### 2.4. Eficiencia (Efficiency)

**Definición:** La relación entre el nivel de desempeño del software y la cantidad de recursos utilizados.

**Cómo se mide:**
- Tiempo de respuesta (ms) en percentiles (p50, p95, p99)
- Uso de memoria y CPU
- Tamaño del bundle de frontend (KB)

**PetCare:** Se utiliza Vite como bundler, que produce builds optimizados con tree-shaking. Las Netlify Functions son stateless y escalan automáticamente. El edge caching para `GET /api/*` reduce la carga en la base de datos Neon PostgreSQL.

### 2.5. Mantenibilidad (Maintainability)

**Definición:** La facilidad con la que el software puede ser modificado para corregir defectos, adaptarse a nuevos requisitos o mejorar su desempeño.

**Cómo se mide:**
- Cobertura de pruebas
- Complejidad ciclomática
- Índice de deuda técnica (herramientas como SonarQube)
- Tiempo medio para resolver un defecto (MTTR)

**PetCare:** La arquitectura hexagonal aplicada (separación clara entre UI, hooks de lógica de negocio, servicios API y Netlify Functions) permite modificar una capa sin afectar las demás. El tipado estricto con TypeScript (`strict: true`) actúa como documentación viva y red de seguridad ante refactorizaciones. Las pruebas automatizadas con cobertura ≥ 80% protegen contra regresiones.

### 2.6. Portabilidad (Portability)

**Definición:** La capacidad del software de ser transferido de un entorno a otro.

**Cómo se mide:**
- Número de entornos soportados
- Esfuerzo de migración entre plataformas
- Compatibilidad con navegadores

**PetCare:** Al ser una aplicación web con frontend en React y backend serverless, PetCare es ejecutable en cualquier navegador moderno (Chrome, Firefox, Safari, Edge). La base de datos Neon PostgreSQL es compatible con PostgreSQL estándar, lo que permite migrar a cualquier proveedor o a una instancia auto-gestionada sin cambios en el código.

---

## 3. Modelo ISO/IEC 25010 (SQuaRE)

El estándar ISO/IEC 25010:2023 — *Systems and software Quality Requirements and Evaluation* (SQuaRE) — es el modelo de referencia internacional para la evaluación de la calidad de productos de software. Organiza los atributos de calidad en un modelo jerárquico de dos niveles: **características** (8) y **subcaracterísticas** (40).

### 3.1. Estructura del Modelo

```
Calidad del Producto de Software
├── Adecuación Funcional (Functional Suitability)
│   ├── Completitud Funcional
│   ├── Corrección Funcional
│   └── Pertinencia Funcional
├── Eficiencia de Desempeño (Performance Efficiency)
│   ├── Comportamiento Temporal
│   ├── Utilización de Recursos
│   └── Capacidad
├── Compatibilidad (Compatibility)
│   ├── Coexistencia
│   └── Interoperabilidad
├── Usabilidad (Usability)
│   ├── Reconocibilidad de Adecuación
│   ├── Capacidad de Aprendizaje
│   ├── Operabilidad
│   ├── Protección contra Errores de Usuario
│   ├── Estética de la Interfaz
│   └── Accesibilidad
├── Confiabilidad (Reliability)
│   ├── Madurez
│   ├── Disponibilidad
│   ├── Tolerancia a Fallos
│   └── Capacidad de Recuperación
├── Seguridad (Security)
│   ├── Confidencialidad
│   ├── Integridad
│   ├── No Repudio
│   ├── Responsabilidad
│   └── Autenticidad
├── Mantenibilidad (Maintainability)
│   ├── Modularidad
│   ├── Reusabilidad
│   ├── Analizabilidad
│   ├── Capacidad de Modificación
│   └── Capacidad de Prueba
└── Portabilidad (Portability)
    ├── Adaptabilidad
    ├── Instalabilidad
    └── Reemplazabilidad
```

### 3.2. Mapeo ISO 25010 → PetCare

| Característica ISO 25010 | Evidencia en PetCare |
|---------------------------|---------------------|
| **Adecuación Funcional** | Sistema de gestión de citas, historia clínica, vacunas y medicamentos implementado según los requerimientos de los tres roles |
| **Eficiencia de Desempeño** | Vite bundling, edge caching, Netlify serverless auto-scaling, respuesta p95 < 2s |
| **Compatibilidad** | API RESTful con respuestas JSON estándar, JWT para autenticación interoperable |
| **Usabilidad** | Dashboards específicos por rol, diseño responsive (mobile-first), i18n multi-idioma, componentes shadcn/ui accesibles |
| **Confiabilidad** | Arquitectura serverless tolerante a fallos, plan de rollback con RTO de 20 min, soft delete en base de datos |
| **Seguridad** | JWT con expiración, tokens de recuperación criptográficos (64 chars), validación Zod en frontend y backend, RBAC con niveles jerárquicos de administrador, protección contra enumeración de emails |
| **Mantenibilidad** | TypeScript strict mode, 28 archivos de test, cobertura ≥ 80%, separación clara de capas, convención de commits semver |
| **Portabilidad** | PostgreSQL estándar (Neon), React web (cualquier navegador moderno), serverless portable |

---

## 4. Aseguramiento vs. Control de Calidad

Estos dos términos se confunden con frecuencia, pero representan actividades distintas y complementarias.

### 4.1. Aseguramiento de la Calidad (Quality Assurance — QA)

**Definición:** Conjunto de actividades planificadas y sistemáticas orientadas a proporcionar confianza en que el producto cumplirá con los requisitos de calidad. El QA es **proactivo** y se enfoca en el **proceso**.

| Característica | QA |
|----------------|-----|
| Foco | El proceso de construcción |
| Momento | Durante todo el ciclo de vida |
| Objetivo | Prevenir defectos |
| Pregunta clave | ¿Estamos siguiendo el proceso correcto? |
| Ejemplos | Definir estándares de codificación, establecer guías de revisión de código, configurar pipelines de CI/CD, capacitar al equipo |

### 4.2. Control de Calidad (Quality Control — QC)

**Definición:** Conjunto de actividades operacionales orientadas a verificar que el producto cumple con los requisitos especificados. El QC es **reactivo** y se enfoca en el **producto**.

| Característica | QC |
|----------------|-----|
| Foco | El producto terminado (o artefacto intermedio) |
| Momento | Después de construir |
| Objetivo | Encontrar defectos |
| Pregunta clave | ¿El producto cumple con los requisitos? |
| Ejemplos | Ejecutar pruebas unitarias, realizar pruebas de aceptación con usuarios, inspeccionar código, medir cobertura |

### 4.3. Relación QA-QC en PetCare

```
                     ┌──────────────────────────────────┐
                     │          ASEGURAMIENTO (QA)        │
                     │         ┌──────────────────┐       │
  Definir ──────────►│ Estánda- │ TypeScript strict │     │
  proceso            │ res de   │ ESLint + Prettier │     │
                     │ código   │ Zod validation    │     │
                     │          │ Vitest config     │     │
                     │          └──────────────────┘       │
                     └──────────────────────────────────┘
                                      │
                                      │ El proceso produce
                                      ▼
                     ┌──────────────────────────────────┐
                     │          CONTROL DE CALIDAD (QC)  │
                     │         ┌──────────────────┐       │
  Verificar ────────►│ Pruebas  │ Tests unitarios  │     │
  producto           │          │ Tests de hooks   │     │
                     │          │ Tests de comp.   │     │
                     │          │ UAT con usuarios │     │
                     │          └──────────────────┘       │
                     └──────────────────────────────────┘
```

---

## 5. Verificación vs. Validación

Otro par de conceptos fundamentales que conviene distinguir:

| | Verificación | Validación |
|---|-------------|------------|
| **Pregunta** | ¿Estamos construyendo el producto correctamente? | ¿Estamos construyendo el producto correcto? |
| **Foco** | Consistencia interna (código ↔ especificaciones) | Consistencia externa (producto ↔ necesidades del usuario) |
| **Actividades** | Revisiones de código, pruebas unitarias, análisis estático, inspecciones de diseño | Pruebas de aceptación (UAT), demostraciones al cliente, encuestas de satisfacción |
| **¿Quién lo hace?** | El equipo de desarrollo | Los stakeholders (usuarios, cliente, product owner) |

**Ejemplo en PetCare:**

- **Verificación:** Un test automatizado en `LoginForm.test.tsx` comprueba que al enviar credenciales inválidas se muestra el mensaje de error definido en la especificación. Esto verifica que el código es consistente con su especificación.
- **Validación:** Durante la sesión UAT con un veterinario real, el profesional usa el sistema para registrar una nota clínica. Al finalizar, confirma que el flujo representa correctamente cómo trabaja en su práctica diaria. Esto valida que el producto resuelve la necesidad real.

> **Principio fundamental:** Un producto puede pasar todas las verificaciones y aun así fracasar en la validación. La verificación sin validación produce software técnicamente correcto pero inútil para el usuario.

---

## 6. Costo de la Calidad

El costo de la calidad no es lo que cuesta hacer calidad, sino lo que cuesta la **no-calidad**. El modelo clásico (Feigenbaum, 1956) clasifica los costos en cuatro categorías:

### 6.1. Costos de Prevención

Invertir en evitar defectos antes de que ocurran.

| Actividad | Costo típico | Retorno |
|-----------|:---:|---------|
| Capacitación del equipo en buenas prácticas | Medio | Reduce defectos en todas las fases |
| Definición de estándares de codificación | Bajo | Acelera revisiones, reduce ambigüedad |
| Configuración de CI/CD | Medio | Detecta regresiones en minutos, no en días |
| Diseño de arquitectura | Alto | Evita refactorizaciones costosas |

### 6.2. Costos de Evaluación

Detectar defectos antes de que lleguen al usuario.

| Actividad | Costo típico | Retorno |
|-----------|:---:|---------|
| Pruebas unitarias automatizadas | Medio | Cada test detecta regresiones para siempre |
| Revisión de código entre pares | Medio | Encuentra 60-90% de defectos (McConnell, 2004) |
| Pruebas de aceptación con usuarios | Alto | Evidencia que el producto resuelve la necesidad |

### 6.3. Costos de Fallas Internas

Defectos encontrados **antes** de llegar al usuario.

- Corrección de bugs encontrados en pruebas
- Re-trabajo por requisitos mal entendidos
- Refactorización por deuda técnica acumulada

### 6.4. Costos de Fallas Externas

Defectos encontrados **después** de llegar al usuario.

- **Soporte técnico** por bugs en producción
- **Pérdida de confianza** del cliente
- **Costo de oportunidad** (usuarios que abandonan el sistema)
- **Responsabilidad legal** (especialmente relevante en sistemas de salud como PetCare, donde un error en una historia clínica o una dosis de medicamento puede tener consecuencias graves)

### 6.5. La Regla 1:10:100

La evidencia empírica en la industria del software muestra una proporción aproximada:

| Momento de detección | Costo relativo |
|----------------------|:---:|
| Durante la captura de requisitos | 1× |
| Durante la codificación | 10× |
| Durante pruebas | 10-50× |
| En producción | 100-1000× |

> **Conclusión:** Cada peso invertido en prevención ahorra entre 10 y 1000 pesos en corrección. La calidad no es un gasto; es una inversión con el mejor retorno posible en ingeniería de software.

---

## 7. Cultura de Calidad

Los fundamentos técnicos son necesarios pero no suficientes. La calidad de software sostenible requiere una cultura organizacional que la priorice. Los pilares de una cultura de calidad son:

### 7.1. Propiedad Colectiva

Nadie dice "ese bug es de Fulano". El código es del equipo. Cuando un test falla en CI, cualquiera puede —y debe— investigarlo.

**En PetCare:** El uso de convenciones de commits semver, el versionado en el README y la documentación estructurada en `docs/` facilitan que cualquier miembro del equipo entienda el historial del proyecto y contribuya.

### 7.2. Mejora Continua

Cada defecto es una oportunidad de aprendizaje. No se trata de buscar culpables, sino de preguntar: **¿Qué podemos cambiar en nuestro proceso para que esto no vuelva a ocurrir?**

**En PetCare:** El formulario FRD (Formulario de Registro de Defectos) y la plantilla ACR (Análisis Causa-Raíz) documentados en el [documento 01](./01-diseno-instrumentos-calidad-software.md) institucionalizan esta práctica.

### 7.3. Transparencia

Las métricas de calidad son visibles para todo el equipo y para los stakeholders. Un problema oculto no se puede resolver.

**En PetCare:** El Tablero de Métricas de Calidad (TMC) definido en el documento 01 establece metas explícitas y umbrales de alerta (verde/rojo) visibles para todos los interesados.

### 7.4. Automatización como Primera Opción

Toda tarea repetitiva de calidad debe automatizarse. Un humano que ejecuta manualmente un checklist de 20 puntos se equivocará en el punto 17 un viernes a las 5 PM.

**En PetCare:** El pipeline de CI/CD en Netlify ejecuta automáticamente el build, los tests y el análisis de linting en cada push. Lo único que requiere intervención humana son las revisiones de código y las pruebas de aceptación.

---

## 8. Aplicación en PetCare

La tabla siguiente resume cómo cada fundamento de calidad se materializa en el proyecto PetCare:

| Fundamento | Aplicación concreta en PetCare |
|-----------|-------------------------------|
| **Corrección funcional** | 28 archivos de test con Vitest cubriendo hooks, componentes, utilidades, i18n y flujos de autenticación |
| **Confiabilidad** | Netlify serverless + Neon PostgreSQL (alta disponibilidad gestionada), plan de rollback documentado |
| **Usabilidad** | Dashboards por rol, diseño responsive mobile-first, i18n (i18next), componentes accesibles shadcn/ui |
| **Eficiencia** | Vite con tree-shaking, edge caching, funciones serverless stateless, bundle optimizado |
| **Mantenibilidad** | TypeScript strict mode, separación de capas (UI → hooks → API → functions), ESLint + Prettier |
| **Seguridad** | JWT, tokens de 64 caracteres criptográficos, Zod validation, RBAC jerárquico, protección anti-enumeración |
| **Portabilidad** | PostgreSQL estándar, React web multi-navegador, API RESTful |
| **QA (Proceso)** | Estándares de codificación documentados, ESLint, TypeScript strict, guía de revisión de código (GRC) |
| **QC (Producto)** | Suite de tests automatizados, UAT con usuarios reales, verificación pre-commit |
| **Verificación** | Tests unitarios y de integración en CI, análisis estático con TypeScript y ESLint |
| **Validación** | Pruebas de aceptación con los tres roles de usuario, plan de capacitación documentado |
| **Costo de calidad** | Inversión en prevención (TypeScript, tests, CI/CD) que evita fallas externas costosas en un sistema de salud |
| **Cultura de calidad** | Documentación estructurada (`docs/`), convención semver, plan de mantenimiento ISO 14764 |

---

## Referencias

- ISO/IEC 25010:2023 — Systems and software engineering — SQuaRE — Product quality model
- ISO/IEC 25000:2014 — Systems and software engineering — SQuaRE — Guide to SQuaRE
- Feigenbaum, A. V. (1956). Total Quality Control. *Harvard Business Review*, 34(6), 93-101.
- Humphrey, W. S. (1989). *Managing the Software Process*. Addison-Wesley.
- McConnell, S. (2004). *Code Complete* (2nd ed.). Microsoft Press.
- Pressman, R. S., & Maxim, B. R. (2019). *Software Engineering: A Practitioner's Approach* (9th ed.). McGraw-Hill.
- Sommerville, I. (2019). *Software Engineering* (10th ed.). Pearson.

---

> **Nota:** Este documento es parte de la evidencia de aplicación de buenas prácticas de calidad en el proyecto PetCare. Se complementa con los instrumentos diseñados en [01-diseno-instrumentos-calidad-software.md](./01-diseno-instrumentos-calidad-software.md) y se profundiza en la aplicación práctica en los documentos [03](./03-buenas-practicas-marcos-trabajo.md), [04](./04-proceso-personal-software-psp.md) y [05](./05-documentacion-proceso-calidad.md).
