class AppError extends Error {
  public SuccessCode: number;

  constructor(statusCode: number, message: string, stack: ``) {
    super(message);
    this.SuccessCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
