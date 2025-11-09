var API = "https://starly.webi-artin.workers.dev";

// المان‌ها
var categoriesEl = document.getElementById("categories");
var productsEl = document.getElementById("products");
var categoryTitle = document.getElementById("categoryTitle");
var cartCountEl = document.getElementById("cartCount");

// سبد خرید
var cart = [];
try {
  var storedCart = localStorage.getItem("cart");
  if (storedCart) cart = JSON.parse(storedCart);
} catch(e) {
  console.error("Error reading cart:", e);
}
if (cartCountEl) cartCountEl.textContent = cart.length;

// ----------------- دسته‌ها -----------------
if (categoriesEl) {
  fetch(API + "/categories")
    .then(function(res){ return res.json(); })
    .then(function(data){
      var cats = data.data || [];
      categoriesEl.innerHTML = "";
      cats.forEach(function(c, i){
        var div = document.createElement("div");
        div.className = "bg-white rounded shadow overflow-hidden cursor-pointer hover:shadow-lg transition";
        div.innerHTML = '<img src="'+ (c.image || 'https://via.placeholder.com/300') +'" class="h-40 w-full object-cover">' +
                        '<h3>'+ c.name +'</h3>';
        div.addEventListener("click", function(){
          window.location.href = "category.html?category=" + c.id;
        });
        categoriesEl.appendChild(div);
      });
    })
    .catch(function(err){ console.error("Error loading categories:", err); });
}

// ----------------- محصولات دسته -----------------
var urlParams = new URLSearchParams(window.location.search);
var categoryId = urlParams.get("category");

if (productsEl && categoryId) {
  fetch(API + "/products")
    .then(function(res){ return res.json(); })
    .then(function(data){
      var allProducts = data.data || [];
      var filtered = allProducts.filter(function(p){ return p.categories.indexOf(Number(categoryId)) !== -1; });

      var catName = filtered[0] && filtered[0].categories_names ?
                    (filtered[0].categories_names.find(function(c){ return c.id == categoryId; }) || {}).name
                    : "Products";
      if (categoryTitle) categoryTitle.textContent = catName;

      productsEl.innerHTML = "";
      filtered.forEach(function(p){
        var div = document.createElement("div");
        div.className = "bg-white rounded shadow p-4 flex flex-col hover:shadow-lg transition";
        var priceText = p.type === "variable" ?
                        (p.price_min + " – " + p.price_max + " " + (p.currency || "IRR")) :
                        (p.price + " " + (p.currency || "IRR"));
        div.innerHTML = '<img src="'+p.image+'" alt="'+p.name+'" class="h-40 object-cover mb-2 rounded cursor-pointer">' +
                        '<h3 class="font-bold text-lg mb-1">'+p.name+'</h3>' +
                        '<p class="mb-2 text-gray-700">'+priceText+'</p>' +
                        '<button class="bg-blue-500 text-white px-3 py-1 mt-auto rounded hover:bg-blue-600">Add to Cart</button>';
        var btn = div.querySelector("button");
        btn.addEventListener("click", function(){
          addToCart(p.id, p.name, p.price_min || p.price);
        });
        productsEl.appendChild(div);
      });
    })
    .catch(function(err){ console.error("Error loading products:", err); });
}

// ----------------- تابع افزودن به سبد -----------------
function addToCart(id, name, price) {
  cart.push({id: id, name: name, price: price});
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch(e){ console.error("Error saving cart:", e); }
  if (cartCountEl) cartCountEl.textContent = cart.length;
  alert(name + " added to cart");
}
