import { useEffect, useState } from "react";
import axios from "axios";
import { Routes, Route, useNavigate, Navigate, useLocation, useParams } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import "./App.css";

const API = "http://localhost:5001";

/* ================= LAYOUT COMPONENT ================= */
function MainLayout({ user, logout, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return <Navigate to="/login" />;

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: "📊" },
    { label: "Buka Toko", path: "/shop", icon: "🛒" },
    { label: "Riwayat Transaksi", path: "/history", icon: "📜" },
  ];

  if (user.role === "Admin") {
    navItems.push({ label: "Tambah Produk", path: "/add", icon: "➕" });
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div style={{ padding: "0 20px", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "24px", color: "var(--primary)" }}>Zak Stuff</h1>
          <p style={{ fontSize: "12px", color: "var(--text-light)" }}>{user.fullname}</p>
        </div>
        
        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <div
              key={item.path}
              className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span>{item.icon}</span> {item.label}
            </div>
          ))}
        </nav>

        <div className="nav-link logout-nav" onClick={logout}>
          <span>👋</span> Logout
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

/* ================= PRODUCT FORM COMPONENT ================= */
function ProductForm({ initialData, onSubmit, title, subtitle }) {
  const [product, setProduct] = useState(initialData || {
    category_id: "1",
    sku: "",
    name: "",
    brand: "",
    size: "",
    color: "",
    price: "",
    stock: "",
    image_url: ""
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialData?.image_url ? `${API}/${initialData.image_url}` : null);

  useEffect(() => {
    if (initialData) {
      setProduct(initialData);
      setPreview(initialData.image_url ? `${API}/${initialData.image_url}` : null);
    }
  }, [initialData]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <header style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px" }}>{title}</h1>
        <p style={{ color: "var(--text-light)" }}>{subtitle}</p>
      </header>

      <form className="glass-card" onSubmit={(e) => { e.preventDefault(); onSubmit(product, file); }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", display: "block" }}>Nama Produk</label>
            <input name="name" className="input-field" value={product.name} placeholder="Contoh: Jersey UKT" onChange={handleChange} required />
          </div>
          <div>
            <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", display: "block" }}>Brand</label>
            <input name="brand" className="input-field" value={product.brand} placeholder="Contoh: Nike" onChange={handleChange} required />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
          <div>
            <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", display: "block" }}>Size</label>
            <input name="size" className="input-field" value={product.size} placeholder="XL" onChange={handleChange} />
          </div>
          <div>
            <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", display: "block" }}>Color</label>
            <input name="color" className="input-field" value={product.color} placeholder="Red" onChange={handleChange} />
          </div>
          <div>
            <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", display: "block" }}>Stock</label>
            <input name="stock" type="number" className="input-field" value={product.stock} placeholder="10" onChange={handleChange} required />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", display: "block" }}>Price (IDR)</label>
            <input name="price" type="number" className="input-field" value={product.price} placeholder="150000" onChange={handleChange} required />
          </div>
          <div>
            <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", display: "block" }}>SKU</label>
            <input name="sku" className="input-field" value={product.sku} placeholder="JKT-001" onChange={handleChange} />
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", display: "block" }}>Foto Produk</label>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginBottom: "10px" }} />
          {preview && (
            <div style={{ marginTop: "10px" }}>
              <img src={preview} alt="Preview" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd" }} />
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary" style={{ width: "100%" }}>
          {initialData ? "Update Produk" : "Simpan Produk"}
        </button>
      </form>
    </div>
  );
}

/* ================= DASHBOARD COMPONENT ================= */
function DashboardView({ user, logout, products, loadProducts }) {
  const navigate = useNavigate();
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    if (user?.role === "Admin") {
      const fetchRecent = async () => {
        try {
          const res = await axios.get(`${API}/transactions`);
          setRecentSales(res.data.slice(0, 5));
        } catch (err) {
          console.error("Gagal ambil recent sales", err);
        }
      };
      fetchRecent();
    }
  }, [user]);

  return (
    <MainLayout user={user} logout={logout}>
      <header style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px" }}>Hello, {user?.fullname ? user.fullname.split('@')[0] : "User"}!</h1>
        <p style={{ color: "var(--text-light)" }}>Selamat datang kembali di dashboard Anda.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => { navigate("/shop"); loadProducts(); }}>
          <h3>Store Inventory</h3>
          <div className="value">🛒 Shop Now</div>
          <p style={{ fontSize: "14px", color: "var(--text-light)" }}>Explore and buy products</p>
        </div>
        
        {user?.role === "Admin" && (
          <div className="stat-card" onClick={() => navigate("/add")}>
            <h3>Product Management</h3>
            <div className="value">➕ Add Items</div>
            <p style={{ fontSize: "14px", color: "var(--text-light)" }}>Add new stock to the shop</p>
          </div>
        )}

        <div className="stat-card" onClick={() => navigate("/history")}>
          <h3>Transaction Report</h3>
          <div className="value">📜 History</div>
          <p style={{ fontSize: "14px", color: "var(--text-light)" }}>View order logs</p>
        </div>
      </div>

      {user?.role === "Admin" && recentSales.length > 0 && (
        <div style={{ marginTop: "50px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Riwayat Transaksi Kasir</h2>
          <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Kasir</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map(t => (
                  <tr key={t.id_transaction}>
                    <td>{new Date(t.transaction_date).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ fontWeight: "600" }}>{t.user_name}</td>
                    <td>
                      <div style={{ fontSize: "13px", color: "var(--text-light)" }}>
                        {t.items.map((item, idx) => (
                          <span key={idx}>{item.name}{idx < t.items.length - 1 ? ", " : ""}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontWeight: "700", color: "var(--primary)" }}>Rp {Number(t.total_amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

/* ================= HISTORY PAGE ================= */
function HistoryPage({ user, logout }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const url = user.role === "Admin" ? `${API}/transactions` : `${API}/transactions/${user.id_user}`;
        const res = await axios.get(url);
        setHistory(res.data);
      } catch (err) {
        console.error("Gagal mengambil riwayat", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <MainLayout user={user} logout={logout}>
      <header style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px" }}>Riwayat Transaksi</h1>
        <p style={{ color: "var(--text-light)" }}>{user.role === "Admin" ? "Semua transaksi di toko Anda." : "Daftar pesanan yang pernah Anda beli."}</p>
      </header>

      {loading ? (
        <p>Memuat data...</p>
      ) : history.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "60px" }}>
          <p style={{ fontSize: "18px", color: "var(--text-light)" }}>Belum ada riwayat transaksi.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tanggal</th>
                {user.role === "Admin" && <th>Pelanggan</th>}
                <th>Produk</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((t) => (
                <tr key={t.id_transaction}>
                  <td>#{t.id_transaction}</td>
                  <td>{new Date(t.transaction_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  {user.role === "Admin" && <td>{t.user_name}</td>}
                  <td>
                    <div style={{ fontSize: "14px" }}>
                      {t.items.map((item, idx) => (
                        <div key={idx}>{item.name} (x{item.qty})</div>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontWeight: "700", color: "var(--primary)" }}>Rp {Number(t.total_amount).toLocaleString()}</td>
                  <td><span className="badge-status">Selesai</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
}

/* ================= EDIT PAGE WRAPPER ================= */
function EditPage({ products, onUpdate, user, logout }) {
  const { id } = useParams();
  const product = products.find(p => String(p.id_product) === id);

  if (!product && products.length > 0) return <Navigate to="/shop" />;

  return (
    <MainLayout user={user} logout={logout}>
      <ProductForm 
        title="Edit Produk" 
        subtitle="Ubah informasi produk di bawah ini." 
        initialData={product} 
        onSubmit={(data, file) => onUpdate(id, data, file)} 
      />
    </MainLayout>
  );
}

/* ================= MAIN APP ================= */
export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await axios.get(API + "/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Gagal mengambil produk", err);
    }
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    navigate("/login");
  };

  /* ================= CART ================= */
  const addToCart = (p) => {
    setCart([...cart, p]);
  };

  const total = cart.reduce((sum, p) => sum + Number(p.price), 0);

  const checkout = async () => {
    if (cart.length === 0) return alert("Keranjang masih kosong");
    try {
      const checkoutData = {
        user_id: user.id_user,
        items: cart.map(p => ({
          id: p.id_product,
          qty: 1,
          price: p.price
        }))
      };

      await axios.post(API + "/buy", checkoutData);
      
      alert("Transaksi berhasil!");
      setCart([]);
      loadProducts();
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Terjadi kesalahan saat checkout");
    }
  };

  /* ================= ADMIN ACTIONS ================= */
  const addProduct = async (data, file) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    if (file) formData.append('image', file);

    try {
      await axios.post(API + "/products", formData);
      alert("Produk ditambahkan");
      navigate("/shop");
      loadProducts();
    } catch (err) {
      alert("Gagal menambah produk");
    }
  };

  const updateProduct = async (id, data, file) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image_url' && file) return;
      formData.append(key, data[key]);
    });
    if (file) formData.append('image', file);

    try {
      await axios.put(API + "/products/" + id, formData);
      alert("Produk berhasil diperbarui");
      navigate("/shop");
      loadProducts();
    } catch (err) {
      alert("Gagal update produk");
    }
  };

  const del = async (id) => {
    if (window.confirm("Hapus produk ini?")) {
      await axios.delete(API + "/products/" + id);
      loadProducts();
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      
      <Route path="/login" element={
        <div className="login-page">
          <Login setUser={setUser} />
        </div>
      } />

      <Route path="/register" element={
        <div className="login-page">
          <Register />
        </div>
      } />

      <Route path="/dashboard" element={
        <DashboardView user={user} logout={logout} products={products} loadProducts={loadProducts} />
      } />

      <Route path="/add" element={
        <MainLayout user={user} logout={logout}>
          <ProductForm 
            title="Tambah Produk Baru" 
            subtitle="Lengkapi form di bawah untuk menambah stok." 
            onSubmit={addProduct} 
          />
        </MainLayout>
      } />

      <Route path="/edit/:id" element={
        <EditPage products={products} onUpdate={updateProduct} user={user} logout={logout} />
      } />

      <Route path="/history" element={
        <HistoryPage user={user} logout={logout} />
      } />

      <Route path="/shop" element={
        <MainLayout user={user} logout={logout}>
          <div className="shop-header">
            <div>
              <h1 style={{ fontSize: "28px" }}>Store Catalog</h1>
              <p style={{ color: "var(--text-light)" }}>Pilih produk yang ingin Anda beli.</p>
            </div>
            
            <div className="glass-card" style={{ padding: "15px 25px", display: "flex", alignItems: "center", gap: "20px" }}>
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-light)" }}>Total Cart</p>
                <p style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary)" }}>Rp {total.toLocaleString()}</p>
              </div>
              <button className="btn-primary" onClick={checkout} style={{ padding: "10px 20px" }}>Checkout</button>
            </div>
          </div>

          <div className="product-grid">
            {products.map(p => (
              <div key={p.id_product} className="product-card">
                {p.image_url ? (
                  <img src={`${API}/${p.image_url}`} alt={p.name} className="product-image" />
                ) : (
                  <div className="product-placeholder">No Image</div>
                )}
                <h3>{p.name}</h3>
                <p className="brand">{p.brand}</p>
                <p className="price">Rp {Number(p.price).toLocaleString()}</p>
                <p className="stock">Stok {p.stock}</p>
                
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button className="btn-primary" style={{ flex: 1, padding: "10px" }} onClick={() => addToCart(p)}>Beli</button>
                  {user?.role === "Admin" && (
                    <>
                      <button className="btn-primary" style={{ background: "#f1f2f6", color: "#333", padding: "10px", boxShadow: "none" }} onClick={() => navigate("/edit/" + p.id_product)}>✏️</button>
                      <button className="btn-danger" style={{ padding: "10px" }} onClick={() => del(p.id_product)}>🗑️</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </MainLayout>
      } />
    </Routes>
  );
}
