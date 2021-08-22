import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
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
  formProductGroup: FormGroup;
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
    this.formProductGroup = this.formBuilder.group({
      name: [{ value: "", disabled: false }],
      barcode: [{ value: "", disabled: false }],
      purchase_price: ["", [Validators.required, Validators.min(1)]],
      selling_price: ["", [Validators.required, Validators.min(1)]],
    });
  }

  getDetails() {
    try {
      this.submissionService.getDetail(this.productId).subscribe(
        ({ data }) => {
          this.onLoad = false;
          this.formProductGroup.patchValue({
            name: data.name,
            barcode: data.barcode,
            purchase_price: data.purchase_price.raw,
            selling_price: data.selling_price.raw,
          });
        }
      );
    } catch (error) {
      console.log(error);
      this.onLoad = false;
    }
  }

  submit() {
    if (!this.formProductGroup.valid) {
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi data terlebih dahulu!",
      });
      return;
    }
    const body = {
      _method: "PUT",
      selling_price: this.formProductGroup.get("selling_price").value,
      purchase_price: this.formProductGroup.get("purchase_price").value,
    };
    this.dataService.showLoading(true);
    this.submissionService.putApprove(body, {
      product_id: this.productId,
    }).subscribe(
      (res) => {
        this.onLoad = false;
        this.router.navigate(["sku-management", "product-cashier", "submission"]);
        this.dialogService.openSnackBar({ message: "Data berhasil diubah" });
        this.dataService.showLoading(false);
      },
      (err) => {
        this.onLoad = false;
        this.dataService.showLoading(false);
      }
    );
  }
}
