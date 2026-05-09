const products = [
  {
    id: "mslr-001",
    name: "Oversized MSLR T-Shirt",
    price: 490,
    category: "t-shirts",
    description: "Premium heavyweight cotton oversized tee with signature MSLR branding. Drop shoulder fit with a washed finish for that lived-in luxury feel. 100% 280gsm combed cotton.",
    images: [
      "./images/shop1.jpeg",
      "./images/shop2.jpeg",
      "./images/shop6.jpeg"
    ],
    colors: ["#000000", "#ffffff"],
    colorNames: ["Black", "White"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    rating: 4.8,
    reviewCount: 124,
    stock: 50,
    badge: "Bestseller",
    featured: true
  },
  {
    id: "mslr-002",
    name: "Dark Green Hoodie",
    price: 890,
    category: "hoodies",
    description: "Ultra-soft French terry hoodie in signature MSLR dark green. Kangaroo pocket, ribbed cuffs, and oversized silhouette. Built for style and warmth. 380gsm fleece interior.",
    images: [
      "./images/shop4.jpeg",
      "./images/shop3.jpeg",
      "./images/shop5.jpeg"
    ],
    colors: ["#000000", "#ffffff"],
    colorNames: ["Black", "White"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.9,
    reviewCount: 89,
    stock: 30,
    badge: "New",
    featured: true
  },
  {
    id: "mslr-003",
    name: "Signature Streetwear Set",
    price: 1290,
    category: "sets",
    description: "The complete MSLR look. Matching oversized hoodie and jogger set crafted from premium French terry. Tonal branding throughout. A wardrobe essential for the modern streetwear aesthetic.",
    images: [
      "./images/shop7.jpeg",
      "./images/shop8.jpeg",
      "./images/shop9.jpeg"
    ],
    colors: ["#000000", "#ffffff"],
    colorNames: ["Black", "White"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.7,
    reviewCount: 56,
    stock: 20,
    badge: "Limited",
    featured: true
  },
  {
    id: "mslr-004",
    name: "Black Graphic Tee",
    price: 550,
    category: "t-shirts",
    description: "Statement graphic t-shirt with original MSLR artwork. Heavyweight 260gsm cotton with a relaxed boxy cut. Screen-printed using water-based inks for lasting quality.",
    images: [
      "./images/shop10.jpeg",
      "./images/shop11.jpeg",
      "./images/shop12.jpeg"
    ],
    colors: ["#000000", "#ffffff"],
    colorNames: ["Black", "White"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    rating: 4.6,
    reviewCount: 78,
    stock: 45,
    badge: null,
    featured: true
  },
  {
    id: "mslr-005",
    name: "Minimal Logo Cap",
    price: 350,
    category: "accessories",
    description: "Six-panel structured cap with embroidered MSLR logo. Adjustable strap with a matte buckle. One size fits most. Premium wool-blend construction.",
    images: [
      "./images/shop13.jpeg",
      "./images/shop14.jpeg",
      "./images/shop15.jpeg"
    ],
    colors: ["#000000", "#ffffff"],
    colorNames: ["Black", "White"],
    sizes: ["One Size"],
    rating: 4.5,
    reviewCount: 102,
    stock: 60,
    badge: null,
    featured: false
  },
  {
    id: "mslr-006",
    name: "Oversized Cargo Pants",
    price: 950,
    category: "sets",
    description: "Tactical-inspired cargo pants with a relaxed oversized fit. Multiple utility pockets, adjustable waistband, and tapered ankle cuffs. Durable ripstop cotton blend.",
    images: [
      "./images/shop16.jpeg",
      "./images/shop17.jpeg",
      "./images/shop18.jpeg"
    ],
    colors: ["#000000", "#ffffff"],
    colorNames: ["Black", "White"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.7,
    reviewCount: 43,
    stock: 25,
    badge: "New",
    featured: false
  },
  {
    id: "mslr-007",
    name: "MSLR Zip Hoodie",
    price: 990,
    category: "hoodies",
    description: "Full-zip premium hoodie with tonal MSLR embroidery. Double-layered hood, YKK zipper, and kangaroo pockets. 350gsm French terry construction.",
    images: [
      "./images/shop19.jpeg",
      "./images/shop20.jpeg",
      "./images/shop21.jpeg"
    ],
    colors: ["#000000", "#ffffff"],
    colorNames: ["Black", "White"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.8,
    reviewCount: 67,
    stock: 35,
    badge: null,
    featured: false
  },
  {
    id: "mslr-008",
    name: "MSLR Crossbody Bag",
    price: 650,
    category: "accessories",
    description: "Compact crossbody bag with padded interior and signature MSLR logo hardware. Water-resistant exterior with adjustable strap. Perfect for daily carry.",
    images: [
      "./images/shop22.jpeg",
      "./images/shop23.jpeg",
      "./images/shop24.jpeg"
    ],
    colors: ["#000000", "#ffffff"],
    colorNames: ["Black", "White"],
    sizes: ["One Size"],
    rating: 4.6,
    reviewCount: 38,
    stock: 40,
    badge: null,
    featured: false
  }
];

if (typeof module !== 'undefined') {
  module.exports = products;
}
