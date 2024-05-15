import 'express-session';

declare module 'express-session' {
  interface SessionData {
    mask_image?: string;
    ori_image?: string;
  }
}
declare global {
  interface Window {
      ethereum: any;
    }
}