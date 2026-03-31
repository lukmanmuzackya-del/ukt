import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Kasir"); // Default role
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");

    if (!fullname || !password || !role) {
      setError("Semua field wajib diisi!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registrasi gagal!");
        setLoading(false);
        return;
      }

      setLoading(false);
      alert("Registrasi berhasil! Silakan login.");
      navigate("/login"); // ✅ arahkan ke login
    } catch (err) {
      setError("Server tidak dapat dihubungi");
      setLoading(false);
    }
  };

  return (
    <div className="login-box">
      <h1>Register</h1>

      {error && (
        <p style={{ color: "red", marginBottom: "10px" }}>
          {error}
        </p>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
        <input
          type="text"
          placeholder="Username / Email"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
        />
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px", textAlign: "left" }}>
          *Bisa menggunakan email maupun username
        </p>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Kasir">Kasir</option>
          <option value="Admin">Admin</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Daftar Sekarang"}
        </button>
      </form>

      <p style={{ marginTop: "15px" }}>
        Sudah punya akun? <button onClick={() => navigate("/login")} style={{ background: "none", color: "#5f6fe8", padding: 0, width: "auto", boxShadow: "none", fontWeight: "bold" }}>Login</button>
      </p>
    </div>
  );
}

export default Register;
