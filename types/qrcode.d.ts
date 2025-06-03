declare module "qrcode" {
  interface QRCodeToStringOptions {
    type?: string;
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: string;
  }

  interface QRCodeToDataURLOptions {
    type?: string;
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: string;
  }

  interface QRCodeToCanvasOptions {
    width?: number;
    margin?: number;
    scale?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: string;
  }

  function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: QRCodeToCanvasOptions
  ): Promise<HTMLCanvasElement>;

  function toString(
    text: string,
    options?: QRCodeToStringOptions
  ): Promise<string>;

  function toDataURL(
    text: string,
    options?: QRCodeToDataURLOptions
  ): Promise<string>;
}
