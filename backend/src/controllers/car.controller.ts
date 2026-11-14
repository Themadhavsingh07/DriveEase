import { Request, Response, NextFunction } from 'express';
import { CarService } from '../services/car.service';
import { sendSuccess } from '../utils/apiResponse';

export class CarController {
  static async getCars(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CarService.getCars(req.query as any);

      // Return both standardized payload and flat keys for legacy compatibility
      return res.status(200).json({
        success: true,
        message: 'Cars retrieved successfully.',
        data: {
          cars: result.cars,
          pagination: result.pagination,
          total: result.pagination.total,
          page: result.pagination.page,
          limit: result.pagination.limit,
          totalPages: result.pagination.totalPages,
        },
        // Flat aliases for legacy frontend callers
        cars: result.cars,
        total: result.pagination.total,
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalPages: result.pagination.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFeaturedCars(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CarService.getCars({ limit: 6, sortBy: 'recommended' });
      return sendSuccess(res, { cars: result.cars }, 'Featured cars retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async getCarById(req: Request, res: Response, next: NextFunction) {
    try {
      const car = await CarService.getCarById(req.params.id);
      return sendSuccess(res, { car }, 'Car details retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CarService.getCategories();
      return sendSuccess(res, { categories }, 'Categories retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async createCar(req: Request, res: Response, next: NextFunction) {
    try {
      const car = await CarService.createCar(req.body);
      return sendSuccess(res, { car }, 'Vehicle created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCar(req: Request, res: Response, next: NextFunction) {
    try {
      const car = await CarService.updateCar(req.params.id, req.body);
      return sendSuccess(res, { car }, 'Vehicle updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async deleteCar(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CarService.deleteCar(req.params.id);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}

// Named function exports for existing routes
export const getCars = CarController.getCars;
export const getFeaturedCars = CarController.getFeaturedCars;
export const getCarById = CarController.getCarById;
export const getCategories = CarController.getCategories;
export const createCar = CarController.createCar;
export const updateCar = CarController.updateCar;
export const deleteCar = CarController.deleteCar;
