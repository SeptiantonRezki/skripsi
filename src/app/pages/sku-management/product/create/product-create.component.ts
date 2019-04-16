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
import { ScanBarcodeDialogComponent } from "./dialog/scan-barcode-dialog.component";
import * as html2canvas from 'html2canvas';
import { DataService } from "app/services/data.service";

@Component({
  selector: "app-product-create",
  templateUrl: "./product-create.component.html",
  styleUrls: ["./product-create.component.scss"]
})
export class ProductCreateComponent {
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  loadingIndicator: boolean;

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

  formProductGroup: FormGroup;
  formProductErrors: any;

  dialogRef: any;
  showLoading: Boolean;

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

    this.listBrand = this.activatedRoute.snapshot.data["listBrand"].data;
    this.listCategory = this.activatedRoute.snapshot.data["listCategory"].data;
    this.listPackaging = this.activatedRoute.snapshot.data["listPackaging"].data;

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
  }

  ngOnInit() {
    this.createFormGroup();

    this.formProductGroup.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.formProductGroup,
        this.formProductErrors
      );
    });

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

  selectionChange(event: MatSelectChange): void {
    this.productService.getListCategory(event.value).subscribe(
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
    if (this.formProductGroup.valid && (this.files && this.files.size < 2000000)) {
      this.loadingIndicator = true;

      this.dataService.showLoading(true);
      await html2canvas(this.screen.nativeElement, { scale: 3 }).then(canvas => {
        this.imageSkuConverted = this.convertCanvasToImage(canvas);
        this.dataService.showLoading(false);
      });

      let aliasChip = this.formProductGroup.get("alias").value.map(item => {
        return item.alias;
      });

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
      fd.append("name", body.name);
      fd.append("barcode", body.barcode);
      fd.append("image", body.image);
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

      this.productService.create(fd).subscribe(
        res => {
          this.loadingIndicator = false;
          this.router.navigate(["sku-management", "product"]);
          this.dialogService.openSnackBar({ message: "Data berhasil disimpan" });
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
}
