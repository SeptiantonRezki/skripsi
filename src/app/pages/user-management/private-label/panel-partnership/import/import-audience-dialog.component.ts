import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { AudienceService } from 'app/services/dte/audience.service';
import { DataService } from 'app/services/data.service';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, forkJoin } from 'rxjs';
import { PagesName } from 'app/classes/pages-name';
import { IdbService } from 'app/services/idb.service';
import { PanelPartnershipService } from 'app/services/user-management/private-label/panel-partnership.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  // selector: 'app-import-audience-dialog',
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

  loadingIndicator = false;
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
  p_page: number = 1;
  totalData: number = 0;
  p_pagination: any = {
    page: 1,
    last_page: 1,
    total: 0
  }
  trials: Array<any> = [];

  constructor(
    public dialogRef: MatDialogRef<ImportAudienceDialogComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    private dataService: DataService,
    private idbService: IdbService,
    private panelPartnershipService: PanelPartnershipService,
    private ls: LanguagesService,
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
    this.idbService.reset();
    fd.append('file', this.files);
    this.dataService.showLoading(true);
    this.panelPartnershipService.importExcel(fd).subscribe(
      res => {
        if (res && res.data) {
          // this.recursiveImport(res);
          this.pagination['per_page'] = 250;
          this.panelPartnershipService.showImport(this.pagination).subscribe(response => {
            this.currPage += 1;
            this.lastPage = response.data.last_page;
            this.totalData = response.data.total;
            this.idbService.bulkUpdate(response.data.data).then(res => {
              console.log('page', this.currPage - 1, res);
              this.recursiveImport();
            }, err => {
              this.dialogService.openSnackBar({
                message: this.ls.locale.global.messages.text15
              })
              this.dialogRef.close([]);
            })
          }, err => {
            console.log('error show import', err);
            this.dataService.showLoading(false);
            this.files = undefined;

            if (err.status === 404 || err.status === 500)
              this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text16 })
          })
        } else {
          this.dataService.showLoading(false);
          this.files = undefined;
          this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text16 })
        }

      },
      err => {
        this.dataService.showLoading(false);
        this.files = undefined;

        if (err.status === 404 || err.status === 500)
          this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text16 })
      }
    )
  }

  recursiveImport() {
    if (this.currPage <= this.lastPage) {
      this.panelPartnershipService.showImport({ page: this.currPage }).subscribe(response => {
        if (response && response.data) {
          this.idbService.bulkUpdate(response.data.data).then(res => {
            console.log('page', this.currPage - 1, res);
            this.currPage += 1;
            this.lastPage = response.data.last_page;
            this.recursiveImport();
          }, err => {
            this.dialogService.openSnackBar({
              message: this.ls.locale.global.messages.text15
            })
            this.dialogRef.close([]);
          })
        } else {
          this.dialogService.openSnackBar({
            message: this.ls.locale.global.messages.text15
          })
          this.dialogRef.close([]);
        }
      }, err => {
        console.log('error show import', err);
        this.trials.push(this.currPage);
        this.dataService.showLoading(false);
        this.files = undefined;
      });
    } else {
      if (this.trials.length > 0) {
        this.trialImport().subscribe(results => {
          let bowls = [];
          results.map(result => {
            if (result && result.data && result.data.data) {
              bowls = [
                ...bowls,
                result.data.data
              ]
            }
          });

          this.idbService.bulkUpdate(bowls).then(resUpdate => {
            this.pagination['per_page'] = 15;
            this.idbService.paginate(this.pagination).then(resPaginate => {
              this.p_pagination = { page: this.p_page, per_page: 15, last_page: Math.ceil(this.totalData / 15), total: this.totalData };
              Page.renderPagination(this.pagination, this.p_pagination);
              this.rows = resPaginate && resPaginate[0] ? resPaginate[0] : [];
              this.dataService.showLoading(false);
            })
          }, err => {
            this.dialogService.openSnackBar({
              message: this.ls.locale.global.messages.failed_partial_import_at+" " + this.trials.join(",")
            })
            this.dialogRef.close([]);
          })
        }, err => {
          this.dialogService.openSnackBar({
            message: this.ls.locale.global.messages.failed_partial_import_at+" " + this.trials.join(",")
          })
          this.dialogRef.close([]);
        });
      } else {
        this.pagination['per_page'] = 15;
        this.idbService.paginate(this.pagination).then(res => {
          this.p_pagination = { page: this.p_page, per_page: 15, last_page: Math.ceil(this.totalData / 15), total: this.totalData };
          Page.renderPagination(this.pagination, this.p_pagination);
          this.rows = res && res[0] ? res[0] : [];
          this.dataService.showLoading(false);
        })
      }
    }
  }

  trialImport() {
    let trialsRes = [];
    this.trials.map(trial => {
      let response = this.panelPartnershipService.showImport({ page: trial });
      trialsRes.push(response);
    })

    return forkJoin(trialsRes);
  }

  setPage(pageInfo) {
    this.dataService.showLoading(true);
    this.offsetPagination = pageInfo.offset;
    this.p_pagination['page'] = pageInfo.offset + 1;

    this.idbService.paginate(this.p_pagination).then(res => {
      this.p_pagination = { page: pageInfo.offset + 1, per_page: 15, last_page: Math.ceil(this.totalData / 15), total: this.totalData };
      Page.renderPagination(this.pagination, this.p_pagination);
      this.rows = res && res[0] ? res[0] : [];
      this.dataService.showLoading(false);
    });
  }

  submit() {
    if (this.totalData > 0) {
      this.dialogRef.close(true);
    } else {
      this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text17 });
    }
  }

}
