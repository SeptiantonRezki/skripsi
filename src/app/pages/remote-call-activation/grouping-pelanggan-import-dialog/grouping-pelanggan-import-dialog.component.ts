import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { RcaAgentService } from 'app/services/rca-agent.service';

@Component({
  selector: 'app-grouping-pelanggan-import-dialog',
  templateUrl: './grouping-pelanggan-import-dialog.component.html',
  styleUrls: ['./grouping-pelanggan-import-dialog.component.scss']
})
export class GroupingPelangganImportDialogComponent implements OnInit {
  files: File;
  validComboDrag: boolean;

  scopedData: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) data,
    public dialogRef: MatDialogRef<GroupingPelangganImportDialogComponent>,
    public dialog: MatDialog,
    private rcaAgentService: RcaAgentService,
    private dataService: DataService,
    private dialogService: DialogService
  ) {
    this.scopedData = data;
  }

  ngOnInit() {
  }

  preview(event) {
    console.log('valid', this.validComboDrag);

    this.files = undefined;
    this.files = event;

    let fd = new FormData();

    fd.append('file', this.files);
    this.dataService.showLoading(true);
    if (this.scopedData.catalog === 'grouping_pelanggan') {
      this.rcaAgentService.importGrouping(fd).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogRef.close(res);
      }, err => {
        this.dataService.showLoading(false);
        this.files = undefined;

        if (err.status === 404 || err.status === 500)
          this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda, atau pilih Eksport File sebagai acuan File Anda." })
      })
    } else {
      this.rcaAgentService.importGrouping(fd).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogRef.close(res);
      }, err => {
        this.dataService.showLoading(false);
        this.files = undefined;

        if (err.status === 404 || err.status === 500)
          this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda, atau pilih Eksport File sebagai acuan File Anda." })
      })
    }

    // this.productService.previewImport({ company_id: this.payload.company_id ? this.payload.company_id : this.vendorCompany.value }, fd).subscribe(
    //   res => {
    //     this.rows = res && res.data ? res.data.data : [];
    //     this.isInvalid = res.data.is_valid ? false : true;
    //     this.dataService.showLoading(false);
    //   },
    //   err => {
    //     this.dataService.showLoading(false);
    //     this.files = undefined;

    //     if (err.status === 404 || err.status === 500)
    //       this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda, atau pilih Eksport File sebagai acuan File Anda." })
    //   }
    // )
  }

}
