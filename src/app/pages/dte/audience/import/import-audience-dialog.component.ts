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
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

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
  ENABLE_IMPORT_IF = ['done', 'failed'];
  detailData: any;
  previewData: any = {
    is_valid: 0,
    preview_id: null,
    preview_task_id: null,
    total_selected: 0,
  };

  requestingPreview:boolean = false;
  requestingImport: boolean = false;
  importing: boolean = false;
  createData = null;

  constructor(
    public dialogRef: MatDialogRef<ImportAudienceDialogComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    private dataService: DataService,
    private idbService: IdbService,
    private ls: LanguagesService,
    @Inject(MAT_DIALOG_DATA) data: any,
    private translate: TranslateService,
  ) {
    this.rows = [];
    this.detailData = data;
    this.dataService.showLoading(false);

    if(data.IMPORT_TYPE === 'AUDIENCE') {

      if (!this.ENABLE_IMPORT_IF.includes(data.import_audience_status) && data.import_audience_status_type === 'preview') {

        this.requestingPreview = true;

      } else {

        this.getPreview();

      }
      if(!this.ENABLE_IMPORT_IF.includes(data.import_audience_status) && data.import_audience_status_type === 'import') {
        
        this.requestingImport = true;

      } else {
        
        this.requestingImport = false;

      }

    }
  }

  ngOnInit() {
  }
  onFileChange(event) {
    const {IMPORT_TYPE} = this.detailData;
    if(IMPORT_TYPE && IMPORT_TYPE === 'AUDIENCE') {

      this.requestPreview(event);

    } else {

      this.preview(event);

    }
  }

  preview(event) {
    this.files = undefined;
    this.files = event;

    let fd = new FormData();
    this.idbService.reset();
    fd.append('file', this.files);
    this.dataService.showLoading(true);
    this.audienceService.importExcel(fd).subscribe(
      res => {
        if (res && res.data) {
          // this.recursiveImport(res);
          this.pagination['per_page'] = 250;
          this.audienceService.showImport(this.pagination).subscribe(response => {
            this.currPage += 1;
            this.lastPage = response.data.last_page;
            this.totalData = response.data.total;
            this.idbService.bulkUpdate(response.data.data).then(res => {
              console.log('page', this.currPage - 1, res);
              this.recursiveImport();
            }, err => {
              this.dialogService.openSnackBar({
                message: this.translate.instant('global.label.failed_import')
              })
              this.dialogRef.close([]);
            })
          }, err => {
            console.log('error show import', err);
            this.dataService.showLoading(false);
            this.files = undefined;

            if (err.status === 404 || err.status === 500)
              this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text16') })
          })
        } else {
          this.dataService.showLoading(false);
          this.files = undefined;
          this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text16') })
        }

      },
      err => {
        this.dataService.showLoading(false);
        this.files = undefined;

        if (err.status === 404 || err.status === 500)
          this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text16') })
      }
    )
  }
  requestPreview(event) {
    this.files = undefined;
    this.files = event;

    const {trade_audience_group_id} = this.detailData;
    const {formAudience, pagination} = this.detailData;
    if (formAudience) formAudience.business_type = "all";
    console.log({formAudience, pagination});
    
    if (this.requestingPreview) {
      this.dialogService.openSnackBar({ message: this.translate.instant('dte.approval_coin_adjustment.request_preview_onprogress') });
      return;
    }

    let fd = new FormData();
    this.idbService.reset();
    fd.append('file', this.files);
    
    if(trade_audience_group_id) {

      fd.append('trade_audience_group_id', trade_audience_group_id);

    }

    if(this.detailData.IMPORT_FROM_METHOD) {
      
      for(let key in formAudience) {
        if(!['business_checkbox', 'geotree_checkbox'].includes(key)) {
          fd.append(`create_data[${key}]`, formAudience[key]);
        }
      }
      fd.append('is_create', 'yes');
      
    }


    console.log({fd});
    this.dataService.showLoading(true);
    
    this.audienceService.requestPreviewImportExcel(fd).subscribe((res) => {

      if(this.detailData.IMPORT_FROM_METHOD && this.detailData.IMPORT_FROM_METHOD === 'CREATE') {

        this.dataService.setToStorage('create_audience_import_status', {
          import_audience_status: "running",
          import_audience_status_type: "preview"
        });

      }
      
      this.setRequesting('preview');
      this.dataService.showLoading(false);

    }, err => {

      this.dataService.showLoading(false);

    })
  }

  recursiveImport() {
    if (this.currPage <= this.lastPage) {
      this.audienceService.showImport({ page: this.currPage }).subscribe(response => {
        if (response && response.data) {
          this.idbService.bulkUpdate(response.data.data).then(res => {
            console.log('page', this.currPage - 1, res);
            this.currPage += 1;
            this.lastPage = response.data.last_page;
            this.recursiveImport();
          }, err => {
            this.dialogService.openSnackBar({
              message: this.translate.instant('global.label.failed_import')
            })
            this.dialogRef.close([]);
          })
        } else {
          this.dialogService.openSnackBar({
            message: this.translate.instant('global.label.failed_import')
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
              message: this.translate.instant('global.messages.failed_partial_import_at') + this.trials.join(",")
            })
            this.dialogRef.close([]);
          })
        }, err => {
          this.dialogService.openSnackBar({
            message: this.translate.instant('global.messages.failed_partial_import_at') + this.trials.join(",")
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
      let response = this.audienceService.showImport({ page: trial });
      trialsRes.push(response);
    })

    return forkJoin(trialsRes);
  }

  onPageChange(pageInfo) {
    const {IMPORT_TYPE} = this.detailData;
    if(IMPORT_TYPE === 'AUDIENCE') {
      this.setPageFromServer(pageInfo)
    } else {
      this.setPage(pageInfo);
    }
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
  setPageFromServer({offset}) {
    this.dataService.showLoading(true);
    const {trade_audience_group_id} = this.detailData;
    this.offsetPagination = offset;
    this.pagination.page = offset + 1;
    this.audienceService.showPreviewImportNew(this.pagination).subscribe(({data}) => {
      this.setPreview(data);
    }, err => {
      this.dataService.showLoading(false);
    })

  }

  submit() {
    let {IMPORT_TYPE, min, max, type, audience_type} = this.detailData;
    const {trade_creator_id, trade_scheduler_id} = this.previewData;
    let is_create = (this.detailData.IMPORT_FROM_METHOD === 'CREATE') ? 'yes' : 'no';
    if(IMPORT_TYPE === 'AUDIENCE') {
      const {is_valid, preview_id, preview_task_id} = this.previewData;

      if(is_valid && preview_id && preview_task_id) {
        const formData = new FormData();
        formData.append("type", type)
        formData.append("preview_id", preview_id)
        formData.append("preview_task_id", preview_task_id)
        formData.append("audience_type", audience_type)
        formData.append("trade_creator_id", trade_creator_id)

        if (audience_type === "scheduler" || type === "challenge") {
          formData.append("trade_scheduler_id", trade_scheduler_id)
        }
        
        this.audienceService.requestImportExcel(formData).subscribe(res => {
          this.setRequesting('import');
          window.localStorage.setItem('isImport', 'true');
          this.dialogRef.close({...this.previewData});
        })

      } else {

        this.dialogService.openSnackBar({ message: this.translate.instant('global.label.invalid_data') });

      }
    }

    else {
      
      if (this.totalData > 0) {
        this.dialogRef.close(true);
      } else {
        this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text17') });
      }

    }
  }
  getPreview() {
    this.dataService.showLoading(true);
    // this.idbService.reset();
    const {trade_audience_group_id} = this.detailData;
    this.offsetPagination = 0;

    this.audienceService.showPreviewImportNew(this.pagination).subscribe(({data}) => {
      this.setPreview(data);
    }, err => {
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar(err.error);
    });
  }
  setPreview(data) {
    this.lastPage = data.data.last_page;
    this.totalData = data.data.total;
    this.rows = data.data.data;
    this.previewData = {
      is_valid: data.is_valid,
      preview_id: data.preview_id,
      preview_task_id: data.preview_task_id,
      total_selected: data.data.total,
    }
    if(this.detailData.IMPORT_FROM_METHOD === 'CREATE') {
      this.previewData = {
        ...this.previewData,
        trade_creator_id: data.create_data.trade_creator_id,
        trade_scheduler_id: data.create_data.trade_scheduler_id,
      }
    }
    // this.p_pagination = { page: this.p_page, per_page: 15, last_page: this.lastPage, total: this.totalData };
    Page.renderPagination(this.pagination, data.data);
    this.dataService.showLoading(false);

    if (!data.is_valid) {
      this.dialogService.openSnackBar({ message: "File yang Anda upload tidak sesuai" });
    }
  }

  setRequesting(reqType) {
    const newStatus = {
      import_audience_status: 'request',
      import_audience_status_type: reqType
    }

    if(reqType === 'import') {
      
      this.importing = true;

    } else {

      this.requestingPreview = true;

    }
    
    if(this.detailData.IMPORT_FROM_METHOD && this.detailData.IMPORT_FROM_METHOD === 'CREATE') {

      this.dataService.setToStorage('create_audience_import_status', {
        import_audience_status: "running",
        import_audience_status_type: reqType,
      });

    }

    const newDetailAudience = {
      ...this.dataService.getFromStorage('detail_audience'),
      ...newStatus
    }
    this.dataService.setToStorage('detail_audience', newDetailAudience);

  }

  getRowClass = (row) => {
    return {
      'row-invalid': row.validated === 0,
    };
  }

}
