import {
  PrismaClient,
  Role,
  Transmission,
  FuelType,
  DiscountType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DriveEase database seeding...');

  // Clean existing data in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.bookingService.deleteMany();
  await prisma.additionalService.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.carImage.deleteMany();
  await prisma.car.deleteMany();
  await prisma.carCategory.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@driveease.com',
      password: adminPasswordHash,
      name: 'Alexander Sterling',
      firstName: 'Alexander',
      lastName: 'Sterling',
      phone: '+91 98765 43210',
      drivingLicenseNumber: 'DL-ADMIN-2024-9988',
      role: Role.ADMIN,
      isActive: true,
      emailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@driveease.com',
      password: passwordHash,
      name: 'Rohan Mehta',
      firstName: 'Rohan',
      lastName: 'Mehta',
      phone: '+91 98111 22334',
      drivingLicenseNumber: 'DL-MH01-2022-7712',
      role: Role.CUSTOMER,
      isActive: true,
      emailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'priya.sharma@example.com',
      password: passwordHash,
      name: 'Priya Sharma',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+91 99222 33445',
      drivingLicenseNumber: 'DL-DL04-2023-4567',
      role: Role.CUSTOMER,
      isActive: true,
      emailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    },
  });

  console.log('✅ Users created: 1 Admin and 2 Customers');

  // 2. Create Categories matching Phase 1 & 2
  const categories = await Promise.all([
    prisma.carCategory.create({
      data: {
        name: 'Hatchback',
        slug: 'hatchback',
        description: 'Agile, fuel-efficient city cars engineered for easy parking and economical journeys.',
        image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.carCategory.create({
      data: {
        name: 'Sedan',
        slug: 'sedan',
        description: 'Sophisticated executive saloons offering supreme comfort, prestige, and smooth performance.',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.carCategory.create({
      data: {
        name: 'SUV',
        slug: 'suv',
        description: 'Commanding high-clearance SUVs with panoramic visibility, ample luggage room, and all-weather capability.',
        image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.carCategory.create({
      data: {
        name: 'Luxury',
        slug: 'luxury',
        description: 'Ultra-prestigious vehicles featuring handcrafted interiors, state-of-the-art tech, and supreme prestige.',
        image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.carCategory.create({
      data: {
        name: 'Electric',
        slug: 'electric',
        description: 'Silent propulsion, instantaneous electric torque, and eco-friendly zero tailpipe emissions.',
        image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.carCategory.create({
      data: {
        name: 'Sports',
        slug: 'sports',
        description: 'Exhilarating horsepower, razor-sharp handling, and striking aerodynamic styling.',
        image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
      },
    }),
  ]);

  const catMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));
  console.log('✅ 6 Car categories created');

  // 3. Create Additional Services
  await Promise.all([
    prisma.additionalService.create({
      data: {
        name: 'Comprehensive Zero-Dep Insurance',
        slug: 'comprehensive-insurance',
        description: 'Zero deductible collision damage waiver, personal accident cover, and roadside assistance.',
        pricePerDay: 500,
        isOneTime: false,
        isAvailable: true,
      },
    }),
    prisma.additionalService.create({
      data: {
        name: 'Child Safety Car Seat',
        slug: 'child-safety-seat',
        description: 'ECE-certified multi-stage booster and ISOFIX child restraint seat for young passengers.',
        pricePerDay: 250,
        isOneTime: false,
        isAvailable: true,
      },
    }),
    prisma.additionalService.create({
      data: {
        name: 'Additional Authorized Driver',
        slug: 'additional-driver',
        description: 'Permit a second verified driver to operate the vehicle throughout the rental period.',
        pricePerDay: 350,
        isOneTime: false,
        isAvailable: true,
      },
    }),
    prisma.additionalService.create({
      data: {
        name: 'Portable 5G Wi-Fi Hotspot',
        slug: 'portable-wifi',
        description: 'Unlimited high-speed in-cabin internet connection for up to 8 client devices.',
        pricePerDay: 200,
        isOneTime: false,
        isAvailable: true,
      },
    }),
  ]);

  console.log('✅ Additional services created');

  // 4. Create 14 Realistic Vehicles matching Phase 2 mock data
  const vehiclesData = [
    {
      brand: 'Maruti Suzuki',
      model: 'Swift ZXi Plus',
      name: 'Maruti Suzuki Swift ZXi Plus',
      year: 2024,
      categoryName: 'Hatchback',
      transmission: Transmission.MANUAL,
      fuelType: FuelType.PETROL,
      seatingCapacity: 5,
      mileage: '22.3 km/l',
      doors: 5,
      luggageCapacity: 2,
      engineCapacity: '1.2L DualJet Dual VVT',
      horsepower: 89,
      dailyPrice: 1800,
      securityDeposit: 3000,
      pickupLocation: 'Bandra Kurla Complex, Mumbai',
      features: [
        'SmartPlay Touchscreen with Apple CarPlay & Android Auto',
        'Rear Parking Camera & Sensors',
        'Cruise Control',
        'Automatic Climate Control',
        'Push Button Start / Stop',
        'LED Projector Headlamps',
        'Airbags',
        'ABS with EBD',
      ],
      description: 'India’s most beloved hatchback, offering an agile city steering dynamic, exceptional fuel efficiency, and modern touchscreen connectivity.',
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', isPrimary: true, caption: 'Front Profile' },
        { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', isPrimary: false, caption: 'Dashboard & Interior' },
      ],
    },
    {
      brand: 'Hyundai',
      model: 'Creta SX (O) Turbo',
      name: 'Hyundai Creta SX (O) Turbo',
      year: 2024,
      categoryName: 'SUV',
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seatingCapacity: 5,
      mileage: '16.5 km/l',
      doors: 5,
      luggageCapacity: 3,
      engineCapacity: '1.5L Turbo GDi',
      horsepower: 158,
      dailyPrice: 3200,
      securityDeposit: 5000,
      pickupLocation: 'Chhatrapati Shivaji Maharaj Airport (T2), Mumbai',
      features: [
        'Panoramic Sunroof',
        'Bose Premium 8-Speaker Audio',
        'Ventilated Front Seats',
        'Dual 10.25-inch Connected Screens',
        'Level 2 ADAS Safety Suite',
        '360-Degree Surround View Monitor',
      ],
      description: 'The benchmark urban SUV. Packed with premium executive comfort, punchy turbocharged acceleration, and a commanding panoramic glass roof.',
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80', isPrimary: true, caption: 'Front Stance' },
        { url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80', isPrimary: false, caption: 'Panoramic Cabin' },
      ],
    },
    {
      brand: 'Kia',
      model: 'Seltos X-Line',
      name: 'Kia Seltos X-Line',
      year: 2024,
      categoryName: 'SUV',
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.DIESEL,
      seatingCapacity: 5,
      mileage: '18.2 km/l',
      doors: 5,
      luggageCapacity: 3,
      engineCapacity: '1.5L CRDi VGT',
      horsepower: 114,
      dailyPrice: 3400,
      securityDeposit: 5000,
      pickupLocation: 'Powai Technology Hub, Mumbai',
      features: [
        'Matte Graphite Aerodynamic Exterior',
        'Sage Green Leatherette Upholstery',
        'Dual Zone Automatic Climate Control',
        'Bose Sound System with Mood Lighting',
        'Blind Spot Collision Monitoring',
      ],
      description: 'Aggressive aesthetics meet torque-rich diesel economy. The Seltos X-Line delivers supreme highway stability, plush leather seating, and advanced active safety.',
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80', isPrimary: true, caption: 'Dynamic Angle' },
        { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', isPrimary: false, caption: 'Plush Leather Interior' },
      ],
    },
    {
      brand: 'Mahindra',
      model: 'Thar LX 4x4 Hard Top',
      name: 'Mahindra Thar LX 4x4 Hard Top',
      year: 2024,
      categoryName: 'SUV',
      transmission: Transmission.MANUAL,
      fuelType: FuelType.DIESEL,
      seatingCapacity: 4,
      mileage: '13.5 km/l',
      doors: 3,
      luggageCapacity: 2,
      engineCapacity: '2.2L mHawk 130',
      horsepower: 130,
      dailyPrice: 3800,
      securityDeposit: 6000,
      pickupLocation: 'Worli Sea Face, Mumbai',
      features: [
        'Shift-on-the-fly 4WD with Low Range Transfer Case',
        'Mechanical Locking Rear Differential',
        '7-inch Touchscreen with Off-Road Telemetrics',
        'Washable Interior with Drain Plugs',
        'All-Terrain 18-inch Deep-Tread Tyres',
      ],
      description: 'The quintessential Indian off-road icon. Built for mountain trails, coastal dunes, and unapologetic road presence with genuine 4x4 low-range prowess.',
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', isPrimary: true, caption: 'Rugged Off-Road Profile' },
        { url: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1200&q=80', isPrimary: false, caption: 'All-Terrain Suspension' },
      ],
    },
    {
      brand: 'Toyota',
      model: 'Fortuner Legender 4x4',
      name: 'Toyota Fortuner Legender 4x4',
      year: 2024,
      categoryName: 'SUV',
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.DIESEL,
      seatingCapacity: 7,
      mileage: '12.4 km/l',
      doors: 5,
      luggageCapacity: 5,
      engineCapacity: '2.8L Turbo Diesel with 500Nm Torque',
      horsepower: 201,
      dailyPrice: 6500,
      securityDeposit: 12000,
      pickupLocation: 'Chhatrapati Shivaji Maharaj Airport (T2), Mumbai',
      features: [
        'Full 7-Passenger High Comfort Seating',
        'Catamaran-Inspired Aggressive Bumper Design',
        '11-Speaker JBL Audio System',
        'Ventilated Front Seats with Contrast Stitching',
        'Electronic Drive Control 4x4',
      ],
      description: 'The undisputed king of highway dominance and reliability. Generous 7-seat versatility, legendary durability, and effortless long-distance touring capabilities.',
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80', isPrimary: true, caption: 'Front Grille' },
        { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', isPrimary: false, caption: 'Muscular Side Profile' },
      ],
    },
    {
      brand: 'BMW',
      model: '3 Series Gran Limousine M Sport',
      name: 'BMW 3 Series Gran Limousine M Sport',
      year: 2024,
      categoryName: 'Luxury',
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seatingCapacity: 5,
      mileage: '15.3 km/l',
      doors: 4,
      luggageCapacity: 3,
      engineCapacity: '2.0L BMW TwinPower Turbo 4-Cylinder',
      horsepower: 255,
      dailyPrice: 8500,
      securityDeposit: 15000,
      pickupLocation: 'Bandra Kurla Complex, Mumbai',
      features: [
        'Extended Wheelbase with Chauffeur Rear Legroom',
        'BMW Curved Dual Display with iDrive 8',
        'Harman Kardon Surround Sound System',
        'Panoramic Glass Sunroof',
        'Adaptive LED Headlamps with Blue Accents',
      ],
      description: 'The Ultimate Driving Machine reimagined with extra rear lounge space. Combining surgical cornering precision with whisper-quiet executive refinement.',
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', isPrimary: true, caption: 'Front Profile' },
        { url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80', isPrimary: false, caption: 'M Sport Cockpit' },
      ],
    },
    {
      brand: 'Porsche',
      model: '911 Carrera GTS',
      name: 'Porsche 911 Carrera GTS',
      year: 2024,
      categoryName: 'Sports',
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seatingCapacity: 2,
      mileage: '9.8 km/l',
      doors: 2,
      luggageCapacity: 2,
      engineCapacity: '3.0L Twin-Turbo Boxer 6',
      horsepower: 473,
      dailyPrice: 16500,
      securityDeposit: 30000,
      pickupLocation: 'Worli Sea Face, Mumbai',
      features: [
        'Sport Chrono Package with Mode Switch',
        'PASM Sport Suspension (-10 mm)',
        'Bose Surround Sound System',
        'Carbon Fiber Interior Package',
        'Porsche Ceramic Composite Brakes (PCCB)',
      ],
      description: 'Pure adrenaline in its most celebrated form. Unmistakable rear-engine rear-wheel-drive poise, ferocious twin-turbo boxer soundtrack, and scalpel-sharp handling.',
      isFeatured: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80', isPrimary: true, caption: 'Silhouette' },
        { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', isPrimary: false, caption: 'Cockpit' },
      ],
    },
    {
      brand: 'Tesla',
      model: 'Model 3 Long Range AWD',
      name: 'Tesla Model 3 Long Range AWD',
      year: 2024,
      categoryName: 'Electric',
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.ELECTRIC,
      seatingCapacity: 5,
      mileage: '629 km Range',
      doors: 4,
      luggageCapacity: 3,
      engineCapacity: 'Dual Motor All-Wheel Drive',
      horsepower: 425,
      dailyPrice: 7200,
      securityDeposit: 12000,
      pickupLocation: 'Powai Technology Hub, Mumbai',
      features: [
        '0-100 km/h in 4.2 Seconds',
        '15.4-inch Center Touchscreen Display',
        'Tesla Supercharger Network Compatibility',
        'Full Glass Panoramic Roof',
        'Autopilot Driver Assistance Hardware',
      ],
      description: 'Instant electric torque, whisper-quiet cabin acoustics, and class-leading battery range. The quintessential modern electric vehicle for forward-thinking travelers.',
      isFeatured: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80', isPrimary: true, caption: 'Aerodynamic Profile' },
        { url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', isPrimary: false, caption: 'Minimalist Interior' },
      ],
    },
    {
      brand: 'Tata',
      model: 'Nexon EV Long Range Empowered',
      name: 'Tata Nexon EV Long Range Empowered',
      year: 2024,
      categoryName: 'Electric',
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.ELECTRIC,
      seatingCapacity: 5,
      mileage: '465 km Range',
      doors: 5,
      luggageCapacity: 3,
      engineCapacity: 'Permanent Magnet Synchronous Motor',
      horsepower: 143,
      dailyPrice: 2600,
      securityDeposit: 4000,
      pickupLocation: 'Bandra Kurla Complex, Mumbai',
      features: [
        '12.3-inch Cinematic Touchscreen by HARMAN',
        'Vehicle-to-Load (V2L) Power Bank Feature',
        'Ventilated Front Seats',
        'Electric Sunroof with Tilt',
        'JBL 9-Speaker Audio System',
      ],
      description: 'India’s best-selling electric SUV, combining 5-star crash safety integrity with punchy emissions-free performance and connected lightbars.',
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80', isPrimary: true, caption: 'Front Stance' },
        { url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80', isPrimary: false, caption: 'Digital Cockpit' },
      ],
    },
    {
      brand: 'Honda',
      model: 'City ZX e:HEV Hybrid',
      name: 'Honda City ZX e:HEV Hybrid',
      year: 2024,
      categoryName: 'Sedan',
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.HYBRID,
      seatingCapacity: 5,
      mileage: '27.1 km/l',
      doors: 4,
      luggageCapacity: 3,
      engineCapacity: '1.5L Atkinson Cycle DOHC i-VTEC Hybrid',
      horsepower: 126,
      dailyPrice: 2800,
      securityDeposit: 5000,
      pickupLocation: 'Chhatrapati Shivaji Maharaj Airport (T2), Mumbai',
      features: [
        'Self-Charging Dual Motor Strong Hybrid Powertrain',
        'Honda Sensing ADAS Suite',
        'Electric Sunroof',
        'Lanewatch Camera',
        '8-Speaker Premium Acoustic Audio',
      ],
      description: 'The definitive executive sedan with self-charging strong hybrid efficiency. Delivers an astonishing 27.1 km/l fuel economy and silky electric drive at low speeds.',
      isFeatured: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', isPrimary: true, caption: 'Sleek Sedan Profile' },
        { url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', isPrimary: false, caption: 'Leather Interior' },
      ],
    },
    {
      brand: 'Mercedes-Benz',
      model: 'C-Class C200 AMG Line',
      name: 'Mercedes-Benz C-Class C200 AMG Line',
      year: 2024,
      categoryName: 'Luxury',
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seatingCapacity: 5,
      mileage: '16.9 km/l',
      doors: 4,
      luggageCapacity: 3,
      engineCapacity: '1.5L Turbo with 48V Mild Hybrid EQ Boost',
      horsepower: 204,
      dailyPrice: 9800,
      securityDeposit: 18000,
      pickupLocation: 'Worli Sea Face, Mumbai',
      features: [
        'Portrait 11.9-inch Central MBUX Touchscreen',
        '64-Color Ambient Mood Lighting',
        'Burmester 3D Surround Sound System',
        'AMG Line Diamond Pattern Grille & Styling',
        'Active Parking Assist with PARKTRONIC',
      ],
      description: 'Often heralded as the "Baby S-Class", the C-Class offers an opulent digital cockpit with flowing 64-color ambient light cascades and Burmester 3D acoustics.',
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80', isPrimary: true, caption: 'AMG Grille' },
        { url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80', isPrimary: false, caption: 'MBUX Portrait Cockpit' },
      ],
    },
    {
      brand: 'Hyundai',
      model: 'Verna SX (O) Turbo DCT',
      name: 'Hyundai Verna SX (O) Turbo DCT',
      year: 2024,
      categoryName: 'Sedan',
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seatingCapacity: 5,
      mileage: '20.6 km/l',
      doors: 4,
      luggageCapacity: 3,
      engineCapacity: '1.5L Turbo GDi 4-Cylinder',
      horsepower: 160,
      dailyPrice: 2900,
      securityDeposit: 5000,
      pickupLocation: 'Powai Technology Hub, Mumbai',
      features: [
        'Futuristic Horizon Connected LED Lightbar',
        'Dual 10.25-inch Integrated Display Screen',
        'Bose Premium 8-Speaker Audio System',
        'Heated and Ventilated Front Seats',
        'Smart Electric Sunroof',
      ],
      description: 'The most powerful mid-size sedan in India. Boasting a muscular 160 HP turbo engine, striking cyberpunk-inspired horizon LED strip, and a roomy fastback boot.',
      isFeatured: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', isPrimary: true, caption: 'Fastback Styling' },
        { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', isPrimary: false, caption: 'Ambient Interior Cockpit' },
      ],
    },
    {
      brand: 'Mahindra',
      model: 'XUV700 AX7 Luxury AWD',
      name: 'Mahindra XUV700 AX7 Luxury AWD',
      year: 2024,
      categoryName: 'SUV',
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.DIESEL,
      seatingCapacity: 7,
      mileage: '15.2 km/l',
      doors: 5,
      luggageCapacity: 4,
      engineCapacity: '2.2L mHawk Turbocharged Diesel',
      horsepower: 185,
      dailyPrice: 4500,
      securityDeposit: 8000,
      pickupLocation: 'Bandra Kurla Complex, Mumbai',
      features: [
        'Dual 10.25-inch Superscreen Cockpit with AdrenoX',
        'Sony 3D 12-Speaker Immersive Audio with Roof Speakers',
        'Panoramic Skyroof - Largest in Segment',
        'Smart Flush Door Handles',
        'Level 2 ADAS with Adaptive Cruise',
      ],
      description: 'India’s technological flagship SUV. Features Sony 3D spatial sound with custom roof speakers, a colossal panoramic Skyroof, and 7-seat family luxury.',
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1200&q=80', isPrimary: true, caption: 'Commanding Front Profile' },
        { url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80', isPrimary: false, caption: 'Panoramic Skyroof' },
      ],
    },
    {
      brand: 'Maruti Suzuki',
      model: 'Ertiga ZXi CNG',
      name: 'Maruti Suzuki Ertiga ZXi CNG',
      year: 2024,
      categoryName: 'Hatchback',
      transmission: Transmission.MANUAL,
      fuelType: FuelType.CNG,
      seatingCapacity: 7,
      mileage: '26.1 km/kg',
      doors: 5,
      luggageCapacity: 3,
      engineCapacity: '1.5L K15C Smart Hybrid CNG',
      horsepower: 87,
      dailyPrice: 2100,
      securityDeposit: 3500,
      pickupLocation: 'Chhatrapati Shivaji Maharaj Airport (T2), Mumbai',
      features: [
        'Factory-Fitted S-CNG Clean Fuel Technology',
        '7-Seat Modular Seating with Reclining Rows',
        '7-inch SmartPlay Touchscreen Audio',
        'Roof Mounted Rear Air Conditioner Vents',
        'Rear Parking Sensors & Camera',
      ],
      description: 'The ultimate cost-effective 7-seater rental vehicle. Equipped with factory S-CNG technology delivering an exceptional 26.1 km/kg running economy.',
      isFeatured: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', isPrimary: true, caption: 'Front Stance' },
        { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', isPrimary: false, caption: '3-Row Seating' },
      ],
    },
  ];

  for (const v of vehiclesData) {
    const categoryId = catMap[v.categoryName];
    if (!categoryId) continue;

    await prisma.car.create({
      data: {
        brand: v.brand,
        model: v.model,
        name: v.name,
        year: v.year,
        categoryId,
        transmission: v.transmission,
        fuelType: v.fuelType,
        seatingCapacity: v.seatingCapacity,
        mileage: v.mileage,
        doors: v.doors,
        numberOfDoors: v.doors,
        luggageCapacity: v.luggageCapacity,
        engineCapacity: v.engineCapacity,
        horsepower: v.horsepower,
        dailyPrice: v.dailyPrice,
        pricePerDay: v.dailyPrice,
        securityDeposit: v.securityDeposit,
        pickupLocation: v.pickupLocation,
        dropoffLocation: v.pickupLocation,
        location: v.pickupLocation,
        features: v.features,
        description: v.description,
        isFeatured: v.isFeatured,
        isAvailable: true,
        availabilityStatus: 'Available',
        isActive: true,
        images: {
          create: v.images.map((img, idx) => ({
            url: img.url,
            imageUrl: img.url,
            isPrimary: img.isPrimary,
            caption: img.caption,
            order: idx,
            displayOrder: idx,
          })),
        },
      },
    });
  }

  console.log(`✅ Seeded ${vehiclesData.length} realistic vehicles with images`);

  // 5. Pre-seeded Promotional Coupons
  await Promise.all([
    prisma.coupon.create({
      data: {
        code: 'DRIVE10',
        description: '10% instant discount on bookings above ₹2,000 (Capped at ₹1,500)',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minBookingAmount: 2000,
        maxDiscountAmount: 1500,
        isActive: true,
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'WELCOME500',
        description: 'Flat ₹500 instant welcome savings on first booking',
        discountType: DiscountType.FIXED,
        discountValue: 500,
        minBookingAmount: 3000,
        isActive: true,
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'LUXURY20',
        description: '20% privilege discount for premium and luxury fleet',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        minBookingAmount: 8000,
        maxDiscountAmount: 5000,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Pre-seeded coupons created: DRIVE10, WELCOME500, LUXURY20');
  console.log('🎉 DriveEase database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
