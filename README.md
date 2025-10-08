### Entrega N° 1 — API de Productos y Carritos (Filesystem)

API en Node.js + Express para gestionar productos y carritos con persistencia en archivos JSON (products.json, carts.json). Escucha en el puerto 8080 y expone rutas bajo /api/products y /api/carts.

#### Tecnologías

- Node.js
- Express
- nanoid (IDs únicos)
- morgan (logs)
- Filesystem (fs/promises)

#### Estructura

- src/
  - app.js
  - routes/
    - products.router.js
    - carts.router.js
  - managers/
    - ProductManager.js
    - CartManager.js
  - utils/
    - fileUtils.js
  - data/
    - products.json
    - carts.json
- package.json
- .gitignore
- README.md

#### Requisitos cumplidos

- Servidor Express en puerto 8080.
- Rutas /api/products y /api/carts con Router.
- Productos:
  - GET /api/products: lista todos.
  - GET /api/products/:pid: obtiene por id.
  - POST /api/products: crea producto (id autogenerado).
  - PUT /api/products/:pid: actualiza campos (sin modificar id).
  - DELETE /api/products/:pid: elimina por id.
- Carritos:
  - POST /api/carts: crea carrito (id autogenerado, products: []).
  - GET /api/carts/:cid: lista productos del carrito.
  - POST /api/carts/:cid/product/:pid: agrega producto (incrementa quantity si ya existe).
- Persistencia en filesystem mediante managers (ProductManager, CartManager).

#### Requisitos previos

- Node.js 18+ recomendado

#### Instalación

1. Clonar el repo
2. Instalar dependencias:
   - npm install
3. Archivos de datos:
   - src/data/products.json -> []
   - src/data/carts.json -> []
4. Correr:
   - Desarrollo: npm run dev
   - Producción: npm start

El servidor escucha en http://localhost:8080

#### Endpoints de ejemplo

- Productos

  - GET http://localhost:8080/api/products
  - GET http://localhost:8080/api/products/:pid
  - POST http://localhost:8080/api/products
    Body:
    {
    "title": "Teclado Mecánico",
    "description": "Switches rojos",
    "code": "KB-001",
    "price": 59.99,
    "status": true,
    "stock": 50,
    "category": "perifericos",
    "thumbnails": ["uploads/teclado1.jpg"]
    }
  - PUT http://localhost:8080/api/products/:pid
    Body: { "price": 64.99, "stock": 40 }
  - DELETE http://localhost:8080/api/products/:pid

- Carritos
  - POST http://localhost:8080/api/carts
  - GET http://localhost:8080/api/carts/:cid
  - POST http://localhost:8080/api/carts/:cid/product/:pid
    Body: { "quantity": 1 } (opcional; default 1)

#### Notas

- IDs generados con nanoid para evitar colisiones.
- code de producto validado como único.
- No se actualiza ni elimina el id en PUT de productos.
- Sin interfaz visual; testear con Postman/Insomnia/Thunder Client.
- No subir node_modules (ver .gitignore).

#### Scripts

- npm run dev -> nodemon src/app.js
- npm start -> node src/app.js
