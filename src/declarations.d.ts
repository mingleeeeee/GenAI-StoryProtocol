declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DATABASE_URL: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

// If this file is a module (you use `import`/`export` syntax), ensure this line is present:
export {};
