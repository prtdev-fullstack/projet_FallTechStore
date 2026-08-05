import { Product } from '../types';

export const products: Product[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    price: 1199,
    originalPrice: 1299,
    image: 'https://gizmobo.com/wp-content/uploads/2022/08/Apple-iPhone-14-Pro-gold.jpg',
    category: 'smartphones',
    description: 'Le dernier iPhone avec puce A17 Pro et caméra révolutionnaire',
    features: ['Puce A17 Pro', 'Caméra 48MP', 'Écran 6.1 pouces', 'Titanium'],
    inStock: true,
    rating: 4.8,
    reviews: 342
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24',
    price: 899,
    image: 'https://static1.anpoimages.com/wordpress/wp-content/uploads/2024/01/galaxy-s24-ultra-titanium-violet.png',
    category: 'smartphones',
    description: 'Smartphone Android haut de gamme avec IA intégrée',
    features: ['Snapdragon 8 Gen 3', 'Caméra 200MP', 'Écran 6.2 pouces', 'One UI 6'],
    inStock: true,
    rating: 4.6,
    reviews: 218
  },
  {
    id: 3,
    name: 'AirPods Pro',
    price: 279,
    originalPrice: 329,
    image: 'https://www.epic.com.mt/wp-content/uploads/2023/03/AirPods_Pro_2nd-Gen-1.png',
    category: 'accessories',
    description: 'Écouteurs sans fil avec réduction de bruit active',
    features: ['Réduction de bruit', 'Audio spatial', 'Étanche IPX4', 'Autonomie 6h'],
    inStock: true,
    rating: 4.7,
    reviews: 156
  },
  {
    id: 4,
    name: 'iPhone 13 Pro',
    price: 899,
    originalPrice: 1099,
    image: 'https://c2.lestechnophiles.com/images.frandroid.com/wp-content/uploads/2021/09/apple-iphone-13-pro-max-frandroid-2021.png?resize=350',
    category: 'smartphones',
    description: 'iPhone 13 Pro avec puce A15 Bionic et système photo Pro',
    features: ['Puce A15 Bionic', 'Caméra Pro 12MP', 'Écran ProMotion', 'Face ID'],
    inStock: true,
    rating: 4.7,
    reviews: 523
  },
  {
    id: 5,
    name: 'Coque iPhone 15 Pro',
    price: 49,
    image: 'https://cdn.shopify.com/s/files/1/0845/2617/0445/files/Coque-en-bois-iPhone-wood-merisier.jpg',
    category: 'accessories',
    description: 'Coque de protection premium en silicone',
    features: ['Silicone premium', 'Protection renforcée', 'Compatible MagSafe', 'Finition mate'],
    inStock: true,
    rating: 4.4,
    reviews: 89
  },
  {
    id: 6,
    name: 'iPhone 14',
    price: 799,
    originalPrice: 999,
    image: 'https://candid.technology/wp-content/uploads/2022/09/iphone-14-max-1.jpg',
    category: 'promotions',
    description: 'iPhone 14 à prix exceptionnel - Offre limitée',
    features: ['Puce A15 Bionic', 'Caméra 12MP', 'Écran 6.1 pouces', 'Face ID'],
    inStock: true,
    rating: 4.5,
    reviews: 445
  },
  {
    id: 7,
    name: 'Chargeur sans fil',
    price: 79,
    image: 'https://www.chargeur-induction.fr/wp-content/uploads/2019/06/eozy-qi-chargeur-sans-fil-rapide-chargeur-a-induct.jpg',
    category: 'accessories',
    description: 'Chargeur sans fil rapide 15W compatible tous smartphones',
    features: ['Charge 15W', 'Compatible Qi', 'LED indicateur', 'Base antidérapante'],
    inStock: true,
    rating: 4.3,
    reviews: 67
  },
  {
    id: 8,
    name: 'Samsung Galaxy A54',
    price: 449,
    image: 'https://media-cdn.bnn.in.th/283749/Samsung-Smartphone-Galaxy-A54-1-square_medium.jpg',
    category: 'smartphones',
    description: 'Smartphone milieu de gamme avec excellent rapport qualité-prix',
    features: ['Exynos 1380', 'Caméra 50MP', 'Écran 6.4 pouces', 'Batterie 5000mAh'],
    inStock: true,
    rating: 4.4,
    reviews: 189
  },
  {
    id: 9,
    name: 'AirPods 3',
    price: 199,
    originalPrice: 229,
    image: 'https://images.pexels.com/photos/8534088/pexels-photo-8534088.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'accessories',
    description: 'Écouteurs sans fil avec audio spatial et résistance à l\'eau',
    features: ['Audio spatial', 'Résistant à l\'eau', 'Autonomie 6h', 'Charge rapide'],
    inStock: true,
    rating: 4.5,
    reviews: 234
  },
  {
    id: 10,
    name: 'Google Pixel 8',
    price: 699,
    image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: 'smartphones',
    description: 'Smartphone Google avec IA avancée et photographie computationnelle',
    features: ['Tensor G3', 'Caméra IA 50MP', 'Android 14', 'Magic Eraser'],
    inStock: true,
    rating: 4.6,
    reviews: 156
  }
];

export const categories = [
  { id: 'smartphones', name: 'Smartphones', icon: '📱' },
  { id: 'accessories', name: 'Accessoires', icon: '🎧' },
  { id: 'promotions', name: 'Promotions', icon: '🔥' }
];

export const heroSlides = [
  {
    id: 1,
    title: 'iPhone 15 Pro',
    subtitle: 'Jusqu\'à -100€ de remise',
    image: 'https://images.pexels.com/photos/18525574/pexels-photo-18525574/free-photo-of-iphone-15-pro-max.jpeg?auto=compress&cs=tinysrgb&w=1200',
    cta: 'Découvrir'
  },
  {
    id: 2,
    title: 'Offres Ramadan',
    subtitle: 'Réductions exceptionnelles sur tous les smartphones',
    image: 'https://img.freepik.com/vecteurs-premium/conception-modele-offre-speciale-etiquette-vente-du-ramadan_179567-1516.jpg',
    cta: 'Voir les offres'
  },
  {
    id: 3,
    title: 'Accessoires Premium',
    subtitle: 'Complétez votre setup avec nos accessoires',
    image: 'https://images.pexels.com/photos/8534088/pexels-photo-8534088.jpeg?auto=compress&cs=tinysrgb&w=1200',
    cta: 'Explorer'
  }
];