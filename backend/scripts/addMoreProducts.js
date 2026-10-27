require('dotenv').config();
const connectDB = require('../config/db');
const Category = require('../models/Category');
const VendorProfile = require('../models/VendorProfile');
const Product = require('../models/Product');

async function seedMoreItems() {
  try {
    await connectDB();
    console.log('Connected to MongoDB Atlas for catalog expansion...');

    // 1. Fetch or create Categories
    let catElectronics = await Category.findOne({ slug: 'electronics-gadgets' });
    let catFashion = await Category.findOne({ slug: 'fashion-apparel' });
    let catHome = await Category.findOne({ slug: 'home-kitchen' });
    let catSports = await Category.findOne({ slug: 'sports-outdoors' });

    let catBeauty = await Category.findOne({ slug: 'beauty-personal-care' });
    if (!catBeauty) {
      catBeauty = await Category.create({
        name: 'Beauty & Personal Care',
        slug: 'beauty-personal-care',
        description: 'Luxury skincare, organic serums, grooming sets, and signature fragrances',
        commissionPercentage: 11,
        iconUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80',
      });
      console.log('Created category: Beauty & Personal Care');
    }

    let catBooks = await Category.findOne({ slug: 'books-stationery' });
    if (!catBooks) {
      catBooks = await Category.create({
        name: 'Books & Stationery',
        slug: 'books-stationery',
        description: 'Bestselling titles, smart notebooks, collectible fountain pens, and desk accessories',
        commissionPercentage: 9,
        iconUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&q=80',
      });
      console.log('Created category: Books & Stationery');
    }

    // 2. Fetch Vendors
    let vendor1 = await VendorProfile.findOne({ storeName: 'Apex Electronics' });
    if (!vendor1) vendor1 = await VendorProfile.findOne({ storeName: 'Apex Tech Goods' });
    if (!vendor1) vendor1 = await VendorProfile.findOne({});

    let vendor2 = await VendorProfile.findOne({ storeName: 'Urban Threads Lifestyle' });
    if (!vendor2) vendor2 = await VendorProfile.findOne({ storeName: 'Urban Threads Apparel' });
    if (!vendor2) vendor2 = vendor1;

    if (!vendor1) {
      console.error('No vendors found. Please run seed.js first.');
      process.exit(1);
    }

    const newItems = [
      // Electronics (Apex Tech Goods)
      {
        vendor: vendor1._id,
        vendorUser: vendor1.user,
        title: 'Samsung 55-inch Crystal 4K UHD Smart TV with HDR10+',
        description: 'PurColor technology delivers millions of shades of vibrant color. 4K upscaling, Motion Xcelerator for fluid gaming, and built-in voice assistants.',
        category: catElectronics._id,
        brand: 'Samsung',
        price: 499.99,
        salePrice: 449.99,
        stock: 25,
        featured: true,
        images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.8,
        ratingsQuantity: 41,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendor1.user,
        title: 'DJI Mini 4K Ultralight Foldable Drone with 3-Axis Gimbal',
        description: 'Under 249g ultra-compact drone. 4K/30fps stabilized video, 10km HD video transmission, Level 5 wind resistance, and 31-minute flight time.',
        category: catElectronics._id,
        brand: 'DJI',
        price: 399.00,
        salePrice: 349.00,
        stock: 30,
        featured: true,
        images: ['https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 58,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendor1.user,
        title: 'Bose SoundLink Flex Waterproof Bluetooth Portable Speaker',
        description: 'PositionIQ technology automatically optimizes sound for orientation. IP67 waterproof & dustproof, silicone exterior, and 12-hour rechargeable battery.',
        category: catElectronics._id,
        brand: 'Bose',
        price: 149.00,
        salePrice: 129.00,
        stock: 50,
        featured: false,
        images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.7,
        ratingsQuantity: 36,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendor1.user,
        title: 'Kindle Paperwhite 16GB Waterproof E-Reader 6.8" 300ppi',
        description: 'Flush-front design with glare-free 300 ppi display that reads like real paper. Adjustable warm light, weeks of battery life, and USB-C fast charging.',
        category: catElectronics._id,
        brand: 'Amazon',
        price: 149.99,
        salePrice: 129.99,
        stock: 40,
        featured: false,
        images: ['https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.8,
        ratingsQuantity: 29,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendor1.user,
        title: 'Logitech MX Master 3S Wireless Performance Ergonomic Mouse',
        description: 'Quiet Click technology with 8,000 DPI track-on-glass sensor. MagSpeed electromagnetic scrolling that scrolls 1,000 lines per second with USB-C.',
        category: catElectronics._id,
        brand: 'Logitech',
        price: 99.99,
        salePrice: 89.99,
        stock: 65,
        featured: true,
        images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 62,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendor1.user,
        title: 'Anker 737 Power Bank 24,000mAh 140W 3-Port Laptop Charger',
        description: 'Ultra-powerful two-way fast charging with Power Delivery 3.1. Smart digital display shows output/input power and estimated full recharge time.',
        category: catElectronics._id,
        brand: 'Anker',
        price: 129.99,
        salePrice: 109.99,
        stock: 35,
        featured: false,
        images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.7,
        ratingsQuantity: 24,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendor1.user,
        title: 'Sony Alpha 7 IV Full-Frame 33MP Hybrid Mirrorless Camera',
        description: 'Groundbreaking full-frame 33MP Exmor R CMOS sensor with BIONZ XR processing engine. 4K 60p 10-bit video, real-time eye autofocus for photo and cinema.',
        category: catElectronics._id,
        brand: 'Sony',
        price: 2499.00,
        salePrice: 2299.00,
        stock: 12,
        featured: true,
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 5.0,
        ratingsQuantity: 18,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendor1.user,
        title: 'Dell UltraSharp 27-inch 4K UHD IPS USB-C Hub Monitor',
        description: 'Exceptional clarity with 98% DCI-P3 color coverage. Single-cable 90W USB-C connectivity, RJ45 Ethernet, and ComfortView Plus low blue light screen.',
        category: catElectronics._id,
        brand: 'Dell',
        price: 579.99,
        salePrice: 519.99,
        stock: 18,
        featured: false,
        images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.8,
        ratingsQuantity: 22,
      },

      // Fashion & Apparel (Urban Threads Apparel)
      {
        vendor: vendor2._id,
        vendorUser: vendor2.user,
        title: 'Luxury Automatic Chronograph Watch with Sapphire Crystal',
        description: 'Exquisite Japanese automatic movement with 42-hour power reserve. Surgical-grade 316L stainless steel case, exhibition caseback, and 100m water resistance.',
        category: catFashion._id,
        brand: 'ChronoSwiss',
        price: 299.99,
        salePrice: 249.99,
        stock: 20,
        featured: true,
        images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 33,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendor2.user,
        title: "Men's Italian Handcrafted Suede Chelsea Ankle Boots",
        description: 'Premium calfskin suede from Tuscany with Goodyear welted construction. Cushioned leather footbed and durable crepe rubber outsole.',
        category: catFashion._id,
        brand: 'Firenze',
        price: 159.00,
        salePrice: 129.00,
        stock: 30,
        featured: true,
        images: ['https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.7,
        ratingsQuantity: 27,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendor2.user,
        title: "Women's 100% Pure Mongolian Cashmere Ribbed Sweater",
        description: 'Ethically sourced Grade-A Mongolian cashmere offering unparalleled softness and warmth without weight. Ribbed cuffs and hem with timeless crewneck.',
        category: catFashion._id,
        brand: 'Lusso',
        price: 149.00,
        salePrice: 119.00,
        stock: 35,
        featured: false,
        images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 44,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendor2.user,
        title: 'British Heritage Double-Breasted Water-Resistant Trench Coat',
        description: 'Durable cotton gabardine weave with water-repellent finish. Removable storm flap, epaulettes, tortoise buttons, and signature check lining.',
        category: catFashion._id,
        brand: 'LondonFog',
        price: 179.99,
        salePrice: 149.99,
        stock: 22,
        featured: false,
        images: ['https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.6,
        ratingsQuantity: 19,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendor2.user,
        title: 'Full-Grain Pull-Up Leather Weekender Duffel Travel Bag',
        description: 'Generous 45L travel duffel made from vegetable-tanned full-grain leather. Reinforced handles, solid brass hardware, and dedicated shoe compartment.',
        category: catFashion._id,
        brand: 'HeritageCraft',
        price: 139.00,
        salePrice: 115.00,
        stock: 28,
        featured: true,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.8,
        ratingsQuantity: 37,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendor2.user,
        title: 'Ray-Ban Classic Aviator Polarized Sunglasses G-15 Green Lens',
        description: 'Iconic gold wireframe sunglasses engineered with polarized crystal lenses. 100% UV400 protection with unmatched glare reduction.',
        category: catFashion._id,
        brand: 'Ray-Ban',
        price: 169.00,
        salePrice: 149.00,
        stock: 45,
        featured: false,
        images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 65,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendor2.user,
        title: 'Pure French Linen Relaxed Resort Button-Down Shirt',
        description: 'Breathable, lightweight 100% Normandy flax linen. Washed for broken-in softness with mother-of-pearl buttons for hot summer getaways.',
        category: catFashion._id,
        brand: 'CoastalBreeze',
        price: 59.99,
        salePrice: 44.99,
        stock: 50,
        featured: false,
        images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.7,
        ratingsQuantity: 28,
      },

      // Home & Kitchen
      {
        vendor: vendor1._id,
        vendorUser: vendor1.user,
        title: "De'Longhi Dedica Deluxe Espresso Machine & Milk Frother",
        description: '15-bar professional pressure delivers rich, crema-topped espresso. Manual adjustable steam wand froths silky milk for barista-quality latte and cappuccino.',
        category: catHome._id,
        brand: "De'Longhi",
        price: 299.95,
        salePrice: 249.95,
        stock: 20,
        featured: true,
        images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 52,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendor1.user,
        title: 'Enameled Cast Iron Signature 6-Quart Round Dutch Oven',
        description: 'Superior heat distribution and retention for slow-cooking, braising, and roasting. Vibrant chip-resistant enamel coating with stainless steel lid knob.',
        category: catHome._id,
        brand: 'MaisonCuisine',
        price: 119.99,
        salePrice: 89.99,
        stock: 35,
        featured: true,
        images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.8,
        ratingsQuantity: 39,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendor1.user,
        title: 'Smart Robot Vacuum Cleaner with Lidar Mapping & Auto-Empty Mop',
        description: '5000Pa hyper suction with precision LDS laser navigation. Sonic mopping lifts over rugs, paired with self-cleaning auto-empty dustbase.',
        category: catHome._id,
        brand: 'Roborock',
        price: 349.00,
        salePrice: 289.00,
        stock: 25,
        featured: true,
        images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 47,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendor1.user,
        title: 'Cold Press Masticating Slow Juicer for Celery & Fruits',
        description: 'Low-speed 60 RPM motor preserves vitamins, enzymes, and nutrients without heat buildup. High juice yield with ultra-quiet operation and reverse function.',
        category: catHome._id,
        brand: 'HuromStyle',
        price: 129.99,
        salePrice: 99.99,
        stock: 30,
        featured: false,
        images: ['https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.7,
        ratingsQuantity: 31,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendor1.user,
        title: 'Luxury 1000 Thread Count Egyptian Cotton 4-Piece Sheet Set',
        description: 'Woven from authentic long-staple Egyptian cotton yarns with lustrous sateen weave. Exceptionally smooth, silky, breathable, and fade-resistant.',
        category: catHome._id,
        brand: 'SilkWeave',
        price: 129.00,
        salePrice: 99.00,
        stock: 40,
        featured: false,
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.8,
        ratingsQuantity: 26,
      },

      // Sports & Outdoors
      {
        vendor: vendor2._id,
        vendorUser: vendor2.user,
        title: 'Garmin Forerunner 265 GPS Running & Tri-Sport Smartwatch',
        description: 'Brilliant AMOLED touchscreen display with advanced training metrics, HRV status, recovery time, morning report, and up to 13 days of battery life.',
        category: catSports._id,
        brand: 'Garmin',
        price: 299.99,
        salePrice: 269.99,
        stock: 28,
        featured: true,
        images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 51,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendor2.user,
        title: "Inflatable Stand-Up Paddle Board 10'6\" All-Round SUP Package",
        description: 'Military-grade double-layer PVC drop-stitch construction supporting up to 330 lbs. Includes floating paddle, leash, dual-action pump, and carry pack.',
        category: catSports._id,
        brand: 'AquaWave',
        price: 329.00,
        salePrice: 279.00,
        stock: 15,
        featured: true,
        images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.8,
        ratingsQuantity: 34,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendor2.user,
        title: 'Rapid-Adjust Dumbbells Pair 5 to 52.5 lbs with Storage Tray',
        description: 'Patented dial selection mechanism adjusts weight in seconds from 5 to 52.5 lbs per hand. Replaces 15 sets of dumbbells with space-saving steel trays.',
        category: catSports._id,
        brand: 'IronGrip',
        price: 349.99,
        salePrice: 299.99,
        stock: 16,
        featured: true,
        images: ['https://images.unsplash.com/photo-1586401100295-7a8096fd231a?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 43,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendor2.user,
        title: 'Instant 4-Person Weatherproof Camping Dome Tent with Rainfly',
        description: 'Pre-attached poles unfold and extend in just 60 seconds. WeatherTec welded floor seams, dark room technology blocking 90% sunlight, and E-Port.',
        category: catSports._id,
        brand: 'Coleman',
        price: 159.99,
        salePrice: 129.99,
        stock: 25,
        featured: false,
        images: ['https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.7,
        ratingsQuantity: 29,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendor2.user,
        title: 'Aerodynamic MIPS Mountain & Road Cycling Helmet with LED',
        description: 'In-mold polycarbonate shell with integrated Multi-directional Impact Protection System (MIPS). 18 ventilation wind tunnels and USB rechargeable rear light.',
        category: catSports._id,
        brand: 'GiroPro',
        price: 69.99,
        salePrice: 54.99,
        stock: 40,
        featured: false,
        images: ['https://images.unsplash.com/photo-1559348349-86f1f65817fe?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.8,
        ratingsQuantity: 31,
      },

      // Beauty & Personal Care
      {
        vendor: vendor2._id,
        vendorUser: vendor2.user,
        title: 'Advanced Vitamin C + Hyaluronic Acid 20% Radiance Serum 50ml',
        description: 'Potent antioxidant complex with stabilized Vitamin C, botanical hyaluronic acid, and Ferulic acid to brighten dark spots, stimulate collagen, and plump skin.',
        category: catBeauty._id,
        brand: 'Lumiere',
        price: 39.99,
        salePrice: 29.99,
        stock: 70,
        featured: true,
        images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 73,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendor2.user,
        title: 'Complete Beard Grooming Care Kit with Sandalwood Oil & Trimmer',
        description: 'All-inclusive beard care box: organic cold-pressed jojoba oil, shaping balm, boars hair brush, stainless trimming scissors, and cordless beard trimmer.',
        category: catBeauty._id,
        brand: 'GentlemenClub',
        price: 49.99,
        salePrice: 36.99,
        stock: 55,
        featured: false,
        images: ['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.8,
        ratingsQuantity: 41,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendor2.user,
        title: 'Pro Ionic Salon Hair Dryer with Magnetic Nozzles & Diffuser',
        description: 'High-speed 110,000 RPM brushless motor generating powerful airflow that dries hair in half the time without extreme heat damage. 200 million negative ions.',
        category: catBeauty._id,
        brand: 'BellaDry',
        price: 89.99,
        salePrice: 69.99,
        stock: 35,
        featured: false,
        images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.7,
        ratingsQuantity: 38,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendor2.user,
        title: 'Velvet Santal Luxury Eau de Parfum Unisex 100ml / 3.4 fl oz',
        description: 'Captivating fragrance blending warm Australian sandalwood, cardamom, violet leaves, iris, and smoky cedarwood. Long-lasting 12-hour sillage.',
        category: catBeauty._id,
        brand: 'MaisonParfum',
        price: 119.00,
        salePrice: 95.00,
        stock: 30,
        featured: true,
        images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 64,
      },

      // Books & Stationery
      {
        vendor: vendor1._id,
        vendorUser: vendor1.user,
        title: 'Atomic Habits by James Clear - Deluxe Hardcover Gold Foil Edition',
        description: 'The #1 New York Times bestseller with over 15 million copies sold. A proven framework for improving every day with small changes that bring remarkable results.',
        category: catBooks._id,
        brand: 'Penguin Publishing',
        price: 29.99,
        salePrice: 21.99,
        stock: 80,
        featured: true,
        images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 5.0,
        ratingsQuantity: 124,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendor1.user,
        title: 'Reusable Smart Erasable Digital Notebook with Cloud Pen & App',
        description: '36 reusable pages that wipe clean with a damp cloth when paired with Pilot FriXion pens. Instantly sync handwritten notes to Google Drive, Slack, and iCloud.',
        category: catBooks._id,
        brand: 'SmartNote',
        price: 34.99,
        salePrice: 27.99,
        stock: 60,
        featured: false,
        images: ['https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.8,
        ratingsQuantity: 45,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendor1.user,
        title: 'Handcrafted Solid Brass Vintage Fountain Pen with Luxury Case',
        description: 'Solid brass hexagonal barrel with natural aging patina. German Schmidt fine iridium nib providing effortless ink flow, includes piston converter and 6 cartridges.',
        category: catBooks._id,
        brand: 'Manuscript',
        price: 49.00,
        salePrice: 39.00,
        stock: 40,
        featured: false,
        images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 32,
      },
    ];

    let insertedCount = 0;
    for (const item of newItems) {
      const existing = await Product.findOne({ title: item.title });
      if (!existing) {
        await Product.create(item);
        insertedCount++;
      }
    }

    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();

    console.log(`✅ SUCCESS: Added ${insertedCount} new products!`);
    console.log(`📊 Total Products now in MongoDB Atlas: ${totalProducts}`);
    console.log(`📊 Total Categories in MongoDB Atlas: ${totalCategories}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to add products:', err);
    process.exit(1);
  }
}

seedMoreItems();
