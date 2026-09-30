# Plataforma de Eventos Deportivos - Pre-entrega 6

Proyecto backend en Node.js y Express para la gestión e inscripción a eventos deportivos. Esta entrega construye el **CRUD completo de la entidad Event**: alta, listado con filtros/paginación/ordenamiento, consulta por id, modificación y cambio de estado, todo protegido por el sistema de **roles y autorización** (`401` sin sesión, `403` sin permisos) y con las reglas de negocio en la capa de `services`.

---

## 🛠️ Tecnologías y dependencias
- **Node.js** & **Express**
- **MongoDB** & **Mongoose** (persistencia y modelos)
- **Passport.js** (`passport-local`, `passport-jwt` para autenticación con cookies httpOnly)
- **bcrypt** (hasheo de contraseñas)
- **cookie-parser** & **dotenv**

---

## 👥 Roles y registro

El modelo `User` maneja 3 roles posibles: `user` (por defecto), `organizer` y `admin`.

- **Registro público (`POST /api/sessions/register`):** Todo usuario nuevo se crea obligatoriamente con rol `user`. El endpoint ignora cualquier campo `role` enviado en el body para evitar que alguien se auto-asigne permisos de admin u organizer.
- **Asignación de roles con privilegios:** Los roles `organizer` o `admin` se asignan manualmente en la base de datos.

---

## 🔐 Matriz de permisos

| Acción | Endpoint | `user` | `organizer` | `admin` |
| :--- | :--- | :---: | :---: | :---: |
| Consultar eventos | `GET /api/events`, `GET /api/events/:id` | ✅ | ✅ | ✅ |
| Crear eventos | `POST /api/events` | ❌ | ✅ | ✅ |
| Modificar eventos propios | `PUT /api/events/:id` | ❌ | ✅ | ✅ |
| Cambiar estado de eventos propios (incluye cancelar) | `PATCH /api/events/:id/status` | ❌ | ✅ | ✅ |
| Modificar / cambiar estado de eventos ajenos | `PUT` / `PATCH /api/events/:id/status` | ❌ | ❌ | ✅ |
| Listar todos los usuarios | `GET /api/users` | ❌ | ❌ | ✅ |
| Ver perfil en sesión | `GET /api/sessions/current` | ✅ | ✅ | ✅ |

---

## 🛡️ Middlewares de seguridad

Separé la autenticación y la autorización en dos middlewares reutilizables dentro de `src/middlewares/`:

1. **`auth.middleware.js` (`auth`):**
   - Extrae y valida el token JWT desde la cookie `currentUser` usando la estrategia `'current'` de Passport.
   - Si el token es válido, puebla `req.user`.
   - Si no hay cookie o el token expiró/es inválido, devuelve **`401 Unauthorized`** (`{ "status": "error", "message": "No autenticado" }`).

2. **`authorize.middleware.js` (`authorize(...roles)`):**
   - Recibe como argumento los roles permitidos (ej. `authorize('organizer', 'admin')`).
   - Compara contra `req.user.role`.
   - Si el rol no está en la lista, devuelve **`403 Forbidden`** (`{ "status": "error", "message": "No tenés permisos para realizar esta acción" }`).

### 📌 Diferencia entre 401 y 403
- **`401 Unauthorized`:** El usuario **no está autenticado** (no inició sesión o no mandó cookie válida).
- **`403 Forbidden`:** El usuario **sí está autenticado**, pero **no tiene los permisos suficientes** para esa acción o recurso.
- Ninguno de estos errores devuelve `500`.

### 🏷️ Validación de propiedad de eventos
Al momento de modificar (`PUT`) o cambiar el estado (`PATCH .../status`) de un evento:
- El `admin` puede modificar cualquier evento.
- El `organizer` solo puede modificar aquellos donde `event.organizer === req.user.id`. Si intenta modificar un evento de otro organizador, el servicio arroja un error **`403`**.

---

## 🎟️ Entidad Event: CRUD y reglas de negocio

### Modelo (`src/models/Event.js`)

| Campo | Tipo | Reglas |
| :--- | :--- | :--- |
| `title` | String | Obligatorio |
| `description` | String | Obligatorio |
| `category` | String | Obligatorio (ej. `workshop`, `torneo`) |
| `location` | String | Obligatorio |
| `date` | Date | Obligatorio. No puede ser una fecha pasada al **crear** el evento |
| `capacity` | Number | Obligatorio, debe ser `> 0` |
| `price` | Number | Debe ser `>= 0` (default `0`) |
| `status` | String | Uno de `draft`, `published`, `cancelled`, `finished`. Nace siempre en `draft` |
| `organizer` | ObjectId (ref `User`) | Se asigna automáticamente desde `req.user.id`; **nunca** se acepta desde el body |

`sport_type` se mantiene como campo opcional heredado de la temática (torneos deportivos), sin ser parte de las reglas de negocio de esta entrega.

### Endpoints

| Método | Ruta | Acceso |
| :--- | :--- | :--- |
| `POST` | `/api/events` | `organizer`, `admin` |
| `GET` | `/api/events` | Público |
| `GET` | `/api/events/:id` | Público |
| `PUT` | `/api/events/:id` | Dueño del evento o `admin` |
| `PATCH` | `/api/events/:id/status` | Dueño del evento o `admin` |

