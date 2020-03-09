import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { AudienceService } from 'app/services/dte/audience.service';
import { DataService } from 'app/services/data.service';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { PagesName } from 'app/classes/pages-name';
import { IdbService } from 'app/services/idb.service';

@Component({
  templateUrl: './import-audience-dialog.component.html',
  styleUrls: ['./import-audience-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportAudienceDialogComponent {

  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  validData: any[];
  pagination: Page = new Page();
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  onLoad: boolean;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  keyUp = new Subject<string>();

  permission: any;
  roles: PagesName = new PagesName();

  offsetPagination: any;
  currPage: number = 1;
  lastPage: number = 1;

  constructor(
    public dialogRef: MatDialogRef<ImportAudienceDialogComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    private dataService: DataService,
    private idbService: IdbService
  ) {
    this.rows = [];
    this.dataService.showLoading(false);
  }

  ngOnInit() {
  }

  preview(event) {
    this.files = undefined;
    this.files = event;

    let fd = new FormData();

    fd.append('file', this.files);
    this.dataService.showLoading(true);
    this.audienceService.importExcel(fd).subscribe(
      res => {
        if (res && res.data) {

          this.audienceService.showImport(this.pagination).subscribe(res => {
            Page.renderPagination(this.pagination, res.data);
            this.lastPage = res.data.last_page;
            this.rows = res.data.data;
            // this.validData = (res.data.data || []).filter(item => item.is_valid).length;
            this.dataService.showLoading(false);
          }, err => {
            console.log('error show import', err);
            this.dataService.showLoading(false);
            this.files = undefined;

            if (err.status === 404 || err.status === 500)
              this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda." })
          })
        } else {
          this.dataService.showLoading(false);
          this.files = undefined;
          this.dialogService.openSnackBar({ message: "Upload gagal, file yang diupload tidak sesuai. Mohon periksa kembali file Anda." })
        }

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
    if (this.currPage <= this.lastPage) {
      this.audienceService.showImport({ page: this.currPage }).subscribe(res => {
        if (res && res.data) {
          this.idbService.bulkUpdate(res.data.data).then(res => {
            this.currPage += 1;
            this.submit();
          }, err => {
            this.dialogService.openSnackBar({
              message: "Gagal mengimport Data!"
            })
            this.dialogRef.close([]);
          })
        } else {
          this.dialogService.openSnackBar({
            message: "Gagal mengimport Data!"
          })
          this.dialogRef.close([]);
        }
      }, err => {

      });
    }
    // const rows = this.rows.filter(item => item.is_valid);
    // if (this.rows.length > 0) {

    //   // const res = rows.map(item => { return { id: item.id } });
    //   this.dialogRef.close(res);
    // } else {
    //   this.dialogService.openSnackBar({ message: "Semua row tidak valid " });
    // }
  }

}
