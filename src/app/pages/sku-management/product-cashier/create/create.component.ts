import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { DataService } from "app/services/data.service";
import { ProductCashierService } from "app/services/sku-management/product-cashier.service";
import { ScanBarcodeDialogComponent } from "app/pages/sku-management/product/create/dialog/scan-barcode-dialog.component";
import { DialogService } from "app/services/dialog.service";
import { commonFormValidator } from "app/classes/commonFormValidator";
import { Router } from "@angular/router";

@Component({
  selector: "app-cashier-create",
  templateUrl: "./create.component.html",
  styleUrls: ["./create.component.scss"],
})
export class CashierCreateComponent implements OnInit {
  formProductGroup: FormGroup;
  onLoad: boolean = false;
  dialogRef: any;
  hasBarcode: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private productCashierService: ProductCashierService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit() {
    this.createFormGroup();
  }

  createFormGroup() {
    this.formProductGroup = this.formBuilder.group({
      name: ["", Validators.required],
      barcode: [""],
      purchase_price: ["", [Validators.required, Validators.min(1)]],
      selling_price: ["", [Validators.required, Validators.min(1)]],
    });
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = "scrumboard-card-dialog";
    dialogConfig.data = { title: "Testing" };
    this.dialogRef = this.dialog.open(ScanBarcodeDialogComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((res: any) => {
      if (res) this.getBarcode(res);
    });
  }

  getBarcode(id) {
    this.dataService.showLoading(true);
    this.productCashierService.barcode(id).subscribe(
      (res) => {
        if (res.data.length) {
          this.hasBarcode = true;
          this.formProductGroup.patchValue({
            name: res.data[0].name,
            barcode: res.data[0].barcode,
          });
        } else {
          this.hasBarcode = false;
          this.dialogService.openSnackBar({
            message: "Produk tidak ditemukan!",
          });
        }
        this.dataService.showLoading(false);
      },
      (err) => {
        console.log(err);
        this.dataService.showLoading(false);
      }
    );
  }

  submit() {
    if (!this.formProductGroup.valid) {
      this.dialogService.openSnackBar({
        message: "Silakan lengkapi data terlebih dahulu!",
      });
      commonFormValidator.validateAllFields(this.formProductGroup);
      return;
    }
    const body = {
      name: this.formProductGroup.get('name').value,
      barcode: this.formProductGroup.get('barcode').value,
      selling_price: this.formProductGroup.get("selling_price").value,
      purchase_price: this.formProductGroup.get("purchase_price").value,
    };
    this.dataService.showLoading(true);
    this.productCashierService.create(body).subscribe(
      (res) => {
        this.onLoad = false;
        this.router.navigate(["sku-management", "product-cashier"]);
        this.dialogService.openSnackBar({ message: "Produk berhasil disimpan" });
        this.dataService.showLoading(false);
      },
      (err) => {
        this.onLoad = false;
        this.dataService.showLoading(false);
      }
    );
  }
}
