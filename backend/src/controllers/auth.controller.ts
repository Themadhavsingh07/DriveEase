import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { setAuthCookies, clearAuthCookies } from '../utils/jwt';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);

      // Set HTTP-only session cookies
      setAuthCookies(res, result.accessToken, result.refreshToken);

      return sendSuccess(
        res,
        {
          user: result.user,
          token: result.accessToken, // For legacy header-based clients
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
        'User registered successfully.',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      // Set HTTP-only session cookies
      setAuthCookies(res, result.accessToken, result.refreshToken);

      return sendSuccess(
        res,
        {
          user: result.user,
          token: result.accessToken,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
        'Logged in successfully.'
      );
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

      await AuthService.logout(refreshToken);
      clearAuthCookies(res);

      return sendSuccess(res, null, 'Logged out successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token =
        req.cookies?.refreshToken || req.body?.refreshToken;

      const result = await AuthService.refresh(token);
      setAuthCookies(res, result.accessToken, result.refreshToken);

      return sendSuccess(
        res,
        {
          accessToken: result.accessToken,
          token: result.accessToken,
          user: result.user,
        },
        'Token refreshed successfully.'
      );
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendSuccess(res, { user: null });
      }

      const user = await AuthService.getMe(req.user.id);
      return sendSuccess(res, { user }, 'Current user retrieved.');
    } catch (error) {
      next(error);
    }
  }
}
