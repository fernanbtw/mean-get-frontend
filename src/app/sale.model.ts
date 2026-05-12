export type DiscountClassification = 'Bajo' | 'Medio' | 'Alto';

export interface Sale {
  _id: string;
  valorVenta: number;
  porcentajeDescuento: number;
  descuento: number;
  totalFinal: number;
  clasificacion: DiscountClassification;
  createdAt: string;
  updatedAt: string;
}

export interface SalePayload {
  valorVenta: number;
  porcentajeDescuento: number;
}

export interface SalesSummary {
  totalBruto: number;
  totalDescuentos: number;
  totalNeto: number;
  mayorDescuento: Sale | null;
  cantidad: number;
}

export interface SalesListResponse {
  ok: boolean;
  sales: Sale[];
  users?: Sale[];
  resumen: SalesSummary;
}

export interface SaleResponse {
  ok: boolean;
  sale: Sale;
  user?: Sale;
}
