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

@Component({
  selector: "cashier-submission-edit",
  templateUrl: "./edit.component.html",
  styleUrls: ["./edit.component.scss"],
})
export class CashierSubmissionEditComponent implements OnInit {
  product: FormGroup;
  onLoad: boolean = true;
  productId: string;
  isDetail: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private submissionService: ProductSubmissionService,
    private dialogService: DialogService,
    private router: Router
  ) {
    this.activatedRoute.url.subscribe((params) => {
      this.productId = params[3].path;
      this.isDetail = params[2].path === "detail" ? true : false;
    });
  }

  ngOnInit() {
    this.createForm();
    this.getDetails();
  }

  createForm() {
    this.product = this.formBuilder.group({
      name: [{ value: "", disabled: true }],
      barcode: [{ value: "", disabled: true }],
      purchase_price: ["", [Validators.required, Validators.min(1)]],
      selling_price: ["", [Validators.required, Validators.min(1)]],
    });
  }

  getDetails() {
    try {
      this.submissionService.getDetail(this.productId).subscribe(({ data }) => {
        this.onLoad = false;
        this.product.patchValue({
          name: data.name,
          barcode: data.barcode,
          purchase_price: data.purchase_price.raw,
          selling_price: data.selling_price.raw,
        });
      });
    } catch (error) {
      console.log(error);
      this.onLoad = false;
    }
  }

  submit(action: string) {
    if (action === "approve") {
      if (!this.product.valid) {
        this.validateFormGroup(this.product);
        this.dialogService.openSnackBar({
          message: "Silahkan lengkapi data terlebih dahulu!",
        });
        return;
      }
      const body = {
        selling_price: this.product.get("selling_price").value,
        purchase_price: this.product.get("purchase_price").value,
      };
      this.dataService.showLoading(true);
      this.submissionService
        .putApprove(body, {
          product_id: this.productId,
        })
        .subscribe(this.submitSuccess.bind(this), this.submitError.bind(this));
    }
    if (action === "disapprove") {
      this.dataService.showLoading(true);
      this.submissionService
        .putDisapprove(null, {
          product_id: this.productId,
        })
        .subscribe(this.submitSuccess.bind(this), this.submitError.bind(this));
    }
  }

  submitSuccess(res: any) {
    this.onLoad = false;
    this.router.navigate(["sku-management", "product-cashier", "submission"]);
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
