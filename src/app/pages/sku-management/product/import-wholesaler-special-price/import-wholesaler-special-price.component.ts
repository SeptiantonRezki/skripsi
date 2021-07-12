import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { WholesalerSpecialPriceService } from 'app/services/sku-management/wholesaler-special-price.service';

@Component({
  selector: 'app-import-wholesaler-special-price',
  templateUrl: './import-wholesaler-special-price.component.html',
  styleUrls: ['./import-wholesaler-special-price.component.scss']
})
export class ImportWholesalerSpecialPriceComponent implements OnInit {
  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  validData: any[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ImportWholesalerSpecialPriceComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private wholesalerService: WholesalerSpecialPriceService,
    private dataService: DataService) {
    this.rows = [];
    this.dataService.showLoading(false);
  }

  ngOnInit() {
  }
  preview(event) {
    this.files = undefined;
    this.files = event;

    let fd = new FormData();

    if (this.files.name.indexOf(".xls") === -1) {
      this.dialogService.openSnackBar({ message: "Ekstensi File wajib XLS!" });
      return;
    }
    let {product_id, rate_id, except_id} = this.data;
    fd.append('file', this.files);
    fd.append('product_id', product_id ? product_id : '');
    fd.append('rate_id', rate_id ? rate_id : '');

    this.dataService.showLoading(true);
    this.wholesalerService.importExcel(fd).subscribe(
      res => {
        this.wholesalerService.importPreview({product_id, rate_id}).subscribe(preview => {
          this.rows = preview.data.list;
          // this.validData = (preview.data.list || []).filter(item => item.is_valid).length;
          console.log({except_id});
          this.validData = (preview.data.list || []).filter(item => {
            if (except_id.includes(item.id)) item.is_valid = false;
            console.log({item});
            return item.is_valid;
          });
          // this.validData = preview.data.is_valid;
          this.dataService.showLoading(false);

        }, err => {
          
          this.dataService.showLoading(false);
          if (err.status === 404 || err.status === 500)
          this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda." })
        });
        // this.rows = res.data;
        // this.validData = (res.data || []).filter(item => item.is_valid).length;
      },
      err => {
        this.dataService.showLoading(false);
        this.files = undefined;

        if (err.status === 404 || err.status === 500)
          this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda." })
      }
    )
  }
  submit() {
    if (this.rows.length > 0) {
      const res = this.validData.map(item => { return { ...item } });
      this.dialogRef.close(res);
    } else {
      this.dialogService.openSnackBar({ message: "Semua row tidak valid " });
    }
  }

}
