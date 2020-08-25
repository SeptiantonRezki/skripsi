import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from "@angular/forms";
import { Subject, Observable, ReplaySubject, forkJoin } from "rxjs";

import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogService } from "../../../../services/dialog.service";
import { ProductService } from "../../../../services/sku-management/product.service";
import { commonFormValidator } from "app/classes/commonFormValidator";
import { MatChipInputEvent, MatSelectChange, MatSelect, MatDialogConfig, MatDialog } from "@angular/material";

import * as moment from "moment";
import { takeUntil } from "rxjs/operators";
import { ScanBarcodeDialogComponent } from "../create/dialog/scan-barcode-dialog.component";
import html2canvas from 'html2canvas';
import { DataService } from "app/services/data.service";
import * as _ from 'underscore';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss']
})
export class ProductEditComponent {
  @ViewChild('containerScroll') private myScrollContainer: ElementRef;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  loadingIndicator: boolean;
  onLoad: Boolean;
  indexDelete: any;

  idProduct: any;
  detailProduct: any;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  otherProduct: any[];
  listBrand: Array<any>;
  listCategory: Array<any>;
  listSubCategory: Array<any>;
  listOtherSubCategory: Array<any>;
  listPackaging: Array<any>;
  packagingIndex: any;

  files: File;
  validComboDrag: boolean;

  imageSku: any;
  imageSkuConverted: any;
  showLoading: Boolean;

  formProductGroup: FormGroup;
  formProductErrors: any;

  keyUp = new Subject<string>();
  statusProduk: any[] = [
    { name: "Aktif", status: "active" },
    { name: "Non Aktif", status: "inactive" }
  ];

  listPinUpProduct: any[] = [
    { name: "Ya", value: 1 },
    { name: "Tidak", value: 0 }
  ]
  minDate: any;

  filteredSkuOptions: Observable<string[]>;

  public filterCategory: FormControl = new FormControl();
  public filteredCategory: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filterBrand: FormControl = new FormControl();
  public filteredBrand: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public filterSubCategory: FormControl = new FormControl();
  public filteredSubCategory: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('screen') screen: ElementRef;
  @ViewChild('singleSelect') singleSelect: MatSelect;
  private _onDestroy = new Subject<void>();

  dialogRef: any;
  isDetail: Boolean;

  listLevelArea: any[];
  list: any;
  typeArea: any[] = ["national", "zone", "region", "area", "salespoint", "district", "territory"];

