import { Component, OnInit, HostListener, ViewChild } from "@angular/core";
import { DialogService } from "../../../../../services/dialog.service";
import { OrdersService } from "../../../../../services/user-management/retailer/orders.service";
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";

import { Observable } from "rxjs";
import { Subject } from "rxjs/Subject";
import { Page } from 'app/classes/laravel-pagination';
import { GenerateReceipt } from "app/classes/generate-receipt";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { DateAdapter } from "@angular/material/core";
import moment from 'moment';
import { DataService } from "app/services/data.service";
import { GoogleAnalyticsService } from "app/services/google-analytics.service";
import { QiscusService } from "app/services/qiscus.service";
import { StorageHelper } from "app/helper/storage.helper";
import { Emitter } from "app/helper/emitter.helper";
import { GeneralService } from "app/services/general.service";
import { ActivatedRoute } from "@angular/router";
import { GoogleTagManagerService } from "app/services/gtm.service";
import { HttpErrorResponse } from "@angular/common/http";
import * as _ from 'underscore';
import { LanguagesService } from "app/services/languages/languages.service";
import { RupiahFormaterWithoutRpPipe } from "@fuse/pipes/rupiah-formater";
import { TranslateInterpolatePipe } from "@fuse/pipes/translateInterpolate.pipe";

@Component({
  selector: 'app-orders-rrp',
  templateUrl: './orders-rrp.component.html',
  styleUrls: ['./orders-rrp.component.scss']
})
export class OrdersRrpComponent implements OnInit {
  rows: any[];
  minDate: any;
  maxDate: any;
  isSetPage = false;

  selectedPerPage = 10;
  listPerPage = [10, 20, 25, 50, 75, 100];
  validateDate = false;

  innerHeight = 'auto';
  statusScroll = false;
  childStatus = '';
  showcustomercode : boolean = false;
  generateReceipt: GenerateReceipt = new GenerateReceipt(this.ls, this.translateInterpolatePipe, this.dataService);
  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;
  body: any;
  selectedOrderToUpdate: any;
  selectedTabMain = 0;
  statusFilter: any[] = [];

  // // Dummy Data // //
  // statusFilter: any[] = [
  //   {
  //     child: [],
  //     is_sign: false,
  //     status_count: 0,
  //     status_title: "semua-pesanan",
  //     status_value: "Semua Pesanan"
  //   },
  //   {
  //     child: [
  //       {status_title: "pesanan-baru", status_value: "Pesanan Baru", status_count: 0},
  //       {status_title: "pesanan-dilihat", status_value: "Pesanan Dilihat", status_count: 1}
  //     ],
  //     is_sign: true,
  //     status_count: 1,
  //     status_title: "pesanan-baru",
  //     status_value: "Pesanan Baru"
  //   },
  //   {
  //     child: [
  //       {status_title: "konfirmasi-perubahan", status_value: "Konfirmasi Perubahan", status_count: 0},
  //       {status_title: "perubahan-disetujui", status_value: "Perubahan Disetujui", status_count: 0},
  //       {status_title: "diproses", status_value: "Pesanan Diproses", status_count: 0}
  //     ],
  //     is_sign: false,
  //     status_count: 0,
  //     status_title: "diproses",
  //     status_value: "Pesanan Diproses"
  //   },
  //   {
  //     child: [],
  //     is_sign: false,
  //     status_count: 0,
  //     status_title: "siap-diambil",
  //     status_value: "Siap Diambil"
  //   },
  //   {
  //     child: [],
  //     is_sign: false,
  //     status_count: 0,
  //     status_title: "dalam-pengiriman",
  //     status_value: "Dalam Pengiriman"
  //   },
  //   {
  //     child: [],
  //     is_sign: false,
  //     status_count: 0,
  //     status_title: "pesanan-diterima",
  //     status_value: "Pesanan Diterima"
  //   },
  //   {
  //     child: [],
  //     is_sign: false,
  //     status_count: 0,
  //     status_title: "belum-lunas",
  //     status_value: "Belum Lunas"
  //   },
  //   {
  //     child: [],
  //     is_sign: false,
  //     status_count: 0,
  //     status_title: "selesai",
  //     status_value: "Pesanan Selesai"
  //   },
  //   {
  //     child: [],
  //     is_sign: false,
  //     status_count: 0,
  //     status_title: "pesanan-dibatalkan",
  //     status_value: "Pesanan Dibatalkan"
  //   },
  // ];
  // // End Dummy Data // //

  courierFilter: any[] = [];

