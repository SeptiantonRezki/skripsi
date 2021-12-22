import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef, Inject, ElementRef } from '@angular/core';
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

  @ViewChild("downloadLink") downloadLink: ElementRef;
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
      this.detailData.dataRows.sort((a,b) => (a.is_valid > b.is_valid ? 1 : -1));

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
  
  async export() {
    this.dataService.showLoading(true);
    const body = {
      trade_audience_group_id: this.detailData.id
    };

    try {
      const response = await this.audienceService.exportPreviewAudience(body).toPromise();
      const newBlob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url= window.URL.createObjectURL(newBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Export_Audience_Personalize_${new Date().toLocaleString()}.xlsx`;
      // this is necessary as link.click() does not work on the latest firefox
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

      setTimeout(function () {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(url);
        link.remove();
      }, 100);

      this.dataService.showLoading(false);
    } catch (error) {
      console.log("err", error);
      this.dataService.showLoading(false);
      throw error;
    }
  }

  getRowClass = (row) => {    
    return {
      'row-invalid': row.is_valid === 0,
    };
   }
}
