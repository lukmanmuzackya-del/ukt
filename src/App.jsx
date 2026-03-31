import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000";

export default function App() {
  const [page, setPage] = useState("login");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const [newProduct, setNewProduct] = useState({
    category_id: "",
    sku: "",
    name: "",
    brand: "",
    size: "",
    color: "",
    price: "",
    stock: ""
  });

  const loadProducts = async () => {
    const res = await axios.get(API + "/products");
    setProducts(res.data);
  };

  useEffect(() => {
    if (page === "shop") loadProducts();
  }, [page]);

  /* ================= LOGIN ================= */
  const login = async () => {
    try {
      const res = await axios.post(API + "/login", { fullname, password });
      setUser(res.data.user);
      setPage("dashboard");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    }
  };

  const logout = () => {
    setUser(null);
    setPage("login");
    setCart([]);
  };

  /* ================= CART ================= */
  const addToCart = (p) => {
    setCart([...cart, p]);
  };

  const total = cart.reduce((sum, p) => sum + Number(p.price), 0);

  const checkout = async () => {
    for (let p of cart) {
      await axios.put(API + "/products/" + p.id_product + "/buy");
    }
    alert("Transaksi berhasil!");
    setCart([]);
    loadProducts();
  };

  /* ================= ADMIN ================= */
  const addProduct = async () => {
    await axios.post(API + "/products", newProduct);
    alert("Produk ditambahkan");
    setPage("shop");
    loadProducts();
  };

  const del = async (id) => {
    await axios.delete(API + "/products/" + id);
    loadProducts();
  };

  /* ================= LOGIN PAGE ================= */
  if (page === "login") {
    return (
      <div className="login-box">
        <h1>Zak Stuff</h1>
        {error && <p style={{color:"red"}}>{error}</p>}
        <input placeholder="Username" onChange={e=>setFullname(e.target.value)} />
        <input type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />
        <button onClick={login}>Login</button>
      </div>
    );
  }

  /* ================= DASHBOARD ================= */
  if (page === "dashboard") {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <h2>{user.fullname} ({user.role})</h2>
        <button onClick={()=>setPage("shop")}>🛒 Buka Toko</button>
        {user.role==="Admin" && <button onClick={()=>setPage("add")}>➕ Tambah Produk</button>}
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  /* ================= ADD PRODUCT ================= */
  if (page === "add") {
    return (
      <div className="checkout">
        <h2>Tambah Produk</h2>
        {Object.keys(newProduct).map(k=>(
          <input key={k} placeholder={k} onChange={e=>setNewProduct({...newProduct,[k]:e.target.value})}/>
        ))}
        <button onClick={addProduct}>Simpan</button>
        <button onClick={()=>setPage("dashboard")}>Kembali</button>
      </div>
    );
  }

  /* ================= SHOP ================= */
  return (
    <div>
      <h2>Shop</h2>
      <button onClick={()=>setPage("dashboard")}>Dashboard</button>
      <button onClick={logout}>Logout</button>

      <h3>🛒 Keranjang: Rp {total.toLocaleString()}</h3>
      <button onClick={checkout}>Bayar</button>

      {products.map(p=>(
        <div key={p.id_product}>
          <h3>{p.name}</h3>
          <p>{p.brand}</p>
          <p>Rp {p.price}</p>
          <p>Stok {p.stock}</p>
          <button onClick={()=>addToCart(p)}>Tambah</button>
          {user.role==="Admin" && <button onClick={()=>del(p.id_product)}>Hapus</button>}
        </div>
      ))}
    </div>
  );
}