import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "app/services/data.service";
import { DialogService } from "app/services/dialog.service";
import { ProductSubmissionService } from "app/services/sku-management/product-submission.service";
import { ProductService } from "app/services/sku-management/product.service";
import { ReplaySubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { MatDialogConfig, MatDialog } from "@angular/material";
import { UploadImageComponent } from "../dialog/upload-image/upload-image.component";
import { PreviewImageComponent } from "../dialog/preview-image/preview-image.component";

@Component({
  selector: "db-product-submission-edit",
  templateUrl: "./edit.component.html",
  styleUrls: ["./edit.component.scss"],
})
export class DbProductSubmissionEditComponent implements OnInit {
  product: FormGroup;
  onLoad: boolean = true;
  productId: string;

  brands: Array<any>;
  filterBrands: FormControl = new FormControl();
  filteredBrands: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  categories: Array<any>;
  filterCategories: FormControl = new FormControl();
  filteredCategories: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  filterDestroy = new Subject();

  files: File;
  filesError: boolean = false;
  imageUrl: any;

  dialogRef: any;

  gettingBarcode: boolean = false;
  hasBarcode: boolean;

  approverType: string;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private productService: ProductService,
    private submissionService: ProductSubmissionService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.activatedRoute.url.subscribe((params) => {
      this.productId = params[params.length - 1].path;
    });
    this.brands = this.activatedRoute.snapshot.data["listBrand"].data
      ? this.activatedRoute.snapshot.data["listBrand"].data.data
      : [];
    this.filteredBrands.next(this.brands.slice());
    this.categories = this.activatedRoute.snapshot.data["listCategory"].data
      ? this.getCategories(
          this.activatedRoute.snapshot.data["listCategory"].data.data
        )
      : [];
    this.filteredCategories.next(this.categories.slice());
  }

  ngOnInit() {
    this.createForm();
    this.getDetails();
    this.filterBrands.valueChanges
      .pipe(takeUntil(this.filterDestroy))
      .subscribe(() => {
        this.filteringBrands();
      });
    this.filterCategories.valueChanges
      .pipe(takeUntil(this.filterDestroy))
      .subscribe(() => {
        this.filteringCategories();
      });
  }

  createForm() {
    this.product = this.formBuilder.group({
      name: ["", Validators.required],
      barcode: [{ value: "", disabled: true }],
      brand: ["", Validators.required],
      category: ["", Validators.required],
      businessName: [{ value: "", disabled: true }],
      businessZone: [{ value: "", disabled: true }],
      businessRegional: [{ value: "", disabled: true }],
      businessArea: [{ value: "", disabled: true }],
    });
  }

  getDetails() {
    try {
      this.submissionService
        .getDbDetail(this.productId)
        .subscribe(({ data }) => {
          console.log(data);
          const business = data.business || {};
          const patchData = {
            name: data.name,
            barcode: data.barcode,
            category: data.category_id,
            brand: data.brand_id,
          };
          if (business.name) {
            patchData["businessName"] = business.name;
          }
          if (business.areas) {
            business.areas.forEach((item) => {
              if (item.level_desc === "division") {
                patchData["businessZone"] = item.name;
              }
              if (item.level_desc === "region") {
                patchData["businessRegional"] = item.name;
              }
              if (item.level_desc === "area") {
                patchData["businessArea"] = item.name;
              }
            });
          }
          if (data.image_url) {
            this.imageUrl = data.image_url;
          }
          if (!data.barcode) {
            this.product.get("barcode").setValidators([Validators.required]);
            this.product.get("barcode").enable();
          }
          this.approverType = data.status.toLowerCase();
          this.hasBarcode = data.barcode ? true : false;
          this.product.patchValue(patchData);
          this.onLoad = false;
        });
    } catch (error) {
      this.onLoad = false;
    }
  }

  getBarcode() {
    this.gettingBarcode = true;
    this.submissionService.getBarcode(this.productId).subscribe((res) => {
      this.product.get("barcode").setValue(res.data);
      this.gettingBarcode = false;
    });
  }

  getCategories(items) {
    let categories = [];
    this.getCategoryChildren(items, categories);
    return categories;
  }

  getCategoryChildren(children, categories) {
    if (children.length) {
      children.forEach((item) => {
        categories.push(item);
        this.getCategoryChildren(item.childrens, categories);
      });
    }
  }

  filteringBrands() {
    const search = this.filterBrands.value;
    if (!this.brands) return;
    if (!search) {
      this.filteredBrands.next(this.brands.slice());
      return;
    }
    this.filteredBrands.next(
      this.brands.filter(
        (item) => item.name.toLowerCase().indexOf(search.toLowerCase()) >= 0
      )
    );
  }

  filteringCategories() {
    const search = this.filterCategories.value;
    if (!this.categories) return;
    if (!search) {
      this.filteredCategories.next(this.categories.slice());
      return;
    }
    this.filteredCategories.next(
      this.categories.filter(
        (item) => item.name.toLowerCase().indexOf(search.toLowerCase()) >= 0
      )
    );
  }

  previewImage() {
    if (!this.imageUrl) return;

    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = "scrumboard-card-dialog";
    dialogConfig.data = {
      imageName: this.product.get("name").value,
      imageUrl: this.imageUrl,
    };

    this.dialogRef = this.dialog.open(PreviewImageComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe((res: any) => {
      if (res) {
        console.log(res);
      }
    });
  }

  uploadImage() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = "scrumboard-card-dialog";

    this.dialogRef = this.dialog.open(UploadImageComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe((res: any) => {
      if (res) {
        this.imageUrl = res.src;
        this.files = res.file;
        this.filesError = false;
      }
    });
  }

  submit(action: string) {
    if (action === "approve") {
      if (!this.product.valid || !this.imageUrl) {
        this.validateFormGroup(this.product);
        if (!this.imageUrl) {
          this.filesError = true;
        }
        this.dialogService.openSnackBar({
          message: "Silahkan lengkapi data terlebih dahulu!",
        });
        return;
      }
      const fd = new FormData();
      fd.append("name", this.product.get("name").value);
      fd.append("barcode", this.product.get("barcode").value);
      fd.append("brand_id", this.product.get("brand").value);
      fd.append("category_id", this.product.get("category").value);
      if (this.files) {
        fd.append("image", this.files);
      }
      this.dataService.showLoading(true);
      if (this.approverType === "approver 1") {
        this.submissionService
          .putApprove1(fd, {
            product_id: this.productId,
          })
          .subscribe(
            this.submitSuccess.bind(this),
            this.submitError.bind(this)
          );
      }
      if (this.approverType === "approver produk db") {
        this.submissionService
          .putApproveDbProduct(fd, {
            product_id: this.productId,
          })
          .subscribe(
            this.submitSuccess.bind(this),
            this.submitError.bind(this)
          );
      }
    }
    if (action === "disapprove") {
      this.dataService.showLoading(true);
      if (this.approverType === "approver 1") {
        this.submissionService
          .putDisapprove1(null, {
            product_id: this.productId,
          })
          .subscribe(
            this.submitSuccess.bind(this),
            this.submitError.bind(this)
          );
      }
      if (this.approverType === "approver produk db") {
        this.submissionService
          .putDisapproveDbProduct(null, {
            product_id: this.productId,
          })
          .subscribe(
            this.submitSuccess.bind(this),
            this.submitError.bind(this)
          );
      }
    }
  }

  submitSuccess(res: any) {
    this.onLoad = false;
    this.router.navigate(["sku-management", "db-product-submission"]);
    this.dialogService.openSnackBar({ message: "Data berhasil diubah" });
    this.dataService.showLoading(false);
  }

  submitError(err: any) {
    this.onLoad = false;
    this.dataService.showLoading(false);
  }

  hasError(name) {
    return this.product.get(name).invalid && this.product.get(name).touched;
  }

  validateFormGroup(form: FormGroup) {
    Object.keys(form.controls).forEach((field) => {
      const control = form.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateFormGroup(control);
      }
    });
  }
}
