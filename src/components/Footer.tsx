import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Instagram, Phone, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-gray text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Smartphone className="h-8 w-8 text-electric-blue" />
              <span className="text-xl font-bold">FallTech Store</span>
            </div>
            <p className="text-gray-300 mb-4">
              Votre boutique de confiance pour les derniers smartphones et accessoires. 
              Qualité premium, service client exceptionnel et prix compétitifs.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" className="text-gray-300 hover:text-electric-blue transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="tel:+33123456789" className="text-gray-300 hover:text-electric-blue transition-colors">
                <Phone className="h-6 w-6" />
              </a>
              <a href="https://wa.me/33123456789" className="text-gray-300 hover:text-electric-blue transition-colors">
                <MessageCircle className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/boutique" className="text-gray-300 hover:text-white transition-colors">
                  Boutique
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="text-gray-300 hover:text-white transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-300">
              <li>📱 +33 1 23 45 67 89</li>
              <li>📧 contact@falltech.fr</li>
              <li>📍 Paris, France</li>
              <li>🕒 Lun-Sam 9h-19h</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 FallTech Store. Tous droits réservés.</p>
          <div className="mt-2 space-x-4">
            <Link to="/mentions-legales" className="hover:text-white transition-colors">
              Mentions légales
            </Link>
            <Link to="/politique-confidentialite" className="hover:text-white transition-colors">
              Politique de confidentialité
            </Link>
            <Link to="/cgv" className="hover:text-white transition-colors">
              CGV
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;