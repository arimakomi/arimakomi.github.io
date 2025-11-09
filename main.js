const API = "https://starly.webi-artin.workers.dev";

const categoriesEl = document.getElementById("categories");
const productsEl = document.getElementById("products");
const categoryTitle = document.getElementById("categoryTitle");
const productDetailsEl = document.getElementById("productDetails");

// Get categoryId or productId from URL
const urlParams = new URLSearchParams(window.location.search);
const categoryId = urlParams.get("category");
const productId = urlParams.get("product");

let allProducts = [];

// Load categories on index.html
if (categoriesEl) {
  fetch(`${API}/categories`)
    .then(res => res.json())
    .then(data => {
      const cats = data.data || [];
      categoriesEl.innerHTML = cats.map(c => `
        <li class="bg-blue-100 text-blue-700 px-3 py-1 rounded cursor-pointer text-center"
            onclick="window.location='category.html?category=${c.id}'">
          ${c.name}
        </li>
      `).join("");
    });
}

// Load products for category.html
if (productsEl && categoryId) {
  fetch(`${API}/products`)
    .then(res => res.json())
    .then(data => {
      allProducts = data.data || [];
      const filtered = allProducts.filter(p => p.categories.includes(Number(categoryId)));
      const categoryName = filtered[0]?.categories_names?.find(c => c.id == categoryId)?.name || "Products";
      categoryTitle.textContent = categoryName;
      renderProducts(filtered);
    });
}

function renderProducts(products) {
  productsEl.innerHTML = products.map(p => {
    let priceText = p.type === "variable" ?
      `${p.price_min} – ${p.price_max} ${p.currency || "IRR"}` :
      `${p.price} ${p.currency || "IRR"}`;
    return `
      <div class="bg-white rounded shadow p-4 flex flex-col">
        <img src="${p.image}" alt="${p.name}" class="h-40 object-cover mb-2 rounded cursor-pointer"
             onclick="window.location='product.html?product=${p.id}'">
        <h3 class="font-bold text-lg mb-1">${p.name}</h3>
        <p class="mb-2 text-gray-700">${priceText}</p>
        <button class="bg-blue-500 text-white px-3 py-1 mt-auto rounded"
                onclick="addToCart('${p.id}', '${p.name}', ${p.price_min || p.price})">
          Add to Cart
        </button>
      </div>
    `;
  }).join("");
}

// Load product details for product.html
if (productDetailsEl && productId) {
  fetch(`${API}/products`)
    .then(res => res.json())
    .then(data => {
      const p = data.data.find(pr => pr.id == productId);
      if (!p) return;
      let priceText = p.type === "variable" ?
        `${p.price_min} – ${p.price_max} ${p.currency || "IRR"}` :
        `${p.price} ${p.currency || "IRR"}`;
      productDetailsEl.innerHTML = `
        <img src="${p.image}" alt="${p.name}" class="h-64 w-full object-cover rounded mb-4">
        <h2 class="text-2xl font-bold mb-2">${p.name}</h2>
        <p class="text-gray-700 mb-2">${priceText}</p>
        <p class="mb-4">${p.description || ""}</p>
        <button class="bg-blue-500 text-white px-3 py-1 rounded"
                onclick="addToCart('${p.id}', '${p.name}', ${p.price_min || p.price})">
          Add to Cart
        </button>
      `;
    });
}

// Cart functions
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(id, name, price) {
  cart.push({id, name, price});
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${name} added to cart`);
}
