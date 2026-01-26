E-Commerce Backend - Pre-Entrega 1
Diseño y Arquitectura Backend - CRUD de Usuarios con Autenticación y Autorización

📋 Descripción
Este proyecto implementa un CRUD de usuarios con autenticación JWT y autorización
por roles usando Passport.js. Además, mantiene las funcionalidades base del e-commerce
(productos, carritos, vistas y WebSockets).

🛠 Stack Tecnológico
Node.js + Express
MongoDB Atlas + Mongoose
Passport + JWT ( passport-jwt)
bcrypt (encriptación de contraseñas)
Handlebars (motor de vistas)
Socket.IO (WebSockets)
Morgan, cookie-parser, dotenv

📦 Instalación

1. Clonar el repositorio
   git clone https://github.com/garkecar/ProyectoBackend1.git
   cd ProyectoBackend1
2. Instalar dependencias
   npm install
3. Configurar variables de entorno
   Crear archivo .env en la raíz del proyecto (al nivel de package.json):
   PORT=8080
   MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?
   retryWrites=true&w=majority
   JWT_SECRET=a8f3k2m9x7p1q5w0z4n6b8v2c3j7h9l1_ecommerce_secure_key
   JWT_EXPIRATION=24h
   NOTA: USER, PASSWORD Y CLUSTER enviados directo en plata
4. Verificar .gitignore
   Asegurar que .env esté ignorado en Git:
   .env
   node_modules/

🚀 Ejecución
npm start
Salida esperada:
🚀 Servidor corriendo en http://localhost:8080
✅ Conectado a MongoDB
✅ Funcionalidades Implementadas (Checklist)

1. Modelo de Usuario + Encriptación de Contraseña
   •Modelo User con campos: first_name, last_name, email, age, password,role, cart
   •Encriptación de contraseña con bcrypt
   •Método comparePassword para validación

2. Estrategias de Passport
   •Estrategia JWT configurada para autenticación
   •Estrategia current para obtener usuario logueado
   •Extracción de JWT desde cookies

3. Sistema de Login + Generación de Token JWT
   •Registro de usuarios con validación
   •Login con generación de JWT válido
   •Token almacenado en cookie httpOnly

4. Endpoint /api/sessions/current
   •Retorna datos del usuario autenticado sin password
   •Incluye carrito asociado (populate)
   •Validación mediante estrategia JWT

5. Middlewares de Autorización
   •authenticateJWT - Requiere autenticación
   •authorize(roles) - Valida roles específicos
   •Rutas protegidas implementadas

🔐 Autenticación (JWT por Cookie)
El JWT se maneja mediante una cookie llamada token.
Para probar en Postman:
Cookie: token=<JWT_AQUI>

📡 Endpoints Principales
Autenticación / Sessions

Registro de Usuario

POST /api/sessions/register
Content-Type: application/json
{
"first_name": "Carlos",
"last_name": "Gallardo",
"email": "carlos@test.com",
"age": 28,
"password": "Test123456"
}

Login
{
POST /api/sessions/login
Content-Type: application/json
"email": "carlos@test.com",
"password": "Test123456"
}

Current (Usuario Logueado)
GET /api/sessions/current
Cookie: token=<JWT>

Productos (Protegidos)

Crear Producto (Solo Admin)
POST /api/products
Cookie: token=<JWT_ADMIN>
Content-Type: application/json
{
"title": "Producto Test",
"description": "Descripción",
"price": 100,
"stock": 10,
"category": "test"
}

Eliminar Producto (Solo Admin)
DELETE /api/products/:pid
Cookie: token=<JWT_ADMIN>
Carritos (Requiere Autenticación)
Agregar Producto al Carrito
POST /api/carts/:cid/product/:pid
Cookie: token=<JWT>
Content-Type: application/json
{
"quantity": 1
}

Actualizar Cantidad de Producto
PUT /api/carts/:cid/products/:pid
Cookie: token=<JWT>
Content-Type: application/json
{
}
"quantity": 3

Eliminar Producto del Carrito
DELETE /api/carts/:cid/products/:pid
Cookie: token=<JWT>

🔒 Autorización por Roles
Middlewares implementados:
•authenticateJWT → Requiere estar autenticado
•authorize("admin") → Requiere rol administrador

Rutas protegidas:
• DELETE /api/products/:pid → Solo admin
• POST /api/carts/:cid/product/:pid → Requiere autenticación
• PUT /api/carts/:cid/products/:pid → Requiere autenticación
• DELETE /api/carts/:cid/products/:pid → Requiere autenticación

Nota: Si un usuario con role: "user" intenta crear/eliminar productos, recibirá
403 Forbidden (comportamiento esperado).
