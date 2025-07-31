import jwt, { JwtPayload, SignOptions, Secret } from "jsonwebtoken";

export const generateToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: string
) => {
  const token = jwt.sign(payload, secret, {
    expiresIn,
  } as SignOptions);

  return token;
};

export const verifyToken = (token: string, secret: Secret): JwtPayload => {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload format");
  }
  return decoded;
};
