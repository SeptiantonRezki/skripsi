import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { DataService } from "app/services/data.service";
import { DialogService } from "app/services/dialog.service";
import { LanguagesService } from "app/services/languages/languages.service";
import { PojokUntungPartnersRegisteredService } from "app/services/pojok-untung/pojok-untung-partners-registered.service";

@Component({
  selector: "app-pojok-untung-partners-registered-import-dialog",
  templateUrl:
    "./pojok-untung-partners-registered-import-dialog.component.html",
  styleUrls: [
    "./pojok-untung-partners-registered-import-dialog.component.scss",
  ],
  encapsulation: ViewEncapsulation.None,
})
export class PojokUntungPartnersRegisteredImportDialogComponent
  implements OnInit
{
  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  validData: any[];
  dialogData: any;

  typeTargeted: string;
  // payload: any;

  constructor(
    public dialogRef: MatDialogRef<PojokUntungPartnersRegisteredImportDialogComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private partnerRegisteredService: PojokUntungPartnersRegisteredService,
    private dataService: DataService,
    private ls: LanguagesService,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.rows = [];
    this.dataService.showLoading(false);
    this.dialogData = data;
  }

  ngOnInit() {}

  preview(event) {
    this.files = undefined;
    this.files = event;

    // console.log("files info", this.files);

    if (this.files.name.indexOf(".xlsx") === -1) {
      this.dialogService.openSnackBar({ message: "Ekstensi File wajib XLSX!" });
      return;
    }

    let fd = new FormData();

    fd.append("file", this.files);

    this.dataService.showLoading(true);
    this.partnerRegisteredService.importFile(fd).subscribe(
      (res) => {
        let fdd = new FormData();
        this.partnerRegisteredService.previewImport(fdd).subscribe(
          (preview) => {
            // console.log("preview res", preview);
            this.rows = preview.data;
            this.dataService.showLoading(false);
          },
          (err) => {
            this.dataService.showLoading(false);
            this.dialogService.openSnackBar({
              message:
                "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda.",
            });
          }
        );
      },
      (err) => {
        this.dataService.showLoading(false);
        this.files = undefined;

        if (err.status === 404 || err.status === 500)
          this.dialogService.openSnackBar({
            message:
              "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda.",
          });
      }
    );
  }

  submit() {
    this.partnerRegisteredService.submitImport().subscribe(
      (res) => {

        // console.log("log submit: ", res)
        if (res.status == true) {
          // console.log("log submit: ",res)
          this.dataService.showLoading(false);
          this.dialogRef.close(this.rows);

          // this.dialogService.openSnackBar({ message: res.message });

          setTimeout(() => {
            this.dialogService.openSnackBar({ message: "Data Success : " + res.success + ", Data Failed : " + res.failed });
          }, 1000);

        } else {
          this.dialogService.openSnackBar({ message: "Semua row tidak valid " });
        }

      },
      (err) => {
        this.dataService.showLoading(false);

        if (err.status === 404 || err.status === 500)
          this.dialogService.openSnackBar({
            message:
              "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda.",
          });
      }
    )

  }
}
