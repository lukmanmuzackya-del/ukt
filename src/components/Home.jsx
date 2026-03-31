function Home({ onEnter }) {
  return (
    <div className="card">
      <div style={{ fontSize: "4rem" }}>👕</div>
      <h1 className="title">Toko Pakaian</h1>
      <p className="name">Lukman Muzacky</p>
      <p className="class">XI RPL B</p>

      <button className="btn" onClick={onEnter}>
        Masuk Toko
      </button>
    </div>
  );
}

export default Home;
