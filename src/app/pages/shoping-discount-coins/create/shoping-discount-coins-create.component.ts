import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { BtoBVoucherService } from 'app/services/bto-bvoucher.service';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { GeotreeService } from 'app/services/geotree.service';
import { GroupTradeProgramService } from 'app/services/dte/group-trade-program.service';
import { ProductService } from 'app/services/sku-management/product.service';
import { MatSelect, MatDialogConfig, MatDialog, MatAutocomplete, MatChipInputEvent, MatAutocompleteSelectedEvent } from '@angular/material';
import { takeUntil, take } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import moment from 'moment';
import { ImportPanelDialogComponent } from 'app/pages/b2-bvoucher/import-panel-dialog/import-panel-dialog.component';
import { startWith, map } from "rxjs/operators";
import { ENTER, COMMA, SEMICOLON } from '@angular/cdk/keycodes';
import { NullAstVisitor } from '@angular/compiler';
import { LanguagesService } from 'app/services/languages/languages.service';
import { ShopingDiscountCoinsService } from 'app/services/shoping-discount-coins.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-shoping-discount-coins-create',
  templateUrl: './shoping-discount-coins-create.component.html',
  styleUrls: ['./shoping-discount-coins-create.component.scss']
})
export class ShopingDiscountCoinsCreateComponent implements OnInit {
  isB2CVoucher: FormControl = new FormControl(false);
  isDetail: Boolean;
  isCreate: Boolean;
  isEdit: Boolean;
  actionType: string = 'detail';
  formShopingDiscountCoins: FormGroup;
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

  // groupTradePrograms: any[] = [];
  listCategories: any[] = [];
  listProduct: any[] = [];
  filterProduct: FormControl = new FormControl("");
  public filteredProduct: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('singleSelect') singleSelect: MatSelect;

