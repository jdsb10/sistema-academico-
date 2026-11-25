# Diagrama de Secuencia — Autenticación y bloqueo de cuenta (HU-01, CP-01)

Basado en la implementación real de `server/src/modules/auth/auth.service.ts` (`login`, `refrescarSesion`) y `server/src/middleware/auth.ts`.

## Camino feliz + intento fallido + bloqueo

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend (React)
    participant API as API /api/auth/login
    participant SVC as auth.service.ts
    participant DB as PostgreSQL (usuarios, intentos_acceso)

    U->>F: Ingresa correo y contraseña
    F->>API: POST /api/auth/login { email, password }
    API->>SVC: login(email, password)
    SVC->>DB: SELECT usuario WHERE email (+ perfiles)
    SVC->>DB: INSERT intento_acceso (exitoso=false)

    alt Usuario no existe
        SVC-->>API: 401 UNAUTHORIZED
        API-->>F: Correo o contraseña incorrectos
    else Cuenta BLOQUEADA y bloqueadoHasta > ahora
        SVC-->>API: 423 LOCKED
        API-->>F: "La cuenta está bloqueada. Intente en N min"
    else Contraseña incorrecta
        SVC->>DB: UPDATE usuarios SET intentos_fallidos += 1
        alt intentos_fallidos >= LOGIN_MAX_ATTEMPTS (5)
            SVC->>DB: UPDATE usuarios SET estado=BLOQUEADO, bloqueado_hasta = ahora + 15min
            SVC->>DB: INSERT auditorias (accion=BLOQUEO_CUENTA)
            SVC-->>API: 423 LOCKED
        else intentos < 5
            SVC->>DB: INSERT auditorias (accion=LOGIN_FALLIDO)
            SVC-->>API: 401 UNAUTHORIZED
        end
        API-->>F: Mensaje de error correspondiente
    else Contraseña correcta
        SVC->>DB: UPDATE usuarios SET intentos_fallidos=0, ultimo_acceso=ahora
        SVC->>DB: UPDATE intento_acceso SET exitoso=true
        SVC->>DB: INSERT auditorias (accion=LOGIN)
        SVC->>SVC: signAccessToken({sub, email, rol, perfilId}) (JWT, 15 min)
        SVC->>SVC: signRefreshToken({sub, jti}) (JWT, 7 días)
        SVC->>DB: INSERT refresh_tokens (tokenHash = sha256(refreshToken))
        SVC-->>API: 200 { accessToken, refreshToken, usuario }
        API-->>F: Tokens guardados en localStorage
        F-->>U: Redirige al dashboard de su rol
    end
```

## Petición autenticada y renovación automática (refresh)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend (api.ts)
    participant MW as authenticate (middleware)
    participant API as Cualquier endpoint /api/*
    participant SVC as auth.service.ts
    participant DB as PostgreSQL (refresh_tokens)

    F->>API: GET /api/... Authorization: Bearer <accessToken>
    API->>MW: authenticate()
    MW->>MW: verifyAccessToken(token)

    alt Token válido
        MW->>API: req.usuario = {id, email, rol, perfilId}
        API-->>F: 200 + datos
    else Token expirado o inválido (401)
        API-->>F: 401 UNAUTHORIZED
        F->>F: apiFetch detecta 401, intenta refrescar UNA vez
        F->>SVC: POST /api/auth/refresh { refreshToken }
        SVC->>DB: SELECT refresh_token WHERE id=jti
        alt Token revocado, expirado o hash no coincide
            SVC-->>F: 401 UNAUTHORIZED
            F-->>U: Redirige a /login
        else Token válido
            SVC->>DB: UPDATE refresh_tokens SET revocada=true (rotación)
            SVC->>SVC: Emite nuevo access + refresh token
            SVC-->>F: 200 { accessToken, refreshToken, usuario }
            F->>API: Reintenta la petición original con el nuevo accessToken
            API-->>F: 200 + datos
        end
    end
```

**Nota de implementación:** el acceso por rol (`requireRole`) no vuelve a consultar la base de datos en cada petición — el rol y el `perfilId` ya viajan dentro del access token firmado. El estado de la cuenta (bloqueo, inactivación) solo se revalida en `login` y `refresh`, que es donde puede cambiar; esto evita una consulta extra a `usuarios` en cada endpoint protegido sin sacrificar seguridad, porque un token comprometido deja de ser válido en como máximo 15 minutos (`JWT_ACCESS_TTL`).
