export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string | null;
  images?: string[];
  badge?: string;
  description: string;
}

export const PRODUCTS: Product[] = [
  { 
    id: 1, 
    name: "Rose Gold Bracelet Set", 
    category: "Jewellery", 
    price: 2499, 
    image: null, 
    badge: "Bestseller",
    description: "An elegant set of three beautifully crafted rose gold bracelets with subtle diamond accents."
  },
  { 
    id: 2, 
    name: "Crystal Drop Necklace", 
    category: "Jewellery", 
    price: 1899, 
    image: null,
    description: "A minimalist necklace featuring a flawless teardrop crystal on a delicate gold chain."
  },
  { 
    id: 3, 
    name: "Charm Keychain Set", 
    category: "Jewellery", 
    price: 599, 
    image: null, 
    badge: "New",
    description: "Personalized charm keychains wrapped in velvet, perfect for daily elegance."
  },
  { 
    id: 4, 
    name: "Journaling Starter Kit", 
    category: "Stationery", 
    price: 1299, 
    image: null, 
    badge: "Popular",
    description: "Everything you need to begin your journaling journey, encased in a premium box."
  },
  { 
    id: 5, 
    name: "Premium Washi Tape Set", 
    category: "Stationery", 
    price: 799, 
    image: null,
    description: "A curated collection of gold-foiled washi tapes for the creative soul."
  },
  { 
    id: 6, 
    name: "Classic Leather Journal", 
    category: "Stationery", 
    price: 1099, 
    image: null,
    description: "Hand-bound full-grain leather journal with thick, ivory fountain-pen friendly paper."
  },
  { 
    id: 7, 
    name: "Slim Leather Wallet", 
    category: "Wallets", 
    price: 1499, 
    image: null,
    description: "A minimalist, refined leather wallet designed for essential cards and cash."
  },
  { 
    id: 8, 
    name: "Customised Hamper Box", 
    category: "Custom", 
    price: 3499, 
    image: null, 
    badge: "Custom",
    description: "Curate your own luxury experience. Select items to be beautifully packaged together."
  },
];
