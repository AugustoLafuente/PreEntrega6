# Plataforma de Eventos Deportivos - Pre-entrega 5

Proyecto backend en Node.js y Express para la gestión e inscripción a eventos deportivos. En esta entrega incorporé el sistema de **roles y autorización** para proteger las rutas de la API, diferenciando errores de autenticación (`401`) y autorización (`403`), junto con la validación de propiedad sobre los eventos.

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
| Consultar eventos publicados | `GET /api/events` | ✅ | ✅ | ✅ |
| Crear eventos | `POST /api/events` | ❌ | ✅ | ✅ |
| Modificar/cancelar eventos propios | `PUT` / `DELETE /api/events/:id` | ❌ | ✅ | ✅ |
| Modificar/cancelar eventos ajenos | `PUT` / `DELETE /api/events/:id` | ❌ | ❌ | ✅ |
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
Al momento de modificar (`PUT`) o cancelar (`DELETE`) un evento:
- El `admin` puede modificar cualquier evento.
- El `organizer` solo puede modificar aquellos donde `event.organizer === req.user.id`. Si intenta modificar un evento de otro organizador, el servicio arroja un error **`403`**.

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
| Crear evento con rol `organizer` | `POST /api/events` | Usuario `organizer` | `201 Created` |
| Ruta admin con rol `organizer` | `GET /api/users` | Usuario `organizer` | `403 Forbidden` |
| Ruta admin con rol `admin` | `GET /api/users` | Usuario `admin` | `200 OK` |
| Ruta privada sin sesión | `GET /api/sessions/current` | Sin cookie | `401 Unauthorized` |
| Modificar evento ajeno | `PUT /api/events/:id` | `organizer` no dueño | `403 Forbidden` |
