const API = "https://starly.webi-artin.workers.dev";

// المان‌ها
const categoriesEl = document.getElementById("categories");
const productsEl = document.getElementById("products");
const categoryTitle = document.getElementById("categoryTitle");
const cartCountEl = document.getElementById("cartCount");

// سبد خرید از localStorage
let cart = [];
try {
  const storedCart = localStorage.getItem("cart");
  if (storedCart) cart = JSON.parse(storedCart);
} catch(e) {
  console.error("Error reading cart from localStorage:", e);
}

// بروزرسانی تعداد سبد در منو
if (cartCountEl) {
  cartCountEl.textContent = cart.length.toString();
}

// ----------------- دسته‌بندی‌ها -----------------
if (categoriesEl) {
  fetch(`${API}/categories`)
    .then(res => res.json())
    .then(data => {
      const cats = data.data || [];
      categoriesEl.innerHTML = cats.map(c => `
        <div class="bg-white rounded shadow overflow-hidden cursor-pointer hover:shadow-lg transition">
          <img src="${c.image || 'https://via.placeholder.com/300'}" class="h-40 w-full object-cover">
          <h3>${c.name}</h3>
        </div>
      `).join("");

      // اضافه کردن event listener به کارت‌ها
      const cards = categoriesEl.querySelectorAll("div");
      cards.forEach((card, index) => {
        card.addEventListener("click", () => {
          window.location.href = `category.html?category=${cats[index].id}`;
        });
      });
    })
    .catch(err => console.error("Error loading categories:", err));
}

// ----------------- محصولات دسته -----------------
const urlParams = new URLSearchParams(window.location.search);
const categoryId = urlParams.get("category");

if (productsEl && categoryId) {
  fetch(`${API}/products`)
    .then(res => res.json())
    .then(data => {
      const allProducts = data.data || [];
      const filtered = allProducts.filter(p => p.categories.includes(Number(categoryId)));

      const catName = filtered[0]?.categories_names?.find(c => c.id == categoryId)?.name || "Products";
      if (categoryTitle) categoryTitle.textContent = catName;

      productsEl.innerHTML = filtered.map(p => {
        const priceText = p.type === "variable"
          ? `${p.price_min} – ${p.price_max} ${p.currency || "IRR"}`
          : `${p.price} ${p.currency || "IRR"}`;

        return `
          <div class="bg-white rounded shadow p-4 flex flex-col hover:shadow-lg transition">
            <img src="${p.image}" alt="${p.name}" class="h-40 object-cover mb-2 rounded cursor-pointer">
            <h3 class="font-bold text-lg mb-1">${p.name}</h3>
            <p class="mb-2 text-gray-700">${priceText}</p>
            <button class="bg-blue-500 text-white px-3 py-1 mt-auto rounded hover:bg-blue-600">
              Add to Cart
            </button>
          </div>
        `;
      }).join("");

      // اضافه کردن event listener برای همه دکمه‌ها
      const buttons = productsEl.querySelectorAll("button");
      buttons.forEach((btn, i) => {
        btn.addEventListener("click", () => {
          addToCart(filtered[i].id, filtered[i].name, filtered[i].price_min || filtered[i].price);
        });
      });
    })
    .catch(err => console.error("Error loading products:", err));
}

// ----------------- تابع افزودن به سبد -----------------
function addToCart(id, name, price) {
  cart.push({ id, name, price });
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch(e) {
    console.error("Error saving cart to localStorage:", e);
  }
  if (cartCountEl) cartCountEl.textContent = cart.length.toString();
  alert(`${name} added to cart`);
}
