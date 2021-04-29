import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { B2CVoucherService } from 'app/services/b2c-voucher.service';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { GeotreeService } from 'app/services/geotree.service';
import { ProductService } from 'app/services/sku-management/product.service';
import { MatSelect, MatDialogConfig, MatDialog, MatAutocomplete, MatChipInputEvent, MatAutocompleteSelectedEvent } from '@angular/material';
import { takeUntil, take } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
import { startWith, map } from 'rxjs/operators';
import { ENTER, COMMA, SEMICOLON } from '@angular/cdk/keycodes';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { ImportAudienceDialogComponent } from './tab/import-audience-dialog/import-audience-dialog.component';

@Component({
  selector: 'app-b2c-voucher-edit',
  templateUrl: './b2c-voucher-edit.component.html',
  styleUrls: ['./b2c-voucher-edit.component.scss']
})
export class B2CVoucherEditComponent implements OnInit {
  isDetail: Boolean;
  formDetailVoucher: FormGroup;
  formFilter: FormGroup;
  minDateVoucher: any = new Date();

  onLoad: boolean;
  @ViewChild('containerScroll') private myScrollContainer: ElementRef;

  rows: any[] = [];
  selected: any[];
  id: any;
  private _onDestroy = new Subject<void>();

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  offsetPagination: any;
  allRowsSelected: boolean;
  // allRowsSelectedValid: boolean;

  isSelected: boolean;

  keyUp = new Subject<string>();
  keyUpProduct = new Subject<string>();
  permission: any;
  roles: PagesName = new PagesName();

  areaFromLogin;
  area_id_list: any = [];
  listLevelArea: any[];
  list: any;
  area: Array<any>;
  lastLevel: any;
  endArea: String;
  dialogRef: any;
  totalData: number = 0;
  wholesalerIds: any = [];
  isSort: boolean = false;

  listCategories: any[] = [];
  listProduct: any[] = [];
  filterProduct: FormControl = new FormControl('');
  public filteredProduct: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('singleSelect') singleSelect: MatSelect;

