import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from "@angular/forms";
import { Subject, Observable, ReplaySubject } from "rxjs";

import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogService } from "../../../../services/dialog.service";
import { ProductService } from "../../../../services/sku-management/product.service";
import { commonFormValidator } from "app/classes/commonFormValidator";
import { MatChipInputEvent, MatSelectChange, MatSelect } from "@angular/material";

import * as moment from "moment";
import { takeUntil } from "rxjs/operators";

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

  @ViewChild('singleSelect') singleSelect: MatSelect;
  private _onDestroy = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private productService: ProductService
  ) {
    this.otherProduct = [];
    this.listSubCategory = [];
    this.onLoad = true;

    activatedRoute.url.subscribe(params => {
      this.idProduct = params[2].path;
    })

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
    this.productService.getdetail(this.idProduct).subscribe(res => {
      this.detailProduct = res;

      let alias = this.formProductGroup.get("alias") as FormArray;
      if (res.alias) {
        (res.alias).map(item => {
          alias.push(this.formBuilder.group({ alias: item.trim() }));
        });
      }

      this.formProductGroup.get("name").setValue(res.name);
      this.formProductGroup.get("brand").setValue(res.brand_id);
      this.formProductGroup.get("packaging").setValue(res.packaging_id);
      this.formProductGroup.get("status").setValue(res.status);


      if (res.category.parent_id) {
        this.formProductGroup.get("category").setValue(res.category_all[0]);
        this.selectionChange();

        this.formProductGroup.get("subCategory").setValue(res.category_all[1]);
      } else {
        this.formProductGroup.get("category").setValue(res.category_id);
      }

      setTimeout(() => {
        this.onLoad = false;  
      }, 500);
      
    })
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

  submit(): void {
    if ((this.formProductGroup.valid && this.files === undefined) || (this.formProductGroup.valid && this.files && this.files.size < 2000000)) {
      this.loadingIndicator = true;

      let aliasChip = this.formProductGroup.get("alias").value.map(item => {
        return item.alias;
      });

      let body = {
        name: this.formProductGroup.get("name").value,
        alias: aliasChip,
        image: this.files,
        brand_id: this.formProductGroup.get("brand").value,
        category_id: this.formProductGroup.get("subCategory").value ? this.formProductGroup.get("subCategory").value : this.formProductGroup.get("category").value,
        // sub_category_id: this.formProductGroup.get("subCategory").value,
        packaging_id: this.formProductGroup.get("packaging").value,
        status: this.formProductGroup.get("status").value,
        // convertion: this.formProductGroup.get("convertion").value
      };

      let fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("name", body.name);
      fd.append("barcode", "");
      
      if (this.files) fd.append("image", body.image);

      fd.append("description", "");
      fd.append("brand_id", body.brand_id);
      fd.append("category_id", body.category_id);
      // fd.append("sub_category_id", body.sub_category_id);
      fd.append("packaging_id", body.packaging_id);
      fd.append("status", body.status);
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

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format("YYYY-MM-DD");
    }

    return "";
  }

}
