import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="font-inter">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/boutique" element={<Shop />} />
              <Route path="/produit/:id" element={<Product />} />
              <Route path="/panier" element={<Cart />} />
              <Route path="/commande" element={<Checkout />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;