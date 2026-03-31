const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "toko_1",
  password: "postgres",
  port: 5432,
});

/* ================= LOGIN ================= */
app.post("/login", async (req,res)=>{
  const { fullname, password } = req.body;

  const user = await pool.query(
    "SELECT * FROM users WHERE fullname=$1 AND password=$2",
    [fullname,password]
  );

  if(user.rows.length===0){
    return res.status(401).json({message:"Username atau password salah"});
  }

  res.json({ user:user.rows[0] });
});

/* ================= PRODUCTS ================= */
app.get("/products", async(req,res)=>{
  const result = await pool.query("SELECT * FROM products ORDER BY id_product");
  res.json(result.rows);
});

app.post("/products", async(req,res)=>{
  const { category_id,name,brand,size,color,price,stock,sku } = req.body;

  const result = await pool.query(
    `INSERT INTO products
     (category_id,name,brand,size,color,price,stock,sku)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
     [category_id,name,brand,size,color,price,stock,sku]
  );

  res.json(result.rows[0]);
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

/* ================= BELI ================= */
app.post("/buy", async(req,res)=>{
  const { user_id, items } = req.body;
  // items = [{id,qty,price}]

  let total = 0;
  items.forEach(i=> total += i.qty * i.price);

  const trx = await pool.query(
    "INSERT INTO transactions(user_id,total) VALUES($1,$2) RETURNING id",
    [user_id,total]
  );

  const trx_id = trx.rows[0].id;

  for(const i of items){
    await pool.query(
      "INSERT INTO transaction_items(transaction_id,product_id,qty,price) VALUES($1,$2,$3,$4)",
      [trx_id,i.id,i.qty,i.price]
    );

    await pool.query(
      "UPDATE products SET stock=stock-$1 WHERE id_product=$2",
      [i.qty,i.id]
    );
  }

  res.json({message:"Transaksi berhasil", transaction_id:trx_id});
});

app.listen(5000,()=>console.log("SERVER READY http://localhost:5000"));