  areaFromLogin;
  detailAreaSelected: any[];

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private productService: ProductService,
    private dialog: MatDialog,
    private dataService: DataService
  ) {
    this.otherProduct = [];
    this.listSubCategory = [];
    this.onLoad = true;
    this.minDate = moment();

    activatedRoute.url.subscribe(params => {
      this.idProduct = params[2].path;
      this.isDetail = params[1].path === 'detail' ? true : false;
    });

    this.listBrand = this.activatedRoute.snapshot.data["listBrand"].data ? this.activatedRoute.snapshot.data["listBrand"].data.data : [];
    this.listCategory = this.activatedRoute.snapshot.data["listCategory"].data ? this.activatedRoute.snapshot.data["listCategory"].data.data : [];
    this.listPackaging = this.activatedRoute.snapshot.data["listPackaging"].data ? this.activatedRoute.snapshot.data["listPackaging"].data.data : [];
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];

    this.filteredBrand.next(this.listBrand.slice());
    this.filteredCategory.next(this.listCategory.slice());

    this.formProductErrors = {
      name: {},
      // alias: [],
      status: {},
      category: {},
      brand: {},
      packaging: {},
      // convertion: {}
    };

    this.listLevelArea = [
      {
        "id": 1,
        "parent_id": null,
        "code": "SLSNTL      ",
        "name": "SLSNTL"
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
  }

  parallelResolver(): Observable<any[]> {
    let listBrand = this.productService.getListBrand();
    let listCategory = this.productService.getListCategory(null);
    let listPackaging = this.productService.getListPackaging();

    return forkJoin([listBrand, listCategory, listPackaging])
  }

  ngOnInit() {
    this.getDetails();
    this.createFormGroup();

    this.formProductGroup.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.formProductGroup,
        this.formProductErrors
      );
    });

    // this.getDetails();

    this.filterCategory.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringCategory();
      });

    this.filterBrand.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringBrand();
      });

    this.filterSubCategory.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringSubCategory();
      });

    this.formProductGroup.controls['listProdukPrivateLabel'].valueChanges.debounceTime(300).subscribe(res => {
      let listProdukPrivateLabel = this.formProductGroup.get('listProdukPrivateLabel') as FormArray;
      (res || []).map((item, index) => {
        if (item.price) {
          listProdukPrivateLabel.at(index).get('price_discount').setValidators([Validators.max(item.price - 1)]);
          listProdukPrivateLabel.at(index).get('price_discount').updateValueAndValidity();
        }

        if (parseInt(item.price_discount) > 0) {
          listProdukPrivateLabel.at(index).get('price_discount_expires_at').enable();
        } else {
          listProdukPrivateLabel.at(index).get('price_discount_expires_at').reset();
          listProdukPrivateLabel.at(index).get('price_discount_expires_at').disable();
          listProdukPrivateLabel.at(index).get('price_discount_expires_at').setValue('');
        }
      })
    });

  }

  getDetails() {
    try {
      this.productService.getdetail(this.idProduct).subscribe(async (res) => {
        this.detailProduct = res.data;

        let alias = this.formProductGroup.get("alias") as FormArray;
        if (res.data.alias) {
          (res.data.alias).map(item => {
            alias.push(this.formBuilder.group({ alias: item.trim() }));
          });
        }

        this.formProductGroup.get("name").setValue(res.data.name);
        this.formProductGroup.get("barcode").setValue(res.data.barcode);
        this.formProductGroup.get("brand").setValue(res.data.brand_id);
        this.formProductGroup.get("packaging").setValue(res.data.packaging_id);
        this.formProductGroup.get("status").setValue(res.data.status);
        this.formProductGroup.get("priority_product").setValue(res.data.priority_product);
        this.formProductGroup.get("is_promo_src").setValue(res.data.is_promo_src === 1 ? true : false);
        if (res && res.data.status_pin_up) {
          this.formProductGroup.get('status_pin_up').setValue(res.data.status_pin_up);
          if (res.data.start_date_pin_up) this.formProductGroup.get('start_date_pin_up').setValue(new Date(res.data.start_date_pin_up));
          if (res.data.end_date_pin_up) this.formProductGroup.get('end_date_pin_up').setValue(new Date(res.data.end_date_pin_up));
        }
        this.formProductGroup.get("is_private_label").setValue(res.data.is_private_label === 1 ? true : false);
        console.log(this.formProductGroup);
        if (res.data.category.parent_id) {
          this.formProductGroup.get("category").setValue(res.data.category_all[0]);
          this.selectionChange();

          this.formProductGroup.get("subCategory").setValue(res.data.category_all[1]);
        } else {
          this.formProductGroup.get("category").setValue(res.data.category_id);
        }

        for (const { val, index } of this.detailProduct.areas.map((val, index) => ({ val, index }))) {
          console.log('hitted me', val, index);
          const response = await this.productService.getParentArea({ parent: val.area_id }).toPromise();
          let wilayah = this.formProductGroup.controls['areas'] as FormArray;

          wilayah.push(this.formBuilder.group({
            national: [this.getArea(response, 'national'), Validators.required],
            zone: [this.getArea(response, 'division')],
            region: [this.getArea(response, 'region')],
            area: [this.getArea(response, 'area')],
            salespoint: [this.getArea(response, 'salespoint')],
            district: [this.getArea(response, 'district')],
            territory: [this.getArea(response, 'teritory')],
            list_national: this.formBuilder.array(this.listLevelArea),
            list_zone: this.formBuilder.array([]),
            list_region: this.formBuilder.array([]),
            list_area: this.formBuilder.array([]),
            list_salespoint: this.formBuilder.array([]),
            list_district: this.formBuilder.array([]),
            list_territory: this.formBuilder.array([]),
            time_period: [val.start_date !== null && val.end_date !== null ? true : false],
            start_date: [val.start_date !== null ? val.start_date : ""],
            end_date: [val.end_edate !== null ? val.end_date : ""]
          }))

          this.initArea(index);
          this.initFormGroup(response, index);

          if (this.detailProduct.areas.length === (index + 1)) {
            this.onLoad = false;
          }
        }

        // if (this.detailProduct.areas.length === 0) {
        //   this.addArea();
        // }

        if (res.data.is_private_label === 1 && res.data.product_prices !== null) {
          let priceProduct = this.formProductGroup.get("listProdukPrivateLabel") as FormArray;
          let idx = 0;
          for (const item of res.data.product_prices) {
            priceProduct.push(this.formBuilder.group({
              packaging: [item.packaging, Validators.required],
              packaging_amount: [item.packaging_amount, [Validators.required, Validators.min(1), Validators.max(1000)]],
              price: [item.price, Validators.required],
              price_discount: [item.price_discount, Validators.required],
              price_discount_expires_at: [item.price_discount_expires_at || "", Validators.required],
            }));
            idx++;
          };
        }

        setTimeout(() => {
          this.onLoad = false;
        }, 500);

        if (this.isDetail) this.formProductGroup.disable();

      })
    } catch (ex) {
      console.log('ex', ex);
    }
  }

  createArea(): FormGroup {
    return this.formBuilder.group({
      national: [1, Validators.required],
      zone: [""],
      salespoint: [""],
      region: [""],
      area: [""],
      district: [""],
      territory: [""],
      list_national: this.formBuilder.array(this.listLevelArea),
      list_zone: this.formBuilder.array([]),
      list_region: this.formBuilder.array([]),
      list_area: this.formBuilder.array([]),
      list_salespoint: this.formBuilder.array([]),
      list_district: this.formBuilder.array([]),
      list_territory: this.formBuilder.array([]),
      time_period: [false],
      start_date: [""],
      end_date: [""]
    })
  }

  addArea() {
    let wilayah = this.formProductGroup.controls['areas'] as FormArray;
    // if (wilayah.length < 2) {
    wilayah.push(this.createArea());
    const index = wilayah.length > 0 ? (wilayah.length - 1) : 0
    this.initArea(index);
    this.generataList('zone', 1, index, 'render');
    // }
  }

  deleteArea(idx) {
    this.indexDelete = idx;
    let data = {
      titleDialog: "Hapus Geotree",
      captionDialog: `Apakah anda yakin untuk menghapus Geotree ${idx + 1} ?`,
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  initArea(index) {
    let wilayah = this.formProductGroup.controls['areas'] as FormArray;
    console.log('area from Login', this.areaFromLogin);
    this.areaFromLogin.map(item => {
      switch (item.type.trim()) {
        case 'national':
          wilayah.at(index).get('national').disable();
          break
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
    })
  }

  initFormGroup(response, index) {
    response.data.map(item => {
      let level_desc = '';
      switch (item.level_desc.trim()) {
        case 'national':
          level_desc = 'zone';
          break
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
      console.log('init Form Group');
      this.generataList(level_desc, item.id, index, 'render');
    });
  }

  async generataList(selection, id, index, type) {
    let item: any;
    let wilayah = this.formProductGroup.controls['areas'] as FormArray;
    console.log('sdasdqwedwsdbjnDWv', selection, id);
    switch (selection) {
      case 'zone':
        const response = await this.productService.getListOtherChildren({ parent_id: id }).toPromise();
        let list = wilayah.at(index).get(`list_${selection}`) as FormArray;

        while (list.length > 0) {
          list.removeAt(list.length - 1);
        }

        _.clone(response || []).map(item => {
          list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua Zone' : item.name }));
        });

        if (type !== 'render') {
          wilayah.at(index).get('region').setValue('');
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
        break;
      case 'region':
        item = wilayah.at(index).get('list_zone').value.length > 0 ? wilayah.at(index).get('list_zone').value.filter(item => item.id === id)[0] : {};
        if (item.name !== 'Semua Zone') {
          const response = await this.productService.getListOtherChildren({ parent_id: id }).toPromise();
          let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item => {
            list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua Regional' : item.name }));
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
        break;
      case 'area':
        item = wilayah.at(index).get('list_region').value.length > 0 ? wilayah.at(index).get('list_region').value.filter(item => item.id === id)[0] : {};
        if (item.name !== 'Semua Regional') {
          const response = await this.productService.getListOtherChildren({ parent_id: id }).toPromise();
          let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item => {
            list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua Area' : item.name }));
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
        break;
      case 'salespoint':
        item = wilayah.at(index).get('list_area').value.length > 0 ? wilayah.at(index).get('list_area').value.filter(item => item.id === id)[0] : {};
        if (item.name !== 'Semua Area') {
          const response = await this.productService.getListOtherChildren({ parent_id: id }).toPromise();
          let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item => {
            list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua Salespoint' : item.name }));
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
        break;
      case 'district':
        item = wilayah.at(index).get('list_salespoint').value.length > 0 ? wilayah.at(index).get('list_salespoint').value.filter(item => item.id === id)[0] : {};
        if (item.name !== 'Semua Salespoint') {
          const response = await this.productService.getListOtherChildren({ parent_id: id }).toPromise();
          let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item => {
            list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua District' : item.name }));
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
        break;
      case 'territory':
        item = wilayah.at(index).get('list_district').value.length > 0 ? wilayah.at(index).get('list_district').value.filter(item => item.id === id)[0] : {};
        if (item.name !== 'Semua District') {
          const response = await this.productService.getListOtherChildren({ parent_id: id }).toPromise();
          let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
          while (list.length > 0) {
            list.removeAt(list.length - 1);
          }
          _.clone(response || []).map(item => {
            list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua Territory' : item.name }));
          });
        }

        if (type !== 'render') {
          wilayah.at(index).get('territory').setValue('');

          if (item.name === 'Semua District') {
            this.clearFormArray(index, 'list_territory');
          }
        }
        break;

      default:
        break;
    }
  }

  getArea(response, selection) {
    return response.data.filter(item => item.level_desc === selection).map(item => item.id)[0]
  }

  confirmDelete() {
    let wilayah = this.formProductGroup.controls['areas'] as FormArray;
    wilayah.removeAt(this.indexDelete);
    this.dialogService.brodcastCloseConfirmation();
  }

  clearFormArray = (index, selection) => {
    let wilayah = this.formProductGroup.controls['areas'] as FormArray;
    let list = wilayah.at(index).get(selection) as FormArray;
    while (list.length > 0) {
      list.removeAt(list.length - 1);
    }
  }

  filteringCategory() {
    if (!this.listCategory) {
      return;
    }
    // get the search keyword
    let search = this.filterCategory.value;
    if (!search) {
      this.filteredCategory.next(this.listCategory.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredCategory.next(
      this.listCategory.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  filteringSubCategory() {
    if (!this.listSubCategory) {
      return;
    }
    // get the search keyword
    let search = this.filterSubCategory.value;
    if (!search) {
      this.filteredSubCategory.next(this.listSubCategory.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredSubCategory.next(
      this.listSubCategory.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  filteringBrand() {
    if (!this.listBrand) {
      return;
    }
    // get the search keyword
    let search = this.filterBrand.value;
    if (!search) {
      this.filteredBrand.next(this.listBrand.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredBrand.next(
      this.listBrand.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  createFormGroup(): void {
    this.formProductGroup = this.formBuilder.group({
      name: ["", Validators.required],
      alias: this.formBuilder.array([]),
      status: ["active", Validators.required],
      brand: ["", Validators.required],
      category: ["", Validators.required],
      subCategory: [""],
      barcode: [""],
      is_promo_src: [false],
      // otherSubCategory: ["", Validators.required],
      packaging: ["", Validators.required],
      areas: this.formBuilder.array([]),
      start_date_pin_up: [""],
      end_date_pin_up: [""],
      status_pin_up: [""],
      priority_product: [""],
      // convertion: ["", [Validators.min(0)]]
      is_private_label: [false],
      listProdukPrivateLabel: this.formBuilder.array([])
    });
  }

  addAlias(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || "").trim()) {
      const alias = this.formProductGroup.get("alias") as FormArray;
      alias.push(this.formBuilder.group({ alias: value.trim() }));
    }

    if (input) {
      input.value = "";
    }
  }

  removeAlias(item): void {
    const alias = this.formProductGroup.get("alias") as FormArray;
    alias.removeAt(item);
    // const index = this.formProductGroup.get("alias").value.indexOf(item);

    // if (index >= 0) {
    //   this.formProductGroup.get("alias").value.splice(item, 1);
    // }
  }

  selectionChange(): void {
    let category_id = this.formProductGroup.get("category").value
    this.productService.getListCategory(category_id).subscribe(
      res => {
        this.listSubCategory = res.data ? res.data.data : [];
      },
      err => {
        this.listSubCategory = [];
      }
    );
  }

  selectionChangeSub(event: MatSelectChange): void {
    this.productService.getListCategory(event.value).subscribe(
      res => {
        this.listOtherSubCategory = res.data ? res.data.data : [];
      },
      err => {
        this.listOtherSubCategory = [];
      }
    );
  }
  findInvalidControls() {
    const invalid = [];
    const controls = this.formProductGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

  async submit() {
    if (this.formProductGroup.get('status_pin_up').value != '1') {
      this.formProductGroup.get('start_date_pin_up').clearValidators();
      this.formProductGroup.get('start_date_pin_up').updateValueAndValidity();
      this.formProductGroup.get('end_date_pin_up').clearValidators();
      this.formProductGroup.get('end_date_pin_up').updateValueAndValidity();
    }
    if (this.formProductGroup.get("is_promo_src").value !== true) {
      // this.formProductGroup.get("is_promo_src").disable();
      this.formProductGroup.get("is_promo_src").setValue(false);
    }
    if (this.formProductGroup.get("is_private_label").value !== true) {
      // this.formProductGroup.get("is_private_label").disable();
      this.formProductGroup.get("is_private_label").setValue(false);
    }
    if ((this.formProductGroup.valid && this.files === undefined) || (this.formProductGroup.valid && this.files && this.files.size < 2000000)) {
      this.loadingIndicator = true;

      let aliasChip = this.formProductGroup.get("alias").value.map(item => {
        return item.alias;
      });

      if (this.files) {
        this.dataService.showLoading(true);
        await html2canvas(this.screen.nativeElement, { scale: 3 }).then(canvas => {
          this.imageSkuConverted = this.convertCanvasToImage(canvas);
          this.dataService.showLoading(false);
        });
      }

      let body = {
        name: this.formProductGroup.get("name").value,
        alias: aliasChip,
        image: this.imageSkuConverted,
        brand_id: this.formProductGroup.get("brand").value,
        priority_product: this.formProductGroup.get("priority_product").value,
        category_id: this.formProductGroup.get("subCategory").value ? this.formProductGroup.get("subCategory").value : this.formProductGroup.get("category").value,
        // sub_category_id: this.formProductGroup.get("subCategory").value,
        barcode: this.formProductGroup.get("barcode").value,
        packaging_id: this.formProductGroup.get("packaging").value,
        status: this.formProductGroup.get("status").value,
        is_promo_src: this.formProductGroup.get("is_promo_src").value === true ? "1" : "0",
        is_private_label: this.formProductGroup.get("is_private_label").value === true ? "1" : "0",
        // convertion: this.formProductGroup.get("convertion").value
      };

      let fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("name", body.name);

      if (body.barcode) fd.append("barcode", body.barcode);

      if (this.files) fd.append("image", body.image);

      if (body.is_promo_src === "1") {
        let _areas = [];
        let areas = [];
        let value = this.formProductGroup.getRawValue();

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
          return this.dialogService.openSnackBar({ message: "Terdapat duplikat geotree, mohon periksa kembali data anda!" });
        }

        areas.map((areaItem, i) => {
          fd.append(`areas[${i}][area_id]`, areaItem.value);
          fd.append(`areas[${i}][start_date]`, moment(value.areas[i].start_date).format("YYYY-MM-DD"));
          fd.append(`areas[${i}][end_date]`, moment(value.areas[i].end_date).format("YYYY-MM-DD"));
        })
      }

      fd.append("description", "");
      fd.append("brand_id", body.brand_id);
      fd.append("priority_product", body.priority_product);
      fd.append("category_id", body.category_id);
      // fd.append("sub_category_id", body.sub_category_id);
      fd.append("packaging_id", body.packaging_id);
      fd.append("status", body.status);
      fd.append("is_promo_src", body.is_promo_src);

      if (this.formProductGroup.get('status_pin_up').value && this.formProductGroup.get('status_pin_up').value == 1) {
        fd.append('status_pin_up', this.formProductGroup.get('status_pin_up').value);
        fd.append('start_date_pin_up', moment(this.formProductGroup.get('start_date_pin_up').value).format("YYYY/MM/DD"));
        fd.append('end_date_pin_up', moment(this.formProductGroup.get('end_date_pin_up').value).format("YYYY/MM/DD"));
      }
      fd.append("is_private_label", body.is_private_label);
      // fd.append("convertion", body.convertion);

      body.alias.map(item => {
        fd.append("alias[]", item);
      });

      let priceProducts = []
      if (body.is_private_label == "1") {
        let listProdukPrivateLabel = [];
        let product = this.formProductGroup.getRawValue();
        product.listProdukPrivateLabel.map((item, index) => {
          listProdukPrivateLabel.push({
            packaging: item.packaging,
            packaging_amount: item.packaging_amount,
            price: item.price,
            price_discount: item.price_discount || 0,
            price_discount_expires_at: this.convertDate(item.price_discount_expires_at)
          })
        });

        if (listProdukPrivateLabel.length > 0) {
          listProdukPrivateLabel.map((item, index) => {
            fd.append(`product_prices[${index}][packaging]`, item.packaging);
            fd.append(`product_prices[${index}][packaging_amount]`, item.packaging_amount);
            fd.append(`product_prices[${index}][price]`, item.price);

            if (item.price_discount_expires_at)
              fd.append(`product_prices[${index}][price_discount]`, item.price_discount);
            else
              fd.append(`product_prices[${index}][price_discount]`, '0');

            fd.append(`product_prices[${index}][price_discount_expires_at]`, item.price_discount_expires_at);
          });

          let primaryNamePackaging = this.findDuplicate(listProdukPrivateLabel.map(item => item.packaging.toLowerCase()));
          if (primaryNamePackaging.length > 0) {
            this.dialogService.openSnackBar({ message: `Terdapat nama kemasan yang sama "${primaryNamePackaging}", nama kemasan tidak boleh sama!` });
            this.loadingIndicator = false;

            return;
          }
        } else {
          this.dialogService.openSnackBar({ message: `Kemasan dan Harga Produk belum ditambahkan` });

          return;
        }
      }
      this.dataService.showLoading(true);
      this.productService.put(fd, { product_id: this.idProduct }).subscribe(
        res => {
          this.loadingIndicator = false;
          this.router.navigate(["sku-management", "product"]);
          this.dialogService.openSnackBar({ message: "Data berhasil diubah" });
          this.dataService.showLoading(false);
        },
        err => {
          // this.dialogService.openSnackBar({ message: err.error.message });
          this.loadingIndicator = false;
          this.dataService.showLoading(false);
        }
      );
    } else {
      let msg;
      if (this.formProductGroup.status == "INVALID") {
        console.log('failed,', this.formProductGroup.get('is_promo_src').hasError('required'))
        console.log('failed2,', this.formProductGroup.get('is_private_label').hasError('required'))
        msg = "Silakan lengkapi data terlebih dahulu!";
      } else if (!this.files) {
        msg = "Gambar produk belum dipilih!";
      } else if (this.files.size > 2000000) {
        msg = "Ukuran gambar tidak boleh melebihi 2MB!";
      } else {
        msg = "Silakan lengkapi data terlebih dahulu!";
      }

      this.dialogService.openSnackBar({ message: msg });
      commonFormValidator.validateAllFields(this.formProductGroup);
    }
  }

  removeImage(): void {
    this.files = undefined;
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { "title": "Testing" };

    this.dialogRef = this.dialog.open(ScanBarcodeDialogComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.formProductGroup.get("barcode").setValue(response);
      }
    })
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format("YYYY-MM-DD");
    }

    return "";
  }

  changeImage(evt) {
    this.readThis(evt);
  }

  readThis(inputValue: any): void {
    var file: File = inputValue;
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.imageSku = myReader.result;
    }

    myReader.readAsDataURL(file);
  }

  convertCanvasToImage(canvas) {
    let image = new Image();
    image.src = canvas.toDataURL("image/jpeg");

    return image.src;
  }

  isPromo(event) {
    if (event.checked) {
      this.formProductGroup.get('is_private_label').setValue(false);
      let packaging = this.formProductGroup.get("listProdukPrivateLabel") as FormArray;
      while (packaging.length > 0) {
        packaging.removeAt(packaging.length - 1);
      }
      this.addArea();
      this.goToBottom();
    } else {
      let areas = this.formProductGroup.controls['areas'] as FormArray;
      while (areas.length > 0) {
        areas.removeAt(areas.length - 1);
      }
    }
  }

  getToolTipData(value, array) {
    if (value && array.length) {
      let msg = array.filter(item => item.id === value)[0]['name'];
      return msg;
    } else {
      return "";
    }
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

  isPrivateLabel(event: any) {
    if (event.checked) {
      this.formProductGroup.get('is_promo_src').setValue(false);
      let areas = this.formProductGroup.controls['areas'] as FormArray;
      while (areas.length > 0) {
        areas.removeAt(areas.length - 1);
      }
      this.openProductPrice();
      this.goToBottom();
    } else {
      let packaging = this.formProductGroup.get("listProdukPrivateLabel") as FormArray;
      packaging.reset();
      while (packaging.length > 0) {
        packaging.removeAt(packaging.length - 1);
      }
    }
  }

  goToBottom() {
    setTimeout(() => {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    }, 300);
  }

  jenisProdukChange(event: any) {
    const e = event.value
    if (e == 'promo_src') {
      this.addArea();
    } else {
      let areas = this.formProductGroup.controls['areas'] as FormArray;
      while (areas.length > 0) {
        areas.removeAt(areas.length - 1);
      }
      this.openProductPrice();
    }
    this.goToBottom();
  }

  openProductPrice() {
    let packaging = this.formProductGroup.get("listProdukPrivateLabel") as FormArray;
    packaging = this.formBuilder.array([this.createListPriceProdukPrivateLabel()]);
  }

  addProductPrice() {
    let packaging = this.formProductGroup.get("listProdukPrivateLabel") as FormArray;
    packaging.push(this.createListPriceProdukPrivateLabel());
    this.goToBottom();
  }

  createListPriceProdukPrivateLabel(): FormGroup {
    return this.formBuilder.group({
      packaging: ["", Validators.required],
      packaging_amount: ["", [Validators.required, Validators.min(1), Validators.max(1000)]],
      price: ["", Validators.required],
      price_discount: "",
      price_discount_expires_at: ["", Validators.required],
    })
  }

  removePackaging(param?: any, i?: any): void {
    this.packagingIndex = i;

    let data = {
      titleDialog: "Hapus Data Kemasan",
      captionDialog: `Apakah anda yakin untuk menghapus data Kemasan ${param.value.packaging}?`,
      confirmCallback: this.confirmRemovePackaging.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmRemovePackaging(): void {
    let packaging = this.formProductGroup.get("listProdukPrivateLabel") as FormArray;
    packaging.removeAt(this.packagingIndex);

    this.dialogService.openSnackBar({ message: 'Data Berhasil Dihapus' });
    this.dialogService.brodcastCloseConfirmation();
  }

}
