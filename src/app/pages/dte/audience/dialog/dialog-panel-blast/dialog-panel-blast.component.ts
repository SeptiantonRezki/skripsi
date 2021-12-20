import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { AudienceService } from 'app/services/dte/audience.service';
import { DataService } from 'app/services/data.service';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, forkJoin } from 'rxjs';
import { PagesName } from 'app/classes/pages-name';
import { IdbService } from 'app/services/idb.service';

@Component({
  selector: 'app-dialog-panel-blast',
  templateUrl: './dialog-panel-blast.component.html',
  styleUrls: ['./dialog-panel-blast.component.scss']
})
export class DialogPanelBlastComponent implements OnInit {
  uploading: Boolean;
  rows: any[];
  pagination: Page = new Page();

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
  detailData: any;

  constructor(
    public dialogRef: MatDialogRef<DialogPanelBlastComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    private dataService: DataService,
    private idbService: IdbService,
    @Inject(MAT_DIALOG_DATA) data: any,
  ) {
    this.rows = [];
    this.detailData = data;
    
    this.dataService.showLoading(false);
  }

  ngOnInit() {
    this.initPreview();
  }

  initPreview(){
    if (this.detailData.dataRows) {
      this.currPage += 1;
      this.totalData = this.detailData.dataRows.length;
      this.idbService.bulkUpdate(this.detailData.dataRows).then(res => {
        this.recursiveImport();
      }, err => {
        this.dialogService.openSnackBar({
          message: "Gagal Preview Data!"
        })
      })
    }
  };

  recursiveImport() {
    this.pagination['per_page'] = 15;
    this.idbService.paginate(this.pagination).then(res => {
      this.p_pagination = { page: this.p_page, per_page: 15, last_page: Math.ceil(this.totalData / 15), total: this.totalData };
      Page.renderPagination(this.pagination, this.p_pagination);
      this.rows = res && res[0] ? res[0] : [];
      this.dataService.showLoading(false);
    }).then(() => this.setPage({offset: 0}));
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
}
