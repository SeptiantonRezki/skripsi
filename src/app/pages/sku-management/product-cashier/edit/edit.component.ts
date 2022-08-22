import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "app/services/data.service";
import { ProductCashierService } from "app/services/sku-management/product-cashier.service";
import { DialogService } from "app/services/dialog.service";

@Component({
  selector: "app-cashier-edit",
  templateUrl: "./edit.component.html",
  styleUrls: ["./edit.component.scss"],
})
export class CashierEditComponent implements OnInit {
  formProductGroup: FormGroup;
  onLoad: boolean = true;
  productId: string;
  isDetail: boolean;
  productCashierType: string;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private productCashierService: ProductCashierService,
    private dialogService: DialogService,
    private router: Router
  ) {
    this.activatedRoute.url.subscribe((params) => {
      this.productId = params[3].path;
      this.isDetail = params[2].path === "detail" ? true : false;
      this.productCashierType = params[1].path;
    });
  }

  ngOnInit() {
    this.createFormGroup();
    this.getDetails();
  }

  createFormGroup() {
    this.formProductGroup = this.formBuilder.group({
      name: [{ value: "", disabled: false }],
      barcode: [{ value: "", disabled: false }],
      purchase_price: ["", [Validators.required, Validators.min(1)]],
      selling_price: ["", [Validators.required, Validators.min(1)]],
      is_sync_price: [false],
    });
  }

  getDetails() {
    try {
      this.productCashierService.getdetail(this.productId).subscribe(
        ({ data }) => {
          this.onLoad = false;
          this.formProductGroup.patchValue({
            name: data.name,
            barcode: data.barcode,
            purchase_price: data.purchase_price.raw,
            selling_price: data.selling_price.raw,
            is_sync_price: data.is_sync_price,
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
        message: "Silakan lengkapi data terlebih dahulu!",
      });
      return;
    }
    const body = {
      _method: "PUT",
      selling_price: this.formProductGroup.get("selling_price").value,
      purchase_price: this.formProductGroup.get("purchase_price").value,
      is_sync_price: this.productCashierType === 'rrp' ? this.formProductGroup.get("is_sync_price").value : undefined,
    };
    this.dataService.showLoading(true);
    this.productCashierService.put(body, {
      product_id: this.productId,
    }).subscribe(
      (res) => {
        this.onLoad = false;
        this.router.navigate(["sku-management", "product-cashier"]);
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