  formFilter: FormGroup;
  keyUp = new Subject<string>();
  isAnyUpdate: Boolean;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  offsetPagination: any;
  selectable: boolean = false;
  selected: any[] = [];
  availableNextStatuses = [
    { label: this.ls.locale.global.label.ready_to_take + ' / ' + this.ls.locale.global.label.ready_to_send, value: 'pesanan-diambil-dikirim' },
    { label: this.ls.locale.global.label.canceled_order, value: 'pesanan-dibatalkan' }
  ];
  selectAllOnPage: any[] = [];
  updateableStatus = [];
  defaultShipping = { id: '', name: "Semua Metode Pengiriman" };
  defaultColumns = [
    this.ls.locale.katalog_src.lihat_pesanan.text8,
    this.ls.locale.global.label.name,
    // this.ls.locale.global.label.delivery_method,
    "Metode Pengiriman",
    this.ls.locale.global.label.address,
    this.ls.locale.global.label.status,
    this.ls.locale.global.label.date,
    this.ls.locale.global.label.total,
    this.ls.locale.global.label.customer_code
  ];
  formColumn: FormControl = new FormControl([
    this.ls.locale.katalog_src.lihat_pesanan.text8,
    this.ls.locale.global.label.name,
    this.ls.locale.global.label.customer_code,
    // this.ls.locale.global.label.delivery_method,
    "Metode Pengiriman",
    this.ls.locale.global.label.address,
    this.ls.locale.global.label.status,
    this.ls.locale.global.label.date,
    this.ls.locale.global.label.total,
    this.ls.locale.global.label.customer_code
  ]);
  columns = [
    this.ls.locale.katalog_src.lihat_pesanan.text8,
    this.ls.locale.global.label.name,
    // this.ls.locale.global.label.order_via,
    "Pesan Melalui",
    // this.ls.locale.global.label.delivery_method,
    "Metode Pengiriman",
    this.ls.locale.global.label.address,
    this.ls.locale.global.label.status,
    this.ls.locale.produk_prinsipal.text28,
    this.ls.locale.global.label.date,
    this.ls.locale.global.label.total,
    // this.ls.locale.global.label.voucher_discount,
    "Diskon Voucher",
    this.ls.locale.katalog_src.lihat_pesanan.text12,
    // this.ls.locale.global.label.customer_tier,
    "Tier Pelanggan",
    this.ls.locale.global.label.phone,
    // this.ls.locale.global.menu.promo_code,
    "Kode Promo",
    // this.ls.locale.global.label.discount_promo,
    "Diskon Promo",
    // this.ls.locale.global.label.received_status_date,
    "Tanggal Status Diterima",
    // this.ls.locale.global.label.last_updated_date,
    "Tanggal Terakhir Diperbarui",
    this.ls.locale.global.label.note,
  ];
  enableCheckboxStatus = ['diproses', 'pesanan-dilihat', 'pesanan-diterima'];
  selectableDataForPrint = {
    selected:[]
  }
  user_country;
  show_printinvoicebtn = false;
  print_invoice_disabled = true


  vaValidated: boolean;
  
  jsonLocale: any;
  // resultColumns = [];

  // Nama -> name
  // Tipe Pelanggan -> classification
  // Tier Pelanggan -> tier
  // Pesan Melalui -> order_from
  // Nomor Ponsel -> phone
  // Kode Promo -> promo_code
  // Diskon Promo -> promo_nominal
  // Diskon Voucher -> voucher_nominal
  // Tanggal Status Diterima -> date_order_status_diterima
  // Tanggal Terakhir diperbarui -> updated_at
  // Catatan -> note

