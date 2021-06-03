import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { DataService } from "app/services/data.service";
import { ProductCashierService } from "app/services/sku-management/product-cashier.service";
import { ScanBarcodeDialogComponent } from "app/pages/sku-management/product/create/dialog/scan-barcode-dialog.component";

@Component({
  selector: "app-cashier-create",
  templateUrl: "./create.component.html",
  styleUrls: ["./create.component.scss"],
})
export class CashierCreateComponent implements OnInit {
  formProductGroup: FormGroup;
  onLoad: boolean = false;
  dialogRef: any;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private productCashierService: ProductCashierService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.createFormGroup();
  }

  createFormGroup() {
    this.formProductGroup = this.formBuilder.group({
      name: [""],
      barcode: [""],
      purchase_price: [""],
      selling_price: [""],
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
      // this.formProductGroup.get("barcode").setValue(id);
    });
  }

  getBarcode(id) {
    console.log(id);
    // this.productCashierService.barcode(id).subscribe((res) => {
    //   console.log(res);
    // })
  }
}
