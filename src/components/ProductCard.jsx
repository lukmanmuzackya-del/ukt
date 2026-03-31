function ProductCard({ name, price, quality, image, onBuy }) {
  return (
    <div className="product-card">
      <img src={image} alt={name} className="product-image" />
      <h3>{name}</h3>
      <p className="price">Rp {price.toLocaleString()}</p>
      <p>{quality}</p>
      <button className="buy-btn" onClick={onBuy}>
        🛒 Beli
      </button>
    </div>
  );
}

export default ProductCard;