  constructor(
    private dialogService: DialogService,
    private ordersService: OrdersService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    // private gaService: GoogleAnalyticsService,
    private qs: QiscusService,
    private storageHelper: StorageHelper,
    private emitter: Emitter,
    private generalService: GeneralService,
    private route: ActivatedRoute,
    private gtmService: GoogleTagManagerService,
    private ls: LanguagesService,
    private convertRp: RupiahFormaterWithoutRpPipe,
    private translateInterpolatePipe: TranslateInterpolatePipe,
  ) {

    // this.gaService.eventTracking({
    //   'event_category': 'MainMenuDetail',
    //   'event_action': 'Click',
    //   'event_label': 'LihatPesanan',
    //   'event_value': 1,
    //   'event_noninteraction': 0
    // });

    this.adapter.setLocale('en');
    this.rows = [];

    // // Dummy Data // //
    // this.rows = [
    //   {
    //     id: 1,
    //     available_status: {
    //       "diproses": "Pesanan Diproses", 
    //       "pesanan-dibatalkan": "Pesanan Dibatalkan"
    //     },
    //     created_at: "2022-01-27 09:28:15",
    //     invoice_number: "AYO.220127092815.130330",
    //     name: "Dummy Test",
    //     order_from: "otc",
    //     shipping_method: "diambil",
    //     address2: "Jakarta, Indonesia",
    //     status: "pesanan-dilihat",
    //     status_indo: "Pesanan Dilihat",
    //     total: 20000,
    //     total_payment: 20000,
    //     total_payment_format_currency: "RP 20.000",
    //     payment_type: "cod",
    //     payment_type_indo: "Bayar Di Tempat"
    //   }
    // ];
    // // End Dummy Data // //

    // // For Dummy Data // //
    // this.rows.map((item) => {
    //   item['orderStatuses'] = Object.entries(item.available_status).map(([value, name]) => ({value,name}));
    // });
    // // End For Dummy Data // //

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
      status: '',
      from: "",
      to: "",
      shipping: '',
      payment_type: '',
      status_dashboard: '',
    });
    this.dataService.currentJsonLocale.subscribe(res => {
      console.log("resss json", res);
      this.jsonLocale = res;
    })
    this.user_country = localStorage.getItem('user_country');
    if (this.user_country === 'kh') {
    	this.show_printinvoicebtn = true;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const staticWindowHeight = event.target.innerWidth < 1714 ? 500 : 449;
    this.innerHeight = event.target.innerWidth <= 984 || event.target.innerHeight < 834 ? 'auto' : (event.target.innerHeight - staticWindowHeight) + 'px';
    this.statusScroll = event.target.innerWidth <= 984 || event.target.innerHeight < 834 ? false : true;
  }

  async ngOnInit() {
    // // For Dummy Data // //
    // this.loadingIndicator = false;
    // this.rows;
    // this.statusFilter;
    // // End For Dummy Data // //
    
    this.courierFilter = [this.defaultShipping];
    const staticWindowHeight = window.innerWidth < 1714 ? 500 : 449;
    this.innerHeight = window.innerWidth <= 984 || window.innerHeight < 834 ? 'auto' : (window.innerHeight - staticWindowHeight) + 'px';
    this.statusScroll = window.innerWidth <= 984 || window.innerHeight < 834 ? false : true;
    
    const profile = this.dataService.getDecryptedProfile();
    this.gtmService.userTracking(profile.id, profile.role_name);
    // this.generalService.updateLastOpen({ type: "wholesaler" }).subscribe(res => { });
    
    await this.getTab();

    // this.route.queryParams.subscribe(({status, from, to, shipping, payment_type}) => {

    // })
    // from = moment(from);
    // to = moment(to);
    // this.getCourierList();
    this.getListOrders();
    // this.formFilter.controls['status'].valueChanges.subscribe(formFilterStatusValue => { this.isSelectable(); })
    this.isSelectable();

    this.selectedTabMainChange(0);
    this.formFilter.get('shipping').setValue(this.dataService.getFromStorage("filter_orders_shipping") ? this.dataService.getFromStorage("filter_orders_shipping") : [this.defaultShipping]);
    this.route.queryParams.subscribe(params => {
      if(params['from']) {
        this.formFilter.get('from').setValue(this.dataService.getFromStorage("filter_orders_from"));
      }
      if(params['to']) {
        this.formFilter.get('to').setValue(this.dataService.getFromStorage("filter_orders_to"));
      }
      if(params['from'] || params['to'] || params['status']){
        this.formFilter.get('shipping').setValue([this.defaultShipping]);
      }
    });

    if(!this.dataService.getFromStorage("page")){
      this.dataService.setToStorage("page", 1);
    }

  }
  ngOnDestroy() {
    this.dataService.setToStorage("filter_orders_payment_type", '');
    this.dataService.setToStorage("filter_orders_status_dashboard", '');
    this.dataService.setToStorage("filter_orders_shipping", '');
    this.dataService.setToStorage("filter_orders_to", '');
    this.dataService.setToStorage("filter_orders_from", '');
  }

  setValFilter(check: boolean = false) {
    const startDate = moment().subtract(7, 'd').format('YYYY-MM-DD');
    const todayDate = moment().format('YYYY-MM-DD');
    let dateFromParam = "";
    let dateToParam = "";
    this.route.queryParams.subscribe(params => {
      dateFromParam = params['from'];
      dateToParam = params['to'];
    });

    const { getFromStorage } = this.dataService;
    const statusOnStorage = getFromStorage("filter_orders_status") ? getFromStorage("filter_orders_status") : [''];
    let fromOnStorage = getFromStorage("filter_orders_from") && !dateFromParam && !dateToParam && (this.selectedTabMain !== 0 && this.selectedTabMain !== 7) ? '' : (dateFromParam)? getFromStorage("filter_orders_from") : startDate;
    let toOnStorage = getFromStorage("filter_orders_to") && !dateFromParam && !dateToParam && (this.selectedTabMain !== 0 && this.selectedTabMain !== 7) ? '' : (dateToParam)? getFromStorage("filter_orders_to") : todayDate;
    // const fromOnStorage = getFromStorage("filter_orders_from") ? (dateFromParam)? getFromStorage("filter_orders_from") : startDate : startDate;
    // const toOnStorage = getFromStorage("filter_orders_to") ? (dateToParam)? getFromStorage("filter_orders_to") : todayDate : todayDate;
    const payment_type = getFromStorage("filter_orders_payment_type") ? getFromStorage("filter_orders_payment_type") : "";
    const status_dashboard = getFromStorage("filter_orders_status_dashboard") ? getFromStorage("filter_orders_status_dashboard") : "";
    // const _status = (status) ? status : statusOnStorage;
    // const _from = (from) ? from : fromOnStorage;
    // const _to = (to) ? to : toOnStorage;
    if (check) {
      fromOnStorage = '';
      toOnStorage = '';
    } else {
      fromOnStorage = getFromStorage("filter_orders_from") && !dateFromParam && !dateToParam && (this.selectedTabMain !== 0 && this.selectedTabMain !== 7) ? '' : (dateFromParam)? getFromStorage("filter_orders_from") : startDate;
      toOnStorage = getFromStorage("filter_orders_to") && !dateFromParam && !dateToParam && (this.selectedTabMain !== 0 && this.selectedTabMain !== 7) ? '' : (dateToParam)? getFromStorage("filter_orders_to") : todayDate;
    }
    this.formFilter.setValue({
      status: statusOnStorage,
      from: fromOnStorage,
      to: toOnStorage,
      shipping: this.dataService.getFromStorage("filter_orders_shipping") ? this.dataService.getFromStorage("filter_orders_shipping") : [this.defaultShipping],
      payment_type: payment_type,
      status_dashboard: status_dashboard,
    });
  }

  async getTab() {
    this.loadingIndicator = true;
    await this.ordersService.getRetailerTab().subscribe(
      async res => {
        this.loadingIndicator = false;
        if(res){
          this.statusFilter = res;
          let allChild = [];
          if (res.length > 0) {
            let isProcessing = true;
            let subscription = this.route.queryParams.subscribe(params => {
              let statusX = params['status'];
              res.map(async (item: any, index: any) => {
                if(item.hasOwnProperty('child') && item.child.length > 0){
                    item.child.map(async (dataChild: any) => {
                      allChild.push(
                        { 
                          'index_parent': index,
                          'parent_name': item.status_title,
                          'child_name': dataChild.status_title
                        }
                      );
                    });
                }
                if (item.status_title === statusX && isProcessing === true) {
                  this.selectedTabMain = index;
                  if(statusX === 'pesanan-baru' || statusX === 'diproses'){
                    this.childStatus = statusX;
                    isProcessing = false;
                  }
                }else{
                  allChild.map(async (children: any) => {
                    if (children.child_name === statusX) {
                      this.selectedTabMain = children.index_parent;
                      this.childStatus = statusX;
                      isProcessing = false;
                    }
                  });
                }
              });
            });
          }
        }
        this.loadingIndicator = false;
      },
      err => {
        this.loadingIndicator = false;
        console.error(err);
      }
    );
    this.getSignOrderMenu();
  }

  getSignOrderMenu() {
    this.ordersService.getSignMenuOrder().subscribe(
      res => {
        if(res){
          this.emitter.emitMenuSignEmitter({ isMenuSign: res.is_sign });
        }
      },
      err => {
        console.error(err);
      }
    );
  }

  compareFn(o1: any, o2: any) {
    return o1.id === o2.id;
  }

  getCourierList() {
    this.ordersService.courierList().subscribe(res => {
      // console.log('courier', res);
      const defaultCourier = this.defaultShipping;
      // {id: 571, name: "Kurir Agen"}
      // console.log({res});
      this.courierFilter = [defaultCourier, ...res.data];
    })
  }

  async getListOrders() {
    this.dataService.showLoading(true);
    this.loadingIndicator = true;
    const page = 1;
    const sort_type = 'desc';
    const sort = 'created_at'
    let courier = _.pluck(this.formFilter.get('shipping').value, 'id');
    // let status = this.formFilter.get("status").value;
    courier = courier.filter(c => c !== "");
    // status = status.filter(s => s !== "");
    // console.log({courier});

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;
    this.pagination.status = (status && status.length) ? status : undefined;
    let dateFrom = '';
    let dateTo = '';
    await this.route.queryParams.subscribe(params => {
      if (params['from']) {
        dateFrom = params['from'];
        dateTo = params['to'];
        this.pagination.status = params['status'];
      } else {
        dateFrom = this.convertDate(this.formFilter.get('from').value);
        dateTo = this.convertDate(this.formFilter.get('to').value);
      }
    });
    const startDate = moment().subtract(7, 'd').format('YYYY-MM-DD');
    const todayDate = moment().format('YYYY-MM-DD');
    this.pagination.start_date = (this.dataService.getFromStorage("filter_orders_from"))? this.dataService.getFromStorage("filter_orders_from") : (this.convertDate(this.formFilter.get('from').value))? this.convertDate(this.formFilter.get('from').value) : startDate;
    this.pagination.end_date = (this.dataService.getFromStorage("filter_orders_to"))? this.dataService.getFromStorage("filter_orders_to") : (this.convertDate(this.formFilter.get('to').value))? this.convertDate(this.formFilter.get('to').value) : todayDate;
    this.pagination.payment_type = this.formFilter.get('payment_type').value;
    this.pagination.status_dashboard = this.formFilter.get('status_dashboard').value;
    this.pagination.delivery_courier_id = (courier && courier.length) ? courier : undefined;
    // console.log('gett shipping', this.formFilter.get('shipping').value);
    this.ordersService.get(this.pagination).subscribe(
      async res => {
        console.log('X 1111111111')
        // console.log({res});
        // if (res.data && res.data.length) {
        //   const columns = Object.keys(res.data[0]);
        //   this.generateColumns(columns);
        // }
        if (res.data && res.data.length) {
           if (Object.keys(res.data[0]).includes('customer_code')) {
              // this.formColumn.(this.ls.locale.global.label.customer_code);
              this.defaultColumns.push(this.ls.locale.global.label.customer_code);
              this.columns.push(this.ls.locale.global.label.customer_code);
              this.showcustomercode = true;
           }
         }
        Page.renderPagination(this.pagination, res);
        // this.rows = res.data;
        await this.getAndCreateRoomById(res);
        this.onLoad = false;
        this.gtmUserTiming();
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

  gtmUserTiming() {
    const startTime = this.dataService.getFromStorage('timeStartClickLihatPesanan');
    if (startTime) {
      const endTime = moment(new Date());
      const totalPageLoadTime = moment.duration(endTime.diff(moment(startTime))).asSeconds();
      console.log('USER-TIMING timeStartClickLihatPesanan FINISH', new Date());
      console.log('USER-TIMING timeStartClickLihatPesanan totalPageLoadTime ', totalPageLoadTime);
      this.gtmService.userTiming({
        timingCategory: 'Page Load',
        timingVariable: 'Lihat pesanan click to fully loaded lihat pesanan',
        timingLabel: location.href,
        timingValue: totalPageLoadTime
      });
      window.localStorage.removeItem('timeStartClickLihatPesanan');
    }
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
    this.isSetPage = true;
    if (this.isSetPage === true) {
      this.ordersService.get(this.pagination).subscribe(async res => {
        Page.renderPagination(this.pagination, res);
        // this.rows = res.data;
        await this.getAndCreateRoomById(res);
        // this.loadingIndicator = false;
        this.dataService.showLoading(false);
      }, err => {
        this.dataService.showLoading(false);
      });
    } else {
      this.isSetPage = false;
      this.dataService.showLoading(false);
      this.loadingIndicator = false;
    }
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.pagination.status = this.formFilter.get("status").value;
    this.pagination.start_date = this.convertDate(this.formFilter.get("from").value);
    this.pagination.end_date = this.convertDate(this.formFilter.get("to").value);

    this.pagination.delivery_courier_id = _.pluck(this.formFilter.get('shipping').value, 'id');
    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.loadingIndicator = true;
    this.dataService.showLoading(true);

    // console.log("check pagination", this.pagination);

    this.ordersService.get(this.pagination).subscribe(async res => {
      Page.renderPagination(this.pagination, res);
      // this.rows = res.data;
      await this.getAndCreateRoomById(res);
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
    });
  }

  async updateFilter(string, value, indexing:any = null) {
    this.loadingIndicator = true;
    this.pagination.search = string;
    this.dataService.showLoading(true);

    this.pagination.page = 1;
    this.offsetPagination = 0;
    // if (string) {
    // } else {
    //   const page = this.dataService.getFromStorage("page");
    //   this.pagination.page = page;
    //   this.offsetPagination = page ? (page - 1) : 0;
    // }
    // console.log('formfilter', this.formFilter);
    let shippings = _.pluck(this.formFilter.get('shipping').value, 'id'); shippings = shippings.filter(shiping => shiping !== "");

    // let status = this.formFilter.get("status").value; status = status.filter(s => s !== "");
    let status:any = [];
    if (!value) {
      this.childStatus = '';
      if (this.statusFilter.length > 0) {
        if (value !== 'search') {
          status.push((this.statusFilter[this.selectedTabMain].status_title === 'semua-pesanan') ? '' : this.statusFilter[this.selectedTabMain].status_title);
        }
      }
      if (this.statusFilter.length > 0 && this.statusFilter[this.selectedTabMain].child.length > 0) {
        this.statusFilter[this.selectedTabMain].child.map(async (item: any) => {
          if (value !== 'search') {
            status.push(item.status_title);
          }
        });
      }
    } else {
      this.childStatus = value;
      if (value !== 'search') {
        status.push(value);
      }
    }
    const filteredArray = status.filter(function(item, pos){
      return status.indexOf(item)== pos;
    });

    this.pagination.delivery_courier_id = (shippings.length) ? shippings : undefined;
    if (filteredArray.length > 0) {
      this.pagination.status = filteredArray;
    }
    this.pagination.start_date = this.convertDate(this.formFilter.get("from").value);
    this.pagination.end_date = this.convertDate(this.formFilter.get("to").value);
    this.pagination.per_page = this.selectedPerPage;
    // console.log('paginate', this.pagination);

    this.isSelectable();
    this.clearSelection();
    this.ordersService.get(this.pagination).subscribe(async res => {
      // this.innerHeight = window.innerWidth <= 984 || res.data.length < 10  ? 'auto' : (window.innerHeight - 500) + 'px';
      // this.statusScroll = true;
      // this.statusScroll = window.innerWidth <= 984 || res.data.length < 10 ? false : true;
      // if (value === 'search') {
      //   if (string) {
      //     this.trackingEvent(string, 'submit-search');
      //   }
      // } else {
      //   this.trackingEvent('filter', 'Click');
      // }
      const mode = this.dataService.getFromStorage('mode');

      const shippings = _.pluck(this.formFilter.get('shipping').value, 'name').join(',');
      if (mode === 'kasir') {
        this.gtmService.generalEvent('ModeKasir', 'Filter',
          { pageName: 'Lihat Daftar Pesanan', filterValue: this.pagination.status + ' - ' + shippings });
      } else {
        this.gtmService.generalEvent('ModeSistem', 'Filter',
          { pageName: 'Lihat Daftar Pesanan', filterValue: this.pagination.status + ' - ' + shippings });
      }

      // Only show address until Kecamatan
      for (let i = 0; i < res.data.length; i++) {
        const splitAddress = res.data[i].address.split("Kec. ");
        if (splitAddress.length > 1) {
          const splitKecamatan = splitAddress[1].split(",");
          if (splitKecamatan.length > 1) {
            res.data[i].address2 = `${splitAddress[0]} Kec. ${splitKecamatan[0]}`;
          } else {
            res.data[i].address2 = res.data[i].address;
          }
        } else {
          res.data[i].address2 = res.data[i].address;
        }
      }

      Page.renderPagination(this.pagination, res);
      await this.getAndCreateRoomById(res);
      // this.rows = res.data;
      this.loadingIndicator = false;
      this.dataService.showLoading(false);
      // console.log('rows', this.rows);
    });
    if (this.selectedTabMain === 0 || this.selectedTabMain === 1 || this.selectedTabMain === 2) {
      this.getSignOrderMenu();
    }
  }

  getFilterChild(val: any){
    this.updateFilter(null, this.childStatus !== val ? val : '');
  }

  changeShipping(param?: any){
    this.dataService.setToStorage("filter_orders_shipping", param);
    this.updateFilter(null, null);
  }

  setMinDate(param?: any): void {
    this.validateDate = true;
    this.formFilter.get("from").setValue(param);
    this.formFilter.get("to").setValue("");
    this.dataService.setToStorage("filter_orders_from", param);
    this.updateFilter(null, null);
  }

  setMaxDate(param?: any): void {
    this.validateDate = true;
    this.formFilter.get("to").setValue(param);
    this.dataService.setToStorage("filter_orders_to", param);
    this.updateFilter(null, null);
    this.validateDate = false;
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format("YYYY-MM-DD");
    }

    return "";
  }

  // trackingEvent(value, action) {
  //   this.gaService.eventTracking({
  //     'event_category': 'LihatPesananDetail',
  //     'event_action': action,
  //     'event_label': value,
  //     'event_value': 1,
  //     'event_noninteraction': 0
  //   });
  // }

  checkValidate(item: any) {
    if ((item.status === 'pesanan-baru') || (item.orderStatuses && item.orderStatuses.length === 0) || (item.payment_type === 'virtual-account' && item.status === 'pesanan-diterima')) {
      return false;
    } else {
      return true;
    }
  }

  async getAndCreateRoomById(items: any) {
    console.log('items', items);
    console.log('qs', this.qs.qiscus);
    if (items && items.data && this.qs.qiscus.isLogin) {
      const dataTransaksi = [];
      this.loadingIndicator = true;
      this.qs.qiscus.loadRoomList({ page: 1, limit: 50, showParticipants: true, showEmpty: false })
        .then(async (rooms: any) => {
          // On success
          // console.log('ROOM', rooms);
          const mappingRoom = await items.data.map(async (item: any) => {
            item['statusOpened'] = false;
            item['orderStatuses'] = Object.entries(item.available_status).map(
              ([value, name]) => ({ value, name })
            );
            if (item.status === 'pesanan-dibatalkan' || item.status === 'selesai') {
              item.dataQiscus = null;
              dataTransaksi.push(item);
              return;
            } else {
              rooms.map((room: any) => {
                if (room.id == item.qiscus_room_id) {
                  item.dataQiscus = room;
                  return;
                }
              });
              dataTransaksi.push(item);
              return;
            }
          });
          Promise.all(mappingRoom).then(() => {
            // console.log("ROWS", dataTransaksi)
            this.rows = dataTransaksi;
            this.loadingIndicator = false;
          });
        }).catch(async (error: any) => {
          // On error
          console.log('3rror', error);
          this.initLoginQiscus();
          if (items && items.data) {
            this.rows = items.data;
            if(this.rows && this.rows.length) {
              this.rows.map((item) => {
                item['orderStatuses'] = Object.entries(item.available_status).map(([value, name]) => ({value,name}));
              });
            }
            this.loadingIndicator = false;
          }
          // setTimeout(() => {
          //   this.getAndCreateRoomById(items);
          // }, 1500);
          // const mappingRoom = await items.data.map(async (item: any) => {
          //   item['statusOpened'] = false;
          //   item['orderStatuses'] = Object.entries(item.available_status).map(([value, name]) => ({ value, name }));
          //   return item;
          // });
          // console.log('mappingRoom', mappingRoom);
          // this.rows = mappingRoom;
          // this.loadingIndicator = false;
        });
    } else {
      this.initLoginQiscus();
      if (items && items.data) {
        this.rows = items.data;
        this.loadingIndicator = false;
      }
    }
  }

  initLoginQiscus() {
    this.qs.qiscus.getNonce().then(async (gn: any) => {
      if (gn && gn.nonce) {
        return new Promise((resolve, reject) => {
          this.qs.createJWT({ nonce: gn.nonce }).subscribe((res: any) => {
            resolve(res);
          }, (err) => {
            reject(err);
          });
        });
      }
    }).then((jwt: any) => {
      if (jwt && jwt.data) {
        return this.qs.qiscus.verifyIdentityToken(jwt.data);
      }
    }).then((userData: any) => {
      if (userData) {
        this.qs.qiscus.setUserWithIdentityToken(userData);
        return userData;
      }
    });
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
          // console.log("ROWS", this.rows)
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

  getDetailTransaction(data: any) {
    /**
     * user timing (Google Tag Manager)
     */
    const startTime = this.dataService.getFromStorage('timeStartPesananDetail');
    if (startTime) {
      window.localStorage.removeItem('timeStartPesananDetail');
      console.log('USER-TIMING timeStartLogin', new Date());
      this.dataService.setToStorage('timeStartPesananDetail', new Date());
    } else {
      this.dataService.setToStorage('timeStartPesananDetail', new Date());
    }

    const mode = this.dataService.getFromStorage('mode');

    if (mode === 'kasir') {
      this.gtmService.generalEvent('ModeKasir', 'LihatPesananDetail', { orderCode: data.invoice_number, orderId: data.id });
    } else {
      this.gtmService.generalEvent('ModeSistem', 'LihatPesananDetail', { orderCode: data.invoice_number, orderId: data.id });
    }
    setTimeout(() => {
      this.emitter.emitDataChat(data);
    }, 200);
  }

  openChangeStatus(row: any) {
    // console.log('row', row);
    let index = this.rows.findIndex(rw => rw.id === row.id);
    if (index > -1) {
      this.rows[index]['statusOpened'] = !this.rows[index]['statusOpened'];
    }
  }

  updateStatus(row: any, {value: status, name}) {
    this.selectedOrderToUpdate = row.id;
    let body: Object = {
      status: status
    };
    // console.log("status", status, row);
    this.dataService.showLoading(true);
    this.ordersService.checkUpdatePriceStatus({ order_id: row.id })
      .subscribe(res => {
        // console.log('resss status', res);
        this.dataService.showLoading(false);
        // let isHavePriceUpdate = row.products.find(prd => prd.price_update_status);
        if (res && res.data && res.data.price_update_status && body['status'] !== 'pesanan-dibatalkan' && (row['status'] === 'pesanan-baru' || row['status'] === 'diproses')) {
          this.body = body;
          let data = {
            titleDialog: "Harga Produk Belum di Perbarui",
            captionDialog: this.ls.locale.lihat_pesanan.text11,
            confirmCallback: this.confirmUpdateStats.bind(this),
            orderDetail: true,
            cancelCallback: this.cancelUpdateStats.bind(this),
            buttonText: [this.ls.locale.lihat_pesanan.text25, "Tidak, Perbaharui Dulu"]
          };
          this.dialogService.openCustomConfirmationDialog(data);
        } else {
          this.body = body;
          let data = {
            titleDialog: this.ls.locale.lihat_pesanan.text24,
            captionDialog: `${this.ls.locale.lihat_pesanan.text23} [${name.toUpperCase()}]`,
            confirmCallback: this.confirmUpdateStats.bind(this),
            buttonText: [this.ls.locale.lihat_pesanan.text25, this.ls.locale.lihat_pesanan.text26]
          }
          this.dialogService.openCustomConfirmationDialog(data);
        }
      }, err => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: 'Gagal melakukan pengecekan status update harga product' });
      })
  }

  confirmUpdateStats() {
    this.dataService.showLoading(true);
    this.ordersService.putStatus(this.body, { order_id: this.selectedOrderToUpdate }).subscribe(
      async res => {
        await this.getTab();
        this.loadingIndicator = false;
        this.dataService.showLoading(false);
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: this.ls.locale.lihat_pesanan.text14 });

        // this.getListOrders();
        this.updateFilter(null, null);
      },
      err => {
        this.loadingIndicator = false;
        this.dataService.showLoading(false);
        // this.dialogService.openSnackBar({ message: err.error.message })
      }
    );
  }

  cancelUpdateStats() {
    this.dialogService.brodcastCloseConfirmation();
  }

  async export() {
    this.dataService.showLoading(true);
    this.loadingIndicator = true;

    this.pagination.page = 1;
    this.offsetPagination = 0;
    let shipping = _.pluck(this.formFilter.get('shipping').value, 'id'); shipping = shipping.filter(s => s !== "");
    let status = this.formFilter.get("status").value; status = status.filter(s => s !== "");
    this.pagination.delivery_courier_id = (shipping && shipping.length) ? shipping : undefined;
    this.pagination.status = (status && status.length) ? status : undefined;
    this.pagination.start_date = this.convertDate(this.formFilter.get("from").value);
    this.pagination.end_date = this.convertDate(this.formFilter.get("to").value);
    try {
      const response = await this.ordersService.export(this.pagination).toPromise();
      // console.log('he', response.headers);
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `Export_Orders_${new Date().toLocaleString()}.xls`);
      // this.downLoadFile(response, "data:text/csv;charset=utf-8", `Export_Retailer_${new Date().toLocaleString()}.csv`);
      // this.downloadLink.nativeElement.href = response;
      // this.downloadLink.nativeElement.click();
      this.dataService.showLoading(false);
      this.loadingIndicator = false;
    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
      this.loadingIndicator = false;
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
  disablePrintInvoiceBtn(){
    this.print_invoice_disabled = !this.print_invoice_disabled
  }
  onSelect(e, row) {
    if (e.checked) {
      if (this.checkSelectable(row)) {
        this.selected.push(row);
        this.selectableDataForPrint.selected.push(row.id)
        if (this.selectableDataForPrint.selected.length) {
          this.print_invoice_disabled = false;
        }
      } else {
        e.source.checked = false;
      }
      this.checkIsAllRowsSelected();
      this.getUpdateableStatus();

    } else {

      const removedItem = this.selected.filter(item => item.id !== row.id);
      this.selected = [...removedItem];
      const removedPrintItem = this.selectableDataForPrint.selected.filter(item => item !== row.id);
      this.selectableDataForPrint.selected = [...removedPrintItem]
      this.selectAllOnPage[this.offsetPagination] = false;
      if(!this.selectableDataForPrint.selected.length){
        this.print_invoice_disabled = true
      }
    }

  }

  isSelectable() {
    this.selectable = true;
    return;
  }
  bulkUpdateStatus(targetStatus) {
    const isAll = this.selectAllOnPage;
    // console.log({isAll});

    let shipping = _.pluck(this.formFilter.get('shipping').value, 'id'); shipping = shipping.filter(s => s !== "");
    let status = this.formFilter.get("status").value; status = status.filter(s => s !== "");
    this.pagination.delivery_courier_id = (shipping && shipping.length) ? shipping : undefined;
    this.pagination.status = (status && status.length) ? status : undefined;
    this.pagination.start_date = this.convertDate(this.formFilter.get("from").value);
    this.pagination.end_date = this.convertDate(this.formFilter.get("to").value);
    const filter = { ...this.pagination };
    filter['status_filter'] = filter['status'];
    delete filter['status'];

    const payload = {
      is_all: isAll.includes(true) ? 1 : 0,
      order_id: _.pluck(this.selected, 'id'),
      status: targetStatus,
      ...filter
    }

    this.dataService.showLoading(true);
    this.loadingIndicator = true;

    this.ordersService.putUpdateMultipleStatus(payload).subscribe(response => {

      this.dataService.showLoading(false);
      this.loadingIndicator = false;

      this.updateFilter(null, null);
      this.getCourierList();

    }, error => {

      console.log({ error });
      this.dataService.showLoading(false);
      this.loadingIndicator = false;

    })
    // console.log({ targetStatus })
  }
  checkSelectable(targetSelected) {

    if (!this.selected.length) return true;

    if (this.selected.length && this.selected[0].status === targetSelected.status) {
      // console.log('this.selected.length && this.selected[0].status === targetSelected.status');
      return true;
    }

    else {
      console.warn('not selected');
      return false;
    }
  }

  onAllRowsChange(e, rows) {
    if(e.checked)this.selected.push(...rows);
    if (!this.selectAllOnPage[this.offsetPagination]) {

      const selectableData = [];

      if (this.selected.length > 0) {
        rows.map(row => {
          if (this.checkSelectable(row)) selectableData.push(row);
          // console.log({selectableData});
        })
        selectableData.forEach((item) => {
          this.selectableDataForPrint.selected.push(item.id)
        })
        if(this.selectableDataForPrint.selected.length >1){
          this.print_invoice_disabled = false;
        }
        console.log(this.selectableDataForPrint)
        console.log(selectableData)
      }
      // Select all again
      if (selectableData.length) {
        const currentSelected = [...this.selected, ...selectableData];
        const uniqueSelected = _.unique(currentSelected, 'id');
        this.selected = uniqueSelected;
        this.selectAllOnPage[this.offsetPagination] = true;
      } else {
        this.selectAllOnPage[this.offsetPagination] = false;
        e.source.checked = false;
      }
    } else {
      // Unselect all
      rows.map(row => {
        this.selected = this.selected.filter((selected) => selected.id !== row.id);
        this.selectableDataForPrint.selected  = this.selectableDataForPrint.selected.filter(item => item !== row.id);
      });
      if (!this.selectableDataForPrint.selected.length) {
        this.print_invoice_disabled = true;
      }
      this.selectAllOnPage[this.offsetPagination] = false;
    }
    this.getUpdateableStatus();
  }
  getRowId(row) {
    return row.id
  }

  checkIsAllRowsSelected() {
    const selected = _.pluck(this.selected, 'id');
    let rows = _.pluck(this.rows, 'id');

    selected.map(selectedItem => { rows = [...rows.filter(row => selectedItem !== row)]; })
    let selectAllOnPage = true;

    if (rows.length) selectAllOnPage = false;

    this.selectAllOnPage[this.offsetPagination] = selectAllOnPage;

  }
  clearSelection() {
    this.selected = [];
    this.selectAllOnPage = [];
  }
  getUpdateableStatus() {
    if (this.selected.length) {
      const selected = this.selected[0];
      var status = selected.status;
      this.ordersService.putUpdateableStatus({ status: status }).subscribe(response => {
        // console.log({response});
        this.updateableStatus = response['data'];
      })
    }
  }

  generateColumns(columns) {
    // let generated = [];
    // columns.map(col => {
    //   const name = String(col.replace('_', ' ')).toLocaleUpperCase();
    //   const prop = col;
    //   generated.push({name, prop});
    // })
    // console.log({generated});
    // this.resultColumns = generated;
  }

  resetColum() {
    this.formColumn.setValue(this.defaultColumns);
  }

  changePerPage(event) {
    this.pagination.per_page = event.value;
    this.selectedPerPage = event.value;
    this.updateFilter(null, (this.childStatus)? this.childStatus : null);
  }

  selectedTabMainChange(index: any) {
    this.selectedTabMain = index;
    if (index !== 0 && index !== 7) {
      this.setValFilter(true);
    } else {
      this.setValFilter(false);
    }
    // this.updateFilter(null, null);
  }
  getCellClass({ row, column, value }): any {
    let color = ' white-strip ';
    if(row.response_time_left < 0 ){
      color = ' red-strip ';
    }
    return color;
  }

  async printAll() {

    this.ordersService.printMultipleInvoice(this.selectableDataForPrint).subscribe(
      async res => {
        console.log(res);
        let detailOrders = res.data;
        let bodyHtmls = [];
        detailOrders.forEach(async (detailOrder)=>{
          let productsNota :any
         await this.ordersService.getDetailProductList({ order_id: detailOrder['id'] }).subscribe( async resProduct => {
            console.log(resProduct);
            detailOrder['products'] = resProduct;
            let products = resProduct ? [...resProduct].filter(obj => obj.amount > 0) : [];
             productsNota = products;
             const mode = this.dataService.getFromStorage('mode');
      
      if (mode === 'kasir') {
        this.gtmService.generalEvent('ModeKasir', 'LihatPesananCetak',
          { orderCode: detailOrder.invoice_number, orderId: detailOrder.id });
      } else {
        this.gtmService.generalEvent('ModeSistem', 'LihatPesananCetak',
          { orderCode: detailOrder.invoice_number, orderId:  detailOrder.id});
      }
      
      productsNota = detailOrder && detailOrder.products ? [...detailOrder.products].filter(obj => obj.amount > 0) : [];
      let withChildSummary = [];
      detailOrder.summary.map(sm => {
            withChildSummary.push({ ...sm });

            if (sm.child) {
              sm.child.map(chld => withChildSummary.push({ ...chld }));
            }
          });
      detailOrder.summary = withChildSummary;
      let bodyCurrency = {
        total_discount: this.convertRp.transform(detailOrder.total_discount),
        point_curs: this.convertRp.transform(detailOrder.point_curs),
        products: productsNota.map(obj => {
          return {
            ...obj,
            price_nota: this.convertRp.transform(obj.price + obj.price_discount),
            subtotal_nota: this.convertRp.transform((obj.price + obj.price_discount) * obj.amount),
            discount_nota: this.convertRp.transform(obj.price_discount * obj.amount)
          };
        })
      };
      
      const bodyHtml = {
        ...detailOrder,
        created_at: moment(detailOrder.created_at).format(
          "DD/MM/YYYY HH:mm"
        ),
        ...bodyCurrency,
        summary: detailOrder.summary.map(obj => {
          return {
            ...obj,
            title: obj.title.toUpperCase() === this.ls.locale.global.label.total_payment ? this.ls.locale.global.label.total_order : obj.title.toUpperCase(),
            value: this.checkOngkirWithProductExisting(obj,productsNota)
          };
        })
      };
      if ((bodyHtml['summary']) ) {
        bodyHtmls.push(bodyHtml)
        console.log(bodyHtmls,'came here');
      }
      if(detailOrders.length  == bodyHtmls.length){
        console.log("Last Element")
      // let receipts = []
      let popupWin;     

      

      let receipt =  await this.generateReceipt.muliplehtmlInvoices(bodyHtmls).then(result => {
        popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.open();
        popupWin.document.write(result);
        popupWin.document.close();
      }

        );
      // bodyHtmls.forEach( async (bodyHtml)=>{
      //   let receipt =  this.generateReceipt.html(bodyHtml);
      //   receipts.push(receipt);
      // })  
      // if (receipt) {
      //   popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
      //   popupWin.document.open();
      //   popupWin.document.write(receipt);
      //   popupWin.document.close();
      // }
      }
        })
          });


      },
      err => {

      }
    )
  }

  checkOngkirWithProductExisting(item, productsNota) {
    let symbol = this.jsonLocale.currencies.symbol;
    const _value = String(item.value).toLowerCase();
    const _symbol = String(symbol).toLowerCase();
    const splited = _value.split(`${_symbol}`);
    let value = (splited[1]) ? splited[1] : _value.split(`${_symbol} `)[1];

    if (item.title === 'Ongkos Pengiriman' || item.title === this.ls.locale.pesan_produk.text69) {
      return productsNota.length === 0 ? 0 : value;
    } else {
      return value;
    }
  }
}



