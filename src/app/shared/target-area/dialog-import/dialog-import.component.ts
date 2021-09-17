import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material";
import { DataService } from "app/services/data.service";
import { AreaService } from "app/services/area.service";
import * as _ from "underscore";

@Component({
  selector: "target-area-dialog-import",
  templateUrl: "./dialog-import.component.html",
  styleUrls: ["./dialog-import.component.scss"],
})
export class DialogImportComponent implements OnInit {
  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[] = [];
  headers: any[];
  jsonData: any[];
  asd: any[] = [];
  importing: Boolean = false;
  isInvalid: Boolean;
  payload: any;
  isValid: boolean = false;
  rowsLength: number;

  constructor(
    public dialogRef: MatDialogRef<DialogImportComponent>,
    public dialog: MatDialog,
    private areaService: AreaService,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.payload = data;
  }

  ngOnInit() {}

  removeFile(): void {
    this.files = undefined;
  }

  preview(event: any) {
    this.rows = [];
    this.files = undefined;
    this.files = event;
    this.isValid = false;
    this.rowsLength = 0;

    let fd = new FormData();
    fd.append("file", this.files);

    this.dataService.showLoading(true);
    this.areaService.import(fd).subscribe(
      (res) => {
        this.rows = res.data;
        this.rowsLength = res.data.length;
        this.isValid = true;
        this.dataService.showLoading(false);
      },
      (err) => {
        this.dataService.showLoading(false);
      }
    );
  }

  submit() {
    this.dialogRef.close(this.rows);
  }
}