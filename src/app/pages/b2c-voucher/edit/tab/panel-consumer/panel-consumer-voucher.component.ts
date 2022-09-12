import { Component, OnInit, Input, EventEmitter, Output, ElementRef, ViewChild } from '@angular/core';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { startWith, map, takeUntil, take } from 'rxjs/operators';
import * as _ from 'underscore';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { BtoBVoucherService } from 'app/services/bto-bvoucher.service';
import { GeotreeService } from 'app/services/geotree.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DateAdapter, MatSelect, MatDialogConfig, MatDialog, MatAutocomplete, MatChipInputEvent, MatAutocompleteSelectedEvent } from '@angular/material';
import { BannerService } from 'app/services/inapp-marketing/banner.service';
import { B2CVoucherService } from 'app/services/b2c-voucher.service';
import { ImportAudienceDialogComponent } from '../import-audience-dialog/import-audience-dialog.component';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { ENTER, COMMA, SEMICOLON } from '@angular/cdk/keycodes';
import { ProductService } from 'app/services/sku-management/product.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-panel-consumer-voucher',
  templateUrl: './panel-consumer-voucher.component.html',
  styleUrls: ['./panel-consumer-voucher.component.scss']
})
export class PanelConsumerVoucherComponent implements OnInit {
  formFilter: FormGroup;
  onLoad: boolean;

  rows: any[] = [];
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  offsetPagination: any;
  allRowsSelected: boolean;
  // allRowsSelectedValid: boolean;

  isSelected: boolean;

  keyUp = new Subject<string>();
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
  totalData: number;
  wholesalerIds: any = [];
  isSort: boolean;
  detailVoucher: any;
  isDetail: Boolean;
  indexDelete: any;
  areaType: any[] = [];
  isArea: boolean;
  disableForm: boolean = false;

  isVoucherAutomation: FormControl = new FormControl(false);
  formConsumerGroup: FormGroup;

  keyUpProduct = new Subject<string>();
  listCategories: any[] = [];
  listProduct: any[] = [];
  filterProduct: FormControl = new FormControl('');
  public filteredProduct: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('singleSelect') singleSelect: MatSelect;

