var cartItemsEl = document.getElementById("cartItems");
var totalPriceEl = document.getElementById("totalPrice");
var checkoutBtn = document.getElementById("checkoutBtn");
var cartCountEl = document.getElementById("cartCount");

var cart = [];
try{ var stored = localStorage.getItem("cart"); if(stored) cart = JSON.parse(stored); }catch(e){ console.error(e); }
if(cartCountEl) cartCountEl.textContent = cart.length;

function renderCart(){
  cartItemsEl.innerHTML = "";
  var total=0;
  for(var i=0;i<cart.length;i++){
    var li = document.createElement("li");
    li.textContent = cart[i].name + " - " + cart[i].price + " IRR";
    cartItemsEl.appendChild(li);
    total += cart[i].price;
  }
  totalPriceEl.textContent = total;
}

renderCart();

checkoutBtn.addEventListener("click", function(){
  if(cart.length===0){ alert("Cart is empty"); return; }
  var productsParam = cart.map(function(p){ return p.id + ":1"; }).join(",");
  window.location.href = "https://starly.ir/cart?products=" + encodeURIComponent(productsParam);
});
