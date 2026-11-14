import { Response } from 'express';

export interface ApiResponseOptions<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  meta?: Record<string, any>;
}

export const sendResponse = <T = any>(
  res: Response,
  statusCode: number,
  options: ApiResponseOptions<T>
) => {
  const { success, message, data, errors, meta } = options;
  const payload: Record<string, any> = { success };

  if (message) payload.message = message;
  if (data !== undefined) payload.data = data;
  if (errors && errors.length > 0) payload.errors = errors;
  if (meta) payload.meta = meta;

  return res.status(statusCode).json(payload);
};

export const sendSuccess = <T = any>(
  res: Response,
  data?: T,
  message = 'Operation completed successfully',
  statusCode = 200,
  meta?: Record<string, any>
) => {
  return sendResponse(res, statusCode, {
    success: true,
    message,
    data,
    meta,
  });
};

export const sendError = (
  res: Response,
  message = 'Something went wrong',
  statusCode = 500,
  errors: any[] = []
) => {
  return sendResponse(res, statusCode, {
    success: false,
    message,
    errors,
  });
};
