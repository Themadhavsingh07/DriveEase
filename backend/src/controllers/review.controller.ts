import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../middleware/error';
import { AuthenticatedRequest } from '../middleware/auth';

export const getCarReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { carId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { carId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { reviews },
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AppError('Unauthorized', 401));

    const { carId, rating, title, comment, bookingId } = req.body;

    if (!carId || !rating || !comment) {
      return next(new AppError('Car ID, rating (1-5), and comment are required.', 400));
    }

    if (rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5.', 400));
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        carId,
        bookingId: bookingId || null,
        rating: Math.round(rating),
        title,
        comment,
        isVerifiedRental: Boolean(bookingId),
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    // Update car aggregate rating
    const aggregate = await prisma.review.aggregate({
      where: { carId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.car.update({
      where: { id: carId },
      data: {
        rating: Math.round((aggregate._avg.rating || 5) * 10) / 10,
        reviewCount: aggregate._count.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};
