var API = "https://starly.webi-artin.workers.dev";

var categoriesEl = document.getElementById("categories");
var productsEl = document.getElementById("products");
var categoryTitle = document.getElementById("categoryTitle");
var cartCountEl = document.getElementById("cartCount");

var cart = [];
try{ var stored = localStorage.getItem("cart"); if(stored) cart = JSON.parse(stored);}catch(e){console.error(e);}
if(cartCountEl) cartCountEl.textContent = cart.length;

// دسته‌ها
if(categoriesEl){
  fetch(API + "/categories")
    .then(function(res){ return res.json(); })
    .then(function(data){
      var cats = data.data || [];
      categoriesEl.innerHTML = "";
      for(var i=0;i<cats.length;i++){
        (function(c){
          var div = document.createElement("div");
          div.className = "card";
          div.textContent = c.name;
          div.addEventListener("click", function(){
            window.location.href = "category.html?category=" + c.id;
          });
          categoriesEl.appendChild(div);
        })(cats[i]);
      }
    })
    .catch(function(err){ console.error(err); });
}

// محصولات دسته
var urlParams = new URLSearchParams(window.location.search);
var categoryId = urlParams.get("category");

if(productsEl && categoryId){
  fetch(API + "/products")
    .then(function(res){ return res.json(); })
    .then(function(data){
      var allProducts = data.data || [];
      var filtered = allProducts.filter(function(p){ return p.categories.indexOf(Number(categoryId))!==-1; });
      var catName = (filtered[0] && filtered[0].categories_names) ?
                    (function(){
                      for(var j=0;j<filtered[0].categories_names.length;j++){
                        if(filtered[0].categories_names[j].id==categoryId) return filtered[0].categories_names[j].name;
                      }
                      return "Products";
                    })()
                    : "Products";
      if(categoryTitle) categoryTitle.textContent = catName;

      productsEl.innerHTML = "";
      for(var k=0;k<filtered.length;k++){
        (function(p){
          var div = document.createElement("div");
          div.className = "card";
          var priceText = p.type==="variable"? (p.price_min + " – " + p.price_max + " IRR") : (p.price + " IRR");
          div.textContent = p.name + " - " + priceText;

          var btn = document.createElement("button");
          btn.textContent = "Add to Cart";
          btn.addEventListener("click", function(){
            addToCart(p.id,p.name,p.price_min||p.price);
          });
          div.appendChild(btn);
          productsEl.appendChild(div);
        })(filtered[k]);
      }
    })
    .catch(function(err){ console.error(err); });
}

function addToCart(id,name,price){
  cart.push({id:id,name:name,price:price});
  try{ localStorage.setItem("cart",JSON.stringify(cart)); }catch(e){console.error(e);}
  if(cartCountEl) cartCountEl.textContent = cart.length;
  alert(name + " added to cart");
}
