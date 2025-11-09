const API = "https://starly.webi-artin.workers.dev";
const categoriesEl = document.getElementById("categories");
const productsEl = document.getElementById("products");
const categoryTitle = document.getElementById("categoryTitle");
const cartCountEl = document.getElementById("cartCount");

let allProducts = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
cartCountEl?.textContent = cart.length;

// Load categories
if (categoriesEl) {
  fetch(`${API}/categories`)
    .then(res => res.json())
    .then(data => {
      const cats = data.data || [];
      categoriesEl.innerHTML = cats.map(c => `
        <div class="bg-white rounded shadow overflow-hidden cursor-pointer hover:shadow-lg transition">
          <img src="${c.image || 'https://via.placeholder.com/300'}" class="h-40 w-full object-cover">
          <div class="p-3">
            <h3 class="font-bold text-lg text-center">${c.name}</h3>
          </div>
        </div>
      `).join("");

      // Add click listener to each category card
      const cards = categoriesEl.querySelectorAll("div");
      cards.forEach((card, i) => {
        card.addEventListener("click", () => {
          window.location.href = `category.html?category=${cats[i].id}`;
        });
      });
    });
}

// Load products for category
const urlParams = new URLSearchParams(window.location.search);
const categoryId = urlParams.get("category");
if (productsEl && categoryId) {
  fetch(`${API}/products`)
    .then(res => res.json())
    .then(data => {
      allProducts = data.data || [];
      const filtered = allProducts.filter(p => p.categories.includes(Number(categoryId)));
      categoryTitle.textContent = filtered[0]?.categories_names?.find(c => c.id == categoryId)?.name || "Products";

      productsEl.innerHTML = filtered.map(p => {
        let priceText = p.type === "variable" ? 
          `${p.price_min} – ${p.price_max} ${p.currency || "IRR"}` :
          `${p.price} ${p.currency || "IRR"}`;
        return `
          <div class="bg-white rounded shadow p-4 flex flex-col hover:shadow-lg transition">
            <img src="${p.image}" alt="${p.name}" class="h-40 object-cover mb-2 rounded cursor-pointer">
            <h3 class="font-bold text-lg mb-1">${p.name}</h3>
            <p class="mb-2 text-gray-700">${priceText}</p>
            <button class="bg-blue-500 text-white px-3 py-1 mt-auto rounded hover:bg-blue-600"
              onclick="addToCart('${p.id}','${p.name}', ${p.price_min || p.price})">
              Add to Cart
            </button>
          </div>
        `;
      }).join("");
    });
}

// Add to cart
window.addToCart = (id, name, price) => {
  cart.push({id, name, price});
  localStorage.setItem("cart", JSON.stringify(cart));
  cartCountEl.textContent = cart.length;
  alert(`${name} added to cart`);
}