  product: FormControl = new FormControl('');
  listProductSkuBank: Array<any> = [];
  filteredSkuOptions: Observable<string[]>;
  productList: any[] = [];
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA, SEMICOLON];
  inputChipList = [];

  @ViewChild('productInput') productInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  private _onDestroy = new Subject<void>();

  typeArea: any[] = ['national', 'zone', 'region', 'area', 'salespoint', 'district', 'territory'];
  listSmoker: any[] = [{ name: 'Semua', value: 'all' }, { name: 'Perokok CC', value: 'cc' }, { name: 'Pengguna iQOS', value: 'rrp' }, { name: 'Bukan Perokok', value: 'non-smoker' }];
  listGender: any[] = [{ name: 'Semua', value: 'both' }, { name: 'Laki-laki', value: 'male' }, { name: 'Perempuan', value: 'female' }];
  listVA: any[] = [
    { name: 'Referral Code', value: 'referral' },
    { name: 'Verified Customer', value: 'verified' },
    { name: 'Referral and Verified', value: 'referral-and-verified' },
    { name: 'Referral or Verified', value: 'referral-or-verified' },
    { name: 'Pesan Antar', value: 'coo'},
    { name: 'Keping Langganan', value: 'loyalty'}
  ];

  _data: any = null;
  @Input()
  set data(data: any) {
    if (data) {
      this.detailVoucher = data;
      this.isVoucherAutomation.setValue(data.automation ? true : false);
      this.formConsumerGroup.get('allocationVoucher').setValue(data.allocation_voucher);
      this.formConsumerGroup.get('va').setValue(data.automation);
      this.formConsumerGroup.get('content_type').setValue(data.content_type === 'cc-rrp' ? ['cc', 'rrp'] : [data.content_type]);
      this.formConsumerGroup.get('age_consumer_from').setValue(data.age_from);
      this.formConsumerGroup.get('age_consumer_to').setValue(data.age_to);
      this.formConsumerGroup.get('gender').setValue(data.gender);
      this.formConsumerGroup.get('isTargetAudience').setValue(data.is_target_audience_customer === 1 ? true : false);
      if (data && data.dataPanelCustomer) {
        if (data.dataPanelCustomer.selected) {
          this.selected = data.dataPanelCustomer.selected;
        } else if (data.dataPanelCustomer.area_id) {
          this.isArea = true;
        }
      }
      if (data.automation === 'coo') {
        const auto = data.automation_indicators;
        this.formConsumerGroup.patchValue({
          limit_by_product: auto.limit_by === 'product',
          limit_by_category: auto.limit_by === 'category',
          limit_only: auto.limit_only,
          limit_purchase: auto.limit_purchase ? true : false,
          product: auto.limit_by === 'product' ? auto.limit_only : '',
          category: auto.limit_by === 'category' ? auto.limit_only.map(dt => Number(dt)) : '',
          minimumPurchase: auto.limit_purchase ? auto.limit_purchase : 0,
          is_subscription: auto.is_subscription,
          customer_indicator: auto.is_subscription !== null,
          operator: auto.operator,
        });
        this.productList = auto.limit_only_data ? auto.limit_only_data : [];
      }
    }
  }
  get data(): any { return this._data; }

  // tslint:disable-next-line:no-output-on-prefix
  @Output()
  onChangeVoucherAutomation: any;

  // tslint:disable-next-line:no-output-on-prefix
  @Output()
  onRefresh: any;

  @Output()
  scrollToTop: any;

  @Output()
  setSelectedTab: any;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private b2bVoucherService: BtoBVoucherService,
    private b2cVoucherService: B2CVoucherService,
    private productService: ProductService,
    private geotreeService: GeotreeService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private bannerService: BannerService,
    private adapter: DateAdapter<any>,
    private ls: LanguagesService
  ) {
    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[0].path === 'detail' ? true : false;
    });
    this.adapter.setLocale('id');
    this.selected = [];
    this.allRowsSelected = false;
    this.isSelected = false;
    this.totalData = 0;
    this.isSort = false;
    this.onChangeVoucherAutomation = new EventEmitter<any>();
    this.onRefresh = new EventEmitter<any>();
    this.scrollToTop = new EventEmitter<any>();
    this.setSelectedTab = new EventEmitter<any>();
    this.onLoad = true;
    this.isArea = false;

    this.areaType = this.dataService.getDecryptedProfile()['area_type'];
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
    };

    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.getListConsumer(data);
      });
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

    this.formConsumerGroup = this.formBuilder.group({
      allocationVoucher: [0],
      content_type: [['all'], Validators.required],
      gender: ['both', Validators.required],
      age_consumer_from: ['', Validators.required],
      age_consumer_to: ['', Validators.required],
      isTargetAudience: [false],
      areas: this.formBuilder.array([]),
      va: [''],
      limit_only: [''],
      limit_by_product: [false],
      limit_by_category: [false],
      limit_purchase: [false],
      product: [''],
      category: [''],
      minimumPurchase: [''],
      customer_indicator: [false],
      is_subscription: [0],
      operator: [null],
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

    this.formConsumerGroup.controls['content_type'].valueChanges.debounceTime(50).subscribe(res => {
      if (res.includes('cc') || res.includes('rrp')) {
        this.formConsumerGroup.controls['age_consumer_from'].setValidators([Validators.required, Validators.min(18)]);
        this.formConsumerGroup.controls['age_consumer_to'].setValidators([Validators.required]);
      } else {
        this.formConsumerGroup.controls['age_consumer_from'].setValidators([Validators.required, Validators.min(0)]);
        this.formConsumerGroup.controls['age_consumer_to'].setValidators([Validators.required]);
      }
      this.formConsumerGroup.controls['age_consumer_from'].updateValueAndValidity();
      this.formConsumerGroup.controls['age_consumer_to'].updateValueAndValidity();
    });

    this.initAreaV2();

    this.formFilter.valueChanges.debounceTime(1000).subscribe(res => {
      this.getListConsumer();
    });

    this.formFilter.get('zone').valueChanges.subscribe(res => {
      if (res) {
        this.getAudienceAreaV2('region', res);
      }
    });
    this.formFilter.get('region').valueChanges.subscribe(res => {
      if (res) {
        this.getAudienceAreaV2('area', res);
      }
    });
    this.formFilter.get('area').valueChanges.subscribe(res => {
      if (res) {
        this.getAudienceAreaV2('salespoint', res);
      }
    });
    this.formFilter.get('salespoint').valueChanges.subscribe(res => {
      if (res) {
        this.getAudienceAreaV2('district', res);
      }
    });
    this.formFilter.get('district').valueChanges.subscribe(res => {
      if (res) {
        this.getAudienceAreaV2('territory', res);
      }
    });

    // this.addArea();
    this.getDetail();

    this.formConsumerGroup.get('isTargetAudience').valueChanges.debounceTime(500).subscribe(res => {
      if (res) {
        this.initAreaV2();
        this.getCustomerSelected();
      }
    });

    this.formConsumerGroup.get("va").valueChanges.subscribe(res => {
      if (res === "loyalty") {
        this.updateValidator("content_type", false);
        this.updateValidator("age_consumer_from", false);
        this.updateValidator("age_consumer_to", false);
        this.updateValidator("gender", false);
      } else {
        this.updateValidator("content_type", true);
        this.updateValidator("age_consumer_from", true);
        this.updateValidator("age_consumer_to", true);
        this.updateValidator("gender", true);
      }
    })
  }

  updateValidator(name: string, isRequired: boolean) {
    if (isRequired) this.formConsumerGroup.get(name).setValidators(Validators.required);
    else this.formConsumerGroup.get(name).clearValidators();
    this.formConsumerGroup.get(name).updateValueAndValidity();
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
      this.formConsumerGroup.get('category').setValue('');
      this.formConsumerGroup.get('limit_by_category').setValue(false);
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
      this.formConsumerGroup.get('limit_by_product').setValue(false);
      this.productList = [];
      this.product.setValue(null);
      // this.product.disable();
      this.listProductSkuBank = [];
      this.inputChipList = [];
      if (event) {
        this.formConsumerGroup.get('category').setValue('');
      }
      if (this.productInput) {
        this.productInput.nativeElement.value = null;
      }
    }
  }

  isCheckedPembelianMinimum(event: any) {
    if (event) {
      // this.formDetailVoucher.get('limit_purchase').setValue(false);
    }
  }

  isCheckedCustomer(event: any) {
    if (event.checked) {
      this.formConsumerGroup.get('operator').setValue('and');
    } else {
      this.formConsumerGroup.get('operator').setValue(null);
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

  async getDetail() {
    this.detailVoucher = this.dataService.getFromStorage('detail_voucher_b2c');
    if (this.detailVoucher) {
      this.formConsumerGroup.get('content_type').setValue(this.detailVoucher.content_type === 'cc-rrp' ? ['cc', 'rrp'] : [this.detailVoucher.content_type]);
      this.formConsumerGroup.get('age_consumer_from').setValue(this.detailVoucher.age_from);
      this.formConsumerGroup.get('age_consumer_to').setValue(this.detailVoucher.age_to);
      this.formConsumerGroup.get('gender').setValue(this.detailVoucher.gender);

      if (!this.formConsumerGroup.get('isTargetAudience').value) {
        if (this.detailVoucher.area_customer && this.detailVoucher.area_customer.length > 0) {
          if (this.detailVoucher.is_enable_panel_customer) {
            this.onLoad = true;
            try {
            this.detailVoucher.area_customer.map(async(val, index) => {
              const response = await this.bannerService.getParentArea({ parent: val.area_id }).toPromise();
              const wilayah = this.formConsumerGroup.controls['areas'] as FormArray;

              wilayah.push(this.formBuilder.group({
                national: [this.getAreaById(response, 'national'), Validators.required],
                zone: [this.getAreaById(response, 'division')],
                region: [this.getAreaById(response, 'region')],
                area: [this.getAreaById(response, 'area')],
                salespoint: [this.getAreaById(response, 'salespoint')],
                district: [this.getAreaById(response, 'district')],
                territory: [this.getAreaById(response, 'teritory')],
                list_national: this.formBuilder.array(this.listLevelArea),
                list_zone: this.formBuilder.array([]),
                list_region: this.formBuilder.array([]),
                list_area: this.formBuilder.array([]),
                list_salespoint: this.formBuilder.array([]),
                list_district: this.formBuilder.array([]),
                list_territory: this.formBuilder.array([])
              }));

              this.initArea(index);
              await this.initFormGroup(response, index);

              if (this.detailVoucher.area_customer.length === (index + 1)) {
                this.onLoad = false;
              }
            });
            } catch(ex) {
              this.onLoad = false;
            } 
          } else {
            this.onLoad = true;
            try {
            this.detailVoucher.area_customer.map(async(val, index) => {
              const response = await this.bannerService.getParentArea({ parent: val.area_id }).toPromise();
              const wilayah = this.formConsumerGroup.controls['areas'] as FormArray;

              wilayah.push(this.formBuilder.group({
                national: [this.getAreaByName(response, 'national'), Validators.required],
                zone: [this.getAreaByName(response, 'division')],
                region: [this.getAreaByName(response, 'region')],
                area: [this.getAreaByName(response, 'area')],
                salespoint: [this.getAreaByName(response, 'salespoint')],
                district: [this.getAreaByName(response, 'district')],
                territory: [this.getAreaByName(response, 'teritory')],
                list_national: this.formBuilder.array(this.listLevelArea),
                list_zone: this.formBuilder.array([]),
                list_region: this.formBuilder.array([]),
                list_area: this.formBuilder.array([]),
                list_salespoint: this.formBuilder.array([]),
                list_district: this.formBuilder.array([]),
                list_territory: this.formBuilder.array([])
              }));

              this.initArea(index);
              await this.initFormGroup(response, index);

              if (this.detailVoucher.area_customer.length === (index + 1)) {
                this.onLoad = false;
              }
            });
            } catch(ex) {
              this.onLoad = false;
            } 
          }
        } else {
          this.addArea();
          this.onLoad = false;
        }
      } else {
        this.onLoad = false;
      }
      // disable form
      if(this.detailVoucher.status !== 'draft' && this.detailVoucher.status !== 'draft_saved' && this.detailVoucher.status !== 'reject') {
        this.formConsumerGroup.disable();
        this.formFilter.disable();
        this.disableForm = true;
      };
    } else {
      setTimeout(() => {
        this.getDetail();
      }, 1000);
    }
  }

  isChangeVoucherAutomation(event: any) {
    this.onChangeVoucherAutomation.emit({ checked: event.checked });
  }

  isChangeTargetAudience(event: any) {
    if (event.checked) {
    }
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  selectFn(allRowsSelected: boolean) {
    this.allRowsSelected = allRowsSelected;
    if (!allRowsSelected) { this.selected = [];
    } else { this.selected.length = this.totalData; }
  }

  getId(row) {
    return row.id;
  }

  getAudienceAreaV2(selection, id, event?) {
    let item: any;
    const fd = new FormData();
    const lastLevel = this.geotreeService.getBeforeLevel(this.parseArea(selection));
    let areaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) =>
    ({ key, value })).filter(item_ => item_.key === this.parseArea(lastLevel));
    if (areaSelected && areaSelected[0] && areaSelected[0].key === 'national') {
      fd.append('area_id[]', areaSelected[0].value);
    } else if (areaSelected.length > 0) {
      if (areaSelected[0].value !== '') {
        areaSelected[0].value.map(ar => {
          fd.append('area_id[]', ar);
        });
        if (areaSelected[0].value.length === 0) {
          const beforeLevel = this.geotreeService.getBeforeLevel(areaSelected[0].key);
          const newAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) =>
          ({ key, value })).filter(item_ => item_.key === this.parseArea(beforeLevel));
          if (newAreaSelected[0].key !== 'national') {
            newAreaSelected[0].value.map(ar => {
              fd.append('area_id[]', ar);
            });
          } else {
            fd.append('area_id[]', newAreaSelected[0].value);
          }
        }
      }
    } else {
      const beforeLastLevel = this.geotreeService.getBeforeLevel(lastLevel);
      areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) =>
      ({ key, value })).filter(item_ => item_.key === this.parseArea(beforeLastLevel));
      if (areaSelected && areaSelected[0] && areaSelected[0].key === 'national') {
        fd.append('area_id[]', areaSelected[0].value);
      } else if (areaSelected.length > 0) {
        if (areaSelected[0].value !== '') {
          areaSelected[0].value.map(ar => {
            fd.append('area_id[]', ar);
          });
          if (areaSelected[0].value.length === 0) {
            const beforeLevel = this.geotreeService.getBeforeLevel(areaSelected[0].key);
            const newAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) =>
            ({ key, value })).filter(item_ => item_.key === this.parseArea(beforeLevel));
            if (newAreaSelected[0].key !== 'national') {
              newAreaSelected[0].value.map(ar => {
                fd.append('area_id[]', ar);
              });
            } else {
              fd.append('area_id[]', newAreaSelected[0].value);
            }
          }
        }
      }
    }

    fd.append('area_type', selection === 'territory' ? 'teritory' : selection);
    let thisAreaOnSet = [];
    let areaNumber = 0;
    let expectedArea = [];
    if (!this.formFilter.get(this.parseArea(selection)).disabled) {
      thisAreaOnSet = this.areaFromLogin[0] ? this.areaFromLogin[0] : [];
      if (this.areaFromLogin[1]) {
        thisAreaOnSet = [
          ...thisAreaOnSet,
          ...this.areaFromLogin[1]
        ];
    }

      thisAreaOnSet = thisAreaOnSet.filter(ar => (ar.level_desc === 'teritory' ? 'territory' : ar.level_desc) === selection);
      if (id && id.length > 1) {
        areaNumber = 1;
      }

      if (areaSelected && areaSelected[0] && areaSelected[0].key !== 'national') {
        expectedArea = thisAreaOnSet.filter(ar => areaSelected[0].value.includes(ar.parent_id));
      }
    }


    switch (this.parseArea(selection)) {
      case 'zone':
        this.geotreeService.getChildFilterArea(fd).subscribe(res => {
          this.list[this.parseArea(selection)] = expectedArea.length > 0 ? res.data.filter(dt =>
            expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
        });

        this.formFilter.get('region').setValue('');
        this.formFilter.get('area').setValue('');
        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['region'] = [];
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'region':
        if (id && id.length !== 0) {
          item = this.list['zone'].length > 0 ? this.list['zone'].filter(() => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt =>
                expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list['region'] = [];
        }
        this.formFilter.get('region').setValue('');
        this.formFilter.get('area').setValue('');
        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'area':
        if (id && id.length !== 0) {
          item = this.list['region'].length > 0 ? this.list['region'].filter(() => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt =>
                expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list['area'] = [];
        }

        this.formFilter.get('area').setValue('');
        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'salespoint':
        if (id && id.length !== 0) {
          item = this.list['area'].length > 0 ? this.list['area'].filter(() => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt =>
                expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list['salespoint'] = [];
        }

        this.formFilter.get('salespoint').setValue('');
        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'district':
        if (id && id.length !== 0) {
          item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(() => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt =>
                expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list['district'] = [];
        }

        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['territory'] = [];
        break;
      case 'territory':
        if (id && id.length !== 0) {
          item = this.list['district'].length > 0 ? this.list['district'].filter(() => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt =>
                expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
            });
          } else {
            this.list[selection] = [];
          }
        } else {
          this.list['territory'] = [];
        }

        this.formFilter.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  parseArea(type) {
    // return type === 'division' ? 'zone' : type;
    switch (type) {
      case 'division':
        return 'zone';
      case 'teritory':
      case 'territory':
        return 'territory';
      default:
        return type;
    }
  }

  getListConsumer(string?: any) {
    try {
      this.dataService.showLoading(true);
      this.pagination.per_page = 25;
      if (string) { this.pagination.search = string;
      } else { delete this.pagination.search; }
      const areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter((item: any) =>
      item.value !== null && item.value !== '' && item.value.length !== 0);
      const area_id = areaSelected[areaSelected.length - 1].value;
      const areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
      this.pagination.area = area_id;

      if (this.areaFromLogin[0].length === 1 && this.areaFromLogin[0][0].type === 'national' && this.pagination.area !== 1) {
        this.pagination['after_level'] = true;
      } else {
        const lastSelectedArea: any = areaSelected[areaSelected.length - 1];
        const indexAreaAfterEndLevel = areaList.indexOf(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
        const indexAreaSelected = areaList.indexOf(lastSelectedArea.key);
        let is_area_2 = false;

        let self_area = this.areaFromLogin[0] ? this.areaFromLogin[0].map(area_1 => area_1.id) : [];
        let last_self_area = [];
        if (self_area.length > 0) {
          last_self_area.push(self_area[self_area.length - 1]);
        }

        if (this.areaFromLogin[1]) {
          const second_areas = this.areaFromLogin[1];
          last_self_area = [
            ...last_self_area,
            second_areas[second_areas.length - 1].id
          ];
          self_area = [
            ...self_area,
            ...second_areas.map(area_2 => area_2.id).filter(area_2 => self_area.indexOf(area_2) === -1)
          ];
        }

        const newLastSelfArea = this.checkAreaLocation(areaSelected[areaSelected.length - 1], last_self_area);

        if (this.pagination['after_level']) { delete this.pagination['after_level']; }
        this.pagination['self_area'] = self_area;
        this.pagination['last_self_area'] = last_self_area;
        let levelCovered = [];
        if (this.areaFromLogin[0]) { levelCovered = this.areaFromLogin[0].map(level => this.parseArea(level.type)); }
        if (lastSelectedArea.value.length === 1 && this.areaFromLogin.length > 1) {
          const oneAreaSelected = lastSelectedArea.value[0];
          const findOnFirstArea = this.areaFromLogin[0].find(are => are.id === oneAreaSelected);
          if (findOnFirstArea) { is_area_2 = false;
          } else { is_area_2 = true; }

          if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
            if (is_area_2) { this.pagination['last_self_area'] = [last_self_area[1]];
            } else { this.pagination['last_self_area'] = [last_self_area[0]]; }
          } else {
            this.pagination['after_level'] = true;
            this.pagination['last_self_area'] = newLastSelfArea;
          }
        } else if (indexAreaSelected >= indexAreaAfterEndLevel) {
          this.pagination['after_level'] = true;
          if (newLastSelfArea.length > 0) {
            this.pagination['last_self_area'] = newLastSelfArea;
          }
        }
      }
      this.loadingIndicator = true;

      this.b2cVoucherService.getAudienceCustomer(this.pagination).subscribe(res => {
          Page.renderPagination(this.pagination, res);
          this.totalData = res.total;
          this.rows = res.data;
          this.loadingIndicator = false;
          this.isSort = false;
          this.dataService.showLoading(false);
      }, err => {
        console.warn(err);
        this.dialogService.openSnackBar({ message: 'Terjadi Kesalahan Pencarian' }); // TODO
        this.loadingIndicator = false;
        this.dataService.showLoading(false);
      });
    } catch (ex) {
      console.warn('ex', ex);
      this.dataService.showLoading(false);
    }
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;
    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage('page', pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage('page');
    }

    this.getListConsumer();
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage('page', this.pagination.page);
    this.dataService.setToStorage('sort', event.column.prop);
    this.dataService.setToStorage('sort_type', event.newValue);
    this.isSort = true;

    this.getListConsumer();
  }

  checkAreaLocation(area, lastSelfArea) {
    const lastLevelFromLogin = this.parseArea(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
    const areaList = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
    const areaAfterEndLevel = this.geotreeService.getNextLevel(lastLevelFromLogin);
    const indexAreaAfterEndLevel = areaList.indexOf(areaAfterEndLevel);
    const indexAreaSelected = areaList.indexOf(area.key);
    const rawValues = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value }));
    let newLastSelfArea = [];
    if (area.value !== 1) {
      if (indexAreaSelected >= indexAreaAfterEndLevel) {
        const areaSelectedOnRawValues: any = rawValues.find(raw => raw.key === areaAfterEndLevel);
        newLastSelfArea = this.list[areaAfterEndLevel].filter(ar =>
          areaSelectedOnRawValues.value.includes(ar.id)).map(ar => ar.parent_id).filter((v, i, a) => a.indexOf(v) === i);
      }
    }

    return newLastSelfArea;
  }

  filteringGeotree(areaList) {
    return areaList;
  }


  initAreaV2() {
    const areas = this.dataService.getDecryptedProfile()['areas'] || [];
    this.geotreeService.getFilter2Geotree(areas);
    const sameArea = this.geotreeService.diffLevelStarted;
    const areasDisabled = this.geotreeService.disableArea(sameArea);
    this.lastLevel = areasDisabled;
    let lastLevelDisabled = null;
    const levelAreas = ['national', 'division', 'region', 'area', 'salespoint', 'district', 'territory'];
    const lastDiffLevelIndex = levelAreas.findIndex(level => level === (sameArea.type === 'teritory' ? 'territory' : sameArea.type));

    if (!this.formFilter.get('national') || this.formFilter.get('national').value === '') {
      this.formFilter.get('national').setValue(1);
      this.formFilter.get('national').disable();
      lastLevelDisabled = 'national';
    }
    areas.map((area, index) => {
      area.map((level, i) => {
        const level_desc = level.level_desc;
        const levelIndex = levelAreas.findIndex(lvl => lvl === level.type);
        if (lastDiffLevelIndex > levelIndex - 2) {
          if (!this.list[level.type]) { this.list[level.type] = []; }
          if (!this.formFilter.controls[this.parseArea(level.type)] || !this.formFilter.controls[this.parseArea(level.type)].value ||
          this.formFilter.controls[this.parseArea(level.type)].value === '') {
            this.formFilter.controls[this.parseArea(level.type)].setValue([level.id]);
            if (sameArea.level_desc === level.type) {
              lastLevelDisabled = level.type;

              this.formFilter.get(this.parseArea(level.type)).disable();
            }

            if (areasDisabled.indexOf(level.type) > -1) { this.formFilter.get(this.parseArea(level.type)).disable(); }
          }
          const isExist = this.list[this.parseArea(level.type)].find(ls => ls.id === level.id);
          level['area_type'] = `area_${index + 1}`;
          this.list[this.parseArea(level.type)] = isExist ? [...this.list[this.parseArea(level.type)]] : [
            ...this.list[this.parseArea(level.type)],
            level
          ];
          if (!this.formFilter.controls[this.parseArea(level.type)].disabled) {
            this.getAudienceAreaV2(this.geotreeService.getNextLevel(this.parseArea(level.type)), level.id);
          }

          if (i === area.length - 1) {
            this.endArea = this.parseArea(level.type);
            this.getAudienceAreaV2(this.geotreeService.getNextLevel(this.parseArea(level.type)), level.id);
          }
        }
      });
    });
  }

  getCustomerSelected() {
    if (this.detailVoucher.is_target_audience_customer === 1 ) {
      this.b2cVoucherService.getSelectedCustomerPanel({ voucher_id: this.detailVoucher.id }).subscribe(res => {
          this.selected = res.data.targeted_audiences.map(aud => ({
            ...aud,
            id: aud.user_id
          }))
      });
    } else {
      // this.geotreeService.getFilter2Geotree(res.data.areas.area_id);
    }
  }

  isLoyaltySelected() {
    return this.isVoucherAutomation.value &&
      this.formConsumerGroup.get('va').value === 'loyalty';
  }

  onSave() {
    if (this.formConsumerGroup.valid || this.formConsumerGroup.get('isTargetAudience').value) {
      let body = null;
      const bodyArea = {
        'type': 'customer',
        'is_target_audience': this.formConsumerGroup.get('isTargetAudience').value ? 1 : 0,
        'user_id': this.selected.map(aud => aud.id),
        'area_id': [1],
        'automation': this.formConsumerGroup.get('va').value,
        'content_type': this.formConsumerGroup.get('content_type').value.includes('cc') && this.formConsumerGroup.get('content_type').value.includes('rrp') ? 'cc-rrp' : this.formConsumerGroup.get('content_type').value[0],
        'age_from': this.formConsumerGroup.get('age_consumer_from').value,
        'age_to': this.formConsumerGroup.get('age_consumer_to').value,
        'gender': this.formConsumerGroup.get('gender').value,
        'allocation_voucher': this.formConsumerGroup.get('allocationVoucher').value
      };
      if (this.formConsumerGroup.get('isTargetAudience').value) {
        body = {
          'type': 'customer',
          'is_target_audience': this.formConsumerGroup.get('isTargetAudience').value ? 1 : 0,
          'user_id': this.selected.map(aud => aud.id),
        };
      } else {
        if (this.isVoucherAutomation.value) {
          if (!this.formConsumerGroup.get('allocationVoucher').value || this.formConsumerGroup.get('allocationVoucher').value < 1) {
            commonFormValidator.validateAllFields(this.formConsumerGroup);
            this.scrollToTop.emit();
            alert('Jumlah Alokasi Voucher harus diisi');
            return;
          }
          if (!this.formConsumerGroup.get('va').value) {
            commonFormValidator.validateAllFields(this.formConsumerGroup);
            this.scrollToTop.emit();
            return;
          }
          if (this.formConsumerGroup.get('va').value === 'coo') {
            const indicators: any = {
              operator: this.formConsumerGroup.get('operator').value,
              limit_purchase: this.formConsumerGroup.get('limit_purchase').value ? this.formConsumerGroup.get('minimumPurchase').value : null,
              is_subscription: this.formConsumerGroup.get('customer_indicator').value ? this.formConsumerGroup.get('is_subscription').value ? 1 : 0 : null,
              limit_by: this.formConsumerGroup.get('limit_by_product').value ? 'product' :
              this.formConsumerGroup.get('limit_by_category').value ? 'category' : null,
              limit_only: []
            };
            if (indicators['limit_by'] !== null) {
              indicators['limit_only'] = indicators['limit_by'] === 'product' ?
                this.productList.map(prd => prd.sku_id) : this.formConsumerGroup.get('category').value;
            }
            bodyArea['automation_indicators'] = indicators;
          }
        }
      }

      let _areas = [];
      let areas = [];
      let value = this.formConsumerGroup.getRawValue();

      value.areas.map(item => {
        let obj = Object.entries(item).map(([key, value]) => ({ key, value }))
        for (const val of this.typeArea) {
          const filteredValue = obj.filter(xyz => val === xyz.key && xyz.value);
          if (filteredValue.length > 0) _areas.push(...filteredValue)
        }

        areas.push(_.last(_areas));
        _areas = [];
      })

      let same = this.findDuplicate(areas.map(item => item.value));
      if (same.length > 0) {
        return this.dialogService.openSnackBar({ message: "Terdapat duplikat sales tree, mohon periksa kembali data anda!" }); // TODO
      }

      bodyArea['area_id'] = [];
      areas.map(item => {
        bodyArea['area_id'].push(item.value);
      });

      if (
        this.isVoucherAutomation.value &&
        this.formConsumerGroup.get('va').value === 'loyalty'
      ) {
        const allowedFields = ['type', 'is_target_audience', 'automation', 'allocation_voucher'];
        for (let field in bodyArea) {
          if (!allowedFields.includes(field)) delete bodyArea[field];
        }
      }

      this.dataService.showLoading(true);
      this.b2cVoucherService.updatePanel({ voucher_id: this.detailVoucher.id }, body ? body : bodyArea).subscribe(res => {
        // this.router.navigate(['b2c-voucher']);
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
        this.onRefresh.emit();
        this.setSelectedTab.emit(3);
        setTimeout(() => {
          this.getIsArea();
        }, 1000);
      }, err => {
        this.dataService.showLoading(false);
      });
    } else {
      commonFormValidator.validateAllFields(this.formConsumerGroup);
      this.scrollToTop.emit();
    }
  }

  getIsArea() {
    if (this.detailVoucher) {
      if (!this.detailVoucher.is_enable_panel_customer) {
        if (this.isArea) {
          const formArray = this.formConsumerGroup.controls['areas'] as FormArray;
          while (formArray.length !== 0) {
            formArray.removeAt(0);
          }
          this.getDetail();
        }
      } else {
        setTimeout(() => {
          this.getIsArea();
        }, 2000);
      }
    }
  }

  async exportCustomer() {
    if (this.selected.length === 0) {
      this.dialogService.openSnackBar({ message: 'Pilih audience untuk di export!' }); // TODO
      return;
    }
    this.dataService.showLoading(true);
    const body = this.selected.map(aud => aud.id);
    try {
      const response = await this.b2cVoucherService.exportAudienceCustomer({ selected: body, audience: 'customer' }).toPromise();
      this.downLoadFile(response, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      `B2CVoucher_Panel_Customer_${new Date().toLocaleString()}.xls`);
      this.dataService.showLoading(false);
    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
    }
  }

  downLoadFile(data: any, type: string, fileName: string) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    const newBlob = new Blob([data], { type: type });

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(newBlob);
      return;
    }

    // For other browsers:
    // Create a link pointing to the ObjectURL containing the blob.
    const url = window.URL.createObjectURL(newBlob);

    const link = document.createElement('a');
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
    console.warn('err', error);

    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.warn(error);
    // alert('Open console to see the error')
  }

  importCustomer(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { audience: 'customer'};

    this.dialogRef = this.dialog.open(ImportAudienceDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.onSelect({ selected: response });
        if (response.data) {
          this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text8 }); // TODO
        }
      }
    });
  }

  createArea(): FormGroup {
    return this.formBuilder.group({
      national: [1, Validators.required],
      zone: [''],
      salespoint: [''],
      region: [''],
      area: [''],
      district: [''],
      territory: [''],
      list_national: this.formBuilder.array(this.listLevelArea),
      list_zone: this.formBuilder.array([]),
      list_region: this.formBuilder.array([]),
      list_area: this.formBuilder.array([]),
      list_salespoint: this.formBuilder.array([]),
      list_district: this.formBuilder.array([]),
      list_territory: this.formBuilder.array([])
    });
  }

  addArea() {
    const wilayah = this.formConsumerGroup.controls['areas'] as FormArray;
    wilayah.push(this.createArea());
    const index = wilayah.length > 0 ? (wilayah.length - 1) : 0;
    this.initArea(index);
    this.generateList('zone', 1, index, 'render');
  }

  deleteArea(idx: number) {
    this.indexDelete = idx;
    const data = {
      titleDialog: 'Hapus Salestree', // TODO
      captionDialog: `Apakah anda yakin untuk menghapus Salestree ${idx + 1} ?`, // TODO
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ['Hapus', this.ls.locale.global.button.cancel] // TODO
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  initArea(index: number) {
    const wilayah = this.formConsumerGroup.controls['areas'] as FormArray;
    this.areaType.map(item => {
      switch (item.type.trim()) {
        case 'national':
          wilayah.at(index).get('national').disable();
          break;
        case 'division':
          wilayah.at(index).get('zone').disable();
          break;
        case 'region':
          wilayah.at(index).get('region').disable();
          break;
        case 'area':
          wilayah.at(index).get('area').disable();
          break;
        case 'salespoint':
          wilayah.at(index).get('salespoint').disable();
          break;
        case 'district':
          wilayah.at(index).get('district').disable();
          break;
        case 'territory':
          wilayah.at(index).get('territory').disable();
          break;
      }
    });
  }

  async generateList(selection: any, id: any, index: number, type: any) {
    let item: any;
    const wilayah = this.formConsumerGroup.controls['areas'] as FormArray;
    switch (selection) {
      case 'zone': {
        const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
        const list = wilayah.at(index).get(`list_${selection}`) as FormArray;

        while (list.length > 0) {
          list.removeAt(list.length - 1);
        }

        _.clone(response || []).map((item_: any) => {
          list.push(this.formBuilder.group({ ...item_, name: item_.name === 'all' ? 'Semua Zone' : item_.name }));
        });

        if (type !== 'render') {
          wilayah.at(index).get('region').setValue(null);
          wilayah.at(index).get('area').setValue('');
          wilayah.at(index).get('salespoint').setValue('');
          wilayah.at(index).get('district').setValue('');
          wilayah.at(index).get('territory').setValue('');

          this.clearFormArray(index, 'list_region');
          this.clearFormArray(index, 'list_area');
          this.clearFormArray(index, 'list_salespoint');
          this.clearFormArray(index, 'list_district');
          this.clearFormArray(index, 'list_territory');
        }
      }
        break;
      case 'region': {
        item = wilayah.at(index).get('list_zone').value.length > 0 ?
        wilayah.at(index).get('list_zone').value.filter((item_: any) => item_.id === id)[0] : {};
        if (item.name !== 'Semua Zone') {
          const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
          const list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item_ => {
            list.push(this.formBuilder.group({ ...item_, name: item_.name === 'all' ? 'Semua Regional' : item_.name }));
          });
        }

        if (type !== 'render') {
          wilayah.at(index).get('region').setValue('');
          wilayah.at(index).get('area').setValue('');
          wilayah.at(index).get('salespoint').setValue('');
          wilayah.at(index).get('district').setValue('');
          wilayah.at(index).get('territory').setValue('');

          if (item.name === 'Semua Zone') {
            this.clearFormArray(index, 'list_region');
          }
          this.clearFormArray(index, 'list_area');
          this.clearFormArray(index, 'list_salespoint');
          this.clearFormArray(index, 'list_district');
          this.clearFormArray(index, 'list_territory');
        }
      }
        break;
      case 'area': {
        item = wilayah.at(index).get('list_region').value.length > 0 ?
        wilayah.at(index).get('list_region').value.filter(item_ => item_.id === id)[0] : {};
        if (item.name !== 'Semua Regional') {
          const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
          const list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item_ => {
            list.push(this.formBuilder.group({ ...item_, name: item_.name === 'all' ? 'Semua Area' : item_.name }));
          });
        }

        if (type !== 'render') {
          wilayah.at(index).get('area').setValue('');
          wilayah.at(index).get('salespoint').setValue('');
          wilayah.at(index).get('district').setValue('');
          wilayah.at(index).get('territory').setValue('');

          if (item.name === 'Semua Regional') {
            this.clearFormArray(index, 'list_area');
          }
          this.clearFormArray(index, 'list_salespoint');
          this.clearFormArray(index, 'list_district');
          this.clearFormArray(index, 'list_territory');
        }
      }
        break;
      case 'salespoint': {
        item = wilayah.at(index).get('list_area').value.length > 0 ?
        wilayah.at(index).get('list_area').value.filter(item_ => item_.id === id)[0] : {};
        if (item.name !== 'Semua Area') {
          const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
          const list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item_ => {
            list.push(this.formBuilder.group({ ...item_, name: item_.name === 'all' ? 'Semua Salespoint' : item_.name }));
          });
        }

        if (type !== 'render') {
          wilayah.at(index).get('salespoint').setValue('');
          wilayah.at(index).get('district').setValue('');
          wilayah.at(index).get('territory').setValue('');

          if (item.name === 'Semua Area') {
            this.clearFormArray(index, 'list_salespoint');
          }
          this.clearFormArray(index, 'list_district');
          this.clearFormArray(index, 'list_territory');
        }
      }
        break;
      case 'district': {
        item = wilayah.at(index).get('list_salespoint').value.length > 0 ?
        wilayah.at(index).get('list_salespoint').value.filter(item_ => item_.id === id)[0] : {};
        if (item.name !== 'Semua Salespoint') {
          const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
          const list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item_ => {
            list.push(this.formBuilder.group({ ...item_, name: item_.name === 'all' ? 'Semua District' : item_.name }));
          });
        }

        if (type !== 'render') {
          wilayah.at(index).get('district').setValue('');
          wilayah.at(index).get('territory').setValue('');

          if (item.name === 'Semua Salespoint') {
            this.clearFormArray(index, 'list_district');
          }
          this.clearFormArray(index, 'list_territory');
        }
      }
        break;
      case 'territory': {
        item = wilayah.at(index).get('list_district').value.length > 0 ?
        wilayah.at(index).get('list_district').value.filter(item_ => item_.id === id)[0] : {};
        if (item.name !== 'Semua District') {
          const response = await this.bannerService.getListOtherChildren({ parent_id: id }).toPromise();
          const list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item_ => {
            list.push(this.formBuilder.group({ ...item_, name: item_.name === 'all' ? 'Semua Territory' : item_.name }));
          });
        }

        if (type !== 'render') {
          wilayah.at(index).get('territory').setValue('');

          if (item.name === 'Semua District') {
            this.clearFormArray(index, 'list_territory');
          }
        }
      }
        break;

      default:
        break;
    }
  }

  clearFormArray = (index: number, selection: any) => {
    const wilayah = this.formConsumerGroup.controls['areas'] as FormArray;
    const list = wilayah.at(index).get(selection) as FormArray;
    while (list.length > 0) {
      list.removeAt(list.length - 1);
    }
  }

  getAreaByName(response, selection) {
    return response.data.filter(item => item.level_desc === selection).map(item => item.name)[0]
  }

  getAreaById(response, selection) {
    return response.data.filter(item => item.level_desc === selection).map(item => item.id)[0]
  }

  findDuplicate(array) {
    var object = {};
    var result = [];

    array.forEach(function (item) {
      if (!object[item])
        object[item] = 0;
      object[item] += 1;
    })

    for (var prop in object) {
      if (object[prop] >= 2) {
        result.push(prop);
      }
    }

    return result;
  }


  async initFormGroup(response, index) {
    response.data.map(item => {
      let level_desc = '';
      switch (item.level_desc.trim()) {
        case 'national':
          level_desc = 'zone';
          break;
        case 'division':
          level_desc = 'region';
          break;
        case 'region':
          level_desc = 'area';
          break;
        case 'area':
          level_desc = 'salespoint';
          break;
        case 'salespoint':
          level_desc = 'district';
          break;
        case 'district':
          level_desc = 'territory';
          break;
      }
      this.generateList(level_desc, item.id, index, 'render');
    });
  }

  confirmDelete() {
    const wilayah = this.formConsumerGroup.controls['areas'] as FormArray;
    wilayah.removeAt(this.indexDelete);
    this.dialogService.brodcastCloseConfirmation();
  }

  getToolTipData(value: any, array: any) {
    // console.log('array', array)
    // if (value && array && array.length > 0) {
    //   const msg = array.filter((item: any) => item.id === value)[0]['name'];
    //   return msg;
    // } else {
      return '';
    // }
  }

  onChangeConsumer(event) {
    const target = event.source;
    let values = this.formConsumerGroup.getRawValue().content_type;
    if (event.checked) {
      const exception = ['all', 'non-smoker']
      if (exception.includes(target.name)) values.splice(0, values.length, target.name);
      else {
        if (values.find(item => exception.includes(item))) values.splice(0, values.length);
        values.push(target.name);
      };
    } else this.formConsumerGroup.get('content_type').setValue(values.splice(values.indexOf(target.name), 1));
    this.formConsumerGroup.get('content_type').setValue(values);
  }

}
