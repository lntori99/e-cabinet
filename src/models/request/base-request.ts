/** Shared shape for any paginated register query. Mirrors `BaseResponse<T>`. */
export interface PaginatedRequest {
  page: number;
  pageSize: number;
}
