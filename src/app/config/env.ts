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
  FRONTEND_URL: string;
  SMTP: {
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_FROM: string;
  };
  REDIS: {
    REDIS_PORT: number;
    REDIS_HOST: string;
    REDIS_PASS: string;
    REDIS_USERNAME: string;
  };
  Cloudinary: {
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_SECRET_KEY: string;
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
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM",
    "FRONTEND_URL",
    "REDIS_PORT",
    "REDIS_HOST",
    "REDIS_PASS",
    "REDIS_USERNAME",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_SECRET_KEY",
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
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    SMTP: {
      SMTP_HOST: process.env.SMTP_HOST as string,
      SMTP_PORT: parseInt(process.env.SMTP_PORT as string),
      SMTP_USER: process.env.SMTP_USER as string,
      SMTP_PASS: process.env.SMTP_PASS as string,
      SMTP_FROM: process.env.SMTP_FROM as string,
    },
    REDIS: {
      REDIS_PORT: Number(process.env.REDIS_PORT),
      REDIS_HOST: process.env.REDIS_HOST as string,
      REDIS_PASS: process.env.REDIS_PASS as string,
      REDIS_USERNAME: process.env.REDIS_USERNAME as string,
    },

    Cloudinary: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
      CLOUDINARY_SECRET_KEY: process.env.CLOUDINARY_SECRET_KEY as string,
    },
  };
};

export const envConfig: EnvConfig = loadEnvConfig();
