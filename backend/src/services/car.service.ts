import prisma from '../config/db';
import { AppError } from '../utils/appError';
import { Prisma } from '@prisma/client';

export interface CarFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  category?: string;
  fuelType?: string;
  transmission?: string;
  seats?: number;
  minSeats?: number;
  minPrice?: number;
  maxPrice?: number;
  availability?: 'all' | 'available' | 'reserved';
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export class CarService {
  static async getCars(params: CarFilterParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.CarWhereInput = {
      isActive: true,
    };

    // 1. Text Search across brand, model, features
    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { brand: { contains: q, mode: 'insensitive' } },
        { model: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { category: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    // 2. Brand
    if (params.brand && params.brand.trim()) {
      where.brand = { equals: params.brand.trim(), mode: 'insensitive' };
    }

    // 3. Category (by slug or name)
    if (params.category && params.category.trim()) {
      const cat = params.category.trim();
      where.category = {
        OR: [
          { slug: { equals: cat.toLowerCase(), mode: 'insensitive' } },
          { name: { equals: cat, mode: 'insensitive' } },
        ],
      };
    }

    // 4. Fuel Type
    if (params.fuelType && params.fuelType.trim()) {
      const fuel = params.fuelType.toUpperCase().trim() as any;
      where.fuelType = fuel;
    }

    // 5. Transmission
    if (params.transmission && params.transmission.trim()) {
      const trans = params.transmission.toUpperCase().trim() as any;
      where.transmission = trans;
    }

    // 6. Seats / Minimum seats
    const seatsFilter = params.seats || params.minSeats;
    if (seatsFilter) {
      where.seatingCapacity = { gte: Number(seatsFilter) };
    }

    // 7. Price Range
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.dailyPrice = {};
      if (params.minPrice !== undefined) {
        where.dailyPrice.gte = new Prisma.Decimal(params.minPrice);
      }
      if (params.maxPrice !== undefined) {
        where.dailyPrice.lte = new Prisma.Decimal(params.maxPrice);
      }
    }

    // 8. Availability
    if (params.availability === 'available') {
      where.isAvailable = true;
    } else if (params.availability === 'reserved') {
      where.isAvailable = false;
    }

    // Sorting
    let orderBy: Prisma.CarOrderByWithRelationInput = { createdAt: 'desc' };

    switch (params.sortBy) {
      case 'price_asc':
        orderBy = { dailyPrice: 'asc' };
        break;
      case 'price_desc':
      case 'pricePerDay':
        orderBy = { dailyPrice: params.order || 'desc' };
        break;
      case 'newest':
        orderBy = { year: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'popular':
        orderBy = { reviewCount: 'desc' };
        break;
      case 'recommended':
      default:
        orderBy = { isFeatured: 'desc' };
        break;
    }

    const [total, cars] = await Promise.all([
      prisma.car.count({ where }),
      prisma.car.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { order: 'asc' },
          },
        },
      }),
    ]);

    // Format for consistent client consumption
    const formattedCars = cars.map((car) => ({
      ...car,
      dailyPrice: Number(car.dailyPrice),
      pricePerDay: Number(car.dailyPrice),
      securityDeposit: Number(car.securityDeposit),
      category: car.category.name,
      categorySlug: car.category.slug,
      images: car.images.map((img) => ({
        id: img.id,
        url: img.url,
        imageUrl: img.url,
        isPrimary: img.isPrimary,
        caption: img.caption,
      })),
    }));

    return {
      cars: formattedCars,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCarById(id: string) {
    const car = await prisma.car.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!car || !car.isActive) {
      throw new AppError('Vehicle not found or no longer active in our fleet.', 404);
    }

    return {
      ...car,
      dailyPrice: Number(car.dailyPrice),
      pricePerDay: Number(car.dailyPrice),
      securityDeposit: Number(car.securityDeposit),
      category: car.category.name,
      categorySlug: car.category.slug,
      images: car.images.map((img) => ({
        id: img.id,
        url: img.url,
        imageUrl: img.url,
        isPrimary: img.isPrimary,
        caption: img.caption,
      })),
    };
  }

  static async getCategories() {
    const categories = await prisma.carCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            cars: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      vehicleCount: c._count.cars,
    }));
  }

  // Admin Car Management
  static async createCar(data: any) {
    // Verify category exists
    const category = await prisma.carCategory.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new AppError('Invalid category ID.', 400);
    }

    const newCar = await prisma.car.create({
      data: {
        brand: data.brand,
        model: data.model,
        name: data.name || `${data.brand} ${data.model}`,
        year: data.year,
        categoryId: data.categoryId,
        transmission: data.transmission,
        fuelType: data.fuelType,
        seatingCapacity: data.seatingCapacity,
        mileage: data.mileage,
        doors: data.doors || 4,
        numberOfDoors: data.doors || 4,
        luggageCapacity: data.luggageCapacity || 3,
        engineCapacity: data.engineCapacity || null,
        horsepower: data.horsepower || null,
        dailyPrice: new Prisma.Decimal(data.dailyPrice),
        pricePerDay: new Prisma.Decimal(data.dailyPrice),
        securityDeposit: new Prisma.Decimal(data.securityDeposit || 3000),
        minRentalDays: data.minRentalDays || 1,
        maxRentalDays: data.maxRentalDays || 30,
        pickupLocation: data.pickupLocation || 'Downtown Hub, Mumbai',
        dropoffLocation: data.dropoffLocation || 'Downtown Hub, Mumbai',
        location: data.pickupLocation || 'Downtown Hub, Mumbai',
        features: data.features || [],
        description: data.description || null,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        availabilityStatus: data.isAvailable !== false ? 'Available' : 'Reserved',
        isFeatured: data.isFeatured || false,
        isActive: true,
        images: {
          create: data.images.map((img: any, idx: number) => ({
            url: img.url || img.imageUrl,
            imageUrl: img.url || img.imageUrl,
            publicId: img.publicId || null,
            isPrimary: img.isPrimary || idx === 0,
            caption: img.caption || null,
            order: img.order !== undefined ? img.order : idx,
            displayOrder: img.displayOrder !== undefined ? img.displayOrder : idx,
          })),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    return {
      ...newCar,
      dailyPrice: Number(newCar.dailyPrice),
      pricePerDay: Number(newCar.dailyPrice),
      securityDeposit: Number(newCar.securityDeposit),
    };
  }

  static async updateCar(id: string, data: any) {
    const existing = await prisma.car.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new AppError('Vehicle not found.', 404);
    }

    const updateData: any = {};
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.model !== undefined) updateData.model = data.model;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.transmission !== undefined) updateData.transmission = data.transmission;
    if (data.fuelType !== undefined) updateData.fuelType = data.fuelType;
    if (data.seatingCapacity !== undefined) updateData.seatingCapacity = data.seatingCapacity;
    if (data.mileage !== undefined) updateData.mileage = data.mileage;
    if (data.doors !== undefined) {
      updateData.doors = data.doors;
      updateData.numberOfDoors = data.doors;
    }
    if (data.luggageCapacity !== undefined) updateData.luggageCapacity = data.luggageCapacity;
    if (data.engineCapacity !== undefined) updateData.engineCapacity = data.engineCapacity;
    if (data.horsepower !== undefined) updateData.horsepower = data.horsepower;
    if (data.dailyPrice !== undefined) {
      updateData.dailyPrice = new Prisma.Decimal(data.dailyPrice);
      updateData.pricePerDay = new Prisma.Decimal(data.dailyPrice);
    }
    if (data.securityDeposit !== undefined) {
      updateData.securityDeposit = new Prisma.Decimal(data.securityDeposit);
    }
    if (data.pickupLocation !== undefined) {
      updateData.pickupLocation = data.pickupLocation;
      updateData.location = data.pickupLocation;
    }
    if (data.dropoffLocation !== undefined) updateData.dropoffLocation = data.dropoffLocation;
    if (data.features !== undefined) updateData.features = data.features;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isAvailable !== undefined) {
      updateData.isAvailable = data.isAvailable;
      updateData.availabilityStatus = data.isAvailable ? 'Available' : 'Reserved';
    }
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // If new images provided
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      await prisma.carImage.deleteMany({ where: { carId: id } });
      updateData.images = {
        create: data.images.map((img: any, idx: number) => ({
          url: img.url || img.imageUrl,
          imageUrl: img.url || img.imageUrl,
          publicId: img.publicId || null,
          isPrimary: img.isPrimary || idx === 0,
          caption: img.caption || null,
          order: img.order !== undefined ? img.order : idx,
          displayOrder: img.displayOrder !== undefined ? img.displayOrder : idx,
        })),
      };
    }

    const updated = await prisma.car.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        images: true,
      },
    });

    return {
      ...updated,
      dailyPrice: Number(updated.dailyPrice),
      pricePerDay: Number(updated.dailyPrice),
      securityDeposit: Number(updated.securityDeposit),
    };
  }

  static async deleteCar(id: string) {
    const existing = await prisma.car.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!existing) {
      throw new AppError('Vehicle not found.', 404);
    }

    // Soft deactivation if vehicle has past or current bookings
    if (existing._count.bookings > 0) {
      await prisma.car.update({
        where: { id },
        data: {
          isActive: false,
          isAvailable: false,
          availabilityStatus: 'Decommissioned',
        },
      });
      return { message: 'Vehicle soft-deactivated due to existing booking history.' };
    }

    // Hard delete if no bookings
    await prisma.car.delete({ where: { id } });
    return { message: 'Vehicle permanently removed from fleet.' };
  }
}
