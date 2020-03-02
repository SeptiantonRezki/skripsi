import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { PagesName } from 'app/classes/pages-name';
import { FormGroup, FormBuilder } from "@angular/forms";

import { Endpoint } from '../../../../../classes/endpoint';
import { DateAdapter } from '@angular/material';

@Component({
  selector: 'app-orderto-supplier-index',
  templateUrl: './orderto-supplier-index.component.html',
  styleUrls: ['./orderto-supplier-index.component.scss']
})
export class OrdertoSupplierIndexComponent implements OnInit {
  onLoad: boolean;
  formFilter: FormGroup;
  statusFilter: any[] = [
    { name: 'Semua Status', value: '' },
    { name: 'Pesanan Baru', value: 'pesanan-baru' },
    { name: 'Diproses', value: 'diproses' },
    { name: 'Konfirmasi Perubahan', value: 'konfirmasi-perubahan' },
    { name: 'Perubahan Disetujui', value: 'perubahan-disetujui' },
    { name: 'Pesanan Dibatalkan', value: 'pesanan-dibatalkan' },
    { name: 'Siap Dikirim', value: 'siap-dikirim' },
    { name: 'Siap Diambil', value: 'siap-diambil' },
    { name: 'Dalam Pengiriman', value: 'dalam-pengiriman' },
    { name: 'Pesanan Diterima', value: 'pesanan-diterima' },
    { name: 'Belum Lunas', value: 'belum-lunas' },
    { name: 'Selesai', value: 'selesai' },
  ]

  rows: any[];
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  endPoint: Endpoint = new Endpoint();
  offsetPagination: any;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  keyUp = new Subject<string>();

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private dataService: DataService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
  ) {
    this.onLoad = false;
    this.adapter.setLocale("id");
  }

  ngOnInit() {
    this.initFilter
  }

  initFilter() {
    this.formFilter = this.formBuilder.group({
      status: "",
      from: "",
      to: ""
    });

    this.formFilter
      .get("status")
      .valueChanges
      .debounceTime(200)
      .subscribe(data => {
        this.dataService.setToStorage("filter_orders_status", data);
      });
    this.formFilter
      .get("from")
      .valueChanges
      .debounceTime(200)
      .subscribe(data => {
        this.dataService.setToStorage("filter_orders_from", data);
      });
    this.formFilter
      .get("to")
      .valueChanges
      .debounceTime(200)
      .subscribe(data => {
        this.dataService.setToStorage("filter_orders_to", data);
      });

    this.formFilter.setValue({
      status: this.dataService.getFromStorage("filter_orders_status") ? this.dataService.getFromStorage("filter_orders_status") : "",
      from: this.dataService.getFromStorage("filter_orders_from") ? this.dataService.getFromStorage("filter_orders_from") : "",
      to: this.dataService.getFromStorage("filter_orders_to") ? this.dataService.getFromStorage("filter_orders_to") : "",
    });
  }
}
