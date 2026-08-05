import React from 'react';
import { Award, Users, Heart, Target } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">À propos de FallTech Store</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Votre partenaire de confiance pour les technologies mobiles depuis 2020. 
            Nous nous engageons à vous offrir les meilleurs produits et un service client exceptionnel.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Histoire</h2>
              <p className="text-gray-600 mb-4">
                FallTech Store a été créé avec une mission simple : rendre la technologie mobile 
                accessible à tous, avec des produits de qualité et un service client personnalisé.
              </p>
              <p className="text-gray-600 mb-4">
                Depuis nos débuts, nous avons servi plus de 10 000 clients satisfaits et nous 
                continuons à grandir grâce à votre confiance et vos recommandations.
              </p>
              <p className="text-gray-600">
                Aujourd'hui, nous sommes fiers d'être reconnus comme l'une des boutiques 
                de téléphones les plus fiables, offrant une garantie de 2 ans sur tous nos produits.
              </p>
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Notre équipe"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-electric-blue rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Qualité</h3>
              <p className="text-gray-600">
                Nous sélectionnons uniquement les meilleurs produits pour nos clients
              </p>
            </div>
            <div className="text-center">
              <div className="bg-electric-blue rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Service Client</h3>
              <p className="text-gray-600">
                Une équipe dédiée pour vous accompagner dans vos achats
              </p>
            </div>
            <div className="text-center">
              <div className="bg-electric-blue rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Confiance</h3>
              <p className="text-gray-600">
                Transparence et honnêteté dans toutes nos relations
              </p>
            </div>
            <div className="text-center">
              <div className="bg-electric-blue rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600">
                Toujours à la pointe des dernières technologies
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nos Chiffres</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-electric-blue mb-2">10,000+</div>
              <div className="text-gray-600">Clients satisfaits</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-electric-blue mb-2">500+</div>
              <div className="text-gray-600">Produits disponibles</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-electric-blue mb-2">98%</div>
              <div className="text-gray-600">Taux de satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;