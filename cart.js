let cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartItemsEl = document.getElementById("cartItems");
const totalPriceEl = document.getElementById("totalPrice");
const checkoutBtn = document.getElementById("checkoutBtn");

function renderCart() {
  cartItemsEl.innerHTML = cart.map(item => `<li>${item.name} - ${item.price} IRR</li>`).join("");
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  totalPriceEl.textContent = total;
}

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return alert("Cart is empty");
  // Encode products in URL query string
  const productsParam = cart.map(p => `${p.id}:1`).join(",");
  window.location.href = `https://starly.ir/cart?products=${encodeURIComponent(productsParam)}`;
});

renderCart();
