function Header({ onLogout }) {
  return (
    <header className="menu-header">
      <h1>🛒 Toko Gallagher</h1>
      <button className="logout-btn" onClick={onLogout}>
        Logout
      </button>
    </header>
  );
}

export default Header;
