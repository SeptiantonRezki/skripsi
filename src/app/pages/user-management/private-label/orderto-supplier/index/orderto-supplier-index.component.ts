import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { PagesName } from 'app/classes/pages-name';
import { FormGroup, FormBuilder } from "@angular/forms";
import * as moment from "moment";

import { Endpoint } from '../../../../../classes/endpoint';
import { DateAdapter } from '@angular/material';
import { OrdertoSupplierService } from 'app/services/user-management/private-label/orderto-supplier.service';

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
    private ordertoSupplierService: OrdertoSupplierService,
    private dialogService: DialogService,
  ) {
    this.onLoad = false;
    this.adapter.setLocale("id");
  }

  ngOnInit() {
    this.initFilter();
    this.getList();
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

  getList() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = 1;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.ordertoSupplierService.getList(this.pagination).subscribe(
      res => {
        if (res.status == 'success') {
          Page.renderPagination(this.pagination, res.data);
          this.rows = res.data.data;
        } else {
          Page.renderPagination(this.pagination, res.data);
          this.rows = [];
          this.dialogService.openSnackBar({
            message: res.status
          });
        }

        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        console.error(err);
        this.onLoad = false;
      }
    );
  }

  updateFilter(string, value) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    this.pagination.page = 1;
    this.offsetPagination = 0;

    this.pagination.status = this.formFilter.get("status").value;
    this.pagination.start_date = this.convertDate(this.formFilter.get("from").value);
    this.pagination.end_date = this.convertDate(this.formFilter.get("to").value);

    this.ordertoSupplierService.getList(this.pagination).subscribe(async res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;
      this.loadingIndicator = false;
      console.log('rows', this.rows);
    });
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format("YYYY-MM-DD");
    }

    return "";
  }
}
