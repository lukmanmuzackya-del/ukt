import { useState } from "react";

function Login({ onLogin }) {
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    // validasi input kosong
    if (!fullname || !password) {
      setError("Username dan password wajib diisi!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: fullname,
          password: password,
        }),
      });

      const data = await response.json();

      // jika login gagal
      if (!response.ok) {
        setError(data.message || "Username atau password salah!");
        setLoading(false);
        return;
      }

      // simpan token
      localStorage.setItem("token", data.token);

      setLoading(false);
      onLogin(); // ✅ login berhasil
    } catch (err) {
      setError("Server tidak dapat dihubungi");
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1 className="title">Login</h1>

      {error && (
        <p style={{ color: "red", marginBottom: "10px" }}>
          {error}
        </p>
      )}

      <input
        type="text"
        placeholder="Full Name"
        className="input"
        value={fullname}
        onChange={(e) => setFullname(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn" onClick={handleLogin} disabled={loading}>
        {loading ? "Loading..." : "Masuk"}
      </button>
    </div>
  );
}

export default Login;
