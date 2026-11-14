import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/apiResponse';

export class UserController {
  static async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = await UserService.getProfile(req.user!.id);
      return sendSuccess(res, { user }, 'User profile retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const updatedUser = await UserService.updateProfile(
        req.user!.id,
        req.body
      );
      return sendSuccess(
        res,
        { user: updatedUser },
        'Profile updated successfully.'
      );
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { currentPassword, newPassword } = req.body;
      await UserService.changePassword(
        req.user!.id,
        currentPassword,
        newPassword
      );
      return sendSuccess(
        res,
        null,
        'Password changed successfully. Please log in with your new password.'
      );
    } catch (error) {
      next(error);
    }
  }
}
