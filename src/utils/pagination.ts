export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getPagination = (query: any): PaginationOptions => {
  const parsedPage = parseInt(query?.page as string, 10);
  const parsedLimit = parseInt(query?.limit as string, 10);

  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const rawLimit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;
  const limit = Math.min(Math.max(rawLimit, 1), 100);

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

export const formatPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  return {
    total,
    page,
    limit,
    totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
  };
};
