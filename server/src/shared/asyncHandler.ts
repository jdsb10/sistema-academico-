import type { NextFunction, Request, Response } from 'express';

type Handler<T = Request> = (req: T, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler<T = Request>(handler: Handler<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req as T, res, next)).catch(next);
  };
}
