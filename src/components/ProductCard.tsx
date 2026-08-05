import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100 hover:border-electric-blue/20">
      <Link to={`/produit/${product.id}`}>
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.originalPrice && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-semibold bg-black bg-opacity-50 px-4 py-2 rounded-lg">Rupture de stock</span>
            </div>
          )}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors">
              <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
            </button>
          </div>
        </div>
      </Link>

      <div className="p-5">
        <Link to={`/produit/${product.id}`}>
          <h3 className="text-lg font-bold text-gray-800 mb-3 hover:text-electric-blue transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2 font-medium">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-electric-blue">
              {product.price}€
            </span>
            {product.originalPrice && (
              <span className="text-base text-gray-400 line-through font-medium">
                {product.originalPrice}€
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              product.inStock
                ? 'bg-electric-blue hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;