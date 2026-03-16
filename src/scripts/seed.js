import "dotenv/config";
import mongoose, { Types } from "mongoose";
import bcrypt              from "bcryptjs";

import { User }    from "../models/user.model.js";
import { Vendor }  from "../models/vendor.model.js";
import { Product } from "../models/product.model.js";
import { Review }  from "../models/review.model.js";

await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ Connected to MongoDB");

await Review.deleteMany({});
await Product.deleteMany({});
await Vendor.deleteMany({});
await User.deleteMany({ email: { $nin: ["admin@test.com"] } });
console.log("🧹 Cleared old seed data — admin account kept");

const hash = await bcrypt.hash("Test@1234", 12);

// ─── VENDOR USERS ─────────────────────────────────────────────────
const vendorUsers = await User.insertMany([
  { fullName: "Ahmed Raza",    email: "ahmed@vendor.com",  password: hash, role: "vendor", isActive: true, avatar: { url: "", publicId: "" } },
  { fullName: "Fatima Malik",  email: "fatima@vendor.com", password: hash, role: "vendor", isActive: true, avatar: { url: "", publicId: "" } },
  { fullName: "Usman Tariq",   email: "usman@vendor.com",  password: hash, role: "vendor", isActive: true, avatar: { url: "", publicId: "" } },
  { fullName: "Zainab Sheikh", email: "zainab@vendor.com", password: hash, role: "vendor", isActive: true, avatar: { url: "", publicId: "" } },
]);

// ─── CUSTOMER USERS ───────────────────────────────────────────────
const customers = await User.insertMany([
  { fullName: "Hassan Ali",      email: "hassan@gmail.com", password: hash, role: "customer", isActive: true, avatar: { url: "", publicId: "" } },
  { fullName: "Ayesha Siddiqui", email: "ayesha@gmail.com", password: hash, role: "customer", isActive: true, avatar: { url: "", publicId: "" } },
  { fullName: "Bilal Chaudhry",  email: "bilal@gmail.com",  password: hash, role: "customer", isActive: true, avatar: { url: "", publicId: "" } },
  { fullName: "Sana Javed",      email: "sana@gmail.com",   password: hash, role: "customer", isActive: true, avatar: { url: "", publicId: "" } },
]);

console.log("👥 8 users created");

