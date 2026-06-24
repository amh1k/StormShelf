class ApiError extends Error {
  readonly data = null;
  readonly success = false;

  constructor(
    public readonly statusCode: number,
    message = "Something went wrong",
    public readonly errors: unknown[] = [],
    stack = "",
  ) {
    super(message);

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
