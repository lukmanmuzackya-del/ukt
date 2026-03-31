const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "toko_2",
  password: "postgres",
  port: 5432,
});

/* ================= MULTER CONFIG ================= */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.send("Backend UKT is running on port 5001 ✅");
});

/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {
  const { fullname, password, role } = req.body;

  try {
    const existingUser = await pool.query("SELECT * FROM users WHERE fullname=$1", [fullname]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Username/Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (fullname, password, role) VALUES ($1, $2, $3) RETURNING id_user, fullname, role",
      [fullname, hashedPassword, role]
    );
    res.status(201).json({ message: "User berhasil didaftarkan", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mendaftarkan user" });
  }
});

/* ================= LOGIN ================= */
app.post("/login", async (req, res) => {
  const { fullname, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE fullname=$1", [fullname]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Server error during login:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

/* ================= PRODUCTS ================= */
app.get("/products", async(req,res)=>{
  const result = await pool.query("SELECT * FROM products ORDER BY id_product");
  res.json(result.rows);
});

app.post("/products", upload.single('image'), async(req,res)=>{
  console.log("POST /products body:", req.body); // For debugging
  
  const { category_id, name, brand, size, color, price, stock, sku } = req.body;
  const image_url = req.file ? `uploads/${req.file.filename}` : null;

  // Defensive check for category_id
  const final_category_id = category_id || 1;

  try {
    const result = await pool.query(
      `INSERT INTO products
       (category_id, name, brand, size, color, price, stock, sku, image_url)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
       [final_category_id, name, brand, size, color, price || 0, stock || 0, sku, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database error adding product:", err);
    res.status(500).json({ message: "Gagal menambah produk: " + err.message });
  }
});

app.put("/products/:id", upload.single('image'), async(req,res)=>{
  console.log("PUT /products/:id body:", req.body); // For debugging

  const { category_id, name, brand, size, color, price, stock, sku } = req.body;
  let image_url = req.body.image_url;
  
  if (req.file) {
    image_url = `uploads/${req.file.filename}`;
  }

  const final_category_id = category_id || 1;

  try {
    const result = await pool.query(
      `UPDATE products
       SET category_id=$1, name=$2, brand=$3, size=$4, color=$5, price=$6, stock=$7, sku=$8, image_url=$9
       WHERE id_product=$10
       RETURNING *`,
       [final_category_id, name, brand, size, color, price || 0, stock || 0, sku, image_url, req.params.id]
    );

    if(result.rowCount===0)
      return res.status(404).json({message:"Produk tidak ditemukan"});

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database error updating product:", err);
    res.status(500).json({ message: "Gagal update produk: " + err.message });
  }
});

app.delete("/products/:id", async(req,res)=>{
  const result = await pool.query(
    "DELETE FROM products WHERE id_product=$1 RETURNING *",
    [req.params.id]
  );

  if(result.rowCount===0)
    return res.status(404).json({message:"Produk tidak ditemukan"});

  res.json({message:"Produk dihapus"});
});

/* ================= BELI (CHECKOUT) ================= */
app.post("/buy", async (req, res) => {
  const { user_id, items } = req.body;
  // items = [{id, qty, price}]

  try {
    let total_amount = 0;
    items.forEach((i) => (total_amount += i.qty * i.price));

    // 1. Insert into transactions
    const trx = await pool.query(
      "INSERT INTO transactions(user_id, total_amount, payment_method) VALUES($1, $2, $3) RETURNING id_transaction",
      [user_id, total_amount, "Cash"] // Default to Cash
    );

    const id_transaction = trx.rows[0].id_transaction;

    // 2. Insert items and update stock
    for (const i of items) {
      const subtotal = i.qty * i.price;
      
      await pool.query(
        "INSERT INTO transaction_items(transaction_id, product_id, quantity, price_at_sale, subtotal) VALUES($1, $2, $3, $4, $5)",
        [id_transaction, i.id, i.qty, i.price, subtotal]
      );

      await pool.query(
        "UPDATE products SET stock = stock - $1 WHERE id_product = $2",
        [i.qty, i.id]
      );
    }

    res.json({ message: "Transaksi berhasil", id_transaction });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Terjadi kesalahan saat checkout" });
  }
});

/* ================= REPORTS ================= */
app.get("/transactions", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id_transaction, t.transaction_date, t.total_amount, t.payment_method, u.fullname as user_name,
             json_agg(json_build_object('name', p.name, 'qty', ti.quantity, 'price', ti.price_at_sale)) as items
      FROM transactions t
      JOIN users u ON t.user_id = u.id_user
      JOIN transaction_items ti ON t.id_transaction = ti.transaction_id
      JOIN products p ON ti.product_id = p.id_product
      GROUP BY t.id_transaction, u.fullname
      ORDER BY t.transaction_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data laporan" });
  }
});

app.get("/transactions/:user_id", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id_transaction, t.transaction_date, t.total_amount, t.payment_method,
             json_agg(json_build_object('name', p.name, 'qty', ti.quantity, 'price', ti.price_at_sale)) as items
      FROM transactions t
      JOIN transaction_items ti ON t.id_transaction = ti.transaction_id
      JOIN products p ON ti.product_id = p.id_product
      WHERE t.user_id = $1
      GROUP BY t.id_transaction
      ORDER BY t.transaction_date DESC
    `, [req.params.user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil riwayat transaksi" });
  }
});

app.listen(5001,()=>console.log("SERVER READY http://localhost:5001"));