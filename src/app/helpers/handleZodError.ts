import { IErrorSource, IGenericError } from "../interfaces/errorInterface";

export const handelZodError = (err: any): IGenericError => {
  const errorSource: IErrorSource[] = [];

  err.issues.forEach((issue: any) => {
    errorSource.push({
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    });
  });

  return {
    StatusCodes: 400,
    message: "Zod Validation Error",
    errorSource,
  };
};
