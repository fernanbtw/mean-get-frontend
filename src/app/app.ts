import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Sale, SalesSummary } from './sale.model';
import { SalesService } from './sales.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly salesService = inject(SalesService);
  private readonly currencyFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  readonly sales = signal<Sale[]>([]);
  readonly summary = signal<SalesSummary | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly editingId = signal<string | null>(null);
  readonly isEditing = computed(() => this.editingId() !== null);
  readonly chartMax = computed(() =>
    Math.max(this.summary()?.totalBruto ?? 0, this.summary()?.totalNeto ?? 0, 1)
  );
  readonly grossBarHeight = computed(() =>
    this.percentOf(this.summary()?.totalBruto ?? 0, this.chartMax())
  );
  readonly netBarHeight = computed(() =>
    this.percentOf(this.summary()?.totalNeto ?? 0, this.chartMax())
  );
  readonly discountImpactPercent = computed(() => {
    const totalBruto = this.summary()?.totalBruto ?? 0;
    if (totalBruto <= 0) return 0;
    return Math.round(((this.summary()?.totalDescuentos ?? 0) / totalBruto) * 100);
  });
  readonly circularChart = computed(() => {
    const totalBruto = this.summary()?.totalBruto ?? 0;
    const totalNeto = this.summary()?.totalNeto ?? 0;
    const total = totalBruto + totalNeto;
    const grossPercent = total > 0 ? Math.round((totalBruto / total) * 100) : 0;
    const netPercent = total > 0 ? 100 - grossPercent : 0;

    return {
      grossPercent,
      netPercent,
      background: `conic-gradient(#0f766e 0 ${grossPercent}%, #2563eb ${grossPercent}% 100%)`,
    };
  });

  readonly saleForm = this.fb.nonNullable.group({
    valorVenta: [0, [Validators.required, Validators.min(0)]],
    porcentajeDescuento: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  ngOnInit(): void {
    this.loadSales();
  }

  // El frontend consume la API y presenta la informacion procesada
  // junto con las graficas y acciones CRUD.
  loadSales(): void {
    this.loading.set(true);
    this.error.set('');

    this.salesService.getSales().subscribe({
      next: (response) => {
        this.sales.set(response.sales ?? response.users ?? []);
        this.summary.set(response.resumen);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con la API. Revisa que el backend este corriendo en el puerto 4000.');
        this.loading.set(false);
      },
    });
  }

  submitSale(): void {
    this.saleForm.markAllAsTouched();
    this.error.set('');
    this.success.set('');

    if (this.saleForm.invalid) {
      this.error.set('Revisa los campos antes de guardar.');
      return;
    }

    const payload = this.saleForm.getRawValue();
    const editingId = this.editingId();
    const request = editingId
      ? this.salesService.updateSale(editingId, payload)
      : this.salesService.createSale(payload);

    this.saving.set(true);
    request.subscribe({
      next: () => {
        this.success.set(editingId ? 'Venta actualizada.' : 'Venta registrada.');
        this.resetForm();
        this.saving.set(false);
        this.loadSales();
      },
      error: (response) => {
        this.error.set(response?.error?.message ?? 'No se pudo guardar la venta.');
        this.saving.set(false);
      },
    });
  }

  editSale(sale: Sale): void {
    this.editingId.set(sale._id);
    this.success.set('');
    this.error.set('');
    this.saleForm.setValue({
      valorVenta: sale.valorVenta,
      porcentajeDescuento: sale.porcentajeDescuento,
    });
  }

  deleteSale(sale: Sale): void {
    const confirmed = window.confirm('Eliminar esta venta?');
    if (!confirmed) return;

    this.error.set('');
    this.success.set('');
    this.salesService.deleteSale(sale._id).subscribe({
      next: () => {
        this.success.set('Venta eliminada.');
        if (this.editingId() === sale._id) {
          this.resetForm();
        }
        this.loadSales();
      },
      error: () => this.error.set('No se pudo eliminar la venta.'),
    });
  }

  deleteAllSales(): void {
    const confirmed = window.confirm('Eliminar todas las ventas?');
    if (!confirmed) return;

    this.error.set('');
    this.success.set('');
    this.salesService.deleteAll().subscribe({
      next: () => {
        this.success.set('Registros eliminados.');
        this.resetForm();
        this.loadSales();
      },
      error: () => this.error.set('No se pudieron eliminar los registros.'),
    });
  }

  resetForm(): void {
    this.editingId.set(null);
    this.saleForm.reset({
      valorVenta: 0,
      porcentajeDescuento: 0,
    });
  }

  formatMoney(value: number | null | undefined): string {
    return this.currencyFormatter.format(value ?? 0);
  }

  trackById(_: number, sale: Sale): string {
    return sale._id;
  }

  private percentOf(value: number, total: number): number {
    if (value <= 0) return 0;
    return Math.max(8, Math.round((value / total) * 100));
  }
}
