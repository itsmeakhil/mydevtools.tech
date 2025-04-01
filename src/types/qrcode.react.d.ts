declare module 'qrcode.react' {
  import { ComponentType, SVGProps } from 'react';
  
  export interface QRCodeSVGProps extends SVGProps<SVGSVGElement> {
    value: string;
    size?: number;
    level?: string;
    bgColor?: string;
    fgColor?: string;
    style?: any;
  }

  export const QRCodeSVG: ComponentType<QRCodeSVGProps>;
} 