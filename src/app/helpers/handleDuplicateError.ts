import { TGenericErrorResponse } from "../interfaces/errorInterface";

export const handelDuplicateError = (err: any): TGenericErrorResponse => {
  const matchArray = err.message.match(/"([^"]*)"/);
  return {
    statusCode: 400,
    message: `Duplicate Key Error: ${matchArray[-1]}`,
  };
};
