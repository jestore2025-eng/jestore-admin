const orders = [
  { id: "JS-1048", customer: "Camila Torres", product: "Set skincare", total: 148000, status: "Preparando" },
  { id: "JS-1047", customer: "Daniel Ruiz", product: "Bolso urbano", total: 212000, status: "En ruta" },
  { id: "JS-1046", customer: "Mariana Rios", product: "Kit cafe premium", total: 96000, status: "Entregado" },
  { id: "JS-1045", customer: "Nicolas Perez", product: "Audifonos bluetooth", total: 178000, status: "Pendiente" }
];

const products = [
  { name: "Set skincare", sku: "SK-284", stock: 8, price: 148000 },
  { name: "Bolso urbano", sku: "BG-132", stock: 3, price: 212000 },
  { name: "Kit cafe premium", sku: "CF-901", stock: 21, price: 96000 },
  { name: "Audifonos bluetooth", sku: "AU-448", stock: 5, price: 178000 }
];

const customers = [
  { name: "Camila Torres", orders: 7, spent: 940000 },
  { name: "Daniel Ruiz", orders: 3, spent: 516000 },
  { name: "Mariana Rios", orders: 9, spent: 1288000 },
  { name: "Nicolas Perez", orders: 2, spent: 274000 }
];

const state = {
  view: "dashboard",
  search: "",
  status: "all"
};

const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

const content = document.querySelector("#content");
const pageTitle = document.querySelector("#page-title");
const sectionTitle = document.querySelector("#section-title");
const sectionCopy = document.querySelector("#section-copy");
const searchInput = document.querySelector("#search-input");
const statusFilter = document.querySelector("#status-filter");
const dialog = document.querySelector("#order-dialog");
const form = document.querySelector("#order-form");

function money(value) {
  return formatter.format(value);
}

function updateMetrics() {
  const active = orders.filter((order) => order.status !== "Entregado");
  document.querySelector("#metric-sales").textContent = money(
    orders.filter((order) => order.status === "Entregado").reduce((sum, order) => sum + order.total, 0)
  );
  document.querySelector("#metric-orders").textContent = active.length;
  document.querySelector("#metric-stock").textContent = products.filter((product) => product.stock <= 5).length;
}

function matchesSearch(values) {
  const query = state.search.trim().toLowerCase();
  return !query || values.some((value) => String(value).toLowerCase().includes(query));
}

function filteredOrders() {
  return orders.filter((order) => {
    const statusMatches = state.status === "all" || order.status === state.status;
    return statusMatches && matchesSearch([order.id, order.customer, order.product, order.status]);
  });
}

function statusClass(status) {
  return status.toLowerCase().replace(" ", "-");
}

function orderRow(order) {
  return `
    <article class="row">
      <div>
        <strong>${order.id}</strong>
        <span>${order.customer}</span>
      </div>
      <div>
        <strong>${order.product}</strong>
        <span>${money(order.total)}</span>
      </div>
      <select data-order="${order.id}" aria-label="Cambiar estado de ${order.id}">
        ${["Pendiente", "Preparando", "En ruta", "Entregado"]
          .map((status) => `<option ${status === order.status ? "selected" : ""}>${status}</option>`)
          .join("")}
      </select>
      <span class="badge ${statusClass(order.status)}">${order.status}</span>
    </article>
  `;
}

function renderOrders() {
  statusFilter.hidden = false;
  const rows = filteredOrders();
  content.innerHTML = rows.length
    ? rows.map(orderRow).join("")
    : `<div class="empty">No hay resultados para los filtros actuales.</div>`;
}

function renderProducts() {
  statusFilter.hidden = true;
  const rows = products.filter((product) => matchesSearch([product.name, product.sku]));
  content.innerHTML = rows
    .map(
      (product) => `
        <article class="row product-row">
          <div>
            <strong>${product.name}</strong>
            <span>${product.sku}</span>
          </div>
          <div>
            <strong>${money(product.price)}</strong>
            <span>${product.stock <= 5 ? "Reposicion sugerida" : "Stock saludable"}</span>
          </div>
          <span class="stock">${product.stock} uds</span>
        </article>
      `
    )
    .join("");
}

function renderCustomers() {
  statusFilter.hidden = true;
  const rows = customers.filter((customer) => matchesSearch([customer.name, customer.orders, customer.spent]));
  content.innerHTML = rows
    .map(
      (customer) => `
        <article class="row customer-row">
          <div>
            <strong>${customer.name}</strong>
            <span>${customer.orders} pedidos</span>
          </div>
          <div>
            <strong>${money(customer.spent)}</strong>
            <span>Valor historico</span>
          </div>
          <button data-customer="${customer.name}">Ver ficha</button>
        </article>
      `
    )
    .join("");
}

function renderActivity() {
  const items = orders.slice(0, 4).map(
    (order) => `
      <div class="activity-item">
        <span class="dot ${statusClass(order.status)}"></span>
        <div>
          <strong>${order.customer}</strong>
          <p>${order.id} cambio a ${order.status}</p>
        </div>
      </div>
    `
  );
  document.querySelector("#activity-list").innerHTML = items.join("");
}

function setTitles() {
  const copy = {
    dashboard: ["Panel", "Pedidos recientes", "Gestiona el flujo diario de la tienda."],
    orders: ["Pedidos", "Todos los pedidos", "Actualiza estados y prioriza entregas."],
    products: ["Productos", "Inventario", "Consulta precios y niveles de stock."],
    customers: ["Clientes", "Clientes frecuentes", "Revisa el historial comercial."]
  };
  const [title, section, description] = copy[state.view];
  pageTitle.textContent = title;
  sectionTitle.textContent = section;
  sectionCopy.textContent = description;
}

function render() {
  setTitles();
  updateMetrics();
  renderActivity();

  if (state.view === "products") renderProducts();
  else if (state.view === "customers") renderCustomers();
  else renderOrders();
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".nav-item.active").classList.remove("active");
    button.classList.add("active");
    state.view = button.dataset.view;
    render();
  });
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  render();
});

statusFilter.addEventListener("change", (event) => {
  state.status = event.target.value;
  render();
});

content.addEventListener("change", (event) => {
  if (!event.target.matches("[data-order]")) return;
  const order = orders.find((item) => item.id === event.target.dataset.order);
  order.status = event.target.value;
  render();
});

document.querySelector("#add-order").addEventListener("click", () => {
  form.reset();
  dialog.showModal();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  orders.unshift({
    id: `JS-${1049 + orders.length}`,
    customer: data.get("customer"),
    product: data.get("product"),
    total: Number(data.get("total")),
    status: "Pendiente"
  });
  dialog.close();
  state.view = "orders";
  document.querySelector(".nav-item.active").classList.remove("active");
  document.querySelector('[data-view="orders"]').classList.add("active");
  render();
});

render();
