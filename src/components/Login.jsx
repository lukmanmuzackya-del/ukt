import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!fullname || !password) {
      setError("Username dan password wajib diisi!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullname, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Username atau password salah!");
        setLoading(false);
        return;
      }

      // Login sukses
      setUser(data.user);
      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Server tidak dapat dihubungi. Pastikan backend menyala.");
      setLoading(false);
    }
  };

  return (
    <div className="login-box">
      <h1>Zak Stuff</h1>
      <p style={{ marginBottom: "15px", color: "#666" }}>Silakan masuk ke akun Anda</p>

      {error && (
        <p style={{ color: "red", backgroundColor: "#ffebeb", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "14px" }}>
          {error}
        </p>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <input
          type="text"
          placeholder="Username / Email"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Menghubungkan..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: "15px" }}>
        Belum punya akun? <button onClick={() => navigate("/register")} style={{ background: "none", color: "#5f6fe8", padding: 0, width: "auto", boxShadow: "none", fontWeight: "bold" }}>Daftar di sini</button>
      </p>
    </div>
  );
}

export default Login;
