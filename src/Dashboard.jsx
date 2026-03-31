import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const API = "http://localhost:5001";

export default function Dashboard({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [view, setView] = useState("list");

  const [newProduct, setNewProduct] = useState({
    category_id: "",
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
    loadProducts();
  }, []);

  const buyProduct = async (id) => {
    await axios.put(API + "/products/" + id + "/stock");
    loadProducts();
  }
}