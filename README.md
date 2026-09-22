# Plataforma de Gestión e Inscripción de Eventos Deportivos

Backend desarrollado en Node.js y Express para la gestión e inscripción a eventos deportivos (torneos, maratones, carreras, etc.). Esta entrega corresponde a la **Pre-entrega 4: Autenticación centralizada con Passport.js**.

---

## Descripción del Proyecto

El sistema está diseñado para conectar:
- **Organizadores**: Creación y administración de eventos, cupos, categorías y sedes.
- **Atletas / Participantes**: Búsqueda de eventos, inscripción y consulta de estado.
- **Administradores**: Moderación general y gestión de usuarios.

En esta etapa se refactorizó el módulo de autenticación para centralizar la lógica en estrategias de **Passport.js**, manteniendo la persistencia en MongoDB y el esquema de sesión mediante JWT en cookies HTTP-only.

---

## Tecnologías Utilizadas

- **Node.js** y **Express.js**: Entorno de ejecución y servidor REST API.
- **MongoDB** con **Mongoose**: Base de datos NoSQL y modelado de datos.
- **Passport.js** (`passport-local`, `passport-jwt`): Centralización de estrategias de autenticación.
- **jsonwebtoken (JWT)**: Generación y firma de tokens de sesión.
- **bcrypt**: Hasheo unidireccional de contraseñas.
- **cookie-parser**: Manejo y lectura de cookies HTTP.
- **dotenv**: Gestión de variables de entorno.

---

## Estructura del Proyecto

```text
src/
├── app.js                # Configuración de Express, middlewares y montaje de rutas
├── server.js             # Conexión a base de datos y arranque del servidor HTTP
├── config/
│   ├── config.js         # Variables de entorno centralizadas y constantes
│   └── passport.config.js# Estrategias 'register', 'login' y 'current' de Passport
├── controllers/
│   ├── events.controller.js
│   └── sessions.controller.js # Emisión de JWT, seteo de cookies y respuestas HTTP
├── routes/
│   ├── events.router.js
│   └── sessions.router.js     # Rutas que delegan la autenticación en Passport
├── repositories/
│   └── users.repository.js    # Capa intermedia de acceso a datos
├── dao/
│   └── users.dao.js           # Consultas directas a Mongoose
├── models/
│   ├── User.js                # Esquema de Usuario (roles: user / admin)
│   └── Event.js               # Esquema de Eventos Deportivos
└── utils/
    ├── hash.js                # Helpers para hasheo y comparación con bcrypt
    └── jwt.js                 # Helpers para firmar y verificar tokens JWT
```

---

## Variables de Entorno

El proyecto incluye un archivo `.env.example` como plantilla. Para ejecutar la API localmente, crear un archivo `.env` en la raíz con las siguientes claves:

| Variable | Descripción | Ejemplo local |
| :--- | :--- | :--- |
| `PORT` | Puerto del servidor HTTP | `8080` |
| `NODE_ENV` | Entorno de ejecución (`development` / `production`) | `development` |
| `MONGO_URL` | URI de conexión a MongoDB | `mongodb://localhost:27017/eventos_db` |
| `JWT_SECRET` | Clave secreta para firmar los JWT | `tu_clave_secreta_aqui` |
| `JWT_EXPIRES_IN` | Tiempo de vida del token | `1h` |

> El archivo `.env` con credenciales reales está excluido en el `.gitignore` y no se incluye en el repositorio.

---

## Instalación y Uso

1. Clonar el repositorio e instalar las dependencias:
   ```bash
   git clone https://github.com/AugustoLafuente/PreEntrega4.git
   cd "Backend II"
   npm install
   ```

2. Configurar el archivo `.env`:
   ```bash
   cp .env.example .env
   ```

3. Iniciar el servidor:
   - **Desarrollo (con recarga automática):**
     ```bash
     npm run dev
     ```
   - **Producción:**
     ```bash
     npm start
     ```

---

## Autenticación y Estrategias con Passport.js

Toda la lógica de autenticación está desacoplada y centralizada en `src/config/passport.config.js`. Las rutas de `sessions.router.js` únicamente delegan en los middlewares de autenticación, y el controlador se encarga de emitir el token y dar formato a las respuestas.

### Estrategias Implementadas

1. **`register` (`passport-local` sobre email)**:
   - Valida campos obligatorios, formato de email y longitud mínima de contraseña (8 caracteres).
   - Normaliza el correo (`trim` + `lowercase`) y valida que no exista previamente.
   - Hashea la contraseña con `bcrypt` y guarda el usuario con rol `user` por defecto.

2. **`login` (`passport-local` sobre email)**:
   - Verifica existencia del usuario y valida la contraseña con `bcrypt.compare`.
   - Si las credenciales no coinciden, responde con `401 Unauthorized` y mensaje genérico.
   - Tras el éxito, el controlador (`sessions.controller.js`) firma el JWT y setea la cookie `currentUser` con atributo `httpOnly: true`.

3. **`current` (`passport-jwt`)**:
   - Extrae el token JWT directamente de la cookie `currentUser` (sin requerir headers `Authorization`).
   - Verifica la firma del token y coloca los datos del usuario autenticado en `req.user`.

> **Preparación para nuevos proveedores:** La estructura de `passport.config.js` permite agregar nuevas estrategias (Google OAuth2, GitHub, etc.) simplemente registrando nuevos `passport.use(...)` dentro de la función de inicialización, sin necesidad de tocar `app.js` ni la lógica existente.

---

## Endpoints de la API

### Sesiones y Autenticación

- **`POST /api/sessions/register`**
  - Registra un nuevo usuario en la base de datos.
  - **Body (JSON):**
    ```json
    {
      "first_name": "Ana",
      "last_name": "Pérez",
      "email": "ana@mail.com",
      "password": "Password123"
    }
    ```
  - **Respuesta exitosa (201 Created):**
    ```json
    {
      "status": "success",
      "payload": {
        "id": "665f2a...",
        "first_name": "Ana",
        "last_name": "Pérez",
        "email": "ana@mail.com",
        "role": "user"
      }
    }
    ```

- **`POST /api/sessions/login`**
  - Valida credenciales, genera el JWT y establece la cookie `currentUser`.
  - **Body (JSON):**
    ```json
    {
      "email": "ana@mail.com",
      "password": "Password123"
    }
    ```
  - **Respuesta exitosa (200 OK):**
    ```json
    {
      "status": "success",
      "message": "Login correcto"
    }
    ```

- **`GET /api/sessions/current`** *(Ruta protegida por cookie JWT)*
  - Devuelve los datos del usuario en sesión a partir de la cookie `currentUser`.
  - **Respuesta exitosa (200 OK):**
    ```json
    {
      "status": "success",
      "payload": {
        "id": "665f2a...",
        "email": "ana@mail.com",
        "role": "user"
      }
    }
    ```
  - **Respuesta sin autenticación (401 Unauthorized):**
    ```json
    {
      "status": "error",
      "message": "No autenticado"
    }
    ```

- **`POST /api/sessions/logout`**
  - Limpia la cookie `currentUser` y finaliza la sesión activa.
  - **Respuesta (200 OK):**
    ```json
    {
      "status": "success",
      "message": "Sesión cerrada"
    }
    ```

### Otros Endpoints

- **`GET /api/health`**: Comprueba el estado del servidor (`200 OK`).
- **`GET /api/events`**: Listado de eventos deportivos registrados (`200 OK`).
