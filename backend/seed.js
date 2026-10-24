require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const VendorProfile = require('./models/VendorProfile');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const Review = require('./models/Review');
const Order = require('./models/Order');
const VendorOrder = require('./models/VendorOrder');
const CommissionLedger = require('./models/CommissionLedger');
const Cart = require('./models/Cart');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for expanded seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      VendorProfile.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Review.deleteMany({}),
      Order.deleteMany({}),
      VendorOrder.deleteMany({}),
      CommissionLedger.deleteMany({}),
      Cart.deleteMany({}),
    ]);
    console.log('🧹 Purged existing database records.');

    // 1. Create Users
    const admin = await User.create({
      name: 'Marketplace Administrator',
      email: 'admin@marketverse.com',
      password: 'Admin@123456',
      role: 'admin',
      phone: '+91 9876543210',
    });

    const vendorUser1 = await User.create({
      name: 'Apex Tech Goods',
      email: 'apex@vendor.com',
      password: 'Vendor@123456',
      role: 'vendor',
      phone: '+91 9876543211',
    });

    const vendorUser2 = await User.create({
      name: 'Urban Threads Apparel',
      email: 'urban@vendor.com',
      password: 'Vendor@123456',
      role: 'vendor',
      phone: '+91 9876543212',
    });

    const customer1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Customer@123456',
      role: 'customer',
      phone: '+91 9876543213',
    });

    const customer2 = await User.create({
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      password: 'Customer@123456',
      role: 'customer',
      phone: '+91 9876543214',
    });

    const customer3 = await User.create({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password: 'Customer@123456',
      role: 'customer',
      phone: '+91 9876543215',
    });

    // 2. Create Vendor Profiles
    const vendor1 = await VendorProfile.create({
      user: vendorUser1._id,
      storeName: 'Apex Electronics',
      storeEmail: 'contact@apexelectronics.com',
      storePhone: '+91 9876543211',
      description: 'Authorized retailer for premier tech, audio equipment, laptops and accessories.',
      logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      commissionRate: 8,
      status: 'approved',
      rating: 4.8,
    });

    const vendor2 = await VendorProfile.create({
      user: vendorUser2._id,
      storeName: 'Urban Threads Lifestyle',
      storeEmail: 'support@urbanthreads.com',
      storePhone: '+91 9876543212',
      description: 'Handcrafted streetwear, premium outerwear, and contemporary fashion accessories.',
      logo: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80',
      commissionRate: 12,
      status: 'approved',
      rating: 4.9,
    });

    // 3. Create Categories
    const catElectronics = await Category.create({
      name: 'Electronics & Gadgets',
      slug: 'electronics-gadgets',
      description: 'Smartphones, premium headphones, laptops, and gaming accessories',
      commissionPercentage: 8,
      iconUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
    });

    const catFashion = await Category.create({
      name: 'Fashion & Apparel',
      slug: 'fashion-apparel',
      description: 'Designer outerwear, jackets, bags, and luxury streetwear',
      commissionPercentage: 12,
      iconUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=300&q=80',
    });

    const catHome = await Category.create({
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Ergonomic furnishings, smart kitchenware, and modern decor',
      commissionPercentage: 10,
      iconUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=300&q=80',
    });

    const catSports = await Category.create({
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      description: 'Athletic footwear, training gear, and fitness equipment',
      commissionPercentage: 10,
      iconUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
    });

    // 4. Create 26 Diverse Products
    const products = await Product.create([
      // Electronics
      {
        vendor: vendor1._id,
        vendorUser: vendorUser1._id,
        title: 'Sony WH-1000XM5 Noise-Canceling Wireless Headphones',
        description: 'Industry-leading noise cancellation with dual processors and 8 microphones. Up to 30 hours battery life with ultra-clear call clarity.',
        category: catElectronics._id,
        brand: 'Sony',
        price: 399.99,
        salePrice: 349.99,
        stock: 45,
        featured: true,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.8,
        ratingsQuantity: 34,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendorUser1._id,
        title: 'Apple MacBook Air 15-inch M3 Chip 16GB RAM 512GB SSD',
        description: 'Strikingly thin design with blazing-fast Apple M3 chip. Liquid Retina display supporting 1 billion colors, 18-hour battery and MagSafe charging.',
        category: catElectronics._id,
        brand: 'Apple',
        price: 1499.0,
        salePrice: 1399.0,
        stock: 20,
        featured: true,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 42,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendorUser1._id,
        title: 'RGB Mechanical Gaming Keyboard with Hot-Swappable Switches',
        description: 'Pro-grade mechanical keyboard featuring aircraft-grade aluminum frame, per-key RGB backlighting, and programmable macro keys.',
        category: catElectronics._id,
        brand: 'ApexPro',
        price: 129.99,
        salePrice: 99.99,
        stock: 60,
        featured: false,
        images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.6,
        ratingsQuantity: 19,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendorUser1._id,
        title: 'Apple Watch Series 9 GPS 45mm Midnight Aluminum',
        description: 'Advanced health sensors, bright Always-On Retina display, S9 SiP with Double Tap gesture control, and up to 18 hours of normal use.',
        category: catElectronics._id,
        brand: 'Apple',
        price: 429.0,
        salePrice: 389.0,
        stock: 35,
        featured: true,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.8,
        ratingsQuantity: 28,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendorUser1._id,
        title: 'Logitech MX Master 3S Wireless Performance Mouse',
        description: '8K DPI any-surface tracking, quiet clicks, and MagSpeed electromagnetic scrolling for ultimate precision and ergonomic workflow.',
        category: catElectronics._id,
        brand: 'Logitech',
        price: 99.99,
        salePrice: 89.99,
        stock: 55,
        featured: false,
        images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 52,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendorUser1._id,
        title: 'Anker 737 Power Bank 24,000mAh 140W Fast Charging',
        description: 'Ultra-powerful two-way fast charging with smart digital display showing output and input power, supporting laptops and phones.',
        category: catElectronics._id,
        brand: 'Anker',
        price: 149.99,
        salePrice: 119.99,
        stock: 40,
        featured: false,
        images: ['https://images.unsplash.com/photo-1609592424300-d830b561c28c?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.7,
        ratingsQuantity: 21,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendorUser1._id,
        title: 'Samsung 32-inch 4K UHD Curved Gaming Monitor 144Hz',
        description: 'Immersive 1000R curved screen with AMD FreeSync Premium, 1ms response time, and HDR10 for fluid, high-detail entertainment.',
        category: catElectronics._id,
        brand: 'Samsung',
        price: 499.99,
        salePrice: 429.99,
        stock: 15,
        featured: true,
        images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.6,
        ratingsQuantity: 15,
      },

      // Fashion & Apparel
      {
        vendor: vendor2._id,
        vendorUser: vendorUser2._id,
        title: 'Heritage Washed Denim Jacket in Midnight Indigo',
        description: 'Crafted from 100% durable organic cotton denim with custom brass buttons and tailored seams. Designed for timeless versatility.',
        category: catFashion._id,
        brand: 'Urban Threads',
        price: 119.0,
        salePrice: 89.0,
        stock: 35,
        featured: true,
        images: ['https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.7,
        ratingsQuantity: 25,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendorUser2._id,
        title: 'Full-Grain Tuscan Leather Weekend Travel Duffle',
        description: 'Handcrafted luxury duffle bag made from vegetable-tanned Italian leather with heavy-duty YKK zippers and reinforced shoulder strap.',
        category: catFashion._id,
        brand: 'Urban Threads',
        price: 289.0,
        salePrice: 249.0,
        stock: 18,
        featured: true,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 5.0,
        ratingsQuantity: 19,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendorUser2._id,
        title: 'Pure Mongolian Cashmere Crewneck Knit Sweater',
        description: 'Ultra-soft 2-ply cashmere offering natural warmth and breathability. Ribbed collar and cuffs with relaxed tailored fit.',
        category: catFashion._id,
        brand: 'Urban Threads',
        price: 179.0,
        salePrice: 149.0,
        stock: 30,
        featured: false,
        images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.8,
        ratingsQuantity: 14,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendorUser2._id,
        title: 'Classic Polarized Aviator Sunglasses with Titanium Frame',
        description: '100% UV400 protection with scratch-resistant polarized lenses and ultra-light titanium bridge for all-day comfort.',
        category: catFashion._id,
        brand: 'SunCraft',
        price: 119.0,
        salePrice: 79.0,
        stock: 50,
        featured: false,
        images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.6,
        ratingsQuantity: 31,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendorUser2._id,
        title: 'Japanese Selvedge Slim-Fit Raw Denim Jeans',
        description: '14oz shuttle-loomed Japanese selvedge denim designed to fade with unique personal wear patterns. Button fly with copper rivets.',
        category: catFashion._id,
        brand: 'Urban Threads',
        price: 159.0,
        salePrice: 129.0,
        stock: 25,
        featured: false,
        images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 22,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendorUser2._id,
        title: 'Waterproof Alpine Shell Windbreaker Jacket',
        description: '3-layer technical waterproof fabric with taped seams, adjustable hood, and underarm zip vents for all-weather outdoor adventures.',
        category: catFashion._id,
        brand: 'SummitGear',
        price: 189.0,
        salePrice: 159.0,
        stock: 28,
        featured: false,
        images: ['https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.7,
        ratingsQuantity: 16,
      },

      // Home & Kitchen
      {
        vendor: vendor1._id,
        vendorUser: vendorUser1._id,
        title: 'Ergonomic Contour Memory Foam Cervical Support Pillow',
        description: 'Orthopedic cervical neck pillow featuring slow-rebound cooling gel memory foam and hypoallergenic bamboo fiber cover.',
        category: catHome._id,
        brand: 'ApexHome',
        price: 79.99,
        salePrice: 59.99,
        stock: 40,
        featured: false,
        images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.5,
        ratingsQuantity: 18,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendorUser1._id,
        title: 'Precision Temperature Control Electric Gooseneck Kettle',
        description: 'Barista-grade 0.8L stainless steel gooseneck spout for precise pour-over coffee flow rate with 60-minute heat maintain mode.',
        category: catHome._id,
        brand: 'BrewMaster',
        price: 99.0,
        salePrice: 79.0,
        stock: 35,
        featured: true,
        images: ['https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 38,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendorUser1._id,
        title: 'Ceramic Stoneware Matte Dinnerware 16-Piece Set',
        description: 'Contemporary Scandinavian tableware set including dinner plates, salad bowls, and mugs. Microwave and dishwasher safe.',
        category: catHome._id,
        brand: 'NordicLiving',
        price: 139.0,
        salePrice: 119.0,
        stock: 22,
        featured: false,
        images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.8,
        ratingsQuantity: 11,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendorUser1._id,
        title: 'Ultrasonic Essential Oil Aromatherapy Diffuser',
        description: 'Whisper-quiet 500ml ultrasonic cool mist diffuser with 7 ambient LED mood lights and automated waterless auto-shutoff.',
        category: catHome._id,
        brand: 'PureBreeze',
        price: 49.99,
        salePrice: 34.99,
        stock: 70,
        featured: false,
        images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.6,
        ratingsQuantity: 27,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendorUser1._id,
        title: 'Chef Series 67-Layer Damascus Steel 8-inch Chef Knife',
        description: 'Japanese VG-10 core with 67 layers of hammered Damascus steel. Razor-sharp 15-degree edge and ergonomic G10 composite handle.',
        category: catHome._id,
        brand: 'Kikuichi',
        price: 129.0,
        salePrice: 99.0,
        stock: 25,
        featured: true,
        images: ['https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 5.0,
        ratingsQuantity: 24,
      },
      {
        vendor: vendor1._id,
        vendorUser: vendorUser1._id,
        title: 'Solid Walnut Wood Monitor Riser & Desk Organizer',
        description: 'Handcrafted natural American walnut stand raising monitors to ergonomic eye-level with built-in cable pass-through and drawer.',
        category: catHome._id,
        brand: 'NordicLiving',
        price: 89.0,
        salePrice: 69.0,
        stock: 30,
        featured: false,
        images: ['https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.7,
        ratingsQuantity: 17,
      },

      // Sports & Outdoors
      {
        vendor: vendor2._id,
        vendorUser: vendorUser2._id,
        title: 'AeroGlide Ultra Breathable Performance Running Shoes',
        description: 'Responsive foam cushioning paired with breathable engineered mesh uppers. Maximizes energy return and joint comfort on long runs.',
        category: catSports._id,
        brand: 'UrbanSport',
        price: 145.0,
        salePrice: 115.0,
        stock: 50,
        featured: false,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.7,
        ratingsQuantity: 24,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendorUser2._id,
        title: 'Vacuum Insulated Stainless Steel Hydration Flask 32oz',
        description: 'Double-wall vacuum insulation keeps ice cold for 24 hours or piping hot for 12 hours. Sweat-free powder coat with leakproof straw lid.',
        category: catSports._id,
        brand: 'HydroActive',
        price: 39.99,
        salePrice: 29.99,
        stock: 80,
        featured: true,
        images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.8,
        ratingsQuantity: 62,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendorUser2._id,
        title: 'Heavy Duty 5-Piece Resistance Bands Set with Door Anchor',
        description: 'Natural anti-snap latex resistance tubes ranging from 10 to 50 lbs with padded foam handles, ankle straps, and travel carrying pouch.',
        category: catSports._id,
        brand: 'ProFit',
        price: 34.99,
        salePrice: 24.99,
        stock: 65,
        featured: false,
        images: ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.6,
        ratingsQuantity: 29,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendorUser2._id,
        title: 'Ultra-Lightweight 100% Carbon Fiber Trekking Poles',
        description: 'Shock-absorbing quick flip-lock collapsible hiking sticks with natural cork moisture-wicking grip and tungsten carbide tips.',
        category: catSports._id,
        brand: 'SummitGear',
        price: 79.0,
        salePrice: 64.0,
        stock: 40,
        featured: false,
        images: ['https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.8,
        ratingsQuantity: 15,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendorUser2._id,
        title: 'Non-Slip High Density Eco-Friendly TPE Yoga Mat 6mm',
        description: 'Dual-sided textured grip providing premium cushioning for knees and joints. Free of PVC, latex, and toxic chemicals with alignment lines.',
        category: catSports._id,
        brand: 'ZenFlow',
        price: 45.0,
        salePrice: 35.0,
        stock: 45,
        featured: false,
        images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.9,
        ratingsQuantity: 33,
      },
      {
        vendor: vendor2._id,
        vendorUser: vendorUser2._id,
        title: 'Trailblazer 40L Waterproof Multi-Day Hiking Backpack',
        description: 'Ripstop nylon backpack with breathable lumbar suspension system, integrated waterproof rain cover, and trekking pole attachments.',
        category: catSports._id,
        brand: 'SummitGear',
        price: 119.0,
        salePrice: 99.0,
        stock: 30,
        featured: true,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'],
        ratingsAverage: 4.7,
        ratingsQuantity: 20,
      },
    ]);

    // 5. Create Coupons
    await Coupon.create([
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 50,
        maxDiscountAmount: 50,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'MARKET20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 150,
        maxDiscountAmount: 100,
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'SUMMER25',
        discountType: 'percentage',
        discountValue: 25,
        minOrderAmount: 200,
        maxDiscountAmount: 150,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ]);

    // 6. Create Realistic Sample Orders & Vendor Orders for Settlement
    const order1 = await Order.create({
      orderNumber: 'ORD-1089',
      customer: customer1._id,
      shippingAddress: {
        fullName: 'John Doe',
        phone: '+91 9876543213',
        street: '42 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
      },
      itemsSummary: [
        {
          product: products[0]._id,
          title: products[0].title,
          image: products[0].images[0],
          quantity: 1,
          price: products[0].salePrice || products[0].price,
          vendor: vendor1._id,
          vendorName: vendor1.storeName,
        },
      ],
      subtotal: 349.99,
      taxAmount: 28.00,
      shippingFee: 0,
      discountAmount: 0,
      grandTotal: 377.99,
      paymentStatus: 'paid',
      paymentDetails: {
        provider: 'stripe_test',
        transactionId: 'pi_test_1089_apex',
        paymentMethod: 'card',
        paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      orderStatus: 'completed',
    });

    const vo1 = await VendorOrder.create({
      masterOrder: order1._id,
      vendor: vendor1._id,
      vendorUser: vendorUser1._id,
      items: [
        {
          product: products[0]._id,
          title: products[0].title,
          image: products[0].images[0],
          price: 349.99,
          quantity: 1,
          commissionPercent: 8,
          commissionAmount: 28.00,
          vendorPayout: 321.99,
        },
      ],
      subtotal: 349.99,
      commissionTotal: 28.00,
      vendorNetTotal: 321.99,
      fulfillmentStatus: 'delivered',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    const order2 = await Order.create({
      orderNumber: 'ORD-1088',
      customer: customer2._id,
      shippingAddress: {
        fullName: 'Sarah Connor',
        phone: '+91 9876543214',
        street: '15 Anna Salai',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '600002',
        country: 'India',
      },
      itemsSummary: [
        {
          product: products[7]._id,
          title: products[7].title,
          image: products[7].images[0],
          quantity: 1,
          price: products[7].salePrice || products[7].price,
          vendor: vendor2._id,
          vendorName: vendor2.storeName,
        },
      ],
      subtotal: 89.00,
      taxAmount: 7.12,
      shippingFee: 0,
      discountAmount: 0,
      grandTotal: 96.12,
      paymentStatus: 'paid',
      paymentDetails: {
        provider: 'razorpay_test',
        transactionId: 'pay_test_1088_urban',
        paymentMethod: 'upi',
        paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      orderStatus: 'processing',
    });

    const vo2 = await VendorOrder.create({
      masterOrder: order2._id,
      vendor: vendor2._id,
      vendorUser: vendorUser2._id,
      items: [
        {
          product: products[7]._id,
          title: products[7].title,
          image: products[7].images[0],
          price: 89.00,
          quantity: 1,
          commissionPercent: 12,
          commissionAmount: 10.68,
          vendorPayout: 78.32,
        },
      ],
      subtotal: 89.00,
      commissionTotal: 10.68,
      vendorNetTotal: 78.32,
      fulfillmentStatus: 'shipped',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    // Update orders with vendorOrders ref
    order1.vendorOrders = [vo1._id];
    await order1.save();

    order2.vendorOrders = [vo2._id];
    await order2.save();

    console.log('✅ EXPANDED SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`- 1 Admin: admin@marketverse.com / Admin@123456`);
    console.log(`- 2 Vendors: apex@vendor.com, urban@vendor.com / Vendor@123456`);
    console.log(`- 3 Customers: john@example.com, sarah@example.com, alex@example.com`);
    console.log(`- 4 Categories, ${products.length} Products, 3 Coupons, 2 Master Orders with Suborders.`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
