import dotenv from 'dotenv';

dotenv.config();

interface Config {
  PORT: number;
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  OPENAI_API_KEY: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

const getConfig = (): Config => {
  return {
    PORT: parseInt(process.env.PORT as string, 10),
    DATABASE_URL: process.env.DATABASE_URL as string,
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY as string,
    accessKeyId: process.env.accessKeyId as string,
    secretAccessKey:  process.env.secretAccessKey as string,
    region: process.env.region as string
  };
};

const config = getConfig();

export default config;
