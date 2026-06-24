class ApiResponse<T> {
  readonly success: boolean;

  constructor(
    public readonly statusCode: number,
    public readonly data: T,
    public readonly message = "Success",
  ) {
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
