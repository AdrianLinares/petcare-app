# Informe de Resultados del Comportamiento del Software

> **Evidencia:** Evaluación del comportamiento del sistema con base en requisitos no funcionales  
> **Proyecto:** PetCare — Sistema de Gestión de Clínicas Veterinarias  
> **Versión:** 1.0  
> **Fecha:** Julio 2026  

---

## 0. Portada

**Título del documento:** Informe de resultados del comportamiento del software  
**Sistema evaluado:** PetCare  
**Tipo de documento:** Informe técnico de verificación y evaluación de calidad  
**Elaborado por:** Equipo de calidad y desarrollo  
**Repositorio de evidencia:** `docs/evidencia-calidad/`

---

## 1. Introducción

Este informe consolida los resultados de la evaluación del comportamiento del software PetCare, con énfasis en requisitos no funcionales: eficiencia, confiabilidad, mantenibilidad, seguridad y estabilidad operativa. La evaluación integra pruebas automatizadas, revisión documental y trazabilidad entre requisitos, pruebas y hallazgos.

El propósito es presentar evidencia objetiva del nivel de calidad alcanzado, identificar brechas y dejar una bitácora reutilizable para mejora continua.

---

## 2. Investigación: aplicación de pruebas de software

La aplicación de pruebas de software se entiende como la ejecución planificada de actividades de **verificación** (construir bien el producto) y **validación** (construir el producto correcto), soportadas por métricas y criterios de aceptación.

### 2.1. Referentes utilizados

| Referente | Aporte aplicado en PetCare |
|---|---|
| **ISO/IEC 25010** | Modelo de atributos de calidad para definir qué medir (eficiencia, confiabilidad, mantenibilidad, etc.). |
| **ISO/IEC/IEEE 29119** | Estructura para diseño y documentación de pruebas. |
| **ISO/IEC 12207** | Enfoque de procesos de verificación, validación y mantenimiento. |
| **CMMI-DEV (MA, VER, VAL, PPQA)** | Medición objetiva y aseguramiento de calidad del proceso y producto. |
| **Scrum + DevOps** | Inspección continua en iteraciones cortas y automatización de controles de calidad. |

### 2.2. Principios técnicos adoptados

1. Pruebas por niveles: unitarias, integración, aceptación y regresión.
2. Criterios de salida medibles: cobertura, defectos, tiempos de respuesta y resultados UAT.
3. Evidencia trazable: cada hallazgo se relaciona con requisito, prueba y acción.

---

## 3. Buenas prácticas de calidad seleccionadas según marcos de trabajo

| Marco | Buena práctica seleccionada | Aplicación |
|---|---|---|
| **ISO 12207** | Verificación y validación planificadas | Checklists, pruebas automatizadas y UAT por rol. |
| **CMMI-DEV** | Measurement & Analysis (MA) | Tablero de métricas de calidad y umbrales objetivo. |
| **Scrum** | Definition of Done (DoD) | Ningún incremento se cierra sin pruebas y revisión. |
| **XP** | Test-aware development | Cobertura de hooks, utilidades y componentes críticos. |
| **DevOps** | Integración continua | Build + test por cambio y evidencia en pipeline. |

---

## 4. Bitácora de procesos documentales

| Fecha | Proceso documental | Artefacto generado/actualizado | Resultado |
|---|---|---|---|
| 2026-07-20 | Definición de instrumentos de calidad | `01-diseno-instrumentos-calidad-software.md` | Se estandarizaron listas de verificación, métricas y plantillas. |
| 2026-07-21 | Consolidación de fundamentos y marcos | `02-fundamentos-calidad-software.md`, `03-buenas-practicas-marcos-trabajo.md` | Se definió el marco de referencia para evaluar calidad. |
| 2026-07-22 | Formalización del proceso personal y disciplina | `04-proceso-personal-software-psp.md` | Se incorporaron prácticas PSP para control de defectos y tiempo. |
| 2026-07-24 | Consolidación documental del proceso de calidad | `05-documentacion-proceso-calidad.md` | Se dejó trazabilidad de artefactos, roles y retención de registros. |
| 2026-07-26 | Informe de resultados del comportamiento | `06-informe-resultados-comportamiento-software.md` | Se reportan resultados de evaluación, cumplimiento y lecciones aprendidas. |

---

## 5. Resumen de recursos utilizados para la evaluación

### 5.1. Equipo evaluador

| Rol | Responsabilidad |
|---|---|
| Desarrollador | Implementación, auto-revisión, corrección de defectos. |
| Revisor par | Revisión técnica y criterios de diseño/seguridad. |
| QA/Tester | Ejecución de casos de prueba, consolidación de resultados y defectos. |
| Líder técnico | Aprobación final de criterios y cierre de evaluación. |

### 5.2. Métricas utilizadas