// ─── VENDOR STORE PROFILES ────────────────────────────────────────
const vendors = await Vendor.insertMany([
  {
    user: vendorUsers[0]._id,
    storeName: "TechZone Official Store",
    storeDescription: "Your trusted destination for premium electronics, smartphones and accessories. All products are 100% genuine with official warranty and certified after-sales support.",
    storeLogo:   { url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=200&fit=crop", publicId: "seed_logo_1" },
    storeBanner: { url: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=300&fit=crop", publicId: "seed_banner_1" },
    status: "approved", totalEarnings: 0, totalOrders: 0, totalProducts: 0,
    bankDetails: { accountName: "Ahmed Raza", accountNumber: "1234567890", bankName: "HBL Bank" },
  },
  {
    user: vendorUsers[1]._id,
    storeName: "Elegance Fashion House",
    storeDescription: "Premium clothing brand offering the latest trends in women and men fashion. Specializing in formal wear, casual collections and festive outfits crafted with the finest fabrics.",
    storeLogo:   { url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&h=200&fit=crop", publicId: "seed_logo_2" },
    storeBanner: { url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=300&fit=crop", publicId: "seed_banner_2" },
    status: "approved", totalEarnings: 0, totalOrders: 0, totalProducts: 0,
    bankDetails: { accountName: "Fatima Malik", accountNumber: "9876543210", bankName: "Meezan Bank" },
  },
  {
    user: vendorUsers[2]._id,
    storeName: "ProSports Equipment",
    storeDescription: "Official distributor of internationally recognized sports brands. Supplying premium cricket, football, badminton and fitness equipment to athletes and sports enthusiasts worldwide.",
    storeLogo:   { url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&h=200&fit=crop", publicId: "seed_logo_3" },
    storeBanner: { url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=300&fit=crop", publicId: "seed_banner_3" },
    status: "approved", totalEarnings: 0, totalOrders: 0, totalProducts: 0,
    bankDetails: { accountName: "Usman Tariq", accountNumber: "1122334455", bankName: "UBL Bank" },
  },
  {
    user: vendorUsers[3]._id,
    storeName: "Casa Decor & Living",
    storeDescription: "Curated home décor, artisan crafts and premium kitchen essentials. We bring together handcrafted heritage pieces and modern living essentials for the contemporary home.",
    storeLogo:   { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop", publicId: "seed_logo_4" },
    storeBanner: { url: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&h=300&fit=crop", publicId: "seed_banner_4" },
    status: "approved", totalEarnings: 0, totalOrders: 0, totalProducts: 0,
    bankDetails: { accountName: "Zainab Sheikh", accountNumber: "5544332211", bankName: "Allied Bank" },
  },
]);

console.log("🏪 4 vendor profiles created");
const [techzone, elegance, prosports, casadecor] = vendors;

// ─── PRODUCTS — ALL 11 CATEGORIES ─────────────────────────────────
const products = await Product.insertMany([

  // ── 1. ELECTRONICS ────────────────────────────────────────────────
  {
    vendor: techzone._id, title: "Samsung Galaxy S24 Ultra 256GB",
    description: "The Samsung Galaxy S24 Ultra redefines flagship smartphones with a 200MP ProVisual Camera, built-in S Pen and Snapdragon 8 Gen 3 processor. Features a 6.8-inch Dynamic AMOLED 2X display with 120Hz refresh rate, 5000mAh battery with 45W fast charging and 12GB RAM for seamless multitasking.",
    price: 349999, discountPrice: 319999, category: "electronics", stock: 10,
    images: [
      { url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop", publicId: "e1_1" },
      { url: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&h=600&fit=crop", publicId: "e1_2" },
    ],
    tags: ["samsung","galaxy","s24","ultra","flagship","smartphone"],
    ratings: { average: 4.8, count: 24 }, sold: 31, isActive: true,
  },
  {
    vendor: techzone._id, title: "Sony WH-1000XM5 Noise Cancelling Headphones",
    description: "Industry-leading noise cancellation with Sony's Auto NC Optimizer. Delivers up to 30 hours of battery life with quick charging. Multipoint connection allows pairing with two devices simultaneously. Exceptional sound quality with LDAC Hi-Res Audio support.",
    price: 89999, discountPrice: 74999, category: "electronics", stock: 18,
    images: [
      { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop", publicId: "e2_1" },
      { url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop", publicId: "e2_2" },
    ],
    tags: ["sony","headphones","noise-cancelling","wireless","xm5"],
    ratings: { average: 4.9, count: 42 }, sold: 58, isActive: true,
  },
  {
    vendor: techzone._id, title: "Apple iPad Air M2 11-inch 256GB WiFi",
    description: "Powered by the Apple M2 chip, the iPad Air delivers superfast performance for demanding apps and workflows. Features an 11-inch Liquid Retina display, 12MP front and rear cameras and all-day battery life. Compatible with Apple Pencil Pro and Magic Keyboard.",
    price: 189999, discountPrice: 174999, category: "electronics", stock: 8,
    images: [
      { url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop", publicId: "e3_1" },
      { url: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&fit=crop", publicId: "e3_2" },
    ],
    tags: ["apple","ipad","air","m2","tablet"],
    ratings: { average: 4.7, count: 19 }, sold: 22, isActive: true,
  },
  {
    vendor: techzone._id, title: "Logitech MX Master 3S Wireless Mouse",
    description: "The Logitech MX Master 3S is an advanced wireless mouse built for creators and professionals. Features an 8000 DPI sensor, MagSpeed electromagnetic scrolling and ergonomic design. Works on any surface including glass. Up to 70 days battery life.",
    price: 19999, discountPrice: 16999, category: "electronics", stock: 35,
    images: [
      { url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop", publicId: "e4_1" },
      { url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&h=600&fit=crop", publicId: "e4_2" },
    ],
    tags: ["logitech","mouse","wireless","mx-master","productivity"],
    ratings: { average: 4.6, count: 31 }, sold: 74, isActive: true,
  },

  // ── 2. ACCESSORIES ────────────────────────────────────────────────
  {
    vendor: techzone._id, title: "Apple Watch Series 9 GPS 45mm",
    description: "Apple Watch Series 9 features the powerful S9 chip, a brighter always-on Retina display and the new double tap gesture. Track your health with advanced heart rate monitoring, blood oxygen sensor and crash detection. Water resistant to 50 metres with 18-hour battery life.",
    price: 129999, discountPrice: 114999, category: "accessories", stock: 14,
    images: [
      { url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop", publicId: "a1_1" },
      { url: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop", publicId: "a1_2" },
    ],
    tags: ["apple","watch","series9","smartwatch","wearable"],
    ratings: { average: 4.8, count: 36 }, sold: 45, isActive: true,
  },
  {
    vendor: elegance._id, title: "Ray-Ban Aviator Classic Sunglasses",
    description: "The iconic Ray-Ban Aviator Classic in gold with green G-15 lenses. Crafted from lightweight metal with adjustable nose pads for a secure, comfortable fit. UV400 protection lenses that block 100% of UVA and UVB rays. Comes with original Ray-Ban case and cleaning cloth.",
    price: 28000, discountPrice: 24500, category: "accessories", stock: 25,
    images: [
      { url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop", publicId: "a2_1" },
      { url: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&h=600&fit=crop", publicId: "a2_2" },
    ],
    tags: ["ray-ban","sunglasses","aviator","uv400","classic"],
    ratings: { average: 4.7, count: 28 }, sold: 53, isActive: true,
  },
  {
    vendor: elegance._id, title: "Fossil Gen 6 Hybrid Leather Wallet",
    description: "The Fossil bifold wallet is crafted from full-grain genuine leather with a slim profile that fits comfortably in any pocket. Features 6 card slots, 2 full-length bill compartments and an ID window. RFID-blocking technology protects your cards from electronic theft.",
    price: 8500, discountPrice: 6999, category: "accessories", stock: 50,
    images: [
      { url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop", publicId: "a3_1" },
      { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop", publicId: "a3_2" },
    ],
    tags: ["fossil","wallet","leather","rfid","slim"],
    ratings: { average: 4.5, count: 22 }, sold: 67, isActive: true,
  },
  {
    vendor: elegance._id, title: "Samsonite Crossbody Leather Bag",
    description: "The Samsonite crossbody bag is made from premium pebbled leather with a structured silhouette. Features a padded laptop sleeve for devices up to 13 inches, multiple organiser pockets and an adjustable strap. Antique gold-tone hardware and magnetic closure for secure access.",
    price: 22000, discountPrice: 18999, category: "accessories", stock: 20,
    images: [
      { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop", publicId: "a4_1" },
      { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", publicId: "a4_2" },
    ],
    tags: ["samsonite","bag","leather","crossbody","laptop"],
    ratings: { average: 4.6, count: 18 }, sold: 29, isActive: true,
  },

  // ── 3. CLOTHING ───────────────────────────────────────────────────
  {
    vendor: elegance._id, title: "Linen Premium Suit — 3 Piece Unstitched",
    description: "Crafted from 100% pure linen fabric, this 3-piece unstitched suit offers breathable comfort with a refined silhouette. Includes a shirt piece, trouser fabric and matching dupatta. Features subtle self-woven texture with delicate embroidered border detailing. Perfect for formal and semi-formal occasions.",
    price: 8500, discountPrice: 7200, category: "clothing", stock: 45,
    images: [
      { url: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=600&fit=crop", publicId: "c1_1" },
      { url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4546?w=600&h=600&fit=crop", publicId: "c1_2" },
    ],
    tags: ["linen","suit","3piece","unstitched","formal","women"],
    ratings: { average: 4.7, count: 28 }, sold: 72, isActive: true,
  },
  {
    vendor: elegance._id, title: "Premium Wool Blend Overcoat — Men",
    description: "A timeless men's overcoat crafted from a premium wool-polyester blend. Features a double-breasted button closure, notch lapels, two side welt pockets and a full satin lining. Tailored in a classic slim fit that drapes elegantly. Available in charcoal, camel and navy.",
    price: 18500, discountPrice: 15999, category: "clothing", stock: 22,
    images: [
      { url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=600&fit=crop", publicId: "c2_1" },
      { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop", publicId: "c2_2" },
    ],
    tags: ["coat","wool","overcoat","men","formal","winter"],
    ratings: { average: 4.6, count: 17 }, sold: 34, isActive: true,
  },
  {
    vendor: elegance._id, title: "Chiffon Embroidered Formal Kurti",
    description: "Elegantly crafted chiffon kurti with intricate machine embroidery on the neckline and sleeves. The flowy silhouette is complemented by a straight hem and concealed placket. Ideal for evening events, family gatherings and festive celebrations. Lined inner for comfort.",
    price: 4800, discountPrice: 3999, category: "clothing", stock: 60,
    images: [
      { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop", publicId: "c3_1" },
      { url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop", publicId: "c3_2" },
    ],
    tags: ["kurti","chiffon","embroidered","women","festive"],
    ratings: { average: 4.5, count: 33 }, sold: 95, isActive: true,
  },
  {
    vendor: elegance._id, title: "Oxford Slim Fit Dress Shirt — Men",
    description: "Classic men's Oxford dress shirt tailored in a modern slim fit. Made from 100% premium combed cotton with a smooth finish. Features a button-down collar, single chest pocket and adjustable barrel cuffs. Machine washable and wrinkle-resistant. Available in white, light blue and ecru.",
    price: 3200, discountPrice: 2700, category: "clothing", stock: 80,
    images: [
      { url: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&h=600&fit=crop", publicId: "c4_1" },
      { url: "https://images.unsplash.com/photo-1602810316693-3667c854239a?w=600&h=600&fit=crop", publicId: "c4_2" },
    ],
    tags: ["shirt","oxford","men","formal","slim-fit","cotton"],
    ratings: { average: 4.4, count: 22 }, sold: 110, isActive: true,
  },

  // ── 4. SHOES ──────────────────────────────────────────────────────
  {
    vendor: prosports._id, title: "Nike React Infinity Run Flyknit 4",
    description: "Engineered to help reduce injury and keep you running. Features a wider base and plush Nike ReactX foam for cushioning with a soft, smooth ride. Flyknit upper provides targeted support while a rollbar minimises foot movement to reduce stress on joints. Sizes 40–46.",
    price: 38000, discountPrice: 32999, category: "shoes", stock: 20,
    images: [
      { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop", publicId: "sh1_1" },
      { url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop", publicId: "sh1_2" },
    ],
    tags: ["nike","running","flyknit","shoes","react"],
    ratings: { average: 4.7, count: 39 }, sold: 52, isActive: true,
  },
  {
    vendor: prosports._id, title: "Adidas Ultraboost 23 Running Shoes",
    description: "The Adidas Ultraboost 23 delivers an incredible running experience with a full-length BOOST midsole for energy return with every stride. The Primeknit upper wraps your foot with a supportive, adaptive fit. Continental rubber outsole for exceptional grip on all surfaces.",
    price: 42000, discountPrice: 36999, category: "shoes", stock: 16,
    images: [
      { url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop", publicId: "sh2_1" },
      { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop", publicId: "sh2_2" },
    ],
    tags: ["adidas","ultraboost","running","shoes","boost"],
    ratings: { average: 4.8, count: 44 }, sold: 61, isActive: true,
  },
  {
    vendor: elegance._id, title: "Clarks Desert Boot — Men Suede",
    description: "The original Clarks Desert Boot, handcrafted since 1950. Made from soft brushed suede with a crepe sole that provides all-day comfort and flexibility. The clean, minimal silhouette makes it one of the most versatile shoes ever made. Available in sand, beeswax and dark tan.",
    price: 24000, discountPrice: 20999, category: "shoes", stock: 30,
    images: [
      { url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=600&fit=crop", publicId: "sh3_1" },
      { url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop", publicId: "sh3_2" },
    ],
    tags: ["clarks","desert-boot","suede","men","casual"],
    ratings: { average: 4.6, count: 27 }, sold: 38, isActive: true,
  },
  {
    vendor: elegance._id, title: "Steve Madden Block Heel Pumps — Women",
    description: "Steve Madden block heel pumps crafted from faux leather with a padded insole for all-day comfort. The 7cm block heel provides height without sacrificing stability. Features a pointed toe, slip-on construction and non-slip outsole. Perfect for the office or evening events.",
    price: 12000, discountPrice: 9999, category: "shoes", stock: 28,
    images: [
      { url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=600&fit=crop", publicId: "sh4_1" },
      { url: "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=600&h=600&fit=crop", publicId: "sh4_2" },
    ],
    tags: ["steve-madden","heels","pumps","women","formal"],
    ratings: { average: 4.5, count: 31 }, sold: 47, isActive: true,
  },

  // ── 5. BOOKS ──────────────────────────────────────────────────────
  {
    vendor: techzone._id, title: "Atomic Habits by James Clear — Hardcover",
    description: "The number one New York Times bestseller. James Clear distils the most fundamental information about habit formation into a practical guide. Learn how to make good habits inevitable, bad habits impossible and tiny changes that deliver remarkable results. Over 15 million copies sold worldwide.",
    price: 3500, discountPrice: 2999, category: "books", stock: 120,
    images: [
      { url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop", publicId: "b1_1" },
      { url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop", publicId: "b1_2" },
    ],
    tags: ["book","atomic-habits","james-clear","self-help","hardcover"],
    ratings: { average: 4.9, count: 67 }, sold: 185, isActive: true,
  },
  {
    vendor: techzone._id, title: "Clean Code by Robert C. Martin — Paperback",
    description: "A handbook of agile software craftsmanship. Robert C. Martin teaches best practices for writing code that is readable, maintainable and elegant. Covers naming conventions, functions, comments, formatting, objects and classes. Essential reading for every software developer.",
    price: 4200, discountPrice: 3599, category: "books", stock: 85,
    images: [
      { url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=600&fit=crop", publicId: "b2_1" },
      { url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=600&fit=crop", publicId: "b2_2" },
    ],
    tags: ["book","clean-code","programming","software","development"],
    ratings: { average: 4.8, count: 53 }, sold: 132, isActive: true,
  },
  {
    vendor: casadecor._id, title: "The Art of Living — Philosophy Collection",
    description: "A beautifully curated collection of stoic philosophy texts including Meditations by Marcus Aurelius, Letters from a Stoic by Seneca and The Enchiridion by Epictetus. Presented in a premium hardcover with gold foil embossing. A timeless gift for any thoughtful reader.",
    price: 5500, discountPrice: 4799, category: "books", stock: 60,
    images: [
      { url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&h=600&fit=crop", publicId: "b3_1" },
      { url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop", publicId: "b3_2" },
    ],
    tags: ["book","philosophy","stoic","hardcover","gift","collection"],
    ratings: { average: 4.8, count: 41 }, sold: 79, isActive: true,
  },
  {
    vendor: casadecor._id, title: "The Psychology of Money by Morgan Housel",
    description: "Timeless lessons on wealth, greed and happiness. Morgan Housel shares 19 short stories exploring the strange ways people think about money. One of the most important finance books written in recent years. Accessible to everyone regardless of financial background.",
    price: 3200, discountPrice: 2799, category: "books", stock: 95,
    images: [
      { url: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&h=600&fit=crop", publicId: "b4_1" },
      { url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop", publicId: "b4_2" },
    ],
    tags: ["book","finance","money","morgan-housel","bestseller"],
    ratings: { average: 4.9, count: 58 }, sold: 163, isActive: true,
  },

  // ── 6. HOME ───────────────────────────────────────────────────────
  {
    vendor: casadecor._id, title: "Artisan Hand-Woven Kilim Rug 5x8ft",
    description: "A stunning hand-woven kilim rug crafted by master weavers using traditional flatweave techniques. Made from 100% natural wool with vegetable-based dyes that retain vibrancy over time. The geometric motif pattern is inspired by classic Central Asian tribal designs. Non-slip backing included.",
    price: 28000, discountPrice: 24500, category: "home", stock: 8,
    images: [
      { url: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&h=600&fit=crop", publicId: "h1_1" },
      { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop", publicId: "h1_2" },
    ],
    tags: ["rug","kilim","handwoven","wool","artisan","decor"],
    ratings: { average: 4.9, count: 21 }, sold: 28, isActive: true,
  },
  {
    vendor: casadecor._id, title: "Le Creuset Signature Cast Iron Casserole 28cm",
    description: "Crafted from premium enamelled cast iron for unrivalled heat distribution and retention. The tight-fitting lid seals in moisture and flavour. Oven safe to 260°C and suitable for all hob types including induction. Signature knob and ergonomic handles. Lifetime guarantee.",
    price: 65000, discountPrice: 56999, category: "home", stock: 6,
    images: [
      { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop", publicId: "h2_1" },
      { url: "https://images.unsplash.com/photo-1584990347449-a2d4c2c044de?w=600&h=600&fit=crop", publicId: "h2_2" },
    ],
    tags: ["le-creuset","casserole","cast-iron","cookware","kitchen"],
    ratings: { average: 5.0, count: 12 }, sold: 14, isActive: true,
  },
  {
    vendor: casadecor._id, title: "Handcrafted Ceramic Dinner Set — 24 Pieces",
    description: "An elegant 24-piece dinner set handcrafted by ceramic artisans. Includes 6 dinner plates, 6 salad plates, 6 bowls and 6 mugs. Each piece features a reactive glaze finish making every item uniquely individual. Dishwasher and microwave safe. Presented in a premium gift box.",
    price: 18500, discountPrice: 15999, category: "home", stock: 15,
    images: [
      { url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop", publicId: "h3_1" },
      { url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop", publicId: "h3_2" },
    ],
    tags: ["ceramic","dinner-set","handcrafted","tableware","gift"],
    ratings: { average: 4.8, count: 27 }, sold: 35, isActive: true,
  },
  {
    vendor: casadecor._id, title: "Scented Soy Wax Candle Set — Luxury Collection",
    description: "A curated luxury set featuring 4 hand-poured soy wax candles with cotton wicks. Fragrances include Oud and Sandalwood, Jasmine and Rose, Cedar and Vanilla and Fresh Linen. Each candle offers up to 50 hours of clean burn time with minimal soot. Presented in a matte black gift box.",
    price: 4800, discountPrice: 3999, category: "home", stock: 50,
    images: [
      { url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&h=600&fit=crop", publicId: "h4_1" },
      { url: "https://images.unsplash.com/photo-1602874801006-8e3c1f04d862?w=600&h=600&fit=crop", publicId: "h4_2" },
    ],
    tags: ["candle","soy-wax","scented","luxury","gift","home-decor"],
    ratings: { average: 4.8, count: 44 }, sold: 89, isActive: true,
  },

  // ── 7. BEAUTY ─────────────────────────────────────────────────────
  {
    vendor: elegance._id, title: "The Ordinary Hyaluronic Acid 2% + B5 Serum",
    description: "A multi-depth hydration serum combining low, medium and high molecular weight hyaluronic acid with Vitamin B5 to deliver intense surface and below-surface hydration. Plumps and smooths skin texture with continued use. Fragrance-free, paraben-free and suitable for all skin types including sensitive skin.",
    price: 3800, discountPrice: 3200, category: "beauty", stock: 90,
    images: [
      { url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop", publicId: "be1_1" },
      { url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop", publicId: "be1_2" },
    ],
    tags: ["the-ordinary","serum","hyaluronic-acid","skincare","hydration"],
    ratings: { average: 4.7, count: 48 }, sold: 143, isActive: true,
  },
  {
    vendor: elegance._id, title: "Cetaphil Gentle Skin Cleanser 500ml",
    description: "Cetaphil Gentle Skin Cleanser is the dermatologist-recommended formula trusted worldwide for over 75 years. Clinically proven to gently cleanse without stripping the skin's natural moisture barrier. Non-irritating, non-comedogenic and fragrance-free. Suitable for sensitive, dry and normal skin.",
    price: 2800, discountPrice: 2400, category: "beauty", stock: 75,
    images: [
      { url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop", publicId: "be2_1" },
      { url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop", publicId: "be2_2" },
    ],
    tags: ["cetaphil","cleanser","skincare","sensitive","dermatologist"],
    ratings: { average: 4.6, count: 35 }, sold: 98, isActive: true,
  },
  {
    vendor: elegance._id, title: "Charlotte Tilbury Pillow Talk Lipstick",
    description: "The most iconic lipstick in the world. Charlotte Tilbury's Pillow Talk is a universally flattering pinky-nude with a matte finish that suits every skin tone. Enriched with Hyaluronic Acid filling spheres, Lip Comfort Complex and antioxidant Vitamin E for a smooth, plump and nourished pout.",
    price: 7500, discountPrice: 6499, category: "beauty", stock: 55,
    images: [
      { url: "https://images.unsplash.com/photo-1586495777744-4e6232bf0c87?w=600&h=600&fit=crop", publicId: "be3_1" },
      { url: "https://images.unsplash.com/photo-1631214499682-a7ddcf7c3e2c?w=600&h=600&fit=crop", publicId: "be3_2" },
    ],
    tags: ["charlotte-tilbury","lipstick","pillow-talk","makeup","beauty"],
    ratings: { average: 4.8, count: 62 }, sold: 178, isActive: true,
  },
  {
    vendor: elegance._id, title: "Dyson Airwrap Multi-Styler Complete",
    description: "The Dyson Airwrap Multi-Styler uses Coanda airflow to curl, wave, smooth and dry hair simultaneously without extreme heat. Includes 6 attachments for different hair types and desired styles. Intelligent heat control measures air temperature over 40 times per second. Prevents extreme heat damage.",
    price: 149999, discountPrice: 134999, category: "beauty", stock: 7,
    images: [
      { url: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop", publicId: "be4_1" },
      { url: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=600&h=600&fit=crop", publicId: "be4_2" },
    ],
    tags: ["dyson","airwrap","hair","styler","beauty","premium"],
    ratings: { average: 4.9, count: 29 }, sold: 33, isActive: true,
  },

  // ── 8. SPORTS ─────────────────────────────────────────────────────
  {
    vendor: prosports._id, title: "Gray-Nicolls Kronus 1000 Cricket Bat",
    description: "The Gray-Nicolls Kronus 1000 is a professional-grade cricket bat crafted from Grade 1 English Willow. Features a traditional full spine profile, pronounced edges and a low-to-mid sweet spot for powerful drives and cuts. Pre-knocked and ready for use with a full-grain toe guard applied.",
    price: 32000, discountPrice: 27999, category: "sports", stock: 10,
    images: [
      { url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&h=600&fit=crop", publicId: "sp1_1" },
      { url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&h=600&fit=crop", publicId: "sp1_2" },
    ],
    tags: ["cricket","bat","gray-nicolls","english-willow","professional"],
    ratings: { average: 4.8, count: 14 }, sold: 19, isActive: true,
  },
  {
    vendor: prosports._id, title: "Adidas Finale Pro FIFA Quality Football",
    description: "The Adidas Finale Pro is an official match ball meeting FIFA Quality standards. Features a seamless thermally bonded surface for consistent flight and touch. The 20-panel construction ensures round shape retention throughout the match. Suitable for all weather conditions and playing surfaces.",
    price: 7500, discountPrice: 6499, category: "sports", stock: 40,
    images: [
      { url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=600&fit=crop", publicId: "sp2_1" },
      { url: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&h=600&fit=crop", publicId: "sp2_2" },
    ],
    tags: ["adidas","football","fifa","match-ball","soccer"],
    ratings: { average: 4.5, count: 26 }, sold: 63, isActive: true,
  },
  {
    vendor: prosports._id, title: "Yonex Astrox 100ZZ Badminton Racket",
    description: "The Yonex Astrox 100ZZ is a top-tier badminton racket engineered for aggressive attacking play. Constructed from ultra-high modulus graphite with Namd technology for sharp repulsion. Extra-slim shaft reduces air resistance for explosive smash speeds. Strung at 28 lbs with BG66 Ultimax string.",
    price: 28000, discountPrice: 24500, category: "sports", stock: 12,
    images: [
      { url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&h=600&fit=crop", publicId: "sp3_1" },
      { url: "https://images.unsplash.com/photo-1593786082639-dad6cb1a78d2?w=600&h=600&fit=crop", publicId: "sp3_2" },
    ],
    tags: ["yonex","badminton","astrox","racket","professional"],
    ratings: { average: 4.7, count: 18 }, sold: 25, isActive: true,
  },
  {
    vendor: prosports._id, title: "Wilson Pro Staff RF97 Tennis Racket",
    description: "The Wilson Pro Staff RF97 Autograph is the racket Roger Federer helped design and has used throughout his legendary career. Crafted from braided graphite and kevlar for exceptional feel. 97 sq inch head size with 18x20 string pattern for precision control and power.",
    price: 45000, discountPrice: 39999, category: "sports", stock: 8,
    images: [
      { url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop", publicId: "sp4_1" },
      { url: "https://images.unsplash.com/photo-1617083934551-ac1f8b48caa0?w=600&h=600&fit=crop", publicId: "sp4_2" },
    ],
    tags: ["wilson","tennis","racket","pro-staff","roger-federer"],
    ratings: { average: 4.9, count: 11 }, sold: 14, isActive: true,
  },

  // ── 9. TOYS ───────────────────────────────────────────────────────
  {
    vendor: casadecor._id, title: "LEGO Technic Land Rover Defender — 2573 Pieces",
    description: "Build and display the iconic Land Rover Defender with this premium LEGO Technic set. Features a detailed interior, opening doors and bonnet, functional 4-speed sequential gearbox and independent suspension. Includes a certificate of authenticity. Suitable for ages 18 and above.",
    price: 28000, discountPrice: 24999, category: "toys", stock: 12,
    images: [
      { url: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&h=600&fit=crop", publicId: "t1_1" },
      { url: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&h=600&fit=crop", publicId: "t1_2" },
    ],
    tags: ["lego","technic","land-rover","building","collector"],
    ratings: { average: 4.9, count: 33 }, sold: 42, isActive: true,
  },
  {
    vendor: casadecor._id, title: "Hot Wheels Ultimate Garage Playset",
    description: "The Hot Wheels Ultimate Garage is the ultimate multi-level parking structure with 140+ car storage capacity. Features a working elevator, spiral ramp, helicopter pad and a T-Rex dinosaur that attacks cars. Includes 2 exclusive Hot Wheels cars. Compatible with all standard Hot Wheels vehicles.",
    price: 12000, discountPrice: 9999, category: "toys", stock: 18,
    images: [
      { url: "https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=600&h=600&fit=crop", publicId: "t2_1" },
      { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop", publicId: "t2_2" },
    ],
    tags: ["hot-wheels","garage","playset","cars","kids"],
    ratings: { average: 4.7, count: 27 }, sold: 51, isActive: true,
  },
  {
    vendor: prosports._id, title: "Nerf Elite 2.0 Commander RD-6 Blaster",
    description: "The Nerf Elite 2.0 Commander RD-6 blaster fires darts up to 27 metres. Includes a 6-dart rotating drum and 12 Official Nerf Elite darts. Features customisable modular design — you can rebuild it in 3 different configurations. Slam-fire action for rapid-fire play.",
    price: 4500, discountPrice: 3799, category: "toys", stock: 35,
    images: [
      { url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=600&fit=crop", publicId: "t3_1" },
      { url: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=600&h=600&fit=crop", publicId: "t3_2" },
    ],
    tags: ["nerf","blaster","outdoor","kids","action"],
    ratings: { average: 4.5, count: 38 }, sold: 84, isActive: true,
  },
  {
    vendor: prosports._id, title: "Hasbro Monopoly Classic Board Game",
    description: "The world's favourite property trading board game. Monopoly Classic includes all original game pieces — 8 tokens, 28 Title Deed cards, 16 Chance and 16 Community Chest cards, 2 dice and a full set of houses and hotels. Suitable for 2 to 6 players aged 8 and above.",
    price: 3200, discountPrice: 2799, category: "toys", stock: 55,
    images: [
      { url: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600&h=600&fit=crop", publicId: "t4_1" },
      { url: "https://images.unsplash.com/photo-1632501641765-e568d28b0a5d?w=600&h=600&fit=crop", publicId: "t4_2" },
    ],
    tags: ["monopoly","board-game","hasbro","family","classic"],
    ratings: { average: 4.7, count: 52 }, sold: 127, isActive: true,
  },

  // ── 10. FOOD ──────────────────────────────────────────────────────
  {
    vendor: casadecor._id, title: "Organic Manuka Honey UMF 15+ 500g",
    description: "Premium certified organic Manuka honey from New Zealand with a UMF rating of 15+, indicating high levels of the unique Manuka factor. Rich in methylglyoxal (MGO 514+) with proven antibacterial and anti-inflammatory properties. Independently tested and certified. Raw, unpasteurised and unfiltered.",
    price: 8500, discountPrice: 7499, category: "food", stock: 40,
    images: [
      { url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=600&fit=crop", publicId: "f1_1" },
      { url: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=600&fit=crop", publicId: "f1_2" },
    ],
    tags: ["manuka","honey","organic","new-zealand","umf","health"],
    ratings: { average: 4.8, count: 34 }, sold: 78, isActive: true,
  },
  {
    vendor: casadecor._id, title: "Lavazza Qualità Rossa Ground Coffee 1kg",
    description: "Lavazza Qualità Rossa is Italy's favourite coffee blend, combining the best Brazilian and Central African Arabica and Robusta beans. Delivers a full-bodied, rich flavour with a velvety crema. Roasted to perfection for espresso machines, moka pots and filter coffee makers. Intensity 5 out of 10.",
    price: 4200, discountPrice: 3599, category: "food", stock: 65,
    images: [
      { url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=600&fit=crop", publicId: "f2_1" },
      { url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=600&fit=crop", publicId: "f2_2" },
    ],
    tags: ["lavazza","coffee","espresso","ground","italian"],
    ratings: { average: 4.7, count: 47 }, sold: 112, isActive: true,
  },
  {
    vendor: casadecor._id, title: "Lindt Excellence Dark Chocolate Gift Box",
    description: "A premium Lindt Excellence gift box featuring 12 individual dark chocolate bars ranging from 70% to 99% cacao. Expertly crafted by Lindt master chocolatiers in Switzerland from sustainably sourced cacao beans. Each bar has a distinct intensity and flavour profile. Perfect gift for any occasion.",
    price: 6500, discountPrice: 5499, category: "food", stock: 45,
    images: [
      { url: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=600&fit=crop", publicId: "f3_1" },
      { url: "https://images.unsplash.com/photo-1606312619070-d48b9ba46ae0?w=600&h=600&fit=crop", publicId: "f3_2" },
    ],
    tags: ["lindt","chocolate","dark","swiss","gift","premium"],
    ratings: { average: 4.9, count: 56 }, sold: 134, isActive: true,
  },
  {
    vendor: casadecor._id, title: "Organic Green Tea Loose Leaf Selection 200g",
    description: "A curated selection of premium organic green teas from Japan and China. Includes Gyokuro, Dragon Well (Longjing) and Jasmine Pearl varieties. Each tea is hand-harvested from certified organic gardens with no pesticides. Packed in an airtight tin to preserve freshness and aroma.",
    price: 3800, discountPrice: 3200, category: "food", stock: 55,
    images: [
      { url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=600&fit=crop", publicId: "f4_1" },
      { url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=600&fit=crop", publicId: "f4_2" },
    ],
    tags: ["green-tea","organic","loose-leaf","japanese","health"],
    ratings: { average: 4.7, count: 39 }, sold: 91, isActive: true,
  },

  // ── 11. OTHER ─────────────────────────────────────────────────────
  {
    vendor: techzone._id, title: "Moleskine Classic Hardcover Notebook — Large",
    description: "The legendary Moleskine notebook used by artists and thinkers worldwide. Large format (13x21cm) with 240 pages of acid-free ivory paper, an elastic closure, ribbon bookmark and expandable inner pocket. Available in ruled, squared and plain pages. A timeless tool for ideas and creativity.",
    price: 3200, discountPrice: 2799, category: "other", stock: 100,
    images: [
      { url: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=600&fit=crop", publicId: "o1_1" },
      { url: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=600&fit=crop", publicId: "o1_2" },
    ],
    tags: ["moleskine","notebook","stationery","journal","hardcover"],
    ratings: { average: 4.8, count: 44 }, sold: 115, isActive: true,
  },
  {
    vendor: techzone._id, title: "Polaroid Now+ Instant Camera — Gen 2",
    description: "The Polaroid Now+ Gen 2 brings analog photography into the modern age with 5 creative lens filters including double exposure, light painting, starburst, portrait and colour. Powered by the Polaroid app via Bluetooth. Autofocus system ensures sharp, beautifully framed instant photos every time.",
    price: 38000, discountPrice: 32999, category: "other", stock: 14,
    images: [
      { url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop", publicId: "o2_1" },
      { url: "https://images.unsplash.com/photo-1572460311620-e2f0082e6c20?w=600&h=600&fit=crop", publicId: "o2_2" },
    ],
    tags: ["polaroid","camera","instant","photography","gift"],
    ratings: { average: 4.7, count: 31 }, sold: 43, isActive: true,
  },
  {
    vendor: casadecor._id, title: "Gardening Starter Kit — Premium 12 Piece",
    description: "A complete premium gardening kit for beginners and enthusiasts. Includes stainless steel trowel, fork, transplanter, weeder, pruning shears, gloves, kneeling pad, plant markers and seed packets. All tools feature ergonomic soft-grip handles and are stored in a durable canvas tote bag.",
    price: 5500, discountPrice: 4799, category: "other", stock: 30,
    images: [
      { url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop", publicId: "o3_1" },
      { url: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=600&h=600&fit=crop", publicId: "o3_2" },
    ],
    tags: ["gardening","tools","outdoor","starter-kit","plants"],
    ratings: { average: 4.6, count: 22 }, sold: 38, isActive: true,
  },
  {
    vendor: casadecor._id, title: "Himalayan Salt Lamp — Natural Crystal 3–5kg",
    description: "A genuine hand-carved Himalayan crystal salt lamp sourced from the Khewra Salt Mine in Pakistan. Each lamp is unique in shape and warm amber glow. When heated by the bulb, releases negative ions that may improve air quality. Includes a dimmer switch cord and spare bulb. Base crafted from neem wood.",
    price: 2800, discountPrice: 2399, category: "other", stock: 45,
    images: [
      { url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop", publicId: "o4_1" },
      { url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&h=600&fit=crop", publicId: "o4_2" },
    ],
    tags: ["himalayan","salt-lamp","natural","wellness","decor","air-purifier"],
    ratings: { average: 4.7, count: 58 }, sold: 142, isActive: true,
  },
]);

console.log(`📦 ${products.length} products created across all 11 categories`);

// ─── Update vendor product counts ─────────────────────────────────
for (const v of vendors) {
  const count = await Product.countDocuments({ vendor: v._id });
  await Vendor.findByIdAndUpdate(v._id, { totalProducts: count });
}

// ─── REVIEWS ──────────────────────────────────────────────────────
const comments = [
  "Absolutely outstanding product. Exactly as described and the packaging was immaculate. Delivery was prompt and the seller communicated throughout. Highly recommended.",
  "Exceptional quality for the price. I have ordered from this store twice before and the consistency is remarkable. Will definitely continue purchasing here.",
  "Superb value for money. The product arrived in perfect condition, genuine item with no issues whatsoever. Very impressed with the overall experience.",
  "Product arrived well-packaged and in pristine condition. Exactly what I was looking for. The seller was responsive and professional. Five stars without hesitation.",
  "Delivery was slightly delayed but the product quality more than made up for it. Beautifully crafted and exactly as advertised. Thoroughly satisfied.",
  "An excellent purchase. The whole family has been using it and everyone is very pleased with the quality. Will be ordering again soon.",
  "Impressive quality and attention to detail. I shared this with several colleagues and they were equally impressed. Thank you for a great product.",
  "Very satisfied with this purchase. The build quality is outstanding and the price is extremely competitive. This seller clearly takes pride in their offerings.",
  "Fast dispatch and excellent communication from the seller. Product quality exceeded my expectations. This is now my go-to store for this category.",
  "Brilliant product at a fair price. Came beautifully packaged and the quality is immediately evident. Cannot fault the experience in any way.",
  "One of the best purchases I have made online. The product performs exactly as described and the after-sales support was helpful. Highly commend this store.",
  "Top-tier quality. Better than I anticipated from the listing photos. The seller is clearly sourcing premium products. Will be recommending to friends and family.",
];

const reviewData = [];
for (let i = 0; i < products.length; i++) {
  const numReviews = Math.floor(Math.random() * 2) + 2;
  for (let j = 0; j < numReviews && j < customers.length; j++) {
    reviewData.push({
      user:               customers[j]._id,
      product:            products[i]._id,
      order:              new Types.ObjectId(),
      rating:             Math.floor(Math.random() * 2) + 4,
      comment:            comments[(i + j) % comments.length],
      isVerifiedPurchase: false,
      images:             [],
    });
  }
}
await Review.insertMany(reviewData);
console.log(`⭐ ${reviewData.length} reviews created`);

// ─── FINAL SUMMARY ────────────────────────────────────────────────
console.log("\n✅ ─────────────────────────────────────────────────────────");
console.log("SEED COMPLETE — VendorHub");
console.log("─────────────────────────────────────────────────────────");
console.log("\nVENDOR ACCOUNTS  (password: Test@1234)");
console.log("  ahmed@vendor.com   → TechZone Official Store   (electronics, accessories, books, other)");
console.log("  fatima@vendor.com  → Elegance Fashion House    (clothing, accessories, shoes, beauty)");
console.log("  usman@vendor.com   → ProSports Equipment       (sports, shoes, toys)");
console.log("  zainab@vendor.com  → Casa Decor & Living       (home, books, toys, food, other)");
console.log("\nCUSTOMER ACCOUNTS  (password: Test@1234)");
console.log("  hassan@gmail.com   → Hassan Ali");
console.log("  ayesha@gmail.com   → Ayesha Siddiqui");
console.log("  bilal@gmail.com    → Bilal Chaudhry");
console.log("  sana@gmail.com     → Sana Javed");
console.log("\nADMIN  (unchanged)");
console.log("  admin@test.com / Test@1234");
console.log("\n📦 CATEGORIES COVERED:");
console.log("  electronics, accessories, clothing, shoes, books, home, beauty, sports, toys, food, other");
console.log(`\n📊 ${products.length} products | 11 categories | 4 vendors | 4 customers | ${reviewData.length} reviews`);
console.log("─────────────────────────────────────────────────────────");

await mongoose.disconnect();
process.exit(0);