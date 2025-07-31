import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  DB_URL: string;
  NODE_ENV: string;
  BCRYPT_SALT_ROUND: string;

  JWT: {
    JWT_ACCESS_SECRET: string;
    JWT_EXPIREDATE: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES: string;
  };
}

const loadEnvConfig = (): EnvConfig => {
  const envRequired: string[] = [
    "PORT",
    "DB_URL",
    "NODE_ENV",
    "BCRYPT_SALT_ROUND",
    "JWT_ACCESS_SECRET",
    "JWT_EXPIREDATE",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES",
  ];
  envRequired.forEach((env) => {
    if (!process.env[env]) {
      throw new Error(`Environment variable ${env} is not defined`);
    }
  });
  return {
    PORT: Number(process.env.PORT) || 5000,
    DB_URL: process.env.DB_URL || "",
    NODE_ENV: process.env.NODE_ENV || "development",
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND || "10",
    JWT: {
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
      JWT_EXPIREDATE: process.env.JWT_EXPIREDATE as string,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
      JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
    },
  };
};

export const envConfig: EnvConfig = loadEnvConfig();
