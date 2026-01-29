import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ExternalLink, Heart, Star, Shirt, Watch, Gift, Flag } from 'lucide-react';
import { Button } from "../ui/button";

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
  }
];

export default function FanZoneSection() {
  return (
    <section>
      {/* contenuto */}
    </section>
  );
}

