# Proyecto Final

Este repositorio contiene la implementación de las entregas de Backend, evolucionando desde filesystem a MongoDB, vistas con Handlebars y WebSockets.

La versión actual corresponde a la entrega final, donde:

- La persistencia es en MongoDB (MongoDB Atlas).
- Se usan Handlebars para las vistas.
- Se implementa actualización en tiempo real de productos con WebSockets (Socket.IO).
- Se exponen APIs REST para productos y carritos con todos los requerimientos de la consigna.

---

## Tecnologías principales

- Node.js
- Express.js
- MongoDB (Mongoose)
- Handlebars
- Socket.IO
- morgan (logs)

---

## Estructura principal del proyecto

src/
app.js
routes/
products.router.js
carts.router.js
views.router.js
dao/
models/
product.model.js
cart.model.js
views/
layouts/
main.handlebars
products.handlebars
productDetail.handlebars
cart.handlebars
realTimeProducts.handlebars
404.handlebars (opcional)
public/
js/
realtime.js
package.json
.gitignore
README.md

---

## Base de datos

Se utiliza MongoDB como sistema de persistencia.

Modelos:

- Product

  - `title` (String, requerido)
  - `description` (String, requerido)
  - `code` (String, requerido, único)
  - `price` (Number, requerido)
  - `status` (Boolean, default: true)
  - `stock` (Number, requerido)
  - `category` (String, requerido)
  - `thumbnails` ([String], default: [])
  - timestamps (`createdAt`, `updatedAt`)

- Cart
  - `products`: arreglo de objetos:
    - `product`: ObjectId ref `"Product"`
    - `quantity`: Number (default: 1)
  - timestamps

---

## API de Productos

Base: `/api/products`

Todas las respuestas siguen la forma:

```json
{
  "status": "success",
  "payload": [...],
  "totalPages": 1,
  "prevPage": null,
  "nextPage": null,
  "page": 1,
  "hasPrevPage": false,
  "hasNextPage": false,
  "prevLink": null,
  "nextLink": null
}
```

### Endpoints

- GET `/api/products`

  Soporta:

  - `limit` (default 10)
  - `page` (default 1)
  - `sort`: `asc` | `desc` (precio ascendente/descendente)
  - `query`:
    - `category:<nombreCategoria>`
    - `status:true` o `status:false`

  Ejemplos:

  - `GET /api/products`
  - `GET /api/products?limit=2&page=2&sort=asc`
  - `GET /api/products?query=category:electronic`
  - `GET /api/products?query=status:true&sort=desc`

- GET `/api/products/:pid`

  Devuelve un solo producto por su `_id`.

- POST `/api/products`

  Crea un nuevo producto.

  Body esperado:

  ```json
  {
    "title": "Bocina",
    "description": "Bluetooth",
    "code": "A002",
    "price": 250,
    "status": true,
    "stock": 30,
    "category": "electronic",
    "thumbnails": []
  }
  ```

- PUT `/api/products/:pid`

  Actualiza campos de un producto existente.

- DELETE `/api/products/:pid`

  Elimina un producto.

---

## API de Carritos

Base: `/api/carts`

### Endpoints

- POST `/api/carts`

  Crea un carrito vacío:

  ```json
  {
    "status": "success",
    "payload": {
      "_id": "cid",
      "products": []
    }
  }
  ```

- GET `/api/carts/:cid`

  Devuelve el carrito con los productos _populateados_:

  ```json
  {
    "status": "success",
    "payload": {
      "_id": "cid",
      "products": [
        {
          "product": {
            "_id": "pid",
            "title": "Bocina",
            "price": 250,
            "category": "electronic",
            "...": "..."
          },
          "quantity": 2
        }
      ]
    }
  }
  ```

- POST `/api/carts/:cid/product/:pid`

  Agrega un producto al carrito o incrementa su cantidad.

  Body:

  ```json
  { "quantity": 2 }
  ```

- PUT `/api/carts/:cid`

  Reemplaza TODO el contenido del carrito.

  Body:

  ```json
  {
    "products": [
      { "product": "pid1", "quantity": 3 },
      { "product": "pid2", "quantity": 1 }
    ]
  }
  ```

- PUT `/api/carts/:cid/products/:pid`

  Actualiza solo la cantidad de un producto específico dentro del carrito.

  Body:

  ```json
  { "quantity": 10 }
  ```

- DELETE `/api/carts/:cid/products/:pid`

  Elimina un producto específico del carrito.

- DELETE `/api/carts/:cid`

  Vacía el carrito (`products: []`).

---

## Vistas con Handlebars

Base: `http://localhost:8080`

- `/products`

  - Lista de productos con:
    - Paginación (siguiente/anterior).
    - Filtros por categoría y estado (a través de query params).
    - Opción para agregar productos a un carrito predefinido vía botón.

- `/products/:pid`

  - Vista detallada de un producto específico (`productDetail.handlebars`):
    - Título, descripción, precio, stock, categoría, código, estado.
    - Botón “Agregar al carrito”.
    - Link “Volver a productos”.

- `/carts/:cid

  - Vista de un carrito (`cart.handlebars`):
    - Lista de productos con título, categoría, precio y cantidad.

- `/realtimeproducts`

  - Lista de productos que se actualiza en tiempo real mediante WebSockets.
  - Formulario para crear productos vía WebSocket.
  - Formulario para eliminar productos vía WebSocket.

---

## WebSockets

- Se usa Socket.IO.
- En el servidor, al crear/actualizar/eliminar productos via API REST se emite el evento:
  - `products:list` con el listado actualizado de productos.
- En la vista `/realtimeproducts`, el cliente escucha este evento y actualiza el DOM sin recargar la página.

---

## Instalación y ejecución

1. Clonar el repositorio:

   git clone https://github.com/garkecar/ProyectoBackend1.git

2. Instalar dependencias:

   npm install

3. Configurar conexión a MongoDB:

   - O bien usar un archivo `.env` con `MONGO_URI=...` (recomendado),
   - O bien configurar la URI directamente en el archivo de conexión (ej. `config/db.js`).

4. Ejecutar el servidor:

   npm start

5. El servidor escucha en:

   - `http://localhost:8080`

---

## Notas

- No se sube `node_modules` (controlado por `.gitignore`).
- La persistencia actual es MongoDB, no filesystem.
- Las rutas antiguas basadas en filesystem (Entregas 1) fueron migradas a persistencia con MongoDB respetando la lógica de negocio original.
