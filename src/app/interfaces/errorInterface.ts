export interface IErrorSource {
  path: string;
  message: string;
}

export interface IGenericError {
  StatusCodes: number;
  message: string;
  errorSource?: IErrorSource[];
}
