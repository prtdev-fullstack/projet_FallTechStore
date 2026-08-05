import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Smartphone, MapPin, User, Mail, Phone, ArrowLeft, Lock } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Checkout: React.FC = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [formData, setFormData] = useState({
    // Informations personnelles
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Adresse de livraison
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    // Informations de paiement
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simuler le traitement de la commande
    alert('Commande confirmée ! Vous recevrez un email de confirmation.');
    clearCart();
  };

  const shippingCost = getTotalPrice() >= 50 ? 0 : 5.99;
  const totalWithShipping = getTotalPrice() + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
          <Link to="/boutique" className="text-electric-blue hover:underline">
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/panier"
            className="inline-flex items-center space-x-2 text-electric-blue hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au panier</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Finaliser ma commande</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de commande */}
          <div className="space-y-6">
            {/* Informations personnelles */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-6">
                <User className="h-5 w-5 text-electric-blue" />
                <h2 className="text-xl font-semibold">Informations personnelles</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Adresse de livraison */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-6">
                <MapPin className="h-5 w-5 text-electric-blue" />
                <h2 className="text-xl font-semibold">Adresse de livraison</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pays *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Luxembourg">Luxembourg</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Moyens de paiement */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-6">
                <CreditCard className="h-5 w-5 text-electric-blue" />
                <h2 className="text-xl font-semibold">Moyen de paiement</h2>
              </div>

              {/* Options de paiement */}
              <div className="space-y-4 mb-6">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPayment === 'card' ? 'border-electric-blue bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPayment('card')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={selectedPayment === 'card'}
                      onChange={() => setSelectedPayment('card')}
                      className="text-electric-blue"
                    />
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Carte bancaire</span>
                  </div>
                  <p className="text-sm text-gray-500 ml-8">Visa, Mastercard, American Express</p>
                </div>

                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPayment === 'paypal' ? 'border-electric-blue bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPayment('paypal')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={selectedPayment === 'paypal'}
                      onChange={() => setSelectedPayment('paypal')}
                      className="text-electric-blue"
                    />
                    <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <span className="font-medium">PayPal</span>
                  </div>
                  <p className="text-sm text-gray-500 ml-8">Paiement sécurisé avec PayPal</p>
                </div>

                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPayment === 'apple' ? 'border-electric-blue bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPayment('apple')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      value="apple"
                      checked={selectedPayment === 'apple'}
                      onChange={() => setSelectedPayment('apple')}
                      className="text-electric-blue"
                    />
                    <Smartphone className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Apple Pay</span>
                  </div>
                  <p className="text-sm text-gray-500 ml-8">Paiement rapide et sécurisé</p>
                </div>

                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPayment === 'transfer' ? 'border-electric-blue bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPayment('transfer')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      value="transfer"
                      checked={selectedPayment === 'transfer'}
                      onChange={() => setSelectedPayment('transfer')}
                      className="text-electric-blue"
                    />
                    <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs">€</span>
                    </div>
                    <span className="font-medium">Virement bancaire</span>
                  </div>
                  <p className="text-sm text-gray-500 ml-8">Paiement par virement SEPA</p>
                </div>
              </div>
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPayment === 'wave' ? 'border-electric-blue bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPayment('wave')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      value="wave"
                      checked={selectedPayment === 'wave'}
                      onChange={() => setSelectedPayment('wave')}
                      className="text-electric-blue"
                    />
                    <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">W</span>
                    </div>
                    <span className="font-medium">Wave</span>
                  </div>
                  <p className="text-sm text-gray-500 ml-8">Paiement mobile sécurisé avec Wave</p>
                </div>

                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPayment === 'orange' ? 'border-electric-blue bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPayment('orange')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      value="orange"
                      checked={selectedPayment === 'orange'}
                      onChange={() => setSelectedPayment('orange')}
                      className="text-electric-blue"
                    />
                    <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">O</span>
                    </div>
                    <span className="font-medium">Orange Money</span>
                  </div>
                  <p className="text-sm text-gray-500 ml-8">Paiement mobile avec Orange Money</p>
                </div>

              {/* Formulaire carte bancaire */}
              {selectedPayment === 'card' && (
                <div className="space-y-4 border-t pt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de carte *
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date d'expiration *
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/AA"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom sur la carte *
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Formulaire Wave */}
{selectedPayment === 'wave' && (
  <div className="space-y-4 border-t pt-6">
    <div className="flex items-center space-x-2">
      <img 
        src="https://kickstartafrica.com/wp-content/uploads/2020/12/94377508_918638458565635_5520442085410340864_o.png" 
        alt="Wave Logo" 
        className="h-6 w-auto" 
      />
      <label className="block text-sm font-medium text-gray-700">
        Numéro de téléphone Wave *
      </label>
    </div>
    <input
      type="tel"
      name="wavePhone"
      placeholder="+221 XX XXX XX XX"
      required
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
    />
    <div className="bg-blue-50 p-4 rounded-lg">
      <p className="text-sm text-blue-800">
        📱 Vous recevrez une notification Wave pour confirmer le paiement de {totalWithShipping.toFixed(2)}€
      </p>
    </div>
  </div>
)}



             {/* Formulaire Orange Money */}
{selectedPayment === 'orange' && (
  <div className="space-y-4 border-t pt-6">
    <div className="flex items-center space-x-2">
      <img 
        src="https://yt3.ggpht.com/a/AATXAJxbPZsfcmu5uhgxzUruur3I8hf-sMLcTXhqXQ=s900-c-k-c0xffffffff-no-rj-mo" 
        alt="Orange Money Logo" 
        className="h-6 w-auto" 
      />
      <label className="block text-sm font-medium text-gray-700">
        Numéro Orange Money *
      </label>
    </div>
    <input
      type="tel"
      name="orangePhone"
      placeholder="+221 XX XXX XX XX"
      required
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
    />
    <div className="bg-orange-50 p-4 rounded-lg">
      <p className="text-sm text-orange-800">
        📱 Composez #144# puis suivez les instructions pour valider le paiement de {totalWithShipping.toFixed(2)}€
      </p>
    </div>
  </div>
)}

            </div>
          </div>

          {/* Résumé de commande */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Résumé de commande</h2>
              
              {/* Articles */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <p className="text-gray-500 text-sm">Qté: {item.quantity}</p>
                    </div>
                    <span className="font-semibold">
                      {(item.product.price * item.quantity).toFixed(2)}€
                    </span>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-semibold">{getTotalPrice().toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-semibold">
                    {shippingCost === 0 ? 'Gratuite' : `${shippingCost.toFixed(2)}€`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span className="text-electric-blue">{totalWithShipping.toFixed(2)}€</span>
                </div>
              </div>

              {/* Bouton de commande */}
              <form onSubmit={handleSubmit} className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-electric-blue hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Lock className="h-5 w-5" />
                  <span>Confirmer ma commande</span>
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Paiement 100% sécurisé SSL
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;