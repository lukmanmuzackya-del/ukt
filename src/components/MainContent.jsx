function ProductCard({ name, price, quality, image }) {
  return (
    <div className="product-card">
      <img src={image} alt={name} className="product-image" />

      <h3>{name}</h3>
      <p className="price">Rp {price}</p>
      <p className="quality">Kualitas: {quality}</p>

      <button className="buy-btn">🛒 Beli</button>
    </div>
  )
}

export default ProductCard