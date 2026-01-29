import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ExternalLink, Heart, Star, Shirt, Watch, Gift, Flag } from 'lucide-react';

const shopCategories = [
  {
    id: 1,
    name: 'Abbigliamento Team',
    description: 'Polo, t-shirt e giacche ufficiali',
    icon: Shirt,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop',
    priceRange: '€45 - €350',
  },
  {
    id: 2,
    name: 'Accessori',
    description: 'Cappellini, occhiali e orologi',
    icon: Watch,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    priceRange: '€25 - €500',
  },
  {
    id: 3,
    name: 'Collezione Piloti',
    description: 'Merchandise Leclerc & Hamilton',
    icon: Star,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    priceRange: '€30 - €200',
  },
  {
    id: 4,
    name: 'Casa & Lifestyle',
    description: 'Per i veri tifosi',
    icon: Gift,
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=300&fit=crop',
    priceRange: '€15 - €150',
  },
];

const featuredProducts = [
  {
    id: 1,
    name: 'Polo Ufficiale Ferrari 2025',
    category: 'Nuovo',
    price: '€89,99',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop',
    rating: 4.8,
    tags: ['Bestseller', 'Limited Edition'],
  },
  {
    id: 2,
    name: 'Cappellino Team Ferrari',
    category: 'Bestseller',
    price: '€39,99',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&h=300&fit=crop',
    rating: 4.6,
    tags: ['In Offerta'],
  },
  {
    id: 3,
    name: 'Felpa Leclerc #16',
    category: 'Nuovo',
    price: '€129,99',
    image: 'https://images.unsplash.com/photo-1574180045827-681f8a1a9622?w=300&h=300&fit=crop',
    rating: 4.9,
    tags: ['Pilota', 'Esclusiva'],
  },
  {
    id: 4,
    name: 'Orologio Ferrari Scuderia',
    category: 'Lusso',
    price: '€449,99',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=300&h=300&fit=crop',
    rating: 4.7,
    tags: ['Limited'],
  },
];

export default function FanZoneSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <ShoppingBag className="w-8 h-8 text-ferrari-yellow" />
            <h2 className="text-4xl font-bold text-white">Fan Zone</h2>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto mb-6">
            Lo shop ufficiale della Scuderia Ferrari - Vesti la tua passione
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-ferrari-red/20 to-ferrari-yellow/20 px-4 py-2 rounded-full">
            <Flag className="w-4 h-4 text-ferrari-red" />
            <span className="text-sm text-gray-300">Spedizione gratuita sopra €100</span>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {shopCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm hover:border-ferrari-red/50 transition-all"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              
              <div className="p-6 relative z-10">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-ferrari-red to-red-700 mb-4">
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-ferrari-yellow font-bold">{category.priceRange}</span>
                  <button className="text-ferrari-red hover:text-red-400 text-sm font-medium flex items-center gap-1 group">
                    Scopri
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Featured Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-white">Prodotti in Evidenza</h3>
            <button className="text-gray-400 hover:text-white text-sm font-medium flex items-center gap-1 group">
              Vedi tutto
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800 hover:border-ferrari-red/50 transition-all"
              >
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      product.category === 'Nuovo' ? 'bg-green-500/90 text-white' :
                      product.category === 'Bestseller' ? 'bg-ferrari-red/90 text-white' :
                      'bg-purple-500/90 text-white'
                    }`}>
                      {product.category}
                    </span>
                  </div>
                  
                  {/* Wishlist Button */}
                  <button className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-ferrari-red rounded-full flex items-center justify-center transition-colors">
                    <Heart className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {product.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Product Name */}
                  <h4 className="font-bold text-white mb-2 line-clamp-1">{product.name}</h4>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating)
                              ? 'text-ferrari-yellow fill-ferrari-yellow'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{product.rating}</span>
                  </div>

                  {/* Price & Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-ferrari-yellow">{product.price}</span>
                    <button className="px-4 py-2 bg-gradient-to-r from-ferrari-red to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg text-sm transition-all">
                      Aggiungi
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-8 md:p-12 bg-gradient-to-r from-ferrari-red/20 via-black to-ferrari-yellow/20 border border-gray-800"
        >
          <div className="relative z-10">
            <div className="max-w-2xl">
              <h3 className="text-3xl font-bold text-white mb-4">
                Diventa un <span className="text-ferrari-yellow">Ferrari Club</span> Member
              </h3>
              <p className="text-gray-300 mb-6">
                Iscriviti al programma fedeltà Ferrari e ottieni sconti esclusivi, 
                accesso anticipato ai prodotti e contenuti speciali.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-100 transition-colors">
                  Iscriviti Ora - Gratis
                </button>
                <button className="px-6 py-3 border border-gray-600 text-white font-medium rounded-lg hover:border-gray-500 hover:bg-gray-800/50 transition-colors">
                  Scopri i Vantaggi
                </button>
              </div>
            </div>
          </div>
          
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-ferrari-red/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-ferrari-yellow/5 to-transparent rounded-full blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
