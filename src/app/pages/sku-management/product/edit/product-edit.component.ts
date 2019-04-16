import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from "@angular/forms";
import { Subject, Observable, ReplaySubject } from "rxjs";

import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogService } from "../../../../services/dialog.service";
import { ProductService } from "../../../../services/sku-management/product.service";
import { commonFormValidator } from "app/classes/commonFormValidator";
import { MatChipInputEvent, MatSelectChange, MatSelect, MatDialogConfig, MatDialog } from "@angular/material";

import * as moment from "moment";
import { takeUntil } from "rxjs/operators";
import { ScanBarcodeDialogComponent } from "../create/dialog/scan-barcode-dialog.component";
import * as html2canvas from 'html2canvas';
import { DataService } from "app/services/data.service";
import * as _ from 'underscore';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss']
})
export class ProductEditComponent {

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

    activatedRoute.url.subscribe(params => {
      this.idProduct = params[2].path;
      this.isDetail = params[1].path === 'detail' ? true : false;
    })

    this.listBrand = this.activatedRoute.snapshot.data["listBrand"].data;
    this.listCategory = this.activatedRoute.snapshot.data["listCategory"].data;
    this.listPackaging = this.activatedRoute.snapshot.data["listPackaging"].data;
    this.areaFromLogin = this.dataService.getFromStorage('profile')['area_type'];

    this.filteredCategory.next(this.listCategory.slice());
    this.filteredBrand.next(this.listBrand.slice());
    this.filteredSubCategory.next(this.listSubCategory.slice());

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
        "name": "Sales National"
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

