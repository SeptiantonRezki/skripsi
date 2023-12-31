import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from "@angular/forms";
import { Subject, Observable, ReplaySubject, forkJoin } from "rxjs";

import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogService } from "../../../../services/dialog.service";
import { ProductService } from "../../../../services/sku-management/product.service";
import { commonFormValidator } from "app/classes/commonFormValidator";
import { MatChipInputEvent, MatSelectChange, MatSelect, MatDialogConfig, MatDialog } from "@angular/material";
import { PagesName } from "app/classes/pages-name";

import moment from 'moment';
import { takeUntil } from "rxjs/operators";
import { ScanBarcodeDialogComponent } from "../create/dialog/scan-barcode-dialog.component";
import html2canvas from 'html2canvas';
import { DataService } from "app/services/data.service";
import * as _ from 'underscore';
import { WholesalerService } from "app/services/user-management/wholesaler.service";
import { WholesalerSpecialPriceService } from "app/services/sku-management/wholesaler-special-price.service";
import { LanguagesService } from "app/services/languages/languages.service";
import { TranslateService } from "@ngx-translate/core";

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
  is_promo_src: Boolean = true;
  is_private_label: Boolean = true;
  is_private_label_res: Boolean = true;

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
  wilayahIndex: any;

  files: File;
  validComboDrag: boolean;

  imageSku: any;
  imageSkuConverted: any;
  showLoading: Boolean;

  formProductGroup: FormGroup;
  formProductErrors: any;

  permission: any;
  roles: PagesName = new PagesName();

  keyUp = new Subject<string>();
  statusProduk: any[] = [
    { name: this.translate.instant('global.label.active'), status: "active" },
    { name: this.translate.instant('global.label.inactive'), status: "inactive" }
  ];

  listPinUpProduct: any[] = [
    { name: this.translate.instant('global.label.yes'), value: 1 },
    { name: this.translate.instant('global.label.no'), value: 0 }
  ]
  listTipe: any[] = [
    { name: "Distribusi", value: "Distribusi" },
    { name: "SRO", value: "SRO" },
    { name: "Kanvas", value: "Kanvas" },
  ]
  
  statusUPC: any[] = [
    { name: this.translate.instant('global.label.yes'), status: 1 },
    { name: this.translate.instant('global.label.no'), status: 0 }
  ];

  produkDSD: any[] = [
    { name: this.translate.instant('global.label.yes'), value: 1 },
    { name: this.translate.instant('global.label.no'), value: 0 }
  ];

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

  linkProduct: FormControl = new FormControl();
  productPrices: any;
  selectedWs: any = [];

  SPECIAL_RATE_TAB: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private productService: ProductService,
    private dialog: MatDialog,
    private dataService: DataService,
    private wholesalerSpecialPriceService: WholesalerSpecialPriceService,
    private ls: LanguagesService,
    private translate: TranslateService,
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

    this.permission = this.roles.getRoles('principal.pengaturandsd');

    console.log(this.permission);
    
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
    this.removeRates = this.removeRates.bind(this);
  }

  generateLink() {
    this.dataService.showLoading(true);
    console.log("this.detail", this.detailProduct.id);
    this.productService.generateLink({ id: this.detailProduct.id }).subscribe(res => {
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({ message: this.translate.instant('manajemen_barang_sku.produk.success_generate_link') });
      this.getDetails();
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  copyMessage(linkMisi: any) {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (linkMisi));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
    this.dialogService.openSnackBar({ message: this.translate.instant('manajemen_barang_sku.produk.success_copy_link') });
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
  }

  getDetails() {
    try {
      this.productService.getdetail(this.idProduct).subscribe(async (res) => {
        console.log({res});
        this.detailProduct = res.data;

        let alias = this.formProductGroup.get("alias") as FormArray;
        while (alias.length > 0) {
          alias.removeAt(alias.length - 1);
        }

        if (res.data.alias) {
          (res.data.alias).map(item => {
            alias.push(this.formBuilder.group({ alias: item.trim() }));
          });
        }

        this.formProductGroup.get("code").setValue(res.data.code);
        this.formProductGroup.get("name").setValue(res.data.name);
        this.formProductGroup.get("barcode").setValue(res.data.barcode);
        this.formProductGroup.get("brand").setValue(res.data.brand_id);
        this.formProductGroup.get("packaging").setValue(res.data.packaging_id);
        this.formProductGroup.get("status").setValue(res.data.status);
        this.formProductGroup.get("is_product_dsd").setValue(res.data.is_product_dsd);
        this.formProductGroup.get("upc").setValue(res.data.upc);
        this.formProductGroup.get("priority_product").setValue(res.data.priority_product);
        this.formProductGroup.get("is_promo_src").setValue(res.data.is_promo_src === 1 ? true : false);
        this.formProductGroup.get("is_paylater").setValue(res.data.is_paylater === 1 ? true : false);
        this.formProductGroup.get("description").setValue(res.data.description);
        this.formProductGroup.get("product_desc").setValue(res.data.product_desc);
        this.formProductGroup.get("product_conversion_rule").setValue(res.data.product_conversion_rule);
        if (res && res.data.status_pin_up) {
          this.formProductGroup.get('status_pin_up').setValue(res.data.status_pin_up);
          if (res.data.start_date_pin_up) this.formProductGroup.get('start_date_pin_up').setValue(new Date(res.data.start_date_pin_up));
          if (res.data.end_date_pin_up) this.formProductGroup.get('end_date_pin_up').setValue(new Date(res.data.end_date_pin_up));
        }
        this.is_private_label_res = res.data.is_private_label_editable;
        this.formProductGroup.get("is_private_label").setValue(res.data.is_private_label === 1 ? true : false);
        console.log(this.formProductGroup);
        if (res.data.category.parent_id) {
          this.formProductGroup.get("category").setValue(res.data.category_all[0]);
          this.selectionChange();

          this.formProductGroup.get("subCategory").setValue(res.data.category_all[1]);
        } else {
          this.formProductGroup.get("category").setValue(res.data.category_id);
        }

        if (res.data.is_promo_src === 1) {
          for (const { val, index } of this.detailProduct.areas.map((val, index) => ({ val, index }))) {
            console.log('hitted me');
            const response = await this.productService.getParentArea({ parent: val.area_id }).toPromise();
            let wilayah = this.formProductGroup.controls['areas'] as FormArray;

            let product_pricesOnPS = [];
            if (res.data.is_private_label === 1 && res.data.product_prices && res.data.product_prices[index]) {
              product_pricesOnPS = res.data.product_prices[index].filter(pps => pps.area_id == val.area_id)
              console.log("product_pricess on PS", product_pricesOnPS);
            }

            let fb = this.formBuilder.group({
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
              end_date: [val.end_edate !== null ? val.end_date : ""],
              listProdukPrivateLabel: product_pricesOnPS.length > 0 ? this.formBuilder.array(product_pricesOnPS.map(item => {
                let fbPL = this.formBuilder.group({
                  packaging: [item.packaging, Validators.required],
                  packaging_amount: [Number(item.packaging_amount), [Validators.required, Validators.min(1), Validators.max(1000)]],
                  price: [Number(item.price), Validators.required],
                  price_discount: [Number(item.price_discount), Validators.required],
                  price_discount_expires_at: [{ value: item.price_discount_expires_at ? moment(item.price_discount_expires_at) : "", disabled: item.price_discount_expires_at ? false : true }, Validators.required],
                  tipe: [item.price_type]
                });
                return fbPL;
              }
              )) : this.formBuilder.array([])
            });

            fb.controls['listProdukPrivateLabel'].valueChanges.debounceTime(300).subscribe(res => {
              let listProdukPrivateLabel = fb.get('listProdukPrivateLabel') as FormArray;
              (res || []).map((item, index) => {
                if (item.price) {
                  listProdukPrivateLabel.at(index).get('price_discount').setValidators([Validators.max(item.price - 1)]);
                  listProdukPrivateLabel.at(index).get('price_discount').updateValueAndValidity();
                }

                if (item.price_discount) {
                  listProdukPrivateLabel.at(index).get('price_discount_expires_at').enable();
                } else {
                  listProdukPrivateLabel.at(index).get('price_discount_expires_at').reset();
                  listProdukPrivateLabel.at(index).get('price_discount_expires_at').disable();
                }
              })
            });


            wilayah.push(fb);

            this.initArea(index);
            await this.initFormGroup(response, index);

            if (this.detailProduct.areas.length === (index + 1)) {
              this.onLoad = false;
            }
          }
        }

        // if (this.detailProduct.areas.length === 0) {
        //   this.addArea();
        // }

        if (res.data.is_private_label === 1 && res.data.product_prices !== null) {
          let productPrices = res.data.product_prices;
          this.productPrices = res.data.product_prices;
          this.forkGetParentArea(productPrices).subscribe(areaResponse => {
            productPrices.map(async (key, index) => {
              // const response = await this.productService.getParentArea({ parent: key[0] && key[0].area_id ? key[0].area_id : "1" }).toPromise();
              let wilayah = this.formProductGroup.controls['areas'] as FormArray;

              let fb = this.formBuilder.group({
                national: [this.getArea(areaResponse[index], 'national'), Validators.required],
                zone: [this.getArea(areaResponse[index], 'division')],
                region: [this.getArea(areaResponse[index], 'region')],
                area: [this.getArea(areaResponse[index], 'area')],
                salespoint: [this.getArea(areaResponse[index], 'salespoint')],
                district: [this.getArea(areaResponse[index], 'district')],
                territory: [this.getArea(areaResponse[index], 'teritory')],
                list_national: this.formBuilder.array(this.listLevelArea),
                list_zone: this.formBuilder.array([]),
                list_region: this.formBuilder.array([]),
                list_area: this.formBuilder.array([]),
                list_salespoint: this.formBuilder.array([]),
                list_district: this.formBuilder.array([]),
                list_territory: this.formBuilder.array([]),
                time_period: [false],
                start_date: [""],
                end_date: [""],
                listProdukPrivateLabel: this.formBuilder.array(key.map(item => this.formBuilder.group({
                  packaging: [item.packaging, Validators.required],
                  packaging_amount: [Number(item.packaging_amount), [Validators.required, Validators.min(1), Validators.max(1000)]],
                  price: [Number(item.price), Validators.required],
                  price_discount: [Number(item.price_discount), Validators.required],
                  price_discount_expires_at: [{ value: item.price_discount_expires_at ? moment(item.price_discount_expires_at) : "", disabled: item.price_discount_expires_at ? false : true }, Validators.required],
                  tipe: [item.price_type]
                })))
              });

              fb.controls['listProdukPrivateLabel'].valueChanges.debounceTime(300).subscribe(res => {
                let listProdukPrivateLabel = fb.get('listProdukPrivateLabel') as FormArray;
                (res || []).map((item, index) => {
                  if (item.price) {
                    listProdukPrivateLabel.at(index).get('price_discount').setValidators([Validators.max(item.price - 1)]);
                    listProdukPrivateLabel.at(index).get('price_discount').updateValueAndValidity();
                  }

                  if (item.price_discount) {
                    listProdukPrivateLabel.at(index).get('price_discount_expires_at').enable();
                  } else {
                    listProdukPrivateLabel.at(index).get('price_discount_expires_at').reset();
                    listProdukPrivateLabel.at(index).get('price_discount_expires_at').disable();
                  }
                })
              });

              if (res.data.is_promo_src === 1 && wilayah.length === 1 && (res.data.areas.length > 0 && res.data.areas[0]['area_id'] === Number(key[0]['area_id']))) {
                console.log("skip private label", res.data.is_promo_src, wilayah.length, index)
              } else {
                fb.get('national').disable()
                wilayah.push(fb);
                // this.initArea(index);
                this.initFormGroup(areaResponse[index], index);
                console.log('wilayah yang didapat pas else', wilayah);
              }

              setTimeout(() => {
                if (wilayah.length === (index + 1)) {
                  this.onLoad = false;
                }
              }, 500);
            });
          })
          if (Array.isArray(productPrices) && productPrices.length === 0) {
            this.addArea();
          }

          this.initSpecialRates(res);
        }

        setTimeout(() => {
          this.onLoad = false;
        }, 1500);

        if (this.isDetail) this.formProductGroup.disable();
        if (this.ls.selectedLanguages == 'km'){
          this.isDetail = true;
          this.formProductGroup.disable();
          this.formProductGroup.get("subCategory").enable();
          this.formProductGroup.get("category").enable();
          this.formProductGroup.get("upc").enable();
        }
      })
    } catch (ex) {
      console.log('ex', ex);
    }
  }

  initSpecialRates({data}) {
    const specialRate = this.formProductGroup.get('special_rate');
    let selectedWs = [];
    if (data.special_rate && data.special_rate.rates.length > 0) {
      
      const {special_rate} = data;
      const rates = specialRate.get('rates') as FormArray;
      special_rate.rates.map( ({id, type, panels, panels_count, prices}, rateIndex) => {
        selectedWs = selectedWs.concat(panels);
        const rate = this.formBuilder.group({

          id: [id],
          type: [type],
          panels: [panels],
          panels_count: [panels_count],
          prices: this.formBuilder.array([
          ]),
          expanded_mitra: false
        });
        rates.push(rate);

        const _prices = rates.at(rateIndex).get('prices') as FormArray;

        prices.map(({qty, price, price_discount, price_discount_expires_at, delivery_cost}, i) => {

            _prices.push(
              this.formBuilder.group({
                qty: [qty],
                price: [price],
                price_discount: [price_discount],
                price_discount_expires_at: [moment(price_discount_expires_at)],
                delivery_cost: [delivery_cost],
              })
            )
            if (parseInt(price)) {
              _prices.at(i).get('price_discount').setValidators([Validators.max(price.price - 1)]);
              _prices.at(i).get('price_discount').updateValueAndValidity();
            }
            if (parseInt(price_discount)) {
              _prices.at(i).get('price_discount_expires_at').enable();
              _prices.at(i).get('price_discount_expires_at').setValidators([Validators.required]);
            } else {
              _prices.at(i).get('price_discount_expires_at').reset();
              _prices.at(i).get('price_discount_expires_at').disable();
            }
        })

      })

    } else {
      const rates = specialRate.get('rates') as FormArray;
      const rate = this.formBuilder.group({

        id: [null],
        type: [''],
        panels: [[]],
        // except: [],
        panels_count: [0],
        prices: this.formBuilder.array([
          this.formBuilder.group({
            qty: [0],
            price: [0],
            price_discount: [0],
            price_discount_expires_at: [null],
            delivery_cost: [0],
          })
        ]),
        expanded_mitra: false
      });
      // rates.push(rate);

    }
    specialRate.get('rates').valueChanges.debounceTime(300).subscribe(res => {
      const sr = this.formProductGroup.get('special_rate');
      let _rates = sr.get('rates') as FormArray;
      (res || []).map( (item, index) => {
        let _prices = _rates.at(index).get('prices') as FormArray;

        (item.prices || []).map((price, priceIndex) => {
          if (price.price) {
            _prices.at(priceIndex).get('price_discount').setValidators([Validators.max(price.price - 1)]);
            _prices.at(priceIndex).get('price_discount').updateValueAndValidity();
          }
          if (price.price_discount) {
            _prices.at(priceIndex).get('price_discount_expires_at').enable();
          } else {
            _prices.at(priceIndex).get('price_discount_expires_at').reset();
            _prices.at(priceIndex).get('price_discount_expires_at').disable();
          }
        });

      })
    });
    this.selectedWs = selectedWs;
    
  }
  getSmallestPackage() {
    
  }
  forkGetParentArea(areas) {
    let requests = []
    areas.map(area => {
      requests.push(this.productService.getParentArea({ parent: area[0] && area[0].area_id && area[0].area_id != '-99' ? area[0].area_id : "1" }))
    });

    return forkJoin(requests)
  }

  createArea(): FormGroup {
    let fb = this.formBuilder.group({
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
      end_date: [""],
      listProdukPrivateLabel: this.formBuilder.array([])
    });

    fb.controls['listProdukPrivateLabel'].valueChanges.debounceTime(300).subscribe(res => {
      let listProdukPrivateLabel = fb.get('listProdukPrivateLabel') as FormArray;
      (res || []).map((item, index) => {
        if (item.price) {
          listProdukPrivateLabel.at(index).get('price_discount').setValidators([Validators.max(item.price - 1)]);
          listProdukPrivateLabel.at(index).get('price_discount').updateValueAndValidity();
        }

        if (item.price_discount) {
          listProdukPrivateLabel.at(index).get('price_discount_expires_at').enable();
        } else {
          listProdukPrivateLabel.at(index).get('price_discount_expires_at').reset();
          listProdukPrivateLabel.at(index).get('price_discount_expires_at').disable();
        }
      })
    });

    return fb;
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
      titleDialog: this.translate.instant('global.messages.delete_data', {entity: this.translate.instant('global.label.area.geotree')}),
      captionDialog: this.translate.instant('global.messages.delete_confirm', {
        entity: this.translate.instant('global.label.area.geotree'),
        index: idx+1
      }),
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel')]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }
  addSpecialRatePrices(item, priceIndex, rateIndex) {

    const specialRate = this.formProductGroup.get('special_rate');

    const rates = specialRate.get('rates') as FormArray;
    const prices = rates.at(rateIndex).get('prices') as FormArray;
    prices.push(
      this.formBuilder.group({
        qty: [0],
        price: [0],
        price_discount: [0],
        price_discount_expires_at: [null],
        delivery_cost: [0],
      })
    )
  }
  removeSpecialRatePrices(item, priceIndex, rateIndex) {

    const specialRate = this.formProductGroup.get('special_rate');

    const rates = specialRate.get('rates') as FormArray;
    const prices = rates.at(rateIndex).get('prices') as FormArray;
    prices.removeAt(priceIndex);
  }
  addRates(i) {

    const specialRate = this.formProductGroup.get('special_rate');
    const rates = specialRate.get('rates') as FormArray;
    const rate = this.formBuilder.group({
      id: [null],
      type: [''],
      panels: [[]],
      except: [[]],
      panels_count: [0],
      prices: this.formBuilder.array([
        this.formBuilder.group({
          qty: [0],
          price: [0],
          price_discount: [0],
          price_discount_expires_at: [null],
          delivery_cost: [0],
        })
      ]),
      expanded_mitra: false
    })
    rates.push(rate);
  }
  removeRates(i, confirmed = false) {
    if (confirmed) {
      // do deleted
      const specialRate = this.formProductGroup.get('special_rate');
      const rates = specialRate.get('rates') as FormArray;
      rates.removeAt(i);
      this.dialogService.brodcastCloseConfirmation();
      console.log('confirmed');
      return;
    }
    else {

      let data = {
        
        titleDialog: this.translate.instant('global.messages.delete_data', {entity: this.translate.instant('manajemen_barang_sku.produk.special_rate')}), 
        captionDialog: this.translate.instant('global.messages.delete_confirm', {
          entity: this.translate.instant('manajemen_barang_sku.produk.special_rate'),
          index: i+1
        }),
        confirmCallback: () => { this.removeRates(i, true)},
        buttonText: [this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel')]
      }
      this.dialogService.openCustomConfirmationDialog(data);
      return;
    }
  }

  initArea(index) {
    let wilayah = this.formProductGroup.controls['areas'] as FormArray;
    console.log("[initArea]", index, wilayah)
    wilayah.at(index).get('national').disable();
    // this.areaFromLogin.map(item => {
    //   switch (item.type.trim()) {
    //     case 'national':
    //       console.log("ada gak cuk", wilayah.at(index), index, wilayah)
    //       wilayah.at(index).get('national').disable();
    //       break
    //     case 'division':
    //       // wilayah.at(index).get('zone').disable();
    //       break;
    //     case 'region':
    //       // wilayah.at(index).get('region').disable();
    //       break;
    //     case 'area':
    //       // wilayah.at(index).get('area').disable();
    //       break;
    //     case 'salespoint':
    //       // wilayah.at(index).get('salespoint').disable();
    //       break;
    //     case 'district':
    //       // wilayah.at(index).get('district').disable();
    //       break;
    //     case 'territory':
    //       // wilayah.at(index).get('territory').disable();
    //       break;
    //   }
    // })
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
    console.log('sdasdqwedwsdbjnDWv', selection, id, index);
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
        console.log('item zone', item);
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
      code: [""],
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
      special_rate: this.formBuilder.group({
        smallest_package: [''],
        rates: this.formBuilder.array([]),
      }),
      start_date_pin_up: [""],
      end_date_pin_up: [""],
      status_pin_up: [""],
      priority_product: [""],
      // convertion: ["", [Validators.min(0)]]
      is_private_label: [false],
      is_paylater: [false],
      listProdukPrivateLabel: this.formBuilder.array([]),
      upc: [0, Validators.required],
      description: [""],
      product_desc: [""],
      product_conversion_rule: [""],
      is_product_dsd: ["0"],
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
    this.formProductGroup.get("subCategory").setValue("");

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
    // console.log(this.formProductGroup);
    // return;
    if (!this.formProductGroup.get('is_private_label').value && !this.is_private_label_res) {
      this.dialogService.openSnackBar({ message: this.translate.instant('manajemen_barang_sku.produk.isolated_partner') });
    } else {
      if (!this.is_promo_src) {
        let areas = this.formProductGroup.controls['areas'] as FormArray;
        while (areas.length > 0) {
          areas.removeAt(areas.length - 1);
        }
      }
      if (!this.is_private_label) {
        let packaging = this.formProductGroup.get("listProdukPrivateLabel") as FormArray;
        packaging.reset();
        while (packaging.length > 0) {
          packaging.removeAt(packaging.length - 1);
        }
      }
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
          code: (this.formProductGroup.get("code").value === null || this.formProductGroup.get("code").value === 'null')? "" : this.formProductGroup.get("code").value,
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
          is_product_dsd: this.formProductGroup.get("is_product_dsd").value,
          is_promo_src: this.formProductGroup.get("is_promo_src").value === true ? "1" : "0",
          is_private_label: this.formProductGroup.get("is_private_label").value === true ? "1" : "0",
          is_paylater: this.formProductGroup.get("is_paylater").value === true ? "1" : "0",
          upc: this.formProductGroup.get("upc").value,
          description: (this.formProductGroup.get("description").value === null || this.formProductGroup.get("description").value === 'null')? "" : this.formProductGroup.get("description").value,
          product_desc: (this.formProductGroup.get("product_desc").value === null || this.formProductGroup.get("product_desc").value === 'null')? "" : this.formProductGroup.get("product_desc").value,
          product_conversion_rule: (this.formProductGroup.get("product_conversion_rule").value === null || this.formProductGroup.get("product_conversion_rule").value === 'null')? "" : this.formProductGroup.get("product_conversion_rule").value,
        };

        let fd = new FormData();
        fd.append("_method", "PUT");
        fd.append("code", body.code);
        fd.append("name", body.name);
        fd.append("upc", body.upc);
        fd.append("description", body.description);
        fd.append("product_desc", body.product_desc);
        fd.append("product_conversion_rule", body.product_conversion_rule);

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
            return this.dialogService.openSnackBar({ message: this.translate.instant('global.label.duplicate_data', {
                entity: this.translate.instant('global.area.geotree')
              })
            });
          }

          areas.map((areaItem, i) => {
            if (i === 0) {
              fd.append(`areas[${i}][area_id]`, areaItem.value);
              fd.append(`areas[${i}][start_date]`, moment(value.areas[i].start_date).format("YYYY-MM-DD"));
              fd.append(`areas[${i}][end_date]`, moment(value.areas[i].end_date).format("YYYY-MM-DD"));
            }
          });
        }

        fd.append("brand_id", body.brand_id);
        fd.append("priority_product", body.priority_product);
        fd.append("category_id", body.category_id);
        // fd.append("sub_category_id", body.sub_category_id);
        fd.append("packaging_id", body.packaging_id);
        fd.append("status", body.status);
        fd.append("is_product_dsd", body.is_product_dsd);
        fd.append("is_promo_src", body.is_promo_src);
        fd.append("is_paylater", body.is_paylater);

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

        let priceProducts = [];
        if (body.is_private_label == "1") {
          let listProdukPrivateLabel = [];
          let productGroup = this.formProductGroup.getRawValue();
          let productAreas = productGroup.areas;
          let _areas = [];
          let areas = [];

          let is_error = false;

          productAreas.map((product, idx) => {
            let obj = Object.entries(product).map(([key, value]) => ({ key, value }))
            for (const val of this.typeArea) {
              const filteredValue = obj.filter(xyz => val === xyz.key && xyz.value);
              if (filteredValue.length > 0) _areas.push(...filteredValue)
            }
            let areaId = _.last(_areas);

            areas.push(_.last(_areas));
            _areas = [];
            let same = this.findDuplicate(areas.map(item => item.value));
            if (same.length > 0) {
              return this.dialogService.openSnackBar({ message: this.translate.instant('global.label.duplicate_data', {
                  entity: this.translate.instant('global.area.geotree')
                })
              });
            }

            product.listProdukPrivateLabel.map((itemPL, index) => {
              listProdukPrivateLabel.push({
                packaging: itemPL.packaging,
                packaging_amount: itemPL.packaging_amount,
                price: itemPL.price,
                price_discount: itemPL.price_discount != 0 || itemPL.price_discount != '' ? itemPL.price_discount : 0,
                price_discount_expires_at: this.convertDate(itemPL.price_discount_expires_at),
                tipe: itemPL.tipe
              });

              fd.append(`product_prices[${listProdukPrivateLabel.length === 1 ? 0 : listProdukPrivateLabel.length + 1}][packaging]`, itemPL.packaging);
              fd.append(`product_prices[${listProdukPrivateLabel.length === 1 ? 0 : listProdukPrivateLabel.length + 1}][packaging_amount]`, itemPL.packaging_amount);
              fd.append(`product_prices[${listProdukPrivateLabel.length === 1 ? 0 : listProdukPrivateLabel.length + 1}][price]`, itemPL.price);
              fd.append(`product_prices[${listProdukPrivateLabel.length === 1 ? 0 : listProdukPrivateLabel.length + 1}][area_id]`, areaId && areaId.value ? areaId.value : 1);

              console.log('pdea', itemPL);
              if (itemPL.price_discount_expires_at)
                fd.append(`product_prices[${listProdukPrivateLabel.length === 1 ? 0 : listProdukPrivateLabel.length + 1}][price_discount]`, itemPL.price_discount);
              else
                fd.append(`product_prices[${listProdukPrivateLabel.length === 1 ? 0 : listProdukPrivateLabel.length + 1}][price_discount]`, "0");

              fd.append(`product_prices[${listProdukPrivateLabel.length === 1 ? 0 : listProdukPrivateLabel.length + 1}][price_discount_expires_at]`, itemPL.price_discount_expires_at ? itemPL.price_discount_expires_at : "");
              fd.append(`product_prices[${listProdukPrivateLabel.length === 1 ? 0 : listProdukPrivateLabel.length + 1}][price_type]`, itemPL.tipe);
            });

            if (body.is_product_dsd == "1" && listProdukPrivateLabel.length == 0){
              alert("Harga kanvas harus ada karena produk DSD");
              is_error = true;
              return;
            } else if (body.is_product_dsd == "1" && listProdukPrivateLabel.length > 0){
              let jumlah_kanvas = 0;
              let list_type = listProdukPrivateLabel.map(item => item.tipe);

              (listProdukPrivateLabel.map(item => item.tipe)).forEach(function (tipe) {
                if (tipe == "Kanvas"){
                  jumlah_kanvas++;
                }
              });

              if (jumlah_kanvas < 1){
                alert("Harga kanvas harus ada karena produk DSD");
                is_error = true;
                return;
              }
            } 

            if (listProdukPrivateLabel.length > 0) {
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
          });

          if(is_error){
            return;
          }

          const rates = this.formProductGroup.get('special_rate')['controls']['rates'].getRawValue();


          rates.map((rate, index) => {
            fd.append(`special_rates[${index}][type]`, rate.type);
            rate.panels.map((panel, panelIndex) => {
              fd.append(`special_rates[${index}][panels][${panelIndex}]`, panel);
            })
            rate.prices.map((price, priceIndex) => {
              fd.append(`special_rates[${index}][rates][${priceIndex}][qty]`, price.qty);
              fd.append(`special_rates[${index}][rates][${priceIndex}][price]`, price.price);
              fd.append(`special_rates[${index}][rates][${priceIndex}][price_discount]`, price.price_discount);
              fd.append(`special_rates[${index}][rates][${priceIndex}][price_discount_expires_at]`, this.convertDate(price.price_discount_expires_at));
              fd.append(`special_rates[${index}][rates][${priceIndex}][delivery_cost]`, price.delivery_cost);

            })
          })
          // console.log({rates});
        }
        this.dataService.showLoading(true);
        this.productService.put(fd, { product_id: this.idProduct }).subscribe(
          res => {
            this.loadingIndicator = false;
            this.router.navigate(["sku-management", "product"]);
            this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text2') });
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
          msg = this.translate.instant('global.label.please_complete_data');
        } else if (!this.files) {
          msg = this.translate.instant('global.label.no_selected_image', {
            type: this.translate.instant('global.label.product')
          });
        } else if (this.files.size > 2000000) {
          msg = this.translate.instant('global.label.max_image_size_data', {size: '200mb!'});;
        } else {
          msg = this.translate.instant('global.label.please_complete_data');
        }

        this.dialogService.openSnackBar({ message: msg });
        commonFormValidator.validateAllFields(this.formProductGroup);
      }
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
      let areas = this.formProductGroup.controls['areas'] as FormArray;
      if (areas.length === 0) {
        while (areas.length > 0) {
          areas.removeAt(areas.length - 1);
        }
        // this.formProductGroup.get('is_private_label').setValue(false);
        this.addArea();
        this.goToBottom();
      }

      if (this.detailProduct.is_promo_src === 1) {
        while (areas.length > 0) {
          areas.removeAt(areas.length - 1);
        }
        this.getDetails();
      }
    } else {
      let areas = this.formProductGroup.controls['areas'] as FormArray;
      if (areas.length > 0) {
        this.is_promo_src = true;
      } else {
        this.addArea();
      }
      if (!this.formProductGroup.get("is_private_label").value) {
        while (areas.length > 0) {
          areas.removeAt(areas.length - 1);
        }
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
      // this.formProductGroup.get('is_promo_src').setValue(false);
      let areas = this.formProductGroup.controls['areas'] as FormArray;
      if (areas.length === 0) {
        while (areas.length > 0) {
          areas.removeAt(areas.length - 1);
        }
        // this.openProductPrice();
        this.addArea();
        this.goToBottom();
      }
      if (this.detailProduct.is_private_label === 1) {
        while (areas.length > 0) {
          areas.removeAt(areas.length - 1);
        }
        this.getDetails();
      }
    } else {
      let areas = this.formProductGroup.controls['areas'] as FormArray;
      if (!this.formProductGroup.get('is_promo_src').value) {
        while (areas.length > 0) {
          areas.removeAt(areas.length - 1);
        }
      }

      if (this.formProductGroup.get('is_promo_src').value) {
        while (areas.length > 1) {
          areas.removeAt(areas.length - 1);
        }
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

  addProductPrice(i) {
    let wilayah = this.formProductGroup.controls['areas'] as FormArray;
    let packaging = wilayah.at(i).get('listProdukPrivateLabel') as FormArray;
    // let packaging = this.formProductGroup.get("listProdukPrivateLabel") as FormArray;
    packaging.push(this.createListPriceProdukPrivateLabel());
    this.goToBottom();
  }

  createListPriceProdukPrivateLabel(): FormGroup {
    return this.formBuilder.group({
      packaging: ["", Validators.required],
      packaging_amount: ["", [Validators.required, Validators.min(1), Validators.max(1000)]],
      price: ["", Validators.required],
      price_discount: [""],
      price_discount_expires_at: ["", Validators.required],
      tipe: [""]
    })
  }

  removePackaging(param?: any, i?: any, j?: any): void {
    this.packagingIndex = i;
    this.wilayahIndex = j;

    let data = {
      titleDialog: this.translate.instant('global.messages.delete_data', {
        entity: this.translate.instant('manajemen_barang_sku.produk.packaging')
      }),
      captionDialog: this.translate.instant('global.messages.delete_confirm', {
        entity: this.translate.instant('manajemen_barang_sku.produk.packaging') + " " + param.value.packaging
      }),
      confirmCallback: this.confirmRemovePackaging.bind(this),
      buttonText: [this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel')]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmRemovePackaging(): void {
    let wilayah = this.formProductGroup.controls['areas'] as FormArray;
    let packaging = wilayah.at(this.wilayahIndex).get('listProdukPrivateLabel') as FormArray;
    packaging.removeAt(this.packagingIndex);

    this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text1') });
    this.dialogService.brodcastCloseConfirmation();
  }

  onSelectedWs(index, event) {
    console.log({event});
    const specialRate = this.formProductGroup.get('special_rate') as FormGroup;
    const rates = specialRate.get('rates') as FormArray;
    const currentSelectedWs = _.pluck(event, 'id');
    const rate = rates.at(index) as FormGroup;
    rate.get('panels').setValue(currentSelectedWs);
    rate.get('panels_count').setValue(currentSelectedWs.length);

    this.filterAllSelectedWs();
  
    console.log({currentSelectedWs});

    console.log({rate});
    console.log({index, event});
  }
  filterAllSelectedWs() {
    const specialRate = this.formProductGroup.get('special_rate') as FormGroup;
    const rates = specialRate.get('rates') as FormArray;
    const allPanels = _.flatten(_.pluck(rates.value, 'panels'));
    this.selectedWs = allPanels;
  }

  getExceptId(rateIndex) {
    const specialRate = this.formProductGroup.get('special_rate') as FormGroup;
    const rates = specialRate.get('rates') as FormArray;
    const rate = rates.at(rateIndex);
    console.log({rates, rate});
    console.log({rateIndex});

    return 1;
  }
  onOpenListMitra(rateIndex) {
    const specialRate = this.formProductGroup.get('special_rate') as FormGroup;
    const rates = specialRate.get('rates') as FormArray;
    const rate = rates.at(rateIndex);
    // const except = rate.get('except');
    // console.log({rateIndex, except});
  }
  toggleListMitra(expanded, index) {
    console.log({expanded});
    const form = this.formProductGroup.get('special_rate');
    const rates = form.get('rates') as FormArray;
    const allExpanded = _.pluck(rates.value, 'expanded_mitra');

    const nextVal = !expanded;
    if (nextVal && allExpanded.includes(true)) {
      this.dialogService.openSnackBar({ message: "Ada mitra yang belum tersimpan!" });
      return;
    }

    const rate = rates.at(index);
    rate.get('expanded_mitra').setValue(!expanded);
    rate.updateValueAndValidity();
  }
  onTabChanged(event) {
    const areas = this.formProductGroup.get('areas') as FormArray;
    const pl = areas.at(0).get('listProdukPrivateLabel') as FormArray;
    const sorted = _.sortBy(pl.value, 'packaging_amount');
    const specialRate = this.formProductGroup.get('special_rate');
    specialRate.get('smallest_package').setValue(sorted[0].packaging);

  }

}
