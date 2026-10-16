import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import MetadataServices from './metadata.services';

const getMetadata = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const role = req.user!.role;

  const result = await MetadataServices.getDashboardMetadata(userId, role);

  res.status(200).json({
    success: true,
    message: 'Dashboard metadata retrieved successfully',
    data: result,
  });
});

export const MetadataController = {
  getMetadata,
};

export default MetadataController;
