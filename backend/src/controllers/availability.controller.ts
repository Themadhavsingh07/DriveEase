import { Request, Response, NextFunction } from 'express';
import { AvailabilityService } from '../services/availability.service';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export class AvailabilityController {
  /**
   * POST /api/v1/availability/check
   */
  static async checkAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { carId, pickupDateTime, returnDateTime, bufferMinutes } = req.body;
      const result = await AvailabilityService.checkAvailability({
        carId,
        pickupDateTime,
        returnDateTime,
        bufferMinutes,
      });

      return sendSuccess(
        res,
        result,
        result.available
          ? 'Vehicle is available for the selected period'
          : 'Vehicle is already reserved for the selected period'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/availability/cars/:carId/calendar?month=11&year=2026
   */
  static async getMonthlyCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const carId = req.params.carId || req.params.id;
      if (!carId) {
        throw new AppError('carId is required.', 400);
      }

      const now = new Date();
      const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getUTCMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getUTCFullYear();

      const result = await AvailabilityService.getMonthlyAvailability(carId, month, year);
      return sendSuccess(res, result, 'Monthly calendar retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/availability/cars/:carId?startDate=2026-11-01&endDate=2026-11-30
   */
  static async getDateRangeAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const carId = req.params.carId || req.params.id;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        // If no startDate/endDate, redirect to current month calendar
        const now = new Date();
        const month = now.getUTCMonth() + 1;
        const year = now.getUTCFullYear();
        const result = await AvailabilityService.getMonthlyAvailability(carId, month, year);
        return sendSuccess(res, result, 'Monthly calendar retrieved successfully.');
      }

      const result = await AvailabilityService.getDateRangeAvailability(
        carId,
        String(startDate),
        String(endDate)
      );

      return sendSuccess(res, result, 'Date range availability retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/availability/search & GET /api/v1/availability/search
   */
  static async searchAvailableCars(req: Request, res: Response, next: NextFunction) {
    try {
      // Support both POST body and GET query params
      const source = req.method === 'POST' ? req.body : req.query;

      const {
        pickupLocation,
        pickupDateTime,
        returnDateTime,
        category,
        brand,
        fuelType,
        transmission,
        seatingCapacity,
        minPrice,
        maxPrice,
        page,
        limit,
        sortBy,
      } = source;

      if (!pickupDateTime || !returnDateTime) {
        throw new AppError('pickupDateTime and returnDateTime are required.', 400);
      }

      const result = await AvailabilityService.searchAvailableCars({
        pickupLocation: pickupLocation ? String(pickupLocation) : undefined,
        pickupDateTime: String(pickupDateTime),
        returnDateTime: String(returnDateTime),
        category: category ? String(category) : undefined,
        brand: brand ? String(brand) : undefined,
        fuelType: fuelType ? String(fuelType) : undefined,
        transmission: transmission ? String(transmission) : undefined,
        seatingCapacity: seatingCapacity ? Number(seatingCapacity) : undefined,
        minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12,
        sortBy: sortBy ? String(sortBy) : undefined,
      });

      return sendSuccess(res, result, 'Available cars retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Legacy endpoint: GET /cars/:id/availability
   */
  static async getLegacyCalendar(req: Request, res: Response, next: NextFunction) {
    return AvailabilityController.getMonthlyCalendar(req, res, next);
  }
}
