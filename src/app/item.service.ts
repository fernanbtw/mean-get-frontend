import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  // Antes (solo funciona en local con proxy):
  // private apiUrl = '/api/calculos';

  // Despues (URL del backend en Railway):
  private apiUrl = 'https://mean-get-backend-production.up.railway.app/api/calculos';

  constructor(private readonly http: HttpClient) {}

  getAll() {
    return this.http.get(this.apiUrl);
  }
}