  detailVoucher: any;
  product: FormControl = new FormControl('');
  listProductSkuBank: Array<any> = [];
  filteredSkuOptions: Observable<string[]>;
  productList: any[] = [];
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA, SEMICOLON];
  inputChipList = [];

  voucherDetailID: any = null;
  isLimitVoucher: boolean; // show List Audience @Panel Retailer
  dataPanelRetailer: any;
  dataPanelCustomer: any;
  selectedTab: number;

  endVoucher: any = new Date();
  useVoucher: any = new Date();
  usedVoucher: any = new Date();
  usage: any[] = [
    {label: 'Pesan Antar', value: 'coo'},
    {label: 'Langsung ke Toko', value: 'offline'}
  ];

  @ViewChild('productInput') productInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private b2cVoucherService: B2CVoucherService,
    private geotreeService: GeotreeService,
    private productService: ProductService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog
  ) {
    activatedRoute.url.subscribe(params => {
      this.isDetail = params[0].path === 'detail' ? true : false;
      this.voucherDetailID = params[1].path || null;
    });
    this.onLoad = false;
    this.selected = [];
    // this.permission = this.roles.getRoles('principal.supplierpanelmitra');
    this.allRowsSelected = false;
    // this.allRowsSelectedValid = false;
    this.isSelected = false;

    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
    this.listLevelArea = [
      {
        'id': 1,
        'parent_id': null,
        'code': 'SLSNTL      ',
        'name': 'SSLSNTL'
      }
    ];
    this.list = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }
    this.area = dataService.getDecryptedProfile()['area_type'];

    // this.filteredSkuOptions = this.product.valueChanges.pipe(
    //   startWith(null),
    //   map((prd: string | null) => prd ? this._filter(prd) : this.productList.slice()));
  }

  ngOnInit() {
    this.keyUpProduct.debounceTime(300)
      .flatMap(key => {
        return Observable.of(key).delay(300);
      })
      .subscribe(res => {
        this.getListProduct(res);
        this.resetField(res);
      });
    this.getProducts();
    this.getCategories();


    this.formDetailVoucher = this.formBuilder.group({
      name: ['', Validators.required],
      voucherValue: [0, [Validators.required, Validators.min(1)]],
      jumlahVoucherPerConsumer: [0, [Validators.required, Validators.min(1)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      available_at: [null, Validators.required],
      expired_at: [null, Validators.required],
      limit_only: [''],
      limit_by_product: [false],
      limit_by_category: [false],
      limit_purchase: [false],
      product: [''],
      category: [''],
      minimumPurchase: [''],
      limit_only_purchase: [0],
      usage: this.formBuilder.array([], [Validators.required]),
    });

    this.formFilter = this.formBuilder.group({
      national: [''],
      zone: [''],
      region: [''],
      area: [''],
      salespoint: [''],
      district: [''],
      territory: ['']
    });

    this.getDetail();

    this.filteredProduct.next(this.listProduct.slice());

    // listen for search field value changes
    this.filterProduct.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterProductList();
      });



  }

  onDateChange(date: string, event: any) {
    const endDate = this.formDetailVoucher.get('endDate').value;
    const availableAt = this.formDetailVoucher.get('available_at').value;
    switch (date) {
      case 'startVoucher':
        this.endVoucher = event.value;
        this.useVoucher = event.value;
        break;
      case 'endVoucher':
        this.usedVoucher = availableAt && availableAt > event.value ? availableAt : event.value;
        break;
      case 'useVoucher':
        this.usedVoucher = endDate && event.value > endDate ? event.value : endDate;
        break;
    }
  }

  onUsageChange(event: any) {
    const usage: FormArray = this.formDetailVoucher.get('usage') as FormArray;
    if (event.checked) {
      usage.push(new FormControl(event.source.value));
    } else {
      usage.controls.forEach((item, index) => {
        if (item.value === event.source.value) {
          usage.removeAt(index);
          return;
        }
      })
    }
  }

  _filterSku(value): any[] {
    const filterValue = value && typeof value === 'object' ? value.name.toLowerCase() : (value ? value.toLowerCase() : '');
    return this.listProductSkuBank.filter(item => item.name.toLowerCase().includes(filterValue));
  }

  resetField(data?: any): void {
    const filteredItem = this.listProductSkuBank.filter(item => item.name.toLowerCase() === data.toLowerCase());

    if (filteredItem.length == 0) {
      // this.product = undefined;
    }
  }

  // private _filter(value: string): string[] {
  //   const filterValue = value.toLowerCase();

  //   return this.listProduct.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
  // }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if (value) {
      this.productList.push(value);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    // this.product.setValue(null);
  }

  remove(id: string): void {
    const index = this.productList.findIndex((prd: any) => prd.sku_id === id);

    if (index >= 0) {
      this.productList.splice(index, 1);
    }
  }

  selectedProduct(event: MatAutocompleteSelectedEvent): void {
    this.productList.push(event.option.viewValue);
    if (this.productInput) {
      this.productInput.nativeElement.value = '';
    }
    this.product.setValue(null);
  }

  getListProduct(param?: any): void {
    if (param) {
      const list = param.split(';').join(',').split(',');
      this.inputChipList = list.map((item: any) => {
        if (item.substr(0, 1) === ' ') { // remove space from first char
          item = item.substr(1, item.length);
        }
        if (item.substr(item.length - 1, item.length) === ' ') { // remove space from last char
          item = item.substr(0, item.length - 1);
        }
        return item;
      });
    }
    if (param.length >= 3) {
      this.b2cVoucherService.getProductList({ page: 'all', search: param, exclude_smoke: 1 }).subscribe(res => {
        this.listProductSkuBank = res.data ? res.data : [];
        this.filteredSkuOptions = this.product.valueChanges.pipe(startWith(null), map(value => this._filterSku(value)));
      });
    } else {
      this.listProductSkuBank = [];
      this.filteredSkuOptions = this.product.valueChanges.pipe(startWith(null), map(value => this._filterSku(value)));
    }
  }

  displayProductName(param?): any {
    return param ? param.name : param;
  }

  getProducts() {
    this.b2cVoucherService.getProductList({ page: 'all' }).subscribe(res => {
      this.listProduct = res.data ? res.data : [];
      this.filteredProduct.next(res.data ? res.data : []);
    })
  }

  getCategories() {
    this.productService.getListCategory(null, { exclude_smoke: 1 }).subscribe(res => {
      this.listCategories = res.data ? res.data.data : [];
    })
  }

  isChecked(type: any, event: any) {
    if (type === 'product') {
      this.formDetailVoucher.get('category').setValue('');
      this.formDetailVoucher.get('limit_by_category').setValue(false);
      this.formDetailVoucher.get('limit_only_purchase').setValue(0);
      if (event) {
        this.productList = [];
        this.product.setValue(null);
        // this.product.disable();
        this.listProductSkuBank = [];
        this.inputChipList = [];
        if (this.productInput) {
          this.productInput.nativeElement.value = null;
        }
      } else {
        this.product.enable();
      }
    } else {
      this.formDetailVoucher.get('limit_by_product').setValue(false);
      this.productList = [];
      this.product.setValue(null);
      // this.product.disable();
      this.listProductSkuBank = [];
      this.inputChipList = [];
      if (event) {
        this.formDetailVoucher.get('category').setValue('');
      }
      if (this.productInput) {
        this.productInput.nativeElement.value = null;
      }
    }
    if (this.formDetailVoucher.get('limit_by_product').value || this.formDetailVoucher.get('limit_by_category').value) {
      this.isLimitVoucher = true;
    } else {
      this.isLimitVoucher = false;
    }
  }

  isCheckedPembelianMinimum(event: any) {
    if (event) {
      // this.formDetailVoucher.get('limit_purchase').setValue(false);
    }
  }

  setInitialValue() {
    this.filteredProduct
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredBanks are loaded initially
        // and after the mat-option elements are available
        this.singleSelect.compareWith = (a: any, b: any) => a && b && a.id === b.id;
      });
  }

  filterProductList() {
    if (!this.listProduct) {
      return;
    }
    // get the search keyword
    let search = this.filterProduct.value;
    if (!search) {
      this.filteredProduct.next(this.listProduct.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the listProduct
    this.filteredProduct.next(
      this.listProduct.filter(prd => prd.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getProductObj(obj: any) {
    let index = this.productList.findIndex(prd => prd.sku_id === obj.sku_id);
    if (index === -1) {
      this.productList.push(obj);
    }
    if (this.productInput) {
      this.productInput.nativeElement.value = null;
    }

    if (this.inputChipList && this.inputChipList.length > 0) {
      const itemClick = this.inputChipList.filter((item) => {
        return item.toLowerCase().search(obj.name.toLowerCase());
      });

      if (itemClick && itemClick.length > 0) {
        if (itemClick.length === 1 && itemClick[0] !== obj.name && itemClick[0].length < 6) {
          /**
           * jika pencarian produk kurang dari 6 char pencarian tidak akan dilanjutkan
           */
          this.listProductSkuBank = [];
        } else {
          this.product.setValue(itemClick.toString());
          if (this.productInput) {
            this.productInput.nativeElement.value = itemClick.toString();
          }
          this.getListProduct(itemClick.toString());
        }
      } else {
        this.product.setValue(null);
        if (this.productInput) {
          this.productInput.nativeElement.value = null;
        }
        this.listProductSkuBank = [];
      }
      setTimeout(() => {
        if (this.productInput) {
          this.productInput.nativeElement.blur();
          this.productInput.nativeElement.focus();
        }
      }, 500);
    }
  }

  getDetail() {
    this.dataService.showLoading(true);
    this.b2cVoucherService.getDetailVoucher({ voucher_id: this.voucherDetailID }).subscribe(res => {
      this.dataService.setToStorage('detail_voucher_b2c', res.data);
      this.detailVoucher = res.data;
      this.formDetailVoucher.patchValue({
        name: res.data.name,
        voucherValue: res.data.nominal || 0,
        jumlahVoucherPerConsumer: res.data.limit_per_user || 0,
        startDate: res.data.start_date,
        endDate: res.data.end_date,
        available_at: res.data.available_at,
        expired_at: res.data.expired_at,
        limit_by_product: res.data.limit_by === 'product',
        limit_by_category: res.data.limit_by === 'category',
        limit_only: res.data.limit_only,
        limit_purchase: res.data.limit_purchase ? true : false,
        product: res.data.limit_by === 'product' ? res.data.limit_only : '',
        category: res.data.limit_by === 'category' ? res.data.limit_only.map(dt => Number(dt)) : '',
        minimumPurchase: res.data.limit_purchase ? res.data.limit_purchase : 0,
        limit_only_purchase: res.data.limit_only_purchase || 0,
        usage: [],
      });
      if (res.data.usage.length) {
        const usage: FormArray = this.formDetailVoucher.get('usage') as FormArray;
        while (usage.length) usage.removeAt(0);
        res.data.usage.forEach((item: string) => {
          usage.push(new FormControl(item));
        });
      }
      const endVoucher = moment(res.data.end_date).format('YYYY-MM-DD');
      const useVoucher = moment(res.data.available_at).format('YYYY-MM-DD');
      this.usedVoucher = useVoucher > endVoucher ? useVoucher : endVoucher;
      this.isLimitVoucher = res.data.limit_by ? true : false;
      this.productList = res && res.data && res.data.limit_only_data ? res.data.limit_only_data : [];
      this.getRetailerSelected();
      this.getCustomerSelected();
      if (!res.data.is_enable_detail_voucher) {
        this.setDisable();
      }
      if (res.data.is_enable_panel_retailer) {
        setTimeout(() => {
          if (this.dataService.getFromStorage('isb2ccrt')) {
            this.setSelectedTab(1);
            this.dataService.setToStorage('isb2ccrt', null);
          }
        }, 1000);
      }
      this.dataService.showLoading(false);
    }, err => {
      console.warn(err);
      this.dataService.showLoading(false);
      if (this.isDetail) {
        this.setDisable();
      }
    });
  }

  setDisable() {
    this.formDetailVoucher.get('name').disable();
    this.formDetailVoucher.get('voucherValue').disable();
    this.formDetailVoucher.get('jumlahVoucherPerConsumer').disable();
    this.formDetailVoucher.get('startDate').disable();
    this.formDetailVoucher.get('endDate').disable();
    this.formDetailVoucher.get('available_at').disable();
    this.formDetailVoucher.get('expired_at').disable();
    this.formDetailVoucher.get('limit_by_product').disable();
    this.formDetailVoucher.get('limit_by_category').disable();
    this.formDetailVoucher.get('limit_purchase').disable();
    this.formDetailVoucher.get('minimumPurchase').disable();
    this.formDetailVoucher.get('usage').disable();
    this.removable = false;
    this.product.disable();
  }

  onRefresh() {
    this.getDetail();
    this.scrollToTop();
  }

  createFormProduct() {
    return this.formBuilder.group({
      product: ['']
    })
  }

  onSaveDetail() {
    if (this.formDetailVoucher.valid) {
      const body = {
        name: this.formDetailVoucher.get('name').value,
        nominal: this.formDetailVoucher.get('voucherValue').value,
        limit_per_user: this.formDetailVoucher.get('jumlahVoucherPerConsumer').value,
        start_date: moment(this.formDetailVoucher.get('startDate').value).format('YYYY-MM-DD'),
        end_date: moment(this.formDetailVoucher.get('endDate').value).format('YYYY-MM-DD'),
        available_at: moment(this.formDetailVoucher.get('available_at').value).format('YYYY-MM-DD'),
        expired_at: moment(this.formDetailVoucher.get('expired_at').value).format('YYYY-MM-DD'),
        limit_by: this.formDetailVoucher.get('limit_by_product').value ? 'product' :
          this.formDetailVoucher.get('limit_by_category').value ? 'category' : null,
        limit_purchase: this.formDetailVoucher.get('limit_purchase').value ? this.formDetailVoucher.get('minimumPurchase').value : null,
        limit_only_purchase: this.formDetailVoucher.get('limit_only_purchase').value,
        usage: this.formDetailVoucher.get('usage').value,
      };

      if (body['limit_by'] !== null) {
        body['limit_only'] = body['limit_by'] === 'product' ?
          this.productList.map(prd => prd.sku_id) : this.formDetailVoucher.get('category').value;
      }

      if (this.formDetailVoucher.get('limit_by_product').value === false && this.formDetailVoucher.get('limit_by_category').value === false) {
        delete body['limit_by'];
        delete body['limit_only'];
      }

      if (body['limit_by'] === 'product' && body['limit_only'].length && !body['limit_only_purchase']) {
        alert('Batasan Pembelian Minimum berdasarkan Produk harus diisi');
        return;
      }

      this.dataService.showLoading(true);
      this.b2cVoucherService.updateVoucher({ voucher_id: this.detailVoucher.id }, body).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: 'Data berhasil disimpan!' });
        // this.router.navigate(['b2c-voucher']);
        this.setSelectedTab(1);
        this.onRefresh();
      }, err => {
        this.dataService.showLoading(false);
      });
    } else {
      commonFormValidator.validateAllFields(this.formDetailVoucher);
      try {
        this.myScrollContainer.nativeElement.scrollTop = 0;
      } catch (err) {
        console.error('Scrolling Error', err);
      }
    }
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }
    return '';
  }

  onChangeVoucherAutomation(event: any) {
    if (event.checked) {
      this.formDetailVoucher.get('jumlahVoucherPerConsumer').setValue(1);
      this.formDetailVoucher.get('jumlahVoucherPerConsumer').disable();
    } else {
      this.formDetailVoucher.get('jumlahVoucherPerConsumer').enable();
    }
  }

  getRetailerSelected() {
    this.b2cVoucherService.getSelectedRetailerPanel({ voucher_id: this.detailVoucher.id }).subscribe(res => {
      if (this.detailVoucher.is_target_audience_retailer === 1) {
        this.detailVoucher = {
          ...this.detailVoucher,
          dataPanelRetailer: {
            selected: res.data.targeted_audiences.map(aud => ({
              ...aud,
              id: aud.business_id
            }))
          }
        };
      } else {
        this.detailVoucher = {
          ...this.detailVoucher,
          dataPanelRetailer: {
            area_id: res.data.areas.map(aud => aud.area_id)
          }
        };
      }
    });
  }

  getCustomerSelected() {
    this.b2cVoucherService.getSelectedCustomerPanel({ voucher_id: this.detailVoucher.id }).subscribe(res => {
      if (this.detailVoucher.is_target_audience_customer === 1) {
        this.detailVoucher = {
          ...this.detailVoucher,
          dataPanelCustomer: {
            selected: res.data.targeted_audiences.map(aud => ({
              ...aud,
              id: aud.user_id
            }))
          }
        };
      } else {
        this.detailVoucher = {
          ...this.detailVoucher,
          dataPanelCustomer: {
            area_id: res.data.areas.map(aud => aud.area_id)
          }
        }
      }
    });
  }

  scrollToTop() {
    try {
      this.myScrollContainer.nativeElement.scrollTop = 0;
    } catch (err) {
      console.error('Scrolling Error', err);
    }
  }

  setSelectedTab(tab: number) {
    this.selectedTab = tab;
  }

  onChangeTab(event: any) {
    this.selectedTab = event.index;
  }

}