  ngOnInit() {
    this.createFormGroup();

    this.formProductGroup.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.formProductGroup,
        this.formProductErrors
      );
    });

    this.getDetails();

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
    this.productService.getdetail(this.idProduct).subscribe(async (res) => {
      this.detailProduct = res;

      let alias = this.formProductGroup.get("alias") as FormArray;
      if (res.alias) {
        (res.alias).map(item => {
          alias.push(this.formBuilder.group({ alias: item.trim() }));
        });
      }

      this.formProductGroup.get("name").setValue(res.name);
      this.formProductGroup.get("barcode").setValue(res.barcode);
      this.formProductGroup.get("brand").setValue(res.brand_id);
      this.formProductGroup.get("packaging").setValue(res.packaging_id);
      this.formProductGroup.get("status").setValue(res.status);
      this.formProductGroup.get("is_promo_src").setValue(res.is_promo_src === 1 ? true : false);

      if (res.category.parent_id) {
        this.formProductGroup.get("category").setValue(res.category_all[0]);
        this.selectionChange();

        this.formProductGroup.get("subCategory").setValue(res.category_all[1]);
      } else {
        this.formProductGroup.get("category").setValue(res.category_id);
      }

      for (const {val, index} of this.detailProduct.areas.map((val, index) => ({ val, index }))) {
        const response = await this.productService.getParentArea({ parent: val }).toPromise();
        let wilayah = this.formProductGroup.controls['areas'] as FormArray;
  
        wilayah.push(this.formBuilder.group({
          national: [this.getArea(response, 'national'), Validators.required],
          zone: [this.getArea(response, 'division'), Validators.required],
          region: [this.getArea(response, 'region'), Validators.required],
          area: [this.getArea(response, 'area'), Validators.required],
          salespoint: [this.getArea(response, 'salespoint'), Validators.required],
          district: [this.getArea(response, 'district'), Validators.required],
          territory: [this.getArea(response, 'teritory'), Validators.required],
          list_national: this.formBuilder.array(this.listLevelArea),
          list_zone: this.formBuilder.array([]),
          list_region: this.formBuilder.array([]),
          list_area: this.formBuilder.array([]),
          list_salespoint: this.formBuilder.array([]),
          list_district: this.formBuilder.array([]),
          list_territory: this.formBuilder.array([])
        }))
  
        this.initArea(index);
        this.initFormGroup(response, index);
  
        if (this.detailProduct.areas.length === (index+1)) {
          this.onLoad = false;
        }
      }

      // if (this.detailProduct.areas.length === 0) {
      //   this.addArea();
      // }

      setTimeout(() => {
        this.onLoad = false;  
      }, 500);

      if (this.isDetail) this.formProductGroup.disable();
      
    })
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
      list_territory: this.formBuilder.array([])
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
      captionDialog: `Apakah anda yakin untuk menghapus Geotree ${idx+1} ?`,
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }
  
  initArea(index) {
    let wilayah = this.formProductGroup.controls['areas'] as FormArray;
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
      this.generataList(level_desc, item.id, index, 'render');
    });
  }

  async generataList(selection, id, index, type) {
    let item: any;
    let wilayah = this.formProductGroup.controls['areas'] as FormArray;
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
            wilayah.at(index).get('region').setValue(null);
            wilayah.at(index).get('area').setValue('');
            wilayah.at(index).get('salespoint').setValue('');
            wilayah.at(index).get('district').setValue('');
            wilayah.at(index).get('territory').setValue('');

            this.clearFormArray(wilayah.at(index).get('list_region') as FormArray);
            this.clearFormArray(wilayah.at(index).get('list_area') as FormArray);
            this.clearFormArray(wilayah.at(index).get('list_salespoint') as FormArray);
            this.clearFormArray(wilayah.at(index).get('list_district') as FormArray);
            this.clearFormArray(wilayah.at(index).get('list_territory') as FormArray);
          }
        break;
      case 'region':
          item = wilayah.at(index).get('list_zone').value.length > 0 ? wilayah.at(index).get('list_zone').value.filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            const response = await this.productService.getListOtherChildren({ parent_id: id }).toPromise();
            let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
            while (list.length > 0) {
              list.removeAt(list.length - 1);
            }
            _.clone(response || []).map(item => {
              list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua Regional' : item.name }));
            });
          } else {
            wilayah.at(index).get(`list_${selection}`).setValue([]);
          }

          if (type !== 'render') {
            wilayah.at(index).get('region').setValue('');
            wilayah.at(index).get('area').setValue('');
            wilayah.at(index).get('salespoint').setValue('');
            wilayah.at(index).get('district').setValue('');
            wilayah.at(index).get('territory').setValue('');

            this.clearFormArray(wilayah.at(index).get('list_area') as FormArray);
            this.clearFormArray(wilayah.at(index).get('list_salespoint') as FormArray);
            this.clearFormArray(wilayah.at(index).get('list_district') as FormArray);
            this.clearFormArray(wilayah.at(index).get('list_territory') as FormArray);
          }
        break;
      case 'area':
          item = wilayah.at(index).get('list_region').value.length > 0 ? wilayah.at(index).get('list_region').value.filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            const response = await this.productService.getListOtherChildren({ parent_id: id }).toPromise();
            let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
            while (list.length > 0) {
              list.removeAt(list.length - 1);
            }
            _.clone(response || []).map(item => {
              list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua Area' : item.name }));
            });
          } else {
            wilayah.at(index).get(`list_${selection}`).setValue([]);
          }

          if (type !== 'render') {
            wilayah.at(index).get('area').setValue('');
            wilayah.at(index).get('salespoint').setValue('');
            wilayah.at(index).get('district').setValue('');
            wilayah.at(index).get('territory').setValue('');

            this.clearFormArray(wilayah.at(index).get('list_salespoint') as FormArray);
            this.clearFormArray(wilayah.at(index).get('list_district') as FormArray);
            this.clearFormArray(wilayah.at(index).get('list_territory') as FormArray);
          }
        break;
      case 'salespoint':
          item = wilayah.at(index).get('list_area').value.length > 0 ? wilayah.at(index).get('list_area').value.filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            const response = await this.productService.getListOtherChildren({ parent_id: id }).toPromise();
            let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
            while (list.length > 0) {
              list.removeAt(list.length - 1);
            }
            _.clone(response || []).map(item => {
              list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua Salespoint' : item.name }));
            });
          } else {
            wilayah.at(index).get(`list_${selection}`).setValue([]);
          }

          if (type !== 'render') {
            wilayah.at(index).get('salespoint').setValue('');
            wilayah.at(index).get('district').setValue('');
            wilayah.at(index).get('territory').setValue('');

            this.clearFormArray(wilayah.at(index).get('list_district') as FormArray);
            this.clearFormArray(wilayah.at(index).get('list_territory') as FormArray);
          }
        break;
      case 'district':
          item = wilayah.at(index).get('list_salespoint').value.length > 0 ? wilayah.at(index).get('list_salespoint').value.filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            const response = await this.productService.getListOtherChildren({ parent_id: id }).toPromise();
            let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
            while (list.length > 0) {
              list.removeAt(list.length - 1);
            }
            _.clone(response || []).map(item => {
              list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua District' : item.name }));
            });
          } else {
            wilayah.at(index).get(`list_${selection}`).setValue([]);
          }

          if (type !== 'render') {
            wilayah.at(index).get('district').setValue('');
            wilayah.at(index).get('territory').setValue('');

            this.clearFormArray(wilayah.at(index).get('list_territory') as FormArray);
          }
        break;
      case 'territory':
        item = wilayah.at(index).get('list_district').value.length > 0 ? wilayah.at(index).get('list_district').value.filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            const response = await this.productService.getListOtherChildren({ parent_id: id }).toPromise();
            let list = wilayah.at(index).get(`list_${selection}`) as FormArray;
            while (list.length > 0) {
              list.removeAt(list.length - 1);
            }
            _.clone(response || []).map(item => {
              list.push(this.formBuilder.group({ ...item, name: item.name === 'all' ? 'Semua Territory' : item.name }));
            });
          } else {
            wilayah.at(index).get(`list_${selection}`).setValue([]);
          } 

          if (type !== 'render') {
            wilayah.at(index).get('territory').setValue('');
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

  clearFormArray = (formArray: FormArray) => {
    formArray = this.formBuilder.array([]);
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
      areas: this.formBuilder.array([], Validators.required),
      // convertion: ["", [Validators.min(0)]]
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
        this.listSubCategory = res.data;
      },
      err => {
        this.listSubCategory = [];
      }
    );
  }

  selectionChangeSub(event: MatSelectChange): void {
    this.productService.getListCategory(event.value).subscribe(
      res => {
        this.listOtherSubCategory = res.data;
      },
      err => {
        this.listOtherSubCategory = [];
      }
    );
  }

  async submit() {
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
        category_id: this.formProductGroup.get("subCategory").value ? this.formProductGroup.get("subCategory").value : this.formProductGroup.get("category").value,
        // sub_category_id: this.formProductGroup.get("subCategory").value,
        barcode: this.formProductGroup.get("barcode").value,
        packaging_id: this.formProductGroup.get("packaging").value,
        status: this.formProductGroup.get("status").value,
        is_promo_src: this.formProductGroup.get("is_promo_src").value === true ? "1" : "0",
        // convertion: this.formProductGroup.get("convertion").value
      };

      let fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("name", body.name);
      
      if (body.barcode) fd.append("barcode", body.barcode);
      
      if (this.files) fd.append("image", body.image);

      if (body.is_promo_src === "1") {
        let areas = [];
        let value = this.formProductGroup.getRawValue();

        // value.areas.map(item => {
        //   let area = Object.entries(item).map(([key, value]) => ({key, value}));
        //   areas.push(area);
        // })

        // let areas_id = [];

        // for (const item of areas) {
        //   // for (const key of this.typeArea) {
        //   //   console.log()
        //   // }
        //   this.typeArea.map(type => {
        //     const filteredValue = item.find(asd => asd.key === type && asd.value);
        //     if (filteredValue) {
        //       areas_id.push(filteredValue);
        //     }
        //   })
        // }

        console.log(value.areas);

        // this.typeArea.map(type => {
        //   console.log(value.area);
        //   const filteredValue = area.val.find(item => type && item.value['type']);
        //   // if (filteredValue.length > 0) areas.push(parseInt(filteredValue[0].value));
        //   console.log(filteredValue);
        // })

        // areas.map(item => {
        //   // fd.append("areas[]", item.id);
        //   console.log(item);
        // });
      }

      return;

      fd.append("description", "");
      fd.append("brand_id", body.brand_id);
      fd.append("category_id", body.category_id);
      // fd.append("sub_category_id", body.sub_category_id);
      fd.append("packaging_id", body.packaging_id);
      fd.append("status", body.status);
      fd.append("is_promo_src", body.is_promo_src);
      // fd.append("convertion", body.convertion);

      body.alias.map(item => {
        fd.append("alias[]", item);
      });

      this.productService.put(fd, { product_id: this.idProduct }).subscribe(
        res => {
          this.loadingIndicator = false;
          this.router.navigate(["sku-management", "product"]);
          this.dialogService.openSnackBar({ message: "Data berhasil diubah" });
        },
        err => {
          // this.dialogService.openSnackBar({ message: err.error.message });
          this.loadingIndicator = false;
        }
      );
    } else {
      let msg;
      if (this.formProductGroup.status == "INVALID") {
        msg = "Silakan lengkapi data terlebih dahulu!";
      } else if (!this.files) {
        msg = "Gambar produk belum dipilih!";
      } else if (this.files.size > 2000000) {
        msg = "Ukuran gambar tidak boleh melebihi 200mb!";
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
    var file:File = inputValue;
    var myReader:FileReader = new FileReader();

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

  asd(event) {
    if (event.checked) {
      this.addArea();
    } else {
      let areas = this.formProductGroup.controls['areas'] as FormArray;
      while (areas.length > 0) {
        areas.removeAt(areas.length - 1);
      }
    }
  }

  getToolTipData(value, array) {
    if (value && array.length){
      let msg = array.filter(item => item.id === value)[0]['name'];
      return msg;
    } else {
      return "";
    }
  }
}
