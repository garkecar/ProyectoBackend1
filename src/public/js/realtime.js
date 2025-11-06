const socket = io();

// Referencias DOM
const listEl = document.getElementById("rt-products");
const createForm = document.getElementById("create-form");
const deleteForm = document.getElementById("delete-form");

// Renderizar lista
function renderList(products) {
  if (!Array.isArray(products)) return;
  listEl.innerHTML = products
    .map(
      (p) => `
    <li data-id="${p.id}" class="product-item">
      <strong>${p.title}</strong> — $${p.price} — Stock: ${p.stock}
      <div class="muted">ID: ${p.id} | Code: ${p.code} | Cat: ${p.category}</div>
    </li>
  `
    )
    .join("");
}

// Al conectar, recibimos lista inicial desde el servidor
socket.on("products:list", (products) => {
  renderList(products);
});

// Form crear (emit por socket)
createForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(createForm);
  const payload = {
    title: fd.get("title"),
    description: fd.get("description"),
    code: fd.get("code"),
    price: Number(fd.get("price")),
    status: fd.get("status") === "true",
    stock: Number(fd.get("stock")),
    category: fd.get("category"),
    thumbnails: (fd.get("thumbnails") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
  socket.emit("product:create", payload, (res) => {
    if (!res?.ok) {
      alert("Error creando: " + (res?.error || "desconocido"));
    } else {
      createForm.reset();
      alert("Producto creado.");
    }
  });
});

// Form eliminar (emit por socket)
deleteForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(deleteForm);
  const id = fd.get("id");
  socket.emit("product:delete", { id }, (res) => {
    if (!res?.ok) {
      alert("Error eliminando: " + (res?.error || "desconocido"));
    } else {
      deleteForm.reset();
      alert("Producto eliminado.");
    }
  });
});
