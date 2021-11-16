import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { PagesName } from 'app/classes/pages-name';
import { FormGroup, FormBuilder } from "@angular/forms";
import moment from 'moment';
import { RupiahFormaterWithoutRpPipe } from "@fuse/pipes/rupiah-formater";
import { GeneratePO } from "app/classes/generate-po";
import { HttpErrorResponse } from '@angular/common/http';

import { Endpoint } from '../../../../../classes/endpoint';
import { DateAdapter, MatDialog, MatDialogConfig } from '@angular/material';
import { OrdertoSupplierService } from 'app/services/user-management/private-label/orderto-supplier.service';
import { WholesalerService } from 'app/services/user-management/wholesaler.service';
import { PopUpImageBlobComponent } from 'app/components/popup-image-blob/popup-image-blob.component';

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
    { name: 'Pesanan Baru', value: 'baru' },
    { name: 'Pesanan Dibatalkan', value: 'dibatalkan' },
    { name: 'Pesanan Diproses', value: 'diproses' },
    { name: 'Pesanan Dikirim', value: 'dikirim' },
    { name: 'Pesanan Diterima', value: 'diterima' },
    { name: 'Pesanan Selesai', value: 'selesai' },
  ];
  generatePO: GeneratePO = new GeneratePO();

  rows: any[];
  selected: any[];
  id: any;
  minDate: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  endPoint: Endpoint = new Endpoint();
  offsetPagination: any;
  detailOrder: any = null;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  keyUp = new Subject<string>();

  permission: any;
  roles: PagesName = new PagesName();
  @ViewChild('downloadLink') downloadLink: ElementRef;
  profileType: string = '';
  HIDE_FOR = ['supplier'];

  dialogRef: any;

  constructor(
    private dataService: DataService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private ordertoSupplierService: OrdertoSupplierService,
    private dialogService: DialogService,
    private router: Router,
    private convertRp: RupiahFormaterWithoutRpPipe,
    private wholesalerService: WholesalerService,
    private dialog: MatDialog,
  ) {
    this.onLoad = false;
    this.adapter.setLocale("id");
  }

  ngOnInit() {
    this.initFilter();
    this.getList();

    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter(data);
      });
    const profile = this.dataService.getDecryptedProfile() || {};
    this.profileType = profile.type || '';
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
    this.loadingIndicator = true;
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.ordertoSupplierService.getList(this.pagination).subscribe(
      res => {
        if (res.status == 'success') {
          if (res.data.total < res.data.per_page && page !== 1) {
            this.dataService.setToStorage("page", 1);
            this.getList();
          } else {
            Page.renderPagination(this.pagination, res.data);
            this.rows = res.data.data;
            this.onLoad = false;
            this.loadingIndicator = false;
          }
        } else {
          Page.renderPagination(this.pagination, res.data);
          this.rows = [];
          this.dialogService.openSnackBar({
            message: res.status
          });
          this.onLoad = false;
          this.loadingIndicator = false;
        }
      },
      err => {
        console.error(err);
        this.onLoad = false;
        this.loadingIndicator = false;
      }
    );
  }

  setMinDate(param?: any): void {
    this.formFilter.get("to").setValue("");
    this.minDate = param;
  }

  updateFilter(string: any) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    this.pagination.page = 1;
    this.offsetPagination = 0;

    if (this.formFilter.get("status").value) {
      this.pagination.status = this.formFilter.get("status").value;
    } else {
      delete this.pagination.status;
    }
    if (this.formFilter.get("from").value && this.formFilter.get("to").value) {
      this.pagination.start_date = this.convertDate(this.formFilter.get("from").value);
      this.pagination.end_date = this.convertDate(this.formFilter.get("to").value);
    } else {
      delete this.pagination.start_date;
      delete this.pagination.end_date;
    }

    this.ordertoSupplierService.getList(this.pagination).subscribe(async res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;
      this.loadingIndicator = false;
      // console.log('rows', this.rows);
    });
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

    this.ordertoSupplierService.getList(this.pagination).subscribe(async res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;
      this.loadingIndicator = false;
      // console.log('rows', this.rows);
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.ordertoSupplierService.getList(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;
      this.loadingIndicator = false;
    });
  }

  async exportPO(string, value) {
    // this.loadingIndicator = true;
    this.dataService.showLoading(true);
    this.pagination.search = string;
    let params = {};

    delete this.pagination.page;
    this.offsetPagination = 0;
    let fileName = `PO_${moment(new Date()).format('YYYY_MM_DD')}.xls`;

    if (this.formFilter.get("status").value) {
      this.pagination.status = this.formFilter.get("status").value;
      params['status'] = this.pagination.status
    } else {
      delete this.pagination.status;
      delete params['status'];
    }
    if (this.formFilter.get("from").value && this.formFilter.get("to").value) {
      this.pagination.start_date = this.convertDate(this.formFilter.get("from").value);
      this.pagination.end_date = this.convertDate(this.formFilter.get("to").value);
      fileName = `PO_${moment(this.formFilter.get("from").value).format('YYYY_MM_DD')}_to_${moment(this.formFilter.get("to").value).format('YYYY_MM_DD')}.xls`;
      params['start_date'] = this.pagination.start_date;
      params['end_date'] = this.pagination.end_date;
    } else {
      delete this.pagination.start_date;
      delete this.pagination.end_date;
      delete params['start_date'];
      delete params['end_date'];
    }
    try {
      const response = await this.ordertoSupplierService.export(params).toPromise();
      // console.log('he', response.headers);
      this.downLoadFile(response, "data:application/vnd.ms-excel", fileName);
      // this.downloadLink.nativeElement.href = response;
      // this.downloadLink.nativeElement.click();
      this.dataService.showLoading(false);
    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
      // throw error;
    }
  }

  async exportXLS() {
    // this.loadingIndicator = true;
    this.dataService.showLoading(true);
    // this.pagination.search = string;

    delete this.pagination.page;
    this.offsetPagination = 0;
    let fileName = `Export_Order_To_Supplier_${moment(new Date()).format('YYYY_MM_DD')}.xls`;

    if (this.formFilter.get("status").value) {
      this.pagination.status = this.formFilter.get("status").value;
    } else {
      delete this.pagination.status;
    }
    if (this.formFilter.get("from").value && this.formFilter.get("to").value) {
      this.pagination.start_date = this.convertDate(this.formFilter.get("from").value);
      this.pagination.end_date = this.convertDate(this.formFilter.get("to").value);
      fileName = `PO_${moment(this.formFilter.get("from").value).format('YYYY_MM_DD')}_to_${moment(this.formFilter.get("to").value).format('YYYY_MM_DD')}.xls`;
    } else {
      delete this.pagination.start_date;
      delete this.pagination.end_date;
    }
    try {
      const response = await this.ordertoSupplierService.export(this.pagination).toPromise();
      // console.log('he', response.headers);
      this.downLoadFile(response, "data:application/vnd.ms-excel", fileName);
      // this.downloadLink.nativeElement.href = response;
      // this.downloadLink.nativeElement.click();
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
      window.navigator.msSaveOrOpenBlob(newBlob, fileName);
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

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format("YYYY-MM-DD");
    }

    return "";
  }

  directDetail(item?: any): void {
    this.router.navigate(["user-management", "supplier-order", "detail", item.id]);
  }

  getDetailOrder(orderId: any): void {
    this.loadingIndicator = true;
    // this.onLoad = false;
    this.ordertoSupplierService.showListPesanan({ orderId: orderId }).subscribe(
      async res => {
        if (res.status == "success") {
          res = res.data;
          this.detailOrder = res;
          let products = this.detailOrder && this.detailOrder.order_products ? [...this.detailOrder.order_products].filter(obj => obj.amount > 0) : [];
          this.detailOrder.total = 0;

          this.loadingIndicator = false;
          this.onLoad = false;

          await res.order_products.map((item: any, idx: number) => {
            this.detailOrder.total = parseInt(this.detailOrder.total) + parseInt(item.total_price);
          });
          this.print();
        }
      }, err => {
        console.log('err', err);
        this.loadingIndicator = false;
      }
    )
  }

  async print() {
    let bodyHtml = {
      ...this.detailOrder,
      created_at: moment(this.detailOrder.created_at).format("DD/MM/YYYY HH:mm"),
      products: this.detailOrder.order_products.map(obj => {
        return {
          ...obj,
          price_str: this.convertRp.transform(obj.price),
          total_price_str: this.convertRp.transform(obj.total_price),
        };
      }),
      total_str: this.convertRp.transform(this.detailOrder.total)
    };

    let popupWin;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(this.generatePO.html(bodyHtml));
    popupWin.document.close();
  }

  getDokumen(row) {
    // console.log("row", row);
    if (row.document) {
      this.downloadLink.nativeElement.href = row.document_image_url;
      this.downloadLink.nativeElement.click();
    } else {
      this.dialogService.openSnackBar({ message: "Tidak ada dokumen yang dapat dilihat!" });
    }
  }

  openDocumentOrder(row) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;
    dialogConfig.panelClass = 'popup-notif';

    this.dataService.showLoading(true);

    const body = {
      invoice_number: row.invoice_number
    };
    this.wholesalerService.showDocumentOrder(body).subscribe(res => {
      dialogConfig.data = {
        blob: res
      };
      this.dialogRef = this.dialog.open(PopUpImageBlobComponent, dialogConfig);
      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    });
  }

}
