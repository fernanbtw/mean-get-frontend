import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SalePayload, SaleResponse, SalesListResponse } from './sale.model';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private readonly apiUrl = 'https://mean-get-backend-production.up.railway.app/api/sales';

  constructor(private readonly http: HttpClient) {}

  getSales(): Observable<SalesListResponse> {
    return this.http.get<SalesListResponse>(this.apiUrl);
  }

  createSale(payload: SalePayload): Observable<SaleResponse> {
    return this.http.post<SaleResponse>(this.apiUrl, payload);
  }

  updateSale(id: string, payload: SalePayload): Observable<SaleResponse> {
    return this.http.put<SaleResponse>(`${this.apiUrl}/${id}`, payload);
  }

  deleteSale(id: string): Observable<{ ok: boolean; message: string }> {
    return this.http.delete<{ ok: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  deleteAll(): Observable<{ ok: boolean; message: string }> {
    return this.http.delete<{ ok: boolean; message: string }>(this.apiUrl);
  }
}
