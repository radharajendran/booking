import { Response } from 'express';

export const sendApiResponse = (res: Response, data: any) => {
  return res.status(200).json(data);
}

export const sendApiError = (res: Response, errorCode: number, errorData: any) => {
  res.status(errorCode).json(errorData);
}