  detailCoinDiscount: any;
  product: FormControl = new FormControl("");
  listProductSkuBank: Array<any> = [];
  filteredSkuOptions: Observable<string[]>;
  productList: any[] = [];
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA, SEMICOLON];
  inputChipList = [];
  voucherB2CList: any;
  opsiVoucherList = [
    { name: 'B2B Only', value: 'b2b' },
    { name: 'Katalog SRC Only', value: 'src-catalogue' },
    { name: 'B2B & Katalog SRC', value: 'both' },
  ]; // TODO
  keyUpProductSRCC = new Subject<string>();
  inputChipListSRCC = [];
  productSRCC: FormControl = new FormControl('');
  productListSRCC: any[] = [];
  listProductSRCC: any[] = [];
  listProductSkuBankSRCC: Array<any> = [];
  filteredSkuOptionsSRCC: Observable<string[]>;
  listCategoriesSRCC: any[] = [];

  @ViewChild('productInput') productInput: ElementRef<HTMLInputElement>;
  @ViewChild('productInputSRCC') productInputSRCC: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  listStatuses: any[] = [];
  titleParam = {
    entity: this.translate.instant('cn_reward.discount_coins_order.title')
  }
  public searchKeywordGTP: FormControl = new FormControl();
  public groupTradePrograms: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  searchingGTP: Boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private shopingDiscountCoinsService: ShopingDiscountCoinsService,
    private geotreeService: GeotreeService,
    private groupTradeProgramService: GroupTradeProgramService,
    private productService: ProductService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private ls: LanguagesService,
    private translate: TranslateService
  ) {
    activatedRoute.url.subscribe(params => {
      this.actionType = params[0].path;
      this.isDetail = params[0].path === 'detail' ? true : false;
      this.isCreate = params[0].path === 'create' ? true : false;
      if (this.actionType !== 'create') {
        this.detailCoinDiscount = this.dataService.getFromStorage("detail_shoping_discount_coins");
      }
    });
    this.onLoad = false;
    this.selected = [];
    this.permission = this.roles.getRoles('principal.koin_potongan_belanja');
    // console.log("permission", this.permission);
    this.allRowsSelected = false;
    // this.allRowsSelectedValid = false;
    this.isSelected = false;
    this.voucherB2CList = null;

    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
    this.listLevelArea = [
      {
        "id": 1,
        "parent_id": null,
        "code": "SLSNTL      ",
        "name": "SSLSNTL"
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

    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        // this.getListRetailer(data);
      });

    // this.filteredSkuOptions = this.product.valueChanges.pipe(
    //   startWith(null),
    //   map((prd: string | null) => prd ? this._filter(prd) : this.productList.slice()));
    this.searchKeywordGTP.valueChanges.debounceTime(350).takeUntil(this._onDestroy).subscribe(keyword => {
      this.getGroupTradeProgram(keyword);
    });
  }

  _filterSku(value): any[] {
    // console.log('valueee', value);
    const filterValue = value && typeof value == "object" ? value.name.toLowerCase() : (value ? value.toLowerCase() : '');
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

    this.product.setValue(null);
  }

  remove(id: string): void {
    const index = this.productList.findIndex((prd: any) => prd.sku_id === id);

    if (index >= 0) {
      this.productList.splice(index, 1);
    }
  }

  selectedProduct(event: MatAutocompleteSelectedEvent): void {
    // console.log('evenaksdjlak', event);
    this.productList.push(event.option.viewValue);
    if (this.productInput) {
      this.productInput.nativeElement.value = '';
    }
    this.product.setValue(null);
  }

  onChangeIsB2CVoucher(event: any) {
    // console.log('EV', event);
    if (event) {
      // this.formShopingDiscountCoins.get('currency').setValue(100);
      // this.formShopingDiscountCoins.get('currency').disable();
    } else {
      // this.formShopingDiscountCoins.get('currency').enable();
    }
  }

  getListProduct(param?): void {
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
      this.shopingDiscountCoinsService.getProductList({ page: 'all', search: param }).subscribe(res => {
        this.listProductSkuBank = res.data ? res.data : [];
        this.filteredSkuOptions = this.product.valueChanges.pipe(startWith(null), map(value => this._filterSku(value)));
      })
    } else {
      this.listProductSkuBank = [];
      this.filteredSkuOptions = this.product.valueChanges.pipe(startWith(null), map(value => this._filterSku(value)));
    }
  }

  displayProductName(param?): any {
    return param ? param.name : param;
  }

  getProducts() {
    this.shopingDiscountCoinsService.getProductList({ page: 'all' }).subscribe(res => {
      this.listProduct = res.data ? res.data : [];
      this.filteredProduct.next(res.data ? res.data : []);
    })
  }

  getCategories() {
    this.productService.getListCategory(null).subscribe(res => {
      this.listCategories = res.data ? res.data.data : [];
    })
  }

  getVendorCategories() {
    this.productService.getListCategoryVendor().subscribe(res => {
      this.listCategoriesSRCC = res.data ? res.data : [];
    });
  }

  getGroupTradeProgram(keyword = null) {
    this.searchingGTP = true;
    this.groupTradeProgramService.get({ page: (!keyword) && 'all', search: keyword }).subscribe(res => {
      this.groupTradePrograms.next(res.data ? res.data.data : []);
      this.searchingGTP = false;
    }, error => {
      this.searchingGTP = false;
    })
  }

  isChecked(type, event) {
    try {
      if (type === 'product') {
        this.formShopingDiscountCoins.get('category').setValue('');
        this.formShopingDiscountCoins.get('limit_by_category').setValue(false);
        if (!event.checked) {
          this.productList = [];
          this.product.setValue(null);
          // this.product.disable();
          this.listProductSkuBank = [];
          this.inputChipList = [];
          if (this.productInput) {
            this.productInput.nativeElement.value = null;
          }
        } else {
          this.formShopingDiscountCoins.get('category').disable();
          this.product.enable();
        }
      } else {
        this.formShopingDiscountCoins.get('limit_by_product').setValue(false);
        this.productList = [];
        this.product.setValue(null);
        // this.product.disable();
        this.listProductSkuBank = [];
        this.inputChipList = [];
        if (event.checked) {
          this.formShopingDiscountCoins.get('category').setValue('');
          this.formShopingDiscountCoins.get('category').enable();
        } else {
          this.formShopingDiscountCoins.get('category').setValue('');
          this.formShopingDiscountCoins.get('category').disable();
        }
        if (this.productInput) {
          this.productInput.nativeElement.value = null;
        }
      }
    } catch (ex) {
      console.warn(ex)
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

  getProductObj(event, obj) {
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
          // console.log('this.listProductSkuBank', this.listProductSkuBank)
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

  getRetailerSelected() {
    this.shopingDiscountCoinsService.getSelectedRetailer({ coin_discount_id: this.detailCoinDiscount.id }).subscribe(res => {
      // console.log('retailer selected', res);
      this.onSelect({
        selected: res.data.map(slc => ({
          ...slc,
          id: slc.business_id
        }))
      });
      // this.getListRetailer();
    })
  }

  onRefreshDetail() {
    this.getDetail();
  }

  getDetail() {
    this.shopingDiscountCoinsService.show({ coin_discount_id: this.detailCoinDiscount.id }).subscribe(res => {
      this.detailCoinDiscount = res.data;
      this.isB2CVoucher.setValue(res.data.is_b2c_voucher ? true : false);
      this.formShopingDiscountCoins.setValue({
        // opsiVoucher: res.data.type,
        name: res.data.name,
        // coin: res.data.coin,
        // currency: Number(res.data.currency),
        // voucher: res.data.nominal,
        startDate: res.data.start_date,
        endDate: res.data.end_date,
        // voucherDate: res.data.available_at,
        // voucherExpiry: res.data.expired_at,
        trade_creator_group_id: res.data.trade_creator_group_id.map(rs => Number(rs)),
        // note: res.data.description,
        limit_by_product: res.data.limit_by === 'product',
        limit_by_category: res.data.limit_by === 'category',
        limit_only: res.data.limit_only,
        product: res.data.limit_by === 'product' ? res.data.limit_only : '',
        category: res.data.limit_by === 'category' ? res.data.limit_only.map(dt => Number(dt)) : '',
        coin_exchange_rate: res.data.coin_exchange_rate

        // limit_by_product_srcc: res.data.limit_by_src_catalogue === 'product',
        // limit_by_category_srcc: res.data.limit_by_src_catalogue === 'category',
        // limit_only_srcc: res.data.limit_only_src_catalogue,
        // product_srcc: res.data.limit_by_src_catalogue === 'product' ? res.data.limit_only_src_catalogue : '',
        // category_srcc: res.data.limit_by_src_catalogue === 'category' ? res.data.limit_only_src_catalogue.map(dt => Number(dt)) : '',
      });

      this.listStatuses = res.data.available_status_update ? Object.entries(res.data.available_status_update).map(
        ([value, name]) => ({ value, name })
      ) : [];

      if (!this.formShopingDiscountCoins.get('limit_by_category').value) {
        this.formShopingDiscountCoins.get('category').disable();
      }

      if (this.permission.b2b_approval) this.formShopingDiscountCoins.disable();

      if (res.data.status === 'need-approval') {
        this.formShopingDiscountCoins.disable();
        this.formShopingDiscountCoins.get('category').disable();
      }


      if (res.data.status === 'published') {
        // this.formShopingDiscountCoins.get('currency').disable();
        this.formShopingDiscountCoins.get('coin_exchange_rate').disable();
        // this.formShopingDiscountCoins.get('voucher').disable();
        this.formShopingDiscountCoins.get('startDate').disable();
        // this.formShopingDiscountCoins.get('voucherDate').disable();
        this.formShopingDiscountCoins.get('trade_creator_group_id').disable();
        // this.formShopingDiscountCoins.get('note').disable();
      }

      if (res.data.limit_by === 'product') {
        this.productList = res && res.data && res.data.limit_only_data ? res.data.limit_only_data : [];
      }
      if (res.data.limit_by_src_catalogue === 'product') {
        this.productListSRCC = res && res.data && res.data.limit_only_data_src_catalogue ?
        res.data.limit_only_data_src_catalogue : [];
      }
      if(this.actionType === 'detail') {
        this.formShopingDiscountCoins.disable();
      }
    });
  }

  checkForNonApprover() {
    if (this.detailCoinDiscount) {
      switch (this.detailCoinDiscount.status) {
        case "need-approval":
          return this.permission.b2b_approval ? true : false;
        default:
          return true;
      }
    } else {
      return false;
    }
  }

  takeAction(action) {
    if ((action.value === 'approved' || action.value === 'rejected') && !this.permission.b2b_approval) {
      this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text19 });
      return;
    }
    const data = {
      titleDialog: this.ls.locale.global.label.edit_status_voucher,
      captionDialog: this.ls.locale.global.messages.text20 + ` ${action.name}?`,
      confirmCallback: () => this.confirmChangeStatus(action),
      buttonText: [this.ls.locale.global.button.yes_continue, this.ls.locale.global.button.cancel]
    };
    this.dialogService.openCustomConfirmationDialog(data);

  }

  confirmChangeStatus(action) {
    this.dataService.showLoading(true);
    this.shopingDiscountCoinsService.changeStatus({ status: action.value }, { voucher_id: this.detailCoinDiscount.id }).subscribe(res => {
      this.dialogService.brodcastCloseConfirmation();
      this.dataService.showLoading(false);
      this.getDetail();
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  getDetailRedeem() {
    this.shopingDiscountCoinsService.getRedeems({ voucher_id: this.detailCoinDiscount.id }).subscribe(res => {
      // console.log('redeeems detail', res);
    })
  }

  whyYouCantSeeMe() {
    if (this.permission.lihat && !this.isCreate) return false;
    else if (this.isCreate && this.permission.buat) return true;
    else if (!this.isCreate && this.permission.ubah) return true;
    else return false;
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

    this.keyUpProductSRCC.debounceTime(300)
      .flatMap(key => {
        return Observable.of(key).delay(300);
      })
      .subscribe(res => {
        this.getListProductSRCC(res);
        this.resetField(res);
      });

    // this.getProducts();
    this.getCategories();
    this.getVendorCategories();
    this.getGroupTradeProgram();
    // this.getVoucherB2CList();


    this.formShopingDiscountCoins = this.formBuilder.group({
      // opsiVoucher: ['b2b', Validators.required],
      name: ["", Validators.required],
      // coin: [0, Validators.required],
      // currency: [0, [Validators.required, Validators.minLength(1)]],
      // voucher: [0, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      // voucherDate: [null, Validators.required],
      // voucherExpiry: [null, Validators.required],
      limit_only: [""],
      limit_by_product: [false],
      limit_by_category: [false],
      product: [""],
      category: [""],
      trade_creator_group_id: [""],
      coin_exchange_rate: [{value: 100, disabled: true}, [Validators.required, Validators.minLength(1)]]
      // note: [''],
      // limit_by_product_srcc: [false],
      // limit_by_category_srcc: [false],
      // limit_only_srcc: [''],
      // product_srcc: [''],
      // category_srcc: [''],
    });

    if (this.isCreate) {
      this.formShopingDiscountCoins.get('category').disable();
      // this.formShopingDiscountCoins.get('category_srcc').disable();
    }

    if(this.actionType === 'edit') {
      this.formShopingDiscountCoins.get('startDate').disable();
    }

    this.formFilter = this.formBuilder.group({
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    })
    if (this.actionType !== 'create') {
      this.getDetail();
      // this.getRetailerSelected();
      this.getDetailRedeem();
    } else {
      // this.product.disable();
    }

    this.initAreaV2();
    // this.getListRetailer();

    this.filteredProduct.next(this.listProduct.slice());

    // listen for search field value changes
    this.filterProduct.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterProductList();
      });

    // this.formShopingDiscountCoins.get('currency').valueChanges.subscribe(res => {
    //   const calculate = res * this.formShopingDiscountCoins.get('coin').value;
    //   this.formShopingDiscountCoins.get('voucher').setValue(this.decimalMax2(calculate));
    // })

    // this.formShopingDiscountCoins.get('coin').valueChanges.subscribe(res => {
    //   const calculate = res * this.formShopingDiscountCoins.get('currency').value;
    //   this.formShopingDiscountCoins.get('voucher').setValue(this.decimalMax2(calculate));
    // })


    this.isB2CVoucher.valueChanges.debounceTime(1000).subscribe(res => {
      if (res) {
        // this.formShopingDiscountCoins.get('trade_creator_group_id').setValue(this.voucherB2CList);
      }
    });

    this.formFilter.valueChanges.debounceTime(1000).subscribe(res => {
      // this.getListMitra();
      // this.getListRetailer();
    });

    this.formFilter.get('zone').valueChanges.subscribe(res => {
      // console.log('zone', res);
      if (res) {
        this.getAudienceAreaV2('region', res);
      }
    });
    this.formFilter.get('region').valueChanges.subscribe(res => {
      // console.log('region', res);
      if (res) {
        this.getAudienceAreaV2('area', res);
      }
    });
    this.formFilter.get('area').valueChanges.subscribe(res => {
      // console.log('area', res, this.formFilter.value['area']);
      if (res) {
        this.getAudienceAreaV2('salespoint', res);
      }
    });
    this.formFilter.get('salespoint').valueChanges.subscribe(res => {
      // console.log('salespoint', res);
      if (res) {
        this.getAudienceAreaV2('district', res);
      }
    });
    this.formFilter.get('district').valueChanges.subscribe(res => {
      // console.log('district', res);
      if (res) {
        this.getAudienceAreaV2('territory', res);
      }
    });
  }

  decimalMax2(calculate){
    return Math.round((calculate + Number.EPSILON) * 100) / 100;
  }

  isChangeB2BVoucher(event) {

  }

  createFormProduct() {
    return this.formBuilder.group({
      product: [""]
    })
  }

  onSelect({ selected }) {
    // console.log(arguments);
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  selectFn(allRowsSelected: boolean) {
    // console.log('allRowsSelected_', allRowsSelected);
    this.allRowsSelected = allRowsSelected;
    if (!allRowsSelected) this.selected = [];
    else this.selected.length = this.totalData;
  }

  getId(row) {
    return row.id;
  }

  getAudienceAreaV2(selection, id, event?) {
    let item: any;
    let fd = new FormData();
    let lastLevel = this.geotreeService.getBeforeLevel(this.parseArea(selection));
    let areaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(lastLevel));
    // console.log('areaSelected', areaSelected, selection, lastLevel, Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })));
    // console.log('audienceareav2', this.formFilter.getRawValue(), areaSelected[0]);
    if (areaSelected && areaSelected[0] && areaSelected[0].key === 'national') {
      fd.append('area_id[]', areaSelected[0].value);
    } else if (areaSelected.length > 0) {
      if (areaSelected[0].value !== "") {
        areaSelected[0].value.map(ar => {
          fd.append('area_id[]', ar);
        })
        // if (areaSelected[0].value.length === 0) fd.append('area_id[]', "1");
        if (areaSelected[0].value.length === 0) {
          let beforeLevel = this.geotreeService.getBeforeLevel(areaSelected[0].key);
          let newAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLevel));
          // console.log('the selection', this.parseArea(selection), newAreaSelected);
          if (newAreaSelected[0].key !== 'national') {
            newAreaSelected[0].value.map(ar => {
              fd.append('area_id[]', ar);
            })
          } else {
            fd.append('area_id[]', newAreaSelected[0].value);
          }
        }
      }
    } else {
      let beforeLastLevel = this.geotreeService.getBeforeLevel(lastLevel);
      areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLastLevel));
      // console.log('new', beforeLastLevel, areaSelected);
      if (areaSelected && areaSelected[0] && areaSelected[0].key === 'national') {
        fd.append('area_id[]', areaSelected[0].value);
      } else if (areaSelected.length > 0) {
        if (areaSelected[0].value !== "") {
          areaSelected[0].value.map(ar => {
            fd.append('area_id[]', ar);
          })
          // if (areaSelected[0].value.length === 0) fd.append('area_id[]', "1");
          if (areaSelected[0].value.length === 0) {
            let beforeLevel = this.geotreeService.getBeforeLevel(areaSelected[0].key);
            let newAreaSelected: any = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter(item => item.key === this.parseArea(beforeLevel));
            // console.log('the selection', this.parseArea(selection), newAreaSelected);
            if (newAreaSelected[0].key !== 'national') {
              newAreaSelected[0].value.map(ar => {
                fd.append('area_id[]', ar);
              })
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
      if (this.areaFromLogin[1]) thisAreaOnSet = [
        ...thisAreaOnSet,
        ...this.areaFromLogin[1]
      ];

      thisAreaOnSet = thisAreaOnSet.filter(ar => (ar.level_desc === 'teritory' ? 'territory' : ar.level_desc) === selection);
      if (id && id.length > 1) {
        areaNumber = 1;
      }

      if (areaSelected && areaSelected[0] && areaSelected[0].key !== 'national') expectedArea = thisAreaOnSet.filter(ar => areaSelected[0].value.includes(ar.parent_id));
      // console.log('on set', thisAreaOnSet, selection, id);
    }


    switch (this.parseArea(selection)) {
      case 'zone':
        // area = this.formFilter.get(selection).value;
        this.geotreeService.getChildFilterArea(fd).subscribe(res => {
          // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
          this.list[this.parseArea(selection)] = res.data;
          // this.list[this.parseArea(selection)] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

          // fd = null
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
        // console.log('zone selected', selection, this.list['region'], this.formFilter.get('region').value);
        break;
      case 'region':
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              this.list[selection] = res.data;
              // this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
            });
          } else {
            this.list[selection] = []
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
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item = this.list['region'].length > 0 ? this.list['region'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          // console.log('area hitted', selection, item, this.list['region']);
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              this.list[selection] = res.data;
              // this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
            });
          } else {
            this.list[selection] = []
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
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item = this.list['area'].length > 0 ? this.list['area'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          // console.log('item', item);
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              this.list[selection] = res.data;
              // this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
            });
          } else {
            this.list[selection] = []
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
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              this.list[selection] = res.data;
              // this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;
              // fd = null
            });
          } else {
            this.list[selection] = []
          }
        } else {
          this.list['district'] = [];
        }

        this.formFilter.get('district').setValue('');
        this.formFilter.get('territory').setValue('');
        this.list['territory'] = [];
        break;
      case 'territory':
        // area = this.formFilter.get(selection).value;
        if (id && id.length !== 0) {
          item = this.list['district'].length > 0 ? this.list['district'].filter(item => {
            return id && id.length > 0 ? id[0] : id;
          })[0] : {};
          if (item && item.name && item.name !== 'all') {
            this.geotreeService.getChildFilterArea(fd).subscribe(res => {
              // this.list[selection] = needFilter ? res.filter(ar => this.area_id_list.includes(Number(ar.id))) : res;
              this.list[selection] = res.data;
              // this.list[selection] = expectedArea.length > 0 ? res.data.filter(dt => expectedArea.map(eArea => eArea.id).includes(dt.id)) : res.data;

              // fd = null
            });
          } else {
            this.list[selection] = []
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

  getListRetailer(string?: any) {
    // console.log('Search', string);
    try {
      this.dataService.showLoading(true);
      this.pagination.per_page = 25;
      if (string) { this.pagination.search = string; }
      else { delete this.pagination.search; }
      let areaSelected = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value })).filter((item: any) => item.value !== null && item.value !== "" && item.value.length !== 0);
      let area_id = areaSelected[areaSelected.length - 1].value;
      let areaList = ["national", "division", "region", "area", "salespoint", "district", "territory"];
      this.pagination.area = area_id;

      // console.log('area_selected on ff list', areaSelected, this.list);
      if (this.areaFromLogin[0].length === 1 && this.areaFromLogin[0][0].type === 'national' && this.pagination.area !== 1) {
        this.pagination['after_level'] = true;
      } else {
        let lastSelectedArea: any = areaSelected[areaSelected.length - 1];
        let indexAreaAfterEndLevel = areaList.indexOf(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
        let indexAreaSelected = areaList.indexOf(lastSelectedArea.key);
        let is_area_2 = false;

        let self_area = this.areaFromLogin[0] ? this.areaFromLogin[0].map(area_1 => area_1.id) : [];
        let last_self_area = [];
        if (self_area.length > 0) {
          last_self_area.push(self_area[self_area.length - 1]);
        }

        if (this.areaFromLogin[1]) {
          let second_areas = this.areaFromLogin[1];
          last_self_area = [
            ...last_self_area,
            second_areas[second_areas.length - 1].id
          ];
          self_area = [
            ...self_area,
            ...second_areas.map(area_2 => area_2.id).filter(area_2 => self_area.indexOf(area_2) === -1)
          ];
        }

        let newLastSelfArea = this.checkAreaLocation(areaSelected[areaSelected.length - 1], last_self_area);

        if (this.pagination['after_level']) delete this.pagination['after_level'];
        this.pagination['self_area'] = self_area;
        this.pagination['last_self_area'] = last_self_area;
        let levelCovered = [];
        if (this.areaFromLogin[0]) levelCovered = this.areaFromLogin[0].map(level => this.parseArea(level.type));
        if (lastSelectedArea.value.length === 1 && this.areaFromLogin.length > 1) {
          let oneAreaSelected = lastSelectedArea.value[0];
          let findOnFirstArea = this.areaFromLogin[0].find(are => are.id === oneAreaSelected);
          // console.log('oneArea Selected', oneAreaSelected, findOnFirstArea);
          if (findOnFirstArea) is_area_2 = false;
          else is_area_2 = true;

          // console.log('last self area', last_self_area, is_area_2, levelCovered, levelCovered.indexOf(lastSelectedArea.key) !== -1, lastSelectedArea);
          if (levelCovered.indexOf(lastSelectedArea.key) !== -1) {
            // console.log('its hitted [levelCovered > -1]');
            if (is_area_2) this.pagination['last_self_area'] = [last_self_area[1]];
            else this.pagination['last_self_area'] = [last_self_area[0]];
          } else {
            // console.log('its hitted [other level]');
            this.pagination['after_level'] = true;
            this.pagination['last_self_area'] = newLastSelfArea;
          }
        } else if (indexAreaSelected >= indexAreaAfterEndLevel) {
          // console.log('its hitted [other level other]');
          this.pagination['after_level'] = true;
          if (newLastSelfArea.length > 0) {
            this.pagination['last_self_area'] = newLastSelfArea;
          }
        }
      }
      this.loadingIndicator = true;
      let body = {
        business_id: this.selected.map(item => item.id)
      }
      this.shopingDiscountCoinsService.getRetailer(this.pagination, body).subscribe(res => {
        if (res.status == 'success') {
          Page.renderPagination(this.pagination, res.data);
          this.totalData = res.data.total;
          this.rows = res.data.data;
          this.loadingIndicator = false;
          this.isSort = false;
          this.pagination.sort = 'name';
          this.pagination.sort_type = 'asc';
          this.dataService.showLoading(false);
        } else {
          this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text11 });
          Page.renderPagination(this.pagination, res.data);
          this.rows = [];
          this.loadingIndicator = false;
          this.dataService.showLoading(false);
        }
      }, err => {
        console.warn(err);
        this.dialogService.openSnackBar({ message:  this.ls.locale.global.messages.text11 });
        this.loadingIndicator = false;
        this.dataService.showLoading(false);
      })
    } catch (ex) {
      console.log('ex', ex)
    }
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

    // this.getListRetailer();
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);
    this.isSort = true;

    // this.getListRetailer();
  }

  getVoucherB2CList() {
    this.shopingDiscountCoinsService.getVoucherB2CList().subscribe(res => {
      this.voucherB2CList = res.data;
    }, err => {
      console.log('err', err)
    });
  }

  checkAreaLocation(area, lastSelfArea) {
    let lastLevelFromLogin = this.parseArea(this.areaFromLogin[0][this.areaFromLogin[0].length - 1].type);
    let areaList = ["national", "division", "region", "area", "salespoint", "district", "territory"];
    let areaAfterEndLevel = this.geotreeService.getNextLevel(lastLevelFromLogin);
    let indexAreaAfterEndLevel = areaList.indexOf(areaAfterEndLevel);
    let indexAreaSelected = areaList.indexOf(area.key);
    let rawValues = Object.entries(this.formFilter.getRawValue()).map(([key, value]) => ({ key, value }));
    let newLastSelfArea = []
    // console.log('[checkAreaLocation:area]', area);
    // console.log('[checkAreaLocation:lastLevelFromLogin]', lastLevelFromLogin);
    // console.log('[checkAreaLocation:areaAfterEndLevel]', areaAfterEndLevel);
    if (area.value !== 1) {
      // console.log('[checkAreaLocation:list]', this.list[area.key]);
      // console.log('[checkAreaLocation:indexAreaAfterEndLevel]', indexAreaAfterEndLevel);
      // console.log('[checkAreaLocation:indexAreaSelected]', indexAreaSelected);
      if (indexAreaSelected >= indexAreaAfterEndLevel) {
        // let sameAreas = this.list[area.key].filter(ar => area.value.includes(ar.id));
        let areaSelectedOnRawValues: any = rawValues.find(raw => raw.key === areaAfterEndLevel);
        newLastSelfArea = this.list[areaAfterEndLevel].filter(ar => areaSelectedOnRawValues.value.includes(ar.id)).map(ar => ar.parent_id).filter((v, i, a) => a.indexOf(v) === i);
        // console.log('[checkAreaLocation:list:areaAfterEndLevel', this.list[areaAfterEndLevel].filter(ar => areaSelectedOnRawValues.value.includes(ar.id)), areaSelectedOnRawValues);
        // console.log('[checkAreaLocation:newLastSelfArea]', newLastSelfArea);
      }
    }

    return newLastSelfArea;
  }

  filteringGeotree(areaList) {
    return areaList;
  }


  initAreaV2() {
    let areas = this.dataService.getDecryptedProfile()['areas'] || [];
    this.geotreeService.getFilter2Geotree(areas);
    let sameArea = this.geotreeService.diffLevelStarted;
    let areasDisabled = this.geotreeService.disableArea(sameArea);
    this.lastLevel = areasDisabled;
    let lastLevelDisabled = null;
    let levelAreas = ["national", "division", "region", "area", "salespoint", "district", "territory"];
    let lastDiffLevelIndex = levelAreas.findIndex(level => level === (sameArea.type === 'teritory' ? 'territory' : sameArea.type));

    if (!this.formFilter.get('national') || this.formFilter.get('national').value === '') {
      this.formFilter.get('national').setValue(1);
      this.formFilter.get('national').disable();
      lastLevelDisabled = 'national';
    }
    areas.map((area, index) => {
      area.map((level, i) => {
        let level_desc = level.level_desc;
        let levelIndex = levelAreas.findIndex(lvl => lvl === level.type);
        if (lastDiffLevelIndex > levelIndex - 2) {
          if (!this.list[level.type]) this.list[level.type] = [];
          if (!this.formFilter.controls[this.parseArea(level.type)] || !this.formFilter.controls[this.parseArea(level.type)].value || this.formFilter.controls[this.parseArea(level.type)].value === '') {
            this.formFilter.controls[this.parseArea(level.type)].setValue([level.id]);
            // console.log('ff value', this.formFilter.value);
            // console.log(this.formFilter.controls[this.parseArea(level.type)]);
            if (sameArea.level_desc === level.type) {
              lastLevelDisabled = level.type;

              this.formFilter.get(this.parseArea(level.type)).disable();
            }

            if (areasDisabled.indexOf(level.type) > -1) this.formFilter.get(this.parseArea(level.type)).disable();
            // if (this.formFilter.get(this.parseArea(level.type)).disabled) this.getFilterArea(level_desc, level.id);
            // console.log(this.parseArea(level.type), this.list[this.parseArea(level.type)]);
          }

          let isExist = this.list[this.parseArea(level.type)].find(ls => ls.id === level.id);
          level['area_type'] = `area_${index + 1}`;
          this.list[this.parseArea(level.type)] = isExist ? [...this.list[this.parseArea(level.type)]] : [
            ...this.list[this.parseArea(level.type)],
            level
          ];
          // console.log('area you choose', level.type, this.parseArea(level.type), this.geotreeService.getNextLevel(this.parseArea(level.type)));
          if (!this.formFilter.controls[this.parseArea(level.type)].disabled) this.getAudienceAreaV2(this.geotreeService.getNextLevel(this.parseArea(level.type)), level.id);

          if (i === area.length - 1) {
            this.endArea = this.parseArea(level.type);
            this.getAudienceAreaV2(this.geotreeService.getNextLevel(this.parseArea(level.type)), level.id);
          }
        }
      });
    });
  }

  onSaveDetail() {
    const body = {
      // type: this.formShopingDiscountCoins.get('opsiVoucher').value,
      name: this.formShopingDiscountCoins.get('name').value,
      // currency: this.formShopingDiscountCoins.get('currency').value,
      // coin: this.formShopingDiscountCoins.get('coin').value,
      start_date: moment(this.formShopingDiscountCoins.get('startDate').value).format("YYYY-MM-DD"),
      end_date: moment(this.formShopingDiscountCoins.get('endDate').value).format("YYYY-MM-DD"),
      // available_at: moment(this.formShopingDiscountCoins.get('voucherDate').value).format("YYYY-MM-DD"),
      // expired_at: moment(this.formShopingDiscountCoins.get('voucherExpiry').value).format("YYYY-MM-DD"),
      trade_creator_group_id: this.formShopingDiscountCoins.get('trade_creator_group_id').value,
      // description: this.formShopingDiscountCoins.get('note').value,
      limit_by: this.formShopingDiscountCoins.get('limit_by_product').value ? 'product' :
        this.formShopingDiscountCoins.get('limit_by_category').value ? 'category' : null,
      // is_b2c_voucher: this.isB2CVoucher.value,
      coin_exchange_rate: this.formShopingDiscountCoins.get('coin_exchange_rate').value
      // limit_by_src_catalogue: this.formShopingDiscountCoins.get('limit_by_product_srcc').value ? 'product' : this.formShopingDiscountCoins.get('limit_by_category_srcc').value ? 'category' : null
    };
    // console.log('paskdjsakl', this.productList);
    if (body['limit_by'] !== null) {
      body['limit_only'] = body['limit_by'] === 'product' ?
        this.productList.map(prd => prd.sku_id) : this.formShopingDiscountCoins.get('category').value;
    }
    // if (body['limit_by_src_catalogue'] !== null) {
    //   body['limit_only_src_catalogue'] = body['limit_by_src_catalogue'] === 'product' ? this.productListSRCC.map(prd => prd.sku_id) : this.formShopingDiscountCoins.get('category_srcc').value;
    // }

    this.dataService.showLoading(true);
    // if (this.isDetail) {
    //   this.shopingDiscountCoinsService.update({ coin_discount_id: this.detailCoinDiscount.id }, body).subscribe(res => {
    //     this.dataService.showLoading(false);
    //     this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
    //     if (!this.isDetail) this.router.navigate(['discount-coins-order', 'detail']);
    //     else {
    //       this.getDetail();
    //     }
    //   }, err => {
    //     this.dataService.showLoading(false);
    //   })
    // } else {
    //   this.shopingDiscountCoinsService.create(body).subscribe(res => {
    //     this.dataService.showLoading(false);
    //     this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
    //     this.router.navigate(['discount-coins-order']);
    //   }, err => {
    //     this.dataService.showLoading(false);
    //   })
    // }
    const actionService = (this.actionType === 'edit')
      ? this.shopingDiscountCoinsService.update({ coin_discount_id: this.detailCoinDiscount.id }, body) // IF EDIT
      : this.shopingDiscountCoinsService.create(body); // IF CREATE
    actionService.subscribe(res => {
      this.dataService.showLoading(false);
      
      this.dialogService.openSnackBar({
        message: this.translate.instant((this.actionType === 'edit') ? 'global.messages.text2' : 'notification.popup_notifikasi.text22')
      });
      this.router.navigate(['discount-coins-order']);
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  onSavePanelRetailer() {
    let body = {
      _method: "PUT",
      type: "retailer"
    }
    if (this.allRowsSelected) {
      body['type_business'] = 'all';
    } else {
      body['business_id'] = this.selected.map(bsn => bsn.id);
    }
    this.dataService.showLoading(true);

    this.shopingDiscountCoinsService.updatePanel({ voucher_id: this.detailCoinDiscount.id }, body).subscribe(res => {
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
      if (!this.isDetail) this.router.navigate(['b2b-voucher', 'detail']);
      else {
        this.getDetail();
        // this.getRetailerSelected();
      }
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  async exportInvoice() {
    // let fileName = `Export_Invoice_Panel_Retailer_CN_REWARD_${moment(new Date()).format('YYYY_MM_DD')}.xls`;
    try {
      this.dataService.showLoading(true);
      const response = await this.shopingDiscountCoinsService.exportInvoice({ voucher_id: this.detailCoinDiscount.id }).toPromise();
      // console.log('he', response);
      if (response && response.data) window.open(response.data.url, "_blank");
      // this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
      this.dataService.showLoading(false);
    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
    }
  }

  // importMitra(): void {
  //   const dialogConfig = new MatDialogConfig();

  //   dialogConfig.disableClose = true;
  //   dialogConfig.autoFocus = true;
  //   dialogConfig.panelClass = 'scrumboard-card-dialog';
  //   dialogConfig.data = {};

  //   this.dialogRef = this.dialog.open(ImportPanelMitraDialogComponent, dialogConfig);

  //   this.dialogRef.afterClosed().subscribe(response => {
  //     if (response) {
  //       if (response.data) {
  //         this.selected = response.data.map((item: any) => { return({ id: item.id })});
  //         this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text8 });
  //         console.log('thisSELECTED', this.selected)
  //       }
  //     }
  //   });
  // }

  async exportRetailer() {
    if (this.selected.length === 0) {
      this.dialogService.openSnackBar({
        message: this.ls.locale.global.messages.text12
      })
      return;
    }

    this.dataService.showLoading(true);
    let fd = {
      business_id: this.selected.map(item => item.id),
      type: 'retailer'
    }
    try {
      const response = await this.shopingDiscountCoinsService.exportRetailer(fd, { voucher_id: this.detailCoinDiscount.id }).toPromise();
      // console.log('he', response.headers);
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `Export_PanelRetailer_${new Date().toLocaleString()}.xls`);
      // this.downLoadFile(response, "data:text/csv;charset=utf-8", `Export_Retailer_${new Date().toLocaleString()}.csv`);
      // this.downloadLink.nativeElement.href = response;
      // this.downloadLink.nativeElement.click();
      this.dataService.showLoading(false);

    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
      // throw error;
    }
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format("YYYY-MM-DD");
    }
    return "";
  }

  async exportExcel() {
    this.dataService.showLoading(true);
    let fileName = `B2B_CN_Reward_Panel_Retailer_${moment(new Date()).format('YYYY_MM_DD')}.xls`;
    try {
      const response = await this.shopingDiscountCoinsService.exportExcel({ voucher_id: this.detailCoinDiscount.id }).toPromise();
      // console.log('he', response.headers);
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
      this.dataService.showLoading(false);
    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
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
    // console.log('Here')
    console.log(error)

    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.log(error);
    // alert('Open console to see the error')
  }

  importRetailer(): void {
    if (this.detailCoinDiscount.status === 'need-approval') {
      this.dialogService.openSnackBar({ message: this.ls.locale.cn_reward.b2b_voucher.voucher_on_review });
      return;
    }
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { voucher_id: this.detailCoinDiscount.id, type: 'retailer' };

    this.dialogRef = this.dialog.open(ImportPanelDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        // this.selected = this.selected.concat(response);
        this.onSelect({ selected: response });
        this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text8 });
        // console.log('this', this.selected)
      }
    });
  }

  getListProductSRCC(param?): void {
    if (param) {
      const list = param.split(';').join(',').split(',');
      this.inputChipListSRCC = list.map((item: any) => {
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
      this.shopingDiscountCoinsService.getProductListVendor({ page: 'all', search: param }).subscribe(res => {
        this.listProductSkuBankSRCC = res.data ? res.data : [];
        this.filteredSkuOptionsSRCC = this.productSRCC.valueChanges.pipe(startWith(null), map(value => this._filterSkuSRCC(value)));
      })
    } else {
      this.listProductSkuBankSRCC = [];
      this.filteredSkuOptionsSRCC = this.productSRCC.valueChanges.pipe(startWith(null), map(value => this._filterSkuSRCC(value)));
    }
  }

  _filterSkuSRCC(value): any[] {
    // console.log('valueee', value);
    const filterValue = value && typeof value == "object" ? value.name.toLowerCase() : (value ? value.toLowerCase() : '');
    return this.listProductSkuBankSRCC.filter(item => item.name.toLowerCase().includes(filterValue));
  }

  getProductObjSRCC(event, obj) {
    let index = this.productListSRCC.findIndex(prd => prd.sku_id === obj.sku_id);
    if (index === -1) {
      this.productListSRCC.push(obj);
    }
    if (this.productInputSRCC) {
      this.productInputSRCC.nativeElement.value = null;
    }

    if (this.inputChipListSRCC && this.inputChipListSRCC.length > 0) {
      const itemClick = this.inputChipListSRCC.filter((item) => {
        return item.toLowerCase().search(obj.name.toLowerCase());
      });

      if (itemClick && itemClick.length > 0) {
        if (itemClick.length === 1 && itemClick[0] !== obj.name && itemClick[0].length < 6) {
          /**
           * jika pencarian produk kurang dari 6 char pencarian tidak akan dilanjutkan
           */
          this.listProductSkuBankSRCC = [];
        } else {
          // console.log('this.listProductSkuBank', this.listProductSkuBank)
          this.productSRCC.setValue(itemClick.toString());
          if (this.productInputSRCC) {
            this.productInputSRCC.nativeElement.value = itemClick.toString();
          }
          this.getListProduct(itemClick.toString());
        }
      } else {
        this.productSRCC.setValue(null);
        if (this.productInputSRCC) {
          this.productInputSRCC.nativeElement.value = null;
        }
        this.listProductSkuBankSRCC = [];
      }
      setTimeout(() => {
        if (this.productInputSRCC) {
          this.productInputSRCC.nativeElement.blur();
          this.productInputSRCC.nativeElement.focus();
        }
      }, 500);
    }
  }

  isCheckedSRCC(type, event) {
    try {
      if (type === 'product') {
        // this.formShopingDiscountCoins.get('category_srcc').setValue('');
        // this.formShopingDiscountCoins.get('limit_by_category_srcc').setValue(false);
        if (!event.checked) {
          this.productListSRCC = [];
          this.productSRCC.setValue(null);
          // this.product.disable();
          this.listProductSkuBankSRCC = [];
          this.inputChipListSRCC = [];
          if (this.productInputSRCC) {
            this.productInputSRCC.nativeElement.value = null;
          }
        } else {
          // this.formShopingDiscountCoins.get('category_srcc').disable();
          this.productSRCC.enable();
        }
      } else {
        // this.formShopingDiscountCoins.get('limit_by_product_srcc').setValue(false);
        this.productListSRCC = [];
        this.productSRCC.setValue(null);
        // this.product.disable();
        this.listProductSkuBankSRCC = [];
        this.inputChipListSRCC = [];
        if (event.checked) {
          // this.formShopingDiscountCoins.get('category_srcc').setValue('');
          // this.formShopingDiscountCoins.get('category_srcc').enable();
        } else {
          // this.formShopingDiscountCoins.get('category_srcc').setValue('');
          // this.formShopingDiscountCoins.get('category_srcc').disable();
        }
        if (this.productInputSRCC) {
          this.productInputSRCC.nativeElement.value = null;
        }
      }
    } catch (ex) {
      console.warn(ex)
    }
  }

  addSRCC(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if (value) {
      this.productListSRCC.push(value);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.productSRCC.setValue(null);
  }

  removeSRCC(id: string): void {
    const index = this.productListSRCC.findIndex((prd: any) => prd.sku_id === id);

    if (index >= 0) {
      this.productListSRCC.splice(index, 1);
    }
  }

  selectedProductSRCC(event: MatAutocompleteSelectedEvent): void {
    // console.log('evenaksdjlak', event);
    this.productListSRCC.push(event.option.viewValue);
    if (this.productInputSRCC) {
      this.productInputSRCC.nativeElement.value = '';
    }
    this.productSRCC.setValue(null);
  }

}
