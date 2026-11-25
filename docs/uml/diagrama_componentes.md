# Diagrama de Componentes — Sistema Académico Universitario

Refleja la arquitectura en capas realmente implementada: `routes → controllers → services → Prisma Client → PostgreSQL`, con un módulo por dominio bajo `server/src/modules/`.

```mermaid
flowchart TB
    subgraph Cliente["Cliente — SPA (client/)"]
        direction TB
        UI[Páginas por rol\nclient/src/pages/]
        UIKit[Design system\nclient/src/components/ui + layout + horario]
        Auth[AuthContext\nJWT + refresh automático]
        ApiLib[Cliente API\nclient/src/lib/api.ts]
        UI --> UIKit
        UI --> Auth
        Auth --> ApiLib
    end

    subgraph API["API REST — server/src/"]
        direction TB

        subgraph Middleware
            MWAuth[authenticate / requireRole]
            MWErr[errorHandler]
            MWRate[rate limiting]
        end

        subgraph Modulos["Módulos (routes → controllers → services)"]
            direction LR
            M1[auth]
            M2[facultades / programas / materias / aulas / grupos / periodos]
            M3[personas\nadministradores · coordinadores · docentes · estudiantes]
            M4[cargas-academicas / horarios]
            M5[asistencias / sensores]
            M6[microcurriculos / competencias / planes]
            M7[calificaciones]
            M8[reportes]
            M9[dashboard]
            M10[auditoria]
            M11[respaldos]
            M12[notificaciones]
        end

        Shared[shared/\nprisma.ts · errors.ts · validate.ts\npagination.ts · auditoria.ts · jwt.ts · time.ts]

        MWAuth --> Modulos
        Modulos --> Shared
        Modulos --> MWErr
    end

    subgraph Externos["Componentes externos (dentro del proceso Node)"]
        PDF[pdfkit\nexportación PDF]
        Excel[exceljs\nexportación Excel]
        Mail[Transportador de correo\nconsola por defecto / SMTP opcional]
    end

    subgraph BD["PostgreSQL 17 (embebido)"]
        direction TB
        Tablas[(40 tablas)]
        Vista[[Vista SQL\nhorario_docente]]
        TrigAud{{Trigger\nbloquear_auditoria\n(bitácora inmutable)}}
        TrigProg{{Trigger\nsincronizar_numero_programas}}
        Excl{{Restricciones EXCLUDE\nbtree_gist\nchoques docente/aula/grupo}}
    end

    ApiLib -->|HTTP/JSON\nBearer JWT| API
    M8 --> PDF
    M8 --> Excel
    M1 --> Mail
    Shared -->|Prisma Client| Tablas
    M4 -. consulta .-> Vista
    Tablas --- TrigAud
    Tablas --- TrigProg
    Tablas --- Excl
```

**Notas de arquitectura** (ver `docs/analysis/decisiones_arquitectonicas.md` para el detalle de cada ADR):

- Cada módulo sigue siempre el mismo patrón de 3 archivos (`*.routes.ts` → `*.controller.ts` → `*.service.ts`), más un `*.schemas.ts` con la validación Zod. Esto permite agregar un módulo nuevo copiando la forma de uno existente (ver `docs/manuales/manual_tecnico.md`).
- `shared/` es la única carpeta con lógica transversal: un único cliente Prisma (`prisma.ts`), un único punto de escritura de la bitácora (`auditoria.ts`), manejo de errores centralizado (`errors.ts` + `middleware/errorHandler.ts`) y validación centralizada (`validate.ts`).
- La exportación de reportes (PDF/Excel) y el envío de correo son los únicos componentes que, en un despliegue real, podrían externalizarse a un servicio aparte; hoy corren dentro del mismo proceso Node por simplicidad, dado el alcance del proyecto.
