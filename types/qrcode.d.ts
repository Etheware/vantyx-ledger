declare module "qrcode" {
  export interface ToDataURLOptions {
    margin?: number;
    width?: number;
  }

  export function toDataURL(text: string, options?: ToDataURLOptions): Promise<string>;
  const QRCode: {
    toDataURL: typeof toDataURL;
  };
  export default QRCode;
}
