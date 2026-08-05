import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones } from 'lucide-react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

const Home: React.FC = () => {
  const featuredProducts = products.slice(0, 6);
  const promotions = products.filter(p => p.category === 'promotions');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-electric-blue to-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Livraison rapide</h3>
              <p className="text-gray-600 text-lg">Livraison gratuite dès 50€ d'achat</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-electric-blue to-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Garantie assurée</h3>
              <p className="text-gray-600 text-lg">2 ans de garantie sur tous nos produits</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-electric-blue to-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Headphones className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Support 24/7</h3>
              <p className="text-gray-600 text-lg">Assistance client dédiée</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Produits populaires</h2>
            <p className="text-xl text-gray-600">Découvrez nos meilleures ventes</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/boutique"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-electric-blue to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 rounded-xl text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Voir tous les produits</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Promotions */}
      {promotions.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">🔥 Offres spéciales</h2>
              <p className="text-xl text-gray-600">Ne manquez pas nos promotions exceptionnelles</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {promotions.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;