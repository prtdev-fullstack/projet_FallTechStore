import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Smartphone, User, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { getTotalItems } = useCart();
  const location = useLocation();

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Boutique', href: '/boutique' },
    { name: 'À propos', href: '/a-propos' },
    { name: 'Contact', href: '/contact' }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Smartphone className="h-10 w-10 text-electric-blue group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-dark-gray group-hover:text-electric-blue transition-colors">FallTech</span>
              <span className="text-xs text-gray-500 -mt-1">STORE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-blue-50 ${
                  isActive(item.href) 
                    ? 'text-electric-blue bg-blue-50' 
                    : 'text-gray-700 hover:text-electric-blue'
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-electric-blue rounded-full"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-3 text-gray-700 hover:text-electric-blue hover:bg-blue-50 rounded-lg transition-all duration-300"
            >
              <Search className="h-5 w-5" />
            </button>
            
            {/* Favorites (Hidden on mobile) */}
            <button className="hidden md:flex p-3 text-gray-700 hover:text-electric-blue hover:bg-blue-50 rounded-lg transition-all duration-300">
              <Heart className="h-5 w-5" />
            </button>
            
            {/* User Account (Hidden on mobile) */}
            <button className="hidden md:flex p-3 text-gray-700 hover:text-electric-blue hover:bg-blue-50 rounded-lg transition-all duration-300">
              <User className="h-5 w-5" />
            </button>
            
            {/* Cart */}
            <Link to="/panier" className="relative p-3 text-gray-700 hover:text-electric-blue hover:bg-blue-50 rounded-lg transition-all duration-300 group">
              <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-bounce">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 text-gray-700 hover:text-electric-blue hover:bg-blue-50 rounded-lg transition-all duration-300"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-6 border-t border-gray-100 animate-slide-up">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-300 text-lg"
              />
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-6 border-t border-gray-100 animate-slide-up">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                    isActive(item.href)
                      ? 'text-electric-blue bg-blue-50 border-l-4 border-electric-blue'
                      : 'text-gray-700 hover:text-electric-blue hover:bg-blue-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;