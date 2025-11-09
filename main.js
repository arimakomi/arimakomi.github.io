const API = "https://starly.webi-artin.workers.dev";

const categoriesEl = document.getElementById("categories");
const productsEl = document.getElementById("products");
const cartEl = document.getElementById("cart");
const clearBtn = document.getElementById("clearCart");

// Load categories
fetch(`${API}/categories`)
  .then(res => res.json())
  .then(data => {
    const cats = data.data || [];
    categoriesEl.innerHTML = cats.map(c => `<li>${c.name}</li>`).join("");
  })
  .catch(err => console.error(err));

// Load products
fetch(`${API}/products`)
  .then(res => res.json())
  .then(data => {
    const products = data.data || [];
    productsEl.innerHTML = products.map(p => `
      <div class="bg-white p-4 rounded shadow">
        <h3 class="font-bold">${p.name}</h3>
        <p>${p.price} ${p.currency || "IRR"}</p>
        <button class="bg-blue-500 text-white px-3 py-1 mt-2 rounded" onclick="addToCart('${p.id}', '${p.name}')">Add to Cart</button>
      </div>
    `).join("");
  })
  .catch(err => console.error(err));

// Cart functions
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(id, name) {
  cart.push({id, name});
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  cartEl.innerHTML = cart.map(item => `<li>${item.name}</li>`).join("");
}

clearBtn.addEventListener("click", () => {
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
});

// Initial render
renderCart();