- **`POST /api/events`**: crea el evento con `status: 'draft'` (cualquier `status` recibido en el body se ignora). Valida campos obligatorios, fecha futura, `capacity > 0` y `price >= 0`. Respuesta `201`.
- **`GET /api/events`**: listado público con filtros, paginación y ordenamiento (ver abajo). Respuesta `200` con `{ data, page, limit, total, totalPages }`.
- **`GET /api/events/:id`**: devuelve un evento puntual. `404` si el id no existe o no tiene formato válido.
- **`PUT /api/events/:id`**: actualiza campos editables (`title`, `description`, `category`, `date`, `location`, `capacity`, `price`). No permite cambiar `status` ni `organizer` desde acá. Vuelve a validar fecha, `capacity` y `price` si vienen en el body.
- **`PATCH /api/events/:id/status`**: única vía para cambiar el `status` (incluida la cancelación, `status: 'cancelled'`). **No elimina el evento físicamente.**

### Reglas de negocio (en `events.service.js`, no en rutas ni controllers)

- No se puede crear un evento con `date` pasada.
- No se puede publicar (`status: 'published'`) un evento que ya está `finished`.
- `capacity <= 0` o `price < 0` se rechazan con `400`.
- Un evento en estado `cancelled` es un **estado terminal**: no admite más modificaciones vía `PUT` ni más cambios de `status` vía `PATCH` (ambos responden `400`).
- Propiedad del recurso: `organizer` solo opera sobre sus propios eventos; `admin` sobre cualquiera (`403` si no corresponde).

### Filtros, paginación y ordenamiento (`GET /api/events`)

| Query param | Descripción |
| :--- | :--- |
| `status` | Filtra por estado exacto (`draft`, `published`, `cancelled`, `finished`) |
| `category` | Filtra por categoría exacta |
| `location` | Filtra por ubicación exacta |
| `dateFrom` / `dateTo` | Filtra eventos con `date` dentro del rango (inclusive) |
| `page` | Página a devolver (default `1`) |
| `limit` | Resultados por página (default `10`) |
| `sort` | Campo de orden: `date`, `price`, `capacity` o `createdAt`. Prefijo `-` para descendente (ej. `sort=-date`). Default: `date` ascendente |

Ejemplo: `GET /api/events?status=published&category=workshop&page=2&limit=5&sort=-date`

Respuesta:
```json
{
  "status": "success",
  "data": [ { "id": "...", "title": "...", "...": "..." } ],
  "page": 2,
  "limit": 5,
  "total": 23,
  "totalPages": 5
}
```

---

## 📂 Estructura del proyecto

```text
src/
├── app.js                     # Configuración de Express y montaje de rutas
├── server.js                  # Conexión a MongoDB y arranque del server
├── config/
│   ├── config.js              # Variables de entorno
│   ├── db.js                  # Conexión a Mongoose
│   └── passport.config.js     # Estrategias register, login y current (JWT)
├── middlewares/
│   ├── auth.middleware.js     # Valida JWT en cookie -> 401
│   └── authorize.middleware.js# Valida rol -> 403
├── controllers/
│   ├── events.controller.js
│   ├── sessions.controller.js
│   └── users.controller.js
├── routes/
│   ├── events.router.js
│   ├── sessions.router.js
│   └── users.router.js
├── services/
│   └── events.service.js      # Lógica de negocio y validación de propiedad
├── repositories/
│   ├── events.repository.js
│   └── users.repository.js
├── dao/
│   ├── events.dao.js
│   └── users.dao.js
├── models/
│   ├── Event.js
│   └── User.js
└── utils/
    ├── hash.js                # bcrypt
    └── jwt.js                 # jsonwebtoken
```

---

## 🚀 Instalación y cómo correr el proyecto

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Variables de entorno:**
   Crear un archivo `.env` tomando como base `.env.example`:
   ```env
   PORT=8080
   NODE_ENV=development
   MONGO_URL=mongodb://localhost:27017/eventos_db
   JWT_SECRET=secreto_para_firmar_jwt
   JWT_EXPIRES_IN=1h
   ```

3. **Iniciar servidor:**
   - Modo desarrollo:
     ```bash
     npm run dev
     ```
   - Modo normal:
     ```bash
     npm start
     ```

---

## 🧪 Casos de prueba principales

| Prueba | Endpoint | Rol / Condición | Resultado esperado |
| :--- | :--- | :--- | :--- |
| Crear evento con rol `user` | `POST /api/events` | Usuario `user` | `403 Forbidden` |
| Crear evento con fecha pasada | `POST /api/events` | `organizer`, `date` en el pasado | `400 Bad Request` |
| Crear evento con `capacity: 0` | `POST /api/events` | `organizer` | `400 Bad Request` |
| Crear evento con rol `organizer` | `POST /api/events` | Usuario `organizer` | `201 Created` |
| Modificar evento propio | `PUT /api/events/:id` | `organizer` dueño | `200 OK` |
| Modificar evento ajeno | `PUT /api/events/:id` | `organizer` no dueño | `403 Forbidden` |
| Modificar evento de otro organizador | `PUT /api/events/:id` | `admin` | `200 OK` |
| Cambiar estado de evento cancelado | `PATCH /api/events/:id/status` | Evento en `cancelled` | `400 Bad Request` |
| Listar con filtros | `GET /api/events?status=published&category=workshop&page=2&limit=5` | Público | `200 OK` con `data`, `page`, `limit`, `total`, `totalPages` |
| Consultar evento inexistente | `GET /api/events/:id` | Id inexistente o inválido | `404 Not Found` |
| Ruta admin con rol `organizer` | `GET /api/users` | Usuario `organizer` | `403 Forbidden` |
| Ruta admin con rol `admin` | `GET /api/users` | Usuario `admin` | `200 OK` |
| Ruta privada sin sesión | `GET /api/sessions/current` | Sin cookie | `401 Unauthorized` |
