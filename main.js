const API = "https://starly.webi-artin.workers.dev";

const categoriesEl = document.getElementById("categories");
const productsEl = document.getElementById("products");
const cartEl = document.getElementById("cart");
const clearBtn = document.getElementById("clearCart");

const modal = document.getElementById("productModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

// Cart
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  cartEl.innerHTML = cart.map(item => `<li>${item.name}</li>`).join("");
}

// Clear Cart
clearBtn.addEventListener("click", () => {
  cart = [];
  saveCart();
});

// Modal
closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Fetch categories
fetch(`${API}/categories`)
  .then(res => res.json())
  .then(data => {
    const cats = data.data || [];
    categoriesEl.innerHTML = cats.map(c => `
      <li class="bg-blue-100 text-blue-700 px-3 py-1 rounded cursor-pointer" onclick="filterByCategory(${c.id})">
        ${c.name}
      </li>
    `).join("");
  });

// Fetch products
let allProducts = [];
fetch(`${API}/products`)
  .then(res => res.json())
  .then(data => {
    allProducts = data.data || [];
    renderProducts(allProducts);
  });

// Render products
function renderProducts(products) {
  productsEl.innerHTML = products.map(p => {
    let priceText = p.type === "variable" ? 
      `${p.price_min} – ${p.price_max} ${p.currency || "IRR"}` :
      `${p.price} ${p.currency || "IRR"}`;
    return `
      <div class="bg-white rounded shadow p-4 flex flex-col">
        <img src="${p.image}" alt="${p.name}" class="h-40 object-cover mb-2 rounded cursor-pointer" onclick="showModal('${p.id}')">
        <h3 class="font-bold text-lg mb-1">${p.name}</h3>
        <p class="mb-2 text-gray-700">${priceText}</p>
        <button class="bg-blue-500 text-white px-3 py-1 mt-auto rounded" onclick="addToCart('${p.id}', '${p.name}')">Add to Cart</button>
      </div>
    `;
  }).join("");
}

// Filter by category
window.filterByCategory = (catId) => {
  const filtered = allProducts.filter(p => p.categories.includes(catId));
  renderProducts(filtered);
}

// Add to cart
window.addToCart = (id, name) => {
  cart.push({id, name});
  saveCart();
}

// Show product details in modal
window.showModal = (id) => {
  const p = allProducts.find(prod => prod.id === id);
  if (!p) return;
  let priceText = p.type === "variable" ? 
      `${p.price_min} – ${p.price_max} ${p.currency || "IRR"}` :
      `${p.price} ${p.currency || "IRR"}`;
  modalContent.innerHTML = `
    <img src="${p.image}" alt="${p.name}" class="h-64 w-full object-cover rounded mb-4">
    <h2 class="text-2xl font-bold mb-2">${p.name}</h2>
    <p class="text-gray-700 mb-2">${priceText}</p>
    <p class="mb-4">${p.description || ""}</p>
  `;
  modal.classList.remove("hidden");
}
