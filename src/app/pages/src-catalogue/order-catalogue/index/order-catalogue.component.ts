import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DialogService } from 'app/services/dialog.service';
import { OrderCatalogueService } from 'app/services/src-catalogue/order-catalogue.service';
import { DateAdapter } from '@angular/material';
import { DataService } from 'app/services/data.service';
import { Emitter } from 'app/helper/emitter.helper';
import { GeneralService } from 'app/services/general.service';
import * as moment from "moment";
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-order-catalogue',
  templateUrl: './order-catalogue.component.html',
  styleUrls: ['./order-catalogue.component.scss']
})
export class OrderCatalogueComponent implements OnInit {
  rows: any[];
  minDate: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;
  body: any;
  selectedOrderToUpdate: any;
  vendor_id: any;
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

  courierFilter: any[] = [];

  formFilter: FormGroup;
  keyUp = new Subject<string>();
  isAnyUpdate: Boolean;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild('downloadLink') downloadLink: ElementRef;

  offsetPagination: any;
  constructor(
    private dialogService: DialogService,
    private ordersService: OrderCatalogueService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private emitter: Emitter,
    private generalService: GeneralService
  ) {
    this.adapter.setLocale("id");

    this.rows = [];
    this.onLoad = true;

    this.keyUp
      .debounceTime(500)
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(res => {
        this.updateFilter(res, 'search');
      });

    this.formFilter = this.formBuilder.group({
      status: "",
      from: "",
      to: "",
    });
  }

  ngOnInit() {
    this.formFilter
      .get("status")
      .valueChanges
      .debounceTime(200)
      .subscribe(data => {
        this.dataService.setToStorage("filter_orders_status_catalogue", data);
      });
    this.formFilter
      .get("from")
      .valueChanges
      .debounceTime(200)
      .subscribe(data => {
        this.dataService.setToStorage("filter_orders_from_catalogue", data);
      });
    this.formFilter
      .get("to")
      .valueChanges
      .debounceTime(200)
      .subscribe(data => {
        this.dataService.setToStorage("filter_orders_to_catalogue", data);
      });

    this.formFilter.setValue({
      status: this.dataService.getFromStorage("filter_orders_status_catalogue") ? this.dataService.getFromStorage("filter_orders_status_catalogue") : "",
      from: this.dataService.getFromStorage("filter_orders_from_catalogue") ? this.dataService.getFromStorage("filter_orders_from_catalogue") : "",
      to: this.dataService.getFromStorage("filter_orders_to_catalogue") ? this.dataService.getFromStorage("filter_orders_to_catalogue") : "",
    });

    this.getListOrders();
    let profile = this.dataService.getDecryptedProfile();
    if (profile) this.vendor_id = profile.vendor_company_id;
  }

  getListOrders() {
    this.dataService.showLoading(true);
    this.loadingIndicator = true;
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type ? sort_type : 'desc';
    this.pagination.sort = sort ? sort : 'created_at';

    this.offsetPagination = page ? (page - 1) : 0;
    this.pagination.status = this.formFilter.get("status").value;
    this.pagination.start_date = this.convertDate(this.formFilter.get("from").value);
    this.pagination.end_date = this.convertDate(this.formFilter.get("to").value);
    this.pagination['company_id'] = this.vendor_id ? this.vendor_id : null;

    this.ordersService.get(this.pagination).subscribe(
      async res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data ? res.data.data : [];
        this.onLoad = false;
        this.loadingIndicator = false;
        this.dataService.showLoading(false);
      },
      err => {
        console.error(err);
        this.onLoad = false;
        this.loadingIndicator = false;
        this.dataService.showLoading(false);
      }
    );
  }

  setPage(pageInfo) {
    this.dataService.showLoading(true);
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

    this.ordersService.get(this.pagination).subscribe(async res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.pagination.status = this.formFilter.get("status").value;
    this.pagination.start_date = this.convertDate(this.formFilter.get("from").value);
    this.pagination.end_date = this.convertDate(this.formFilter.get("to").value);

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.loadingIndicator = true;

    console.log("check pagination", this.pagination);

    this.ordersService.get(this.pagination).subscribe(async res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  updateFilter(string, value) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    this.pagination.page = 1;
    this.offsetPagination = 0;
    // if (string) {
    // } else {
    //   const page = this.dataService.getFromStorage("page");
    //   this.pagination.page = page;
    //   this.offsetPagination = page ? (page - 1) : 0;
    // }

    this.pagination.status = this.formFilter.get("status").value;
    this.pagination.start_date = this.convertDate(this.formFilter.get("from").value);
    this.pagination.end_date = this.convertDate(this.formFilter.get("to").value);

    this.ordersService.get(this.pagination).subscribe(async res => {

      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
      console.log('rows', this.rows);
    });
  }

  async export() {
    this.dataService.showLoading(true);
    try {
      const response = await this.ordersService.export().toPromise();
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `OrderSrcCatalogue${new Date().toLocaleString()}.xls`);
      this.dataService.showLoading(false);
    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
      // throw error;
    }
  }

  downLoadFile(data: any, type: string, fileName: string) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    var newBlob = new Blob([data], { type: type });

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(newBlob);
      return;
    }

    // For other browsers: 
    // Create a link pointing to the ObjectURL containing the blob.
    const url = window.URL.createObjectURL(newBlob);

    var link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    setTimeout(function () {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(url);
      link.remove();
    }, 100);
  }

  handleError(error) {
    console.log('Here')
    console.log(error)

    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.log(error);
    // alert('Open console to see the error')
  }

  setMinDate(param?: any): void {
    this.formFilter.get("to").setValue("");
    this.minDate = param;
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format("YYYY-MM-DD");
    }

    return "";
  }

}
