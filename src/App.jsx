import React, { useEffect, useState } from "react";

// آدرس پروکسی Cloudflare Worker (از .env)
const API_PROXY = import.meta.env.VITE_API_PROXY || process.env.REACT_APP_API_PROXY || "";
const PRODUCTS_PER_PAGE = 12;

// هوک برای سبد خرید در localStorage
function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  return [state, setState];
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedCat, setSelectedCat] = useState("");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useLocalStorage("starly-mini-cart", []);
  const [showCart, setShowCart] = useState(false);

  // بارگذاری دسته‌بندی‌ها
  useEffect(() => {
    fetchCategories();
  }, []);

  // بارگذاری محصولات با هر تغییر دسته یا جستجو
  useEffect(() => {
    fetchProducts(1, selectedCat, query, true);
  }, [selectedCat, query]);

  async function fetchCategories() {
    try {
      const res = await fetch(`${API_PROXY}/categories`);
      if (!res.ok) throw new Error("خطا در دریافت دسته‌بندی‌ها");
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchProducts(p = 1, category = "", q = "", replace = false) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("per_page", PRODUCTS_PER_PAGE);
      params.set("page", p);
      if (category) params.set("category", category);
      if (q) params.set("search", q);

      const res = await fetch(`${API_PROXY}/products?${params.toString()}`);
      if (!res.ok) throw new Error("خطا در دریافت محصولات");
      const data = await res.json();
      setProducts((prev) => (replace ? data : prev.concat(data)));
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function addToCart(product) {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists)
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      return prev.concat({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.src || "",
        qty: 1,
      });
    });
  }

  function updateQty(id, qty) {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
    );
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function cartCount() {
    return cart.reduce((s, i) => s + i.qty, 0);
  }

  function subtotal() {
    return cart
      .reduce((s, i) => s + parseFloat(i.price || 0) * i.qty, 0)
      .toFixed(2);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-blue-600">Starly Mini</h1>
            <span className="text-sm text-gray-500">
              فروشگاه کوچک GitHub Pages
            </span>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="جستجو..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-gray-100 rounded-lg px-3 py-1 text-sm"
            />
            <button
              onClick={() => window.open("https://starly.ir/wp-login.php")}
              className="text-sm text-blue-600 underline"
            >
              ورود به سایت اصلی
            </button>

            <button onClick={() => setShowCart(true)} className="relative">
              🛒
              {cartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
                  {cartCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="bg-white p-4 rounded-lg shadow md:col-span-1">
          <h3 className="font-semibold mb-3">دسته‌بندی‌ها</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCat("")}
              className={`px-3 py-1 rounded-full ${
                selectedCat === "" ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              همه
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1 rounded-full ${
                  selectedCat === cat.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Product Grid */}
        <section className="md:col-span-3">
          {loading && (
            <div className="text-center text-gray-500 py-8">در حال بارگذاری...</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-lg shadow p-4 flex flex-col hover:shadow-lg transition"
              >
                <div className="aspect-w-4 aspect-h-3 mb-3 overflow-hidden rounded">
                  <img
                    src={p.images?.[0]?.src || ""}
                    alt={p.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <div
                  className="text-sm text-gray-500 line-clamp-2 mt-1"
                  dangerouslySetInnerHTML={{
                    __html: p.short_description || "",
                  }}
                />
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div>
                    <div className="text-sm text-gray-600">قیمت</div>
                    <div className="font-bold">{p.price} تومان</div>
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    افزودن
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!loading && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() =>
                  fetchProducts(page + 1, selectedCat, query, false)
                }
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                بارگذاری بیشتر
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black bg-opacity-40"
            onClick={() => setShowCart(false)}
          />
          <div className="w-96 bg-white p-4 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">🛍️ سبد خرید</h3>
              <button onClick={() => setShowCart(false)}>✖️</button>
            </div>

            <div className="mt-4 space-y-4">
              {cart.length === 0 && (
                <div className="text-gray-500 text-sm text-center">
                  سبد خرید خالی است.
                </div>
              )}
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img
                    src={item.image}
                    className="w-16 h-16 object-cover rounded"
                    alt={item.name}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      قیمت: {item.price}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="px-2 bg-gray-200 rounded"
                      >
                        -
                      </button>
                      <div>{item.qty}</div>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="px-2 bg-gray-200 rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 text-sm"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between font-semibold">
                  جمع کل: {subtotal()} تومان
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      window.open("https://starly.ir/checkout", "_blank")
                    }
                    className="bg-green-600 text-white rounded-lg py-2 hover:bg-green-700"
                  >
                    پرداخت
                  </button>
                  <button
                    onClick={() =>
                      alert("برای همگام‌سازی سبد خرید نیاز به SSO است.")
                    }
                    className="bg-gray-200 rounded-lg py-2"
                  >
                    همگام‌سازی
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
