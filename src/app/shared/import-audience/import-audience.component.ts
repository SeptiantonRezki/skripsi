import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';

@Component({
  templateUrl: './import-audience.component.html',
  styleUrls: ['./import-audience.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportAudienceComponent {

  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  invalidData: any;
  dialogData: any;

  typeTargeted: string;

  constructor(
    public dialogRef: MatDialogRef<ImportAudienceComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    this.rows = [];
    this.dataService.showLoading(false);
    this.dialogData = data;
  }

  ngOnInit() {
  }

  async preview(event) {
    this.files = undefined;
    this.files = event;

    console.log('files info', this.files);
    if (this.files.name.indexOf(".xlsx") > -1) {
      this.dialogService.openSnackBar({ message: "Ekstensi File wajib XLS!" });
      return;
    }

    let fd = new FormData();

    fd.append('file', this.files);
    fd.append('audience', this.dialogData.audience);
    this.dataService.showLoading(true);
    if(this.dialogData.api) {
      this.dialogData.api(fd).subscribe(
        res => {
          if (res) {
            const data = res.data.audiences || res.data;
            this.rows = data;
            this.invalidData = (data || []).filter(item => !item.flag && !item.is_valid).length;
            this.dataService.showLoading(false);
            if(this.invalidData > 0) {
              const filterData = () => {
                this.rows = this.rows.filter(item => item.flag || item.is_valid);
                this.invalidData = 0;
                this.dialogService.brodcastCloseConfirmation();
              };
              const data = {
                titleDialog: `Apakah anda ingin menghapus data yang tidak valid?`,
                confirmCallback: () => filterData(),
                rejectCallback: () => {
                  this.dialogService.openSnackBar({ message: "Silahkan unggah ulang data" });
                  this.dialogService.brodcastCloseConfirmation();
                },
                buttonText: ['Ya', 'Tidak']
              };
              this.dialogService.openCustomConfirmationDialog(data);
            };
          } else {
            this.dialogService.openSnackBar({ message: "Data tidak Valid, mohon mengunggah ulang." });
            this.dataService.showLoading(false);
          }
        },
        err => {
          this.dataService.showLoading(false);
          this.files = undefined;
  
          if (err.status === 404 || err.status === 500)
            this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda." })
        }
      )
    };
  }

  submit() {
    if (this.rows.length > 0) {
      const res = this.rows.map(item => item);
      this.dialogRef.close(res);
    } else {
      this.dialogService.openSnackBar({ message: "Semua row tidak valid " });
    }
  }

}
