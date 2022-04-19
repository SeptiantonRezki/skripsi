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
  counter: any = false;
  fileType: any;

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
    this.fileType = this.dialogData.fileType ? `.${this.dialogData.fileType}` : null;
  }

  async preview(event) {
    this.files = undefined;
    this.files = event;
    if (this.dialogData.fileType
      && this.files.name.indexOf(`.${this.dialogData.fileType}`) == -1) {
      this.dialogService.openSnackBar({ message: `Ekstensi File wajib ${this.dialogData.fileType.toUpperCase()}!` });
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
            const data = res.data.audiences || res.data.data || res.data;
            this.rows = data;
            this.invalidData = (data || []).filter(item => !item.flag && !item.is_valid).length;
            this.dataService.showLoading(false);
            this.counter = {
              total: data.length,
              invalid: this.invalidData,
              valid: data.length - this.invalidData
            };
            if(this.invalidData > 0) {
              const filterData = () => {
                this.rows = this.rows.filter(item => item.flag || item.is_valid);
                this.invalidData = 0;
                this.counter = {
                  total: this.rows.length,
                  invalid: 0,
                  valid: this.rows.length
                };
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
