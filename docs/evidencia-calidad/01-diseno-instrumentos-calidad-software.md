# Diseño de Instrumentos de Calidad de Software

> **Evidencia:** Aplicación de buenas prácticas de calidad documentadas en las disciplinas de calidad de software  
> **Proyecto:** PetCare — Sistema de Gestión de Clínicas Veterinarias  
> **Versión:** 1.0  
> **Fecha:** Julio 2026  

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Instrumentos de Verificación](#2-instrumentos-de-verificación)
3. [Instrumentos de Validación](#3-instrumentos-de-validación)
4. [Instrumentos de Medición](#4-instrumentos-de-medición)
5. [Instrumentos de Revisión](#5-instrumentos-de-revisión)
6. [Instrumentos de Prueba](#6-instrumentos-de-prueba)
7. [Instrumentos de Despliegue](#7-instrumentos-de-despliegue)
8. [Aplicación en PetCare](#8-aplicación-en-petcare)

---

## 1. Introducción

Los instrumentos de calidad de software son herramientas, plantillas, listas de verificación y procedimientos que permiten evaluar, medir y garantizar que un producto de software cumple con los requisitos de calidad establecidos. No son el fin en sí mismos, sino el medio para sistematizar las actividades de aseguramiento y control de calidad.

Un instrumento de calidad bien diseñado debe cumplir tres propiedades fundamentales:

| Propiedad | Descripción |
|-----------|-------------|
| **Repetibilidad** | Dos evaluadores distintos, aplicando el mismo instrumento sobre el mismo artefacto, deben obtener resultados equivalentes. |
| **Trazabilidad** | Cada hallazgo o medición debe poder vincularse con el requisito, estándar o criterio que lo originó. |
| **Accionabilidad** | El resultado del instrumento debe traducirse en acciones correctivas o preventivas concretas. |

Este documento presenta el diseño de los instrumentos de calidad aplicados al proyecto PetCare, clasificados por disciplina: verificación, validación, medición, revisión, prueba y despliegue.

---

## 2. Instrumentos de Verificación

La verificación responde a la pregunta: **¿Estamos construyendo el producto correctamente?** Los instrumentos de verificación aseguran que cada artefacto intermedio cumple con sus especificaciones antes de pasar a la fase siguiente.

### 2.1. Lista de Verificación de Requisitos (LV-RQ)

**Propósito:** Validar que cada requisito funcional y no funcional esté correctamente formulado antes de iniciar el diseño.

**Criterios de evaluación (escala: Cumple / No Cumple / No Aplica):**

| ID | Criterio | Evidencia |
|----|----------|-----------|
| RQ-01 | El requisito es atómico (no mezcla dos funcionalidades distintas) | Lectura individual del requisito |
| RQ-02 | El requisito es verificable (existe un procedimiento objetivo para comprobar su cumplimiento) | Descripción del procedimiento de verificación |
| RQ-03 | El requisito es trazable a una necesidad del negocio o del usuario | Mapeo en matriz de trazabilidad |
| RQ-04 | El requisito no contiene ambigüedades (términos como "rápido", "amigable", "bueno" están cuantificados) | Glosario de términos y métricas asociadas |
| RQ-05 | El requisito tiene prioridad asignada (Alta, Media, Baja) | Columna de prioridad en el documento de requisitos |
| RQ-06 | El requisito identifica a los actores involucrados | Lista de actores por requisito |

**Ejemplo aplicado a PetCare:**

| Requisito | RQ-01 | RQ-02 | RQ-03 | RQ-04 | RQ-05 | RQ-06 |
|-----------|-------|-------|-------|-------|-------|-------|
| "El veterinario debe poder registrar una nota clínica para una mascota atendida" | ✅ | ✅ | ✅ | ✅ | Alta | Veterinario |
| "El sistema debe ser rápido y fácil de usar" | ❌ | ❌ | ❌ | ❌ | — | — |

> En el segundo caso, el requisito fue reformulado como: "El sistema debe responder a las peticiones del dashboard en menos de 2 segundos (p95) y completar una operación CRUD básica en máximo 3 pasos de interacción."

### 2.2. Lista de Verificación de Código (LV-C)

**Propósito:** Verificar que el código fuente cumple con los estándares de codificación definidos antes de la revisión por pares y la integración.

| ID | Criterio | Herramienta |
|----|----------|-------------|
| CD-01 | El código compila/transpila sin errores | `pnpm build` / `tsc --noEmit` |
| CD-02 | No hay errores de linting | ESLint (`pnpm lint`) |
| CD-03 | El formateo es consistente con la configuración del proyecto | Prettier |
| CD-04 | Los tipos están correctamente definidos (no hay `any` injustificados) | TypeScript strict mode |
| CD-05 | No hay imports no utilizados ni variables declaradas sin uso | ESLint (`no-unused-vars`) |
| CD-06 | Las claves, tokens y secretos no están hardcodeados | Revisión manual + `gitleaks` |
| CD-07 | Las dependencias no tienen vulnerabilidades conocidas de severidad alta o crítica | `pnpm audit` |

**Configuración aplicada en PetCare:**

```jsonc
// tsconfig.json — strict mode activado
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 2.3. Lista de Verificación de Base de Datos (LV-BD)

**Propósito:** Verificar que los cambios en el esquema de base de datos cumplen con las buenas prácticas de modelado y no introducen regresiones.

| ID | Criterio |
|----|----------|
| BD-01 | Toda tabla tiene clave primaria definida |
| BD-02 | Las claves foráneas tienen definida la acción ON DELETE |
| BD-03 | Los índices cubren las consultas frecuentes identificadas |
| BD-04 | Los campos de texto tienen longitud acotada cuando corresponde |
| BD-05 | Existen constraints CHECK para dominios con valores acotados |
| BD-06 | El esquema incluye marcas de tiempo (created_at, updated_at) |
| BD-07 | Se utiliza soft delete con campo deleted_at para entidades principales |
| BD-08 | Los cambios de esquema están versionados y son reversibles |

**Aplicación en PetCare (schema.sql):**

```sql
-- Ejemplo de buenas prácticas aplicadas en el esquema de PetCare
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    user_type VARCHAR(50) NOT NULL
        CHECK (user_type IN ('pet_owner', 'veterinarian', 'administrator')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

---

## 3. Instrumentos de Validación

La validación responde a la pregunta: **¿Estamos construyendo el producto correcto?** Los instrumentos de validación confrontan el producto con las necesidades reales de los usuarios y el negocio.

### 3.1. Matriz de Validación de Requisitos (MVR)

**Propósito:** Registrar para cada requisito funcional el método de validación empleado, el resultado y la conformidad del stakeholder.

| ID Requisito | Descripción | Método de Validación | Resultado | Conformidad | Fecha |
|-------------|-------------|---------------------|-----------|-------------|-------|
| PET-RQ-01 | El propietario puede registrar una mascota con nombre, especie, raza, edad y peso | Prueba de aceptación con usuario real | ✅ Exitoso | Propietario conforme | 2026-06-15 |
| VET-RQ-03 | El veterinario puede crear una nota clínica con diagnóstico, tratamiento y seguimiento | Demostración guiada con veterinario | ✅ Exitoso | Veterinario conforme | 2026-06-16 |
| ADM-RQ-02 | El administrador puede crear, editar y desactivar usuarios de cualquier rol | Prueba de aceptación | ✅ Exitoso | Admin conforme | 2026-06-17 |

### 3.2. Protocolo de Pruebas de Aceptación de Usuario (UAT)

**Propósito:** Estandarizar la ejecución de pruebas de aceptación con usuarios reales, asegurando que cada sesión produce resultados comparables.

**Estructura del protocolo:**

1. **Pre-sesión:**
   - Seleccionar perfil de usuario que coincida con el rol a validar
   - Preparar dataset de prueba aislado
   - Entregar guion de escenarios sin inducir sesgos
   - Verificar que el ambiente de prueba está disponible

2. **Durante la sesión:**
   - El facilitador observa sin intervenir (máximo: responder dudas de interpretación)
   - Registrar: pasos seguidos, tiempos, errores encontrados, expresiones de confusión
   - No sugerir soluciones ni guiar al usuario hacia el "camino feliz"

3. **Post-sesión:**
   - Completar el formulario de hallazgos
   - Clasificar hallazgos: Bloqueante / Mayor / Menor / Sugerencia
   - Obtener firma de conformidad del usuario participante
   - Actualizar la matriz de trazabilidad

**Formulario de registro de sesión UAT:**

| Campo | Descripción |
|-------|-------------|
| ID de sesión | Código único: UAT-{ROL}-{FECHA}-{NÚMERO} |
| Rol validado | Pet Owner / Veterinarian / Administrator |
| Perfil del participante | Datos del usuario real que ejecuta la prueba |
| Escenarios ejecutados | Lista de identificadores de escenario |
| Hallazgos | Descripción, severidad, evidencia (captura de pantalla) |
| Conformidad | Firma del participante |
| Observaciones | Comentarios libres del participante |

---

## 4. Instrumentos de Medición

La medición proporciona datos objetivos para la toma de decisiones. Sin métricas, la calidad es una opinión.

### 4.1. Tablero de Métricas de Calidad (TMC)

**Propósito:** Consolidar en un solo instrumento las métricas clave de calidad del producto y del proceso, permitiendo la visualización de tendencias.

| Dimensión | Métrica | Unidad | Frecuencia | Meta | Rojo |
|-----------|---------|--------|------------|------|------|
| **Funcionalidad** | Cobertura de requisitos implementados | % | Por sprint | ≥ 95% | < 80% |
| **Confiabilidad** | Defectos encontrados en producción | # | Mensual | 0 | > 3 |
| **Confiabilidad** | Tiempo medio entre fallos (MTBF) | Horas | Mensual | > 720 | < 168 |
| **Mantenibilidad** | Cobertura de pruebas unitarias | % | Por commit | ≥ 80% | < 60% |
| **Mantenibilidad** | Deuda técnica (SonarQube / ESLint warnings) | # | Por sprint | ≤ 10 | > 50 |
| **Eficiencia** | Tiempo de respuesta p95 del dashboard | ms | Por despliegue | ≤ 2000 | > 5000 |
| **Eficiencia** | Tamaño del bundle de frontend (gzip) | KB | Por build | ≤ 500 | > 1000 |
| **Proceso** | Velocidad del equipo (story points entregados) | SP | Por sprint | ≥ 20 | < 10 |
| **Proceso** | Tiempo de ciclo (commit → despliegue) | Horas | Por historia | ≤ 48 | > 96 |

### 4.2. Formulario de Registro de Defectos (FRD)

**Propósito:** Capturar cada defecto encontrado con información suficiente para su análisis, corrección y prevención futura.

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| ID | Código único: DEF-{NÚMERO} | DEF-042 |
| Severidad | Bloqueante / Mayor / Menor / Cosmético | Mayor |
| Prioridad | Inmediata / Alta / Media / Baja | Alta |
| Estado | Abierto / En análisis / Corregido / Verificado / Cerrado | Corregido |
| Módulo | Componente afectado | `frontend/src/components/Auth/LoginForm.tsx` |
| Descripción | Qué ocurre, bajo qué condiciones | El formulario de login no muestra mensaje de error cuando el backend devuelve 401 |
| Pasos para reproducir | Secuencia exacta | 1. Ingresar credenciales inválidas 2. Presionar "Iniciar sesión" 3. Observar que no aparece mensaje de error |
| Comportamiento esperado | Qué debería ocurrir | Debe mostrarse un mensaje "Credenciales inválidas" en color rojo bajo el formulario |
| Causa raíz | Análisis post-corrección | El hook `useLogin` capturaba la excepción pero no actualizaba el estado `errorMessage` |
| Corrección aplicada | Qué se modificó | Se agregó `setErrorMessage(err.message)` en el bloque catch de `useLogin` |
| Prueba de regresión | Cómo se verifica que no vuelva a ocurrir | `LoginForm.test.tsx` — caso "displays error message on 401 response" |

### 4.3. Plantilla de Análisis Causa-Raíz (ACR)

**Propósito:** Para defectos de severidad Bloqueante o Mayor, realizar un análisis estructurado que identifique la causa raíz y las acciones preventivas.

**Método: Los 5 Porqués**

| Nivel | Pregunta | Respuesta |
|-------|----------|-----------|
| 1 | ¿Por qué ocurrió el defecto? | |
| 2 | ¿Por qué [respuesta 1]? | |
| 3 | ¿Por qué [respuesta 2]? | |
| 4 | ¿Por qué [respuesta 3]? | |
| 5 | ¿Por qué [respuesta 4]? | |

**Acciones derivadas del ACR:**

| Acción | Tipo | Responsable | Fecha límite |
|--------|------|-------------|-------------|
| | Correctiva / Preventiva | | |
| | Correctiva / Preventiva | | |

---

## 5. Instrumentos de Revisión

Las revisiones técnicas son una de las prácticas más efectivas para encontrar defectos tempranamente. La evidencia empírica muestra que una revisión de código encuentra entre el 60% y el 90% de los defectos, mientras que las pruebas unitarias encuentran entre el 30% y el 60%.

### 5.1. Guía de Revisión de Código (GRC)

**Propósito:** Estandarizar el proceso de revisión de código entre pares, asegurando que cada revisión cubre aspectos de corrección, diseño, seguridad y mantenibilidad.

**Dimensiones de revisión:**

| Dimensión | Qué buscar | Peso |
|-----------|-----------|------|
| **Corrección** | ¿El código implementa lo que la historia de usuario o el ticket describe? ¿Maneja correctamente los casos borde? | 30% |
| **Diseño** | ¿La solución está en el lugar correcto de la arquitectura? ¿Respeta la separación de responsabilidades? | 25% |
| **Seguridad** | ¿Se validan todas las entradas? ¿Las consultas a base de datos usan parámetros? ¿No se exponen secretos? | 20% |
| **Legibilidad** | ¿Los nombres son expresivos? ¿Las funciones tienen un solo nivel de abstracción? ¿Hay comentarios donde el código no es autoexplicativo? | 15% |
| **Pruebas** | ¿El cambio incluye pruebas que cubren los casos principales y los casos borde? ¿Las pruebas existentes siguen pasando? | 10% |

**Reglas del proceso de revisión:**

1. Todo cambio en `main` requiere al menos una aprobación de revisión.
2. El autor del cambio NO puede aprobar su propio Pull Request.
3. La revisión debe completarse en máximo 24 horas hábiles.
4. Si el cambio supera las 400 líneas, debe dividirse en múltiples PRs encadenados.
5. Los comentarios de revisión se clasifican como: **Bloqueante** (debe corregirse antes del merge), **Sugerencia** (recomendación a criterio del autor), **Elogio** (buena práctica que vale la pena destacar).

### 5.2. Plantilla de Reporte de Revisión (PRR)

```markdown
# Reporte de Revisión de Código — PR #{NÚMERO}

**Revisor:** {NOMBRE}
**Autor:** {NOMBRE}
**Fecha:** {FECHA}
**Alcance:** {ARCHIVOS MODIFICADOS}
**Tiempo de revisión:** {MINUTOS} minutos

## Resumen

| Dimensión | Puntuación (1-5) | Observaciones |
|-----------|-------------------|---------------|
| Corrección |  |  |
| Diseño |  |  |
| Seguridad |  |  |
| Legibilidad |  |  |
| Pruebas |  |  |

## Hallazgos

### Bloqueantes
- {HALLAZGO} — Archivo: {ARCHIVO}, Línea: {LÍNEA}

### Sugerencias
- {HALLAZGO} — Archivo: {ARCHIVO}, Línea: {LÍNEA}

### Elogios
- {HALLAZGO}

## Veredicto

- [ ] Aprobado — Proceder al merge
- [ ] Aprobado con sugerencias — Las sugerencias quedan a criterio del autor
- [ ] Cambios solicitados — Deben resolverse los bloqueantes antes de re-revisar
```

---

## 6. Instrumentos de Prueba

Los instrumentos de prueba definen qué probar, cómo probarlo y cómo registrar los resultados de forma que otro miembro del equipo pueda reproducirlos.

### 6.1. Estrategia de Pruebas por Nivel (EPN)

**Propósito:** Definir para cada nivel de prueba los objetivos, el alcance, las herramientas y los criterios de aceptación.

| Nivel | Objetivo | Alcance | Herramienta | Criterio de aceptación |
|-------|----------|---------|-------------|------------------------|
| **Unitarias** | Verificar el comportamiento de funciones, hooks y componentes aislados | Todas las funciones de utilidad, hooks personalizados, componentes con lógica de negocio | Vitest + React Testing Library | Cobertura ≥ 80%, todos los tests pasan |
| **Integración** | Verificar la interacción entre componentes y servicios | Flujos completos: login → dashboard → CRUD | Vitest + MSW (Mock Service Worker) | Todos los flujos críticos cubiertos |
| **Aceptación** | Validar que el sistema cumple las necesidades del usuario | Escenarios definidos en el plan UAT por cada rol | Prueba manual guiada por el protocolo UAT | 100% de escenarios críticos aprobados por el usuario |
| **Regresión** | Garantizar que los cambios no rompen funcionalidad existente | Suite completa de pruebas automatizadas | Vitest (CI en cada PR) | 0 tests fallando, cobertura no disminuye |

### 6.2. Plantilla de Caso de Prueba (PCP)

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| ID | TC-{MÓDULO}-{NÚMERO} | TC-AUTH-003 |
| Módulo | Componente o funcionalidad | Autenticación — Recuperación de contraseña |
| Precondiciones | Estado del sistema antes de ejecutar | No hay sesión activa. El usuario existe en la base de datos. |
| Datos de entrada | Valores específicos | Email: `owner@petcare.com` |
| Pasos | Secuencia exacta de acciones | 1. Navegar a /login 2. Clic en "¿Olvidaste tu contraseña?" 3. Ingresar email 4. Clic en "Enviar" |
| Resultado esperado | Comportamiento correcto | Se muestra mensaje: "Si el correo existe, recibirás un enlace de recuperación." Se registra token en `password_reset_tokens` con expiración de 1 hora. |
| Resultado obtenido | Lo que realmente ocurrió | ✅ El mensaje apareció. El token se generó con 64 caracteres criptográficos. |
| Estado | Pasó / Falló / Bloqueado | Pasó |
| Evidencia | Captura o registro | `tc-auth-003-evidence.png` |

### 6.3. Configuración del Entorno de Pruebas Automatizadas

**Propósito:** Asegurar que las pruebas automatizadas se ejecutan en un entorno determinista y reproducible.

**Archivo de configuración utilizado en PetCare (`vitest.config.ts`):**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        branches: 70,
        functions: 80,
        statements: 80,
      },
    },
  },
});
```

---

## 7. Instrumentos de Despliegue

La calidad no termina en el código; el proceso de despliegue también debe estar instrumentado para prevenir regresiones en producción.

### 7.1. Lista de Verificación Pre-Despliegue (LV-D)

| ID | Criterio | Responsable | Automatizado |
|----|----------|-------------|:---:|
| DP-01 | La rama `main` pasa todos los tests | CI/CD (Netlify) | ✅ |
| DP-02 | El build de producción se genera sin errores | CI/CD | ✅ |
| DP-03 | No hay vulnerabilidades de severidad alta o crítica en dependencias | Desarrollador | ❌ |
| DP-04 | Las variables de entorno requeridas están configuradas en el entorno destino | DevOps | ❌ |
| DP-05 | La migración de base de datos (si aplica) fue ejecutada y verificada | Desarrollador | ❌ |
| DP-06 | Se generó un tag de versión siguiendo semver (`v1.4.0`) | Desarrollador | ❌ |
| DP-07 | El changelog fue actualizado con los cambios de esta versión | Desarrollador | ❌ |
| DP-08 | Se notificó al equipo por el canal de comunicación establecido | Desarrollador | ❌ |

### 7.2. Plan de Rollback

**Propósito:** Definir el procedimiento para revertir un despliegue defectuoso en el menor tiempo posible.

| Paso | Acción | Responsable | Tiempo estimado |
|------|--------|-------------|:---:|
| 1 | Detectar la regresión (monitoreo o reporte de usuario) | Equipo | — |
| 2 | Confirmar que el defecto fue introducido por el último despliegue | Desarrollador | 5 min |
| 3 | Ejecutar rollback al despliegue anterior desde Netlify | DevOps | 2 min |
| 4 | Verificar que el sistema recupera su funcionamiento normal | QA | 5 min |
| 5 | Notificar al equipo y stakeholders | Líder técnico | 3 min |
| 6 | Crear ticket de defecto con severidad Bloqueante | QA | 5 min |

**Tiempo total estimado de recuperación (RTO):** 20 minutos.

---

## 8. Aplicación en PetCare

La tabla siguiente resume qué instrumentos fueron aplicados efectivamente durante el desarrollo de PetCare y en qué fase del ciclo de vida:

| Fase | Instrumentos aplicados | Artefacto generado |
|------|------------------------|-------------------|
| **Requisitos** | LV-RQ (Lista de Verificación de Requisitos) | Requisitos refinados y priorizados |
| **Diseño** | Revisiones de arquitectura | `docs/01-ARCHITECTURE.md` |
| **Codificación** | LV-C, GRC, ESLint, Prettier, TypeScript strict mode | Código tipado, sin errores de linting, revisado por pares |
| **Base de Datos** | LV-BD | `schema.sql` con índices, constraints CHECK y soft delete |
| **Pruebas** | EPN, PCP, Vitest config | 28 archivos de prueba automatizados, protocolo UAT, plan de capacitación |
| **Despliegue** | LV-D, Plan de Rollback | Netlify CI/CD, versionado semver, `.env.example` |
| **Mantenimiento** | FRD, ACR | `docs/08-PLAN-MANTENIMIENTO.md` (ISO/IEC 14764) |

---

## Referencias

- ISO/IEC/IEEE 29119:2022 — Software Testing Standard
- ISO/IEC 25010:2023 — Systems and software Quality Requirements and Evaluation (SQuaRE)
- IEEE 1028-2008 — Software Reviews and Audits
- McConnell, S. (2004). *Code Complete* (2nd ed.). Microsoft Press.
- Wiegers, K., & Beatty, J. (2013). *Software Requirements* (3rd ed.). Microsoft Press.

---

> **Nota:** Este documento es parte de la evidencia de aplicación de buenas prácticas de calidad en el proyecto PetCare. Los instrumentos aquí diseñados se complementan con los documentos [02-fundamentos-calidad-software.md](./02-fundamentos-calidad-software.md), [03-buenas-practicas-marcos-trabajo.md](./03-buenas-practicas-marcos-trabajo.md), [04-proceso-personal-software-psp.md](./04-proceso-personal-software-psp.md) y [05-documentacion-proceso-calidad.md](./05-documentacion-proceso-calidad.md).