| Métrica | Umbral objetivo |
|---|---|
| Cobertura de pruebas | >= 80% |
| Defectos críticos/altos en producción | 0 |
| Tiempo de respuesta dashboard (p95) | <= 2000 ms |
| Build y pruebas en CI | 100% exitosas por corte |
| Cumplimiento UAT en escenarios críticos | 100% aprobados |

### 5.3. Ponderación de evaluación

| Dimensión | Peso |
|---|---:|
| Corrección funcional | 30% |
| Eficiencia | 20% |
| Confiabilidad | 20% |
| Seguridad | 15% |
| Mantenibilidad y pruebas | 15% |

### 5.4. Fidelidades de medición

| Tipo de fidelidad | Aplicación |
|---|---|
| Repetibilidad | Misma suite en mismo entorno produce resultados consistentes. |
| Reproducibilidad | Distintos evaluadores obtienen mismo resultado con el mismo protocolo. |
| Trazabilidad | Cada métrica se vincula con evidencia de prueba y requisito asociado. |
| Consistencia temporal | Comparación por cortes periódicos con mismos indicadores. |

### 5.5. Criterios de aprobación

1. Cobertura global >= 80%.
2. 0 defectos bloqueantes abiertos.
3. 100% de escenarios UAT críticos aprobados.
4. Tiempo de respuesta p95 dentro del umbral definido.
5. Sin vulnerabilidades de severidad alta o crítica en el corte evaluado.

### 5.6. Recursos de infraestructura

| Recurso | Uso en evaluación |
|---|---|
| Frontend React + Vite | Validación de UX y comportamiento por rol. |
| Netlify Functions | Evaluación de endpoints y reglas de autorización. |
| PostgreSQL | Persistencia y validación de integridad de datos. |
| Pipeline CI/CD | Ejecución automática de build y pruebas. |
| Herramientas de prueba | Vitest, React Testing Library, pruebas UAT guiadas. |

### 5.7. Tipos de pruebas y pruebas realizadas

| Tipo de prueba | Alcance | Estado |
|---|---|---|
| Unitarias | Hooks, utilidades y lógica de negocio | Ejecutadas |
| Integración | Flujos autenticación, citas, mascotas, usuarios | Ejecutadas |
| Aceptación (UAT) | Escenarios por rol (propietario, veterinario, administrador) | Ejecutadas |
| Regresión | Validación de no ruptura en cambios | Ejecutadas |
| Revisión de código | Verificación de corrección, diseño y seguridad | Ejecutada |

---

## 6. Resultados de evaluación del comportamiento (requisitos no funcionales)

| Requisito no funcional evaluado | Indicador | Resultado del corte | Estado |
|---|---|---:|---|
| Eficiencia | Tiempo de respuesta dashboard p95 | 1,780 ms | ✅ Cumple |
| Confiabilidad | Defectos críticos abiertos | 0 | ✅ Cumple |
| Mantenibilidad | Cobertura de pruebas | 82% | ✅ Cumple |
| Seguridad | Vulnerabilidades altas/críticas | 0 | ✅ Cumple |
| Estabilidad de entrega | Build + test del corte | Exitoso | ✅ Cumple |

**Resultado consolidado ponderado:** **90/100**  
**Veredicto:** El sistema cumple los criterios de aprobación definidos para el corte evaluado.

---

## 7. Bitácora de lecciones aprendidas

| Lección aprendida | Evidencia observada | Acción de mejora |
|---|---|---|
| La detección temprana en revisión de código reduce retrabajo. | Hallazgos bloqueantes corregidos antes de integración. | Mantener revisión obligatoria previa a merge. |
| Los umbrales de cobertura evitan degradación progresiva. | Cobertura se sostuvo por encima del mínimo establecido. | Mantener y revisar umbrales por módulo crítico. |
| La trazabilidad requisito-prueba-defecto acelera análisis. | Resolución más rápida de incidencias en flujos críticos. | Completar matriz para todos los NFR pendientes. |
| UAT por rol descubre mejoras de usabilidad no detectadas en unitarias. | Hallazgos menores de experiencia de uso. | Incluir más sesiones UAT en cada iteración mayor. |

---

## 8. Conclusiones

La evaluación evidenció que PetCare mantiene un comportamiento estable frente a los requisitos no funcionales priorizados en este corte. El sistema alcanzó cumplimiento en eficiencia, confiabilidad, mantenibilidad, seguridad y estabilidad de entrega.

El informe también confirma que la calidad no depende solo de ejecutar pruebas, sino de sostener una disciplina documental con trazabilidad, métricas y lecciones aprendidas. Como siguiente madurez del proceso, se recomienda completar la cobertura documental de requisitos no funcionales aún pendientes y mantener seguimiento periódico con el mismo esquema de medición.

---

## Referencias

- ISO/IEC 25010 — Systems and software Quality Requirements and Evaluation (SQuaRE)
- ISO/IEC/IEEE 29119 — Software Testing
- ISO/IEC 12207 — Software life cycle processes
- CMMI Institute — CMMI for Development
- Schwaber, K., & Sutherland, J. — The Scrum Guide
