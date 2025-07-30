import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  DB_URL: string;
  NODE_ENV: string;
  BCRYPT_SALT_ROUND: string;

  JWT: {
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES_IN: string;
  };
}

const loadEnvConfig = (): EnvConfig => {
  const envRequired: string[] = [
    "PORT",
    "DB_URL",
    "NODE_ENV",
    "BCRYPT_SALT_ROUND",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES_IN",
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
      JWT_SECRET: process.env.JWT_SECRET || "",
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
      JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },
  };
};

export const envConfig: EnvConfig = loadEnvConfig();
