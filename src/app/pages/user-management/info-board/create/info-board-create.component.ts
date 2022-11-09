import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Config } from 'app/classes/config';
import { LanguagesService } from 'app/services/languages/languages.service';
import { InfoBoardService } from "app/services/dte/info-board.service";
import { DialogService } from 'app/services/dialog.service';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { ProductService } from 'app/services/sku-management/product.service';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { BtoBVoucherService } from 'app/services/bto-bvoucher.service';
import { ENTER, COMMA, SEMICOLON } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-info-board-create',
  templateUrl: './info-board-create.component.html',
  styleUrls: ['./info-board-create.component.scss']
})
export class InfoBoardCreateComponent implements OnInit {
  selectedTab: number = 0;

  formBoard: FormGroup;
  onLoad: boolean;
  minDateStart = new Date();
  minDateEnd = new Date();
  groupTradePrograms: any[] = [];
  formFilter: FormGroup;
  formGeo: FormGroup;
  isPopulation: boolean = true;
  data_imported: any = [];
  exportTemplate: Boolean;
  dialogRef: any;
  isChecked: boolean = false;
  panelBlast: number;
  selectedZone = [];
  selectedRegion = [];
  selectedArea = [];
  loadingZone = true;
  loadingRegion = false;
  loadingArea = false;
  list: any;
  areaFromLogin;
  isFreeText = false;
  listBrands = [];
  public filterBrand: FormControl = new FormControl();
  public filteredBrand: ReplaySubject<any[]> = new ReplaySubject<any[]>(
    1
  );
  isFour = false;
  productList: any[] = [];
  @ViewChild('productInput') productInput: ElementRef<HTMLInputElement>;
  keyUpProduct = new Subject<string>();
  product: FormControl = new FormControl('');
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  filteredSkuOptions: Observable<string[]>;
  listProduct: any[] = [];
  filterProduct: FormControl = new FormControl('');
  public filteredProduct: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  inputChipList = [];
  listProductSkuBank: Array<any> = [];
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA, SEMICOLON];

  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  lastLevel: any;

  files: File;
  imageContentType: File;
  imageContentTypeBase64: any;
  image: any;
  validComboDrag: boolean;
  imageConverted: any;
  preview_header: FormControl = new FormControl("");

  infoBoard: any[] = [];

  public audienceFixed: FormControl = new FormControl();
  public audiencePopulation: FormControl = new FormControl();

  @ViewChild('downloadLink') downloadLink: ElementRef;

  statusTP: any[] = [{ name: this.translate.instant('dte.trade_program.text6'), value: 'publish' }, { name: this.translate.instant('dte.trade_program.text7'), value: 'unpublish' }]

  listGroupTradeProgram: any[] = [];
  listSubGroupTradeProgram: any[] = [];

  private _onDestroy = new Subject<void>();
  filteredGTpOptions: Observable<string[]>;
  public filterGTP: FormControl = new FormControl();
  public filteredGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterSGTP: FormControl = new FormControl();
  public filteredSGTP: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public options: Object = { ...Config.FROALA_CONFIG, placeholderText: "" };

  retailClassification: any[] = [
    { name: this.ls.locale.global.label.all + " " + this.ls.locale.call_objective.text9, value: "all" },
    { name: "SRC", value: "SRC" },
    { name: "NON-SRC", value: "NON-SRC" },
    { name: "IMO", value: "IMO" },
    { name: "LAMP/HOP", value: "LAMP/HOP" },
    { name: "GT", value: "GT" },
    { name: "KA", value: "KA" }
  ];

  geoLevel: string[] = ["national", "division", "region", "area"];
  geoList: any = {
    national: [
      {
        id: 1,
        parent_id: null,
        code: "SLSNTL",
        name: "SLSNTL",
      },
    ],
  };

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
    private translate: TranslateService,
    private infoBoardService: InfoBoardService,
    private dialogService: DialogService,
    private dataService: DataService,
    private productService: ProductService,
    private b2bVoucherService: BtoBVoucherService,
  ) {
    this.onLoad = true;

    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];

    this.list = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    };
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
    this.formBoard = this.formBuilder.group({
      name_board: ["", Validators.required],
      description_board: ["", Validators.required],
      type: [""],
      start_date: [new Date()],
      start_time: ["00:00", Validators.required],
      end_date: [new Date()],
      end_time: ["00:00", Validators.required],
      brand_id: [[]],
      product: [""],
    });

    this.infoBoardService.type().subscribe(
      res => {
        this.infoBoard = res.data ? res.data.data : [];
      },
      err => {
        console.error(err);
      }
    );

    this.onLoad = false;

    this.formBoard.get('type').valueChanges.subscribe(res => {
      if (res === 1) {
        this.isFreeText = true;
      } else {
        this.isFreeText = false;
      }
    });
    this.getBrands();
    this.filterBrand.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringKeyword();
      });

    this.formBoard.get('type').valueChanges.subscribe(res => {
      if (res === 4) {
        this.isFour = true;
      } else {
        this.isFour = false;
      }
    });
  }

  getBrands() {
    this.productService.getListBrand().subscribe(res => {
      this.listBrands = res.data ? res.data.data : [];
      this.filteredBrand.next(res.data ? res.data.data : []);
    });
  }

  filteringKeyword() {
    if (!this.listBrands) {
      return;
    }
    // get the search keyword
    let search = this.filterBrand.value;
    if (!search) {
      this.filteredBrand.next(this.listBrands.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the brand
    this.filteredBrand.next(
      this.listBrands.filter(
        (item) => item.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  submit(): void {

    if (this.formBoard.valid) {

      const body = {
        name: this.formBoard.get('name_board').value,
        type_id: this.formBoard.get('type').value,
        description: this.formBoard.get('description_board').value,
        start_date: `${moment(this.formBoard.get('start_date').value).format('YYYY-MM-DD')} ${this.formBoard.get('start_time').value}:00`,
        end_date: `${moment(this.formBoard.get('end_date').value).format('YYYY-MM-DD')} ${this.formBoard.get('end_time').value}:00`,
        limit_by: 'product',
        limit_only: this.productList.map(prd => prd.sku_id),
        status: 'unpublish'
      };

      this.infoBoardService.create(body).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
          if (this.isFreeText) {
            this.dataService.setToStorage('free_text', true);
            this.dataService.setToStorage('detail_info_board', res.data);
            this.router.navigate(['user-management', 'info-board', 'edit']);
          } else {
            this.router.navigate(['user-management', 'info-board']);
          }
        },
        err => {
          console.log(err.error.message);
        }
      )
    } else {
      this.dialogService.openSnackBar({ message: this.translate.instant('global.label.please_complete_data') });
      commonFormValidator.validateAllFields(this.formBoard);
    }
  }

  convertDate(param: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return "";
  }

  onDateStart($event) {
    const stringified = JSON.stringify($event.value);
    const dob = stringified.substring(1, 11);
    let date = new Date();
    date.setDate(new Date(dob).getDate() + 1);
    console.log(date);
    this.minDateStart = date;
  }
  onDateEnd($event) {
    const stringified = JSON.stringify($event.value);
    const dob = stringified.substring(1, 11);
    let date = new Date();
    date.setDate(new Date(dob).getDate() + 1);
    console.log(date);
  }
  onDateAnnounce($event) {
    const stringified = JSON.stringify($event.value);
    const dob = stringified.substring(1, 11);
    let date = new Date();
    date.setDate(new Date(dob).getDate() + 1);
    console.log(date);
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

  getProducts() {
    this.b2bVoucherService.getProductList({ page: 'all' }).subscribe(res => {
      this.listProduct = res.data ? res.data : [];
      this.filteredProduct.next(res.data ? res.data : []);
    });
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

  displayProductName(param?): any {
    return param ? param.name : param;
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
      this.b2bVoucherService.getProductList({ page: 'all', search: param }).subscribe(res => {
        this.listProductSkuBank = res.data ? res.data : [];
        this.filteredSkuOptions = this.product.valueChanges.pipe(startWith(null), map(value => this._filterSku(value)));
      })
    } else {
      this.listProductSkuBank = [];
      this.filteredSkuOptions = this.product.valueChanges.pipe(startWith(null), map(value => this._filterSku(value)));
    }
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
}
