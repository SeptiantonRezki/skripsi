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
import { QiscusService } from 'app/services/qiscus.service';
import { StorageHelper } from 'app/helper/storage.helper';

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
    private generalService: GeneralService,
    private qs: QiscusService,
    private storageHelper: StorageHelper
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
        await this.getAndCreateRoomById(res.data);
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
      // await this.getAndCreateRoomById(res.data);
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
      // await this.getAndCreateRoomById(res.data);
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
      // await this.getAndCreateRoomById(res.data);
      this.loadingIndicator = false;
      console.log('rows', this.rows);
    });
  }

  async export() {
    this.dataService.showLoading(true);
    try {
      let query = {};
      query['status'] = this.formFilter.get("status").value;
      query['start_date'] = this.convertDate(this.formFilter.get("from").value);
      query['end_date'] = this.convertDate(this.formFilter.get("to").value);
      const response = await this.ordersService.export(query).toPromise();
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

  async getAndCreateRoomById(items: any) {
    if (items.data && this.qs.qiscus.isLogin) {
      const dataTransaksi = [];
      this.loadingIndicator = true;
      this.qs.qiscus.loadRoomList({ page: 1, limit: 50, showParticipants: true, showEmpty: false })
        .then(async (rooms: any) => {
          // On success
          // console.log('ROOM', rooms);
          const mappingRoom = await items.data.map(async (item: any) => {
            item['statusOpened'] = false;
            // item['orderStatuses'] = Object.entries(item.available_status).map(
            //   ([value, name]) => ({ value, name })
            // );
            rooms.map((room: any) => {
              // console.log('room', room.id === item.qiscus_room_id, room.id, item.qiscus_room_id, item.invoice_number);
              if (room.id == item.qiscus_room_id) {
                item.dataQiscus = room;
                return;
              }
            });
            dataTransaksi.push(item);
            return;
            // if (item.status === 'pesanan-dibatalkan' || item.status === 'selesai') {
            //   item.dataQiscus = null;
            //   dataTransaksi.push(item);
            //   return;
            // } else {

            // }
          });
          Promise.all(mappingRoom).then(() => {
            // console.log("ROWS", dataTransaksi)
            this.rows = dataTransaksi;
            this.loadingIndicator = false;
          });
        })
        .catch(async (error: any) => {
          // On error
          console.log('3rror', error);
          const mappingRoom = await items.data.map(async (item: any) => {
            item['statusOpened'] = false;
            item['orderStatuses'] = Object.entries(item.available_status).map(([value, name]) => ({ value, name }));
            return item;
          });
          console.log('mappingRoom', mappingRoom);
          this.rows = mappingRoom;
          this.loadingIndicator = false;
        })
    } else {
      setTimeout(() => {
        this.getAndCreateRoomById(items);
      }, 500);
    }
  }

  async getAndCreateRoomById_(items: any) {
    const userIds = [];
    let userQiscus: any = await this.storageHelper.getUserQiscus();
    let userProfile = this.dataService.getDecryptedProfile();
    if (items.data) {
      if (userQiscus && userProfile) {
        const dataTransaksi = [];
        const mappingRoom = await items.data.map(async (item: any) => {
          userIds.push(userQiscus.email);
          if (item.status === 'pesanan-dibatalkan' || item.status === 'selesai') {
            item.dataQiscus = null;
            dataTransaksi.push(item);
          } else if (item.qiscus_room_id !== null && item.qiscus_room_id !== '' && item.qiscus_room_id !== undefined) {
            await this.qs.qiscus.getRoomById(item.qiscus_room_id).then(async (getRoom: any) => {
              // console.log('DATAROOM', getRoom);
              item.dataQiscus = { ...getRoom };
              item.dataQiscus.retailer = {
                username: userProfile.fullname, // agar saat ganti nama akun d apps terganti juga di Qiscus
                email: userQiscus.email // email khusus untuk Qiscus terdiri dari (Id User + 'rethms' + Id Retailer)
              };
              dataTransaksi.push(item);
            }).catch((qiscusError: any) => {
              console.log(qiscusError);
            });
          } else {
            const payload = {
              retailer_id: item.retailer_id || "",
              invoice_number: item.invoice_number || "",
              order_id: item.id || ""
            };
            // console.log("PAYLOAD", payload);
            this.qs.qiscusCreateUpdateRoom(payload).subscribe(async (qRes: any) => {
              // console.log("RESP", qRes);
              if (qRes.status) {
                await this.qs.qiscus.getRoomById(qRes.data.room_id).then((getRoom: any) => {
                  // console.log('DATAROOM', getRoom);
                  item.dataQiscus = { ...getRoom };
                  item.dataQiscus.retailer = {
                    username: userProfile.fullname, // agar saat ganti nama akun d apps terganti juga di Qiscus
                    email: userQiscus.email // email khusus untuk Qiscus terdiri dari (Id User + 'rethms' + Id Retailer)
                  };
                  dataTransaksi.push(item);
                }).catch((qiscusError: any) => {
                  console.log(qiscusError);
                });
              }
            });
          }
        });
        Promise.all(mappingRoom).then(() => {
          this.rows = dataTransaksi;
          this.loadingIndicator = false;
          console.log("ROWS", this.rows)
        });
      } else {
        this.rows = [];
        this.onLoad = false;
        this.loadingIndicator = false;
      }
    } else {
      this.rows = [];
      this.onLoad = false;
      this.loadingIndicator = false;
    }
  }

}
