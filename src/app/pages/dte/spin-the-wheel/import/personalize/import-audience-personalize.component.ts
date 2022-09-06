import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from 'app/services/dialog.service';
import { AudienceService } from 'app/services/dte/audience.service';
import { SpinTheWheelService } from 'app/services/dte/spin-the-wheel.service';
import { DataService } from 'app/services/data.service';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, forkJoin } from 'rxjs';
import { PagesName } from 'app/classes/pages-name';
import { IdbService } from 'app/services/idb.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-import-audience-personalize',
  templateUrl: './import-audience-personalize.component.html',
  styleUrls: ['./import-audience-personalize.component.scss']
})
export class ImportAudiencePersonalizeComponentSPW implements OnInit {

  files: File;
  validComboDrag: boolean;

  uploading: Boolean;
  rows: any[];
  invalidData: boolean = false;
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
  allData: Array<any> = [];
  validData = [];
  numError: number = 1;

  constructor(
    public dialogRef: MatDialogRef<ImportAudiencePersonalizeComponentSPW>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private audienceService: AudienceService,
    private spinTheWheelService: SpinTheWheelService,
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

  preview(event) {
    this.files = undefined;
    this.files = event;

    let fd = new FormData();
    this.idbService.reset();
    fd.append('file', this.files);
    this.dataService.showLoading(true);
    this.spinTheWheelService.importExcel(fd).subscribe(
      res => {
        if (res && res.data) {
          this.dataService.showLoading(false);
          this.pagination['per_page'] = 1000;
          this.spinTheWheelService.showImport(this.pagination).subscribe(response => {
            // console.log('satu', this.pagination);
            const {data} = response.data;
            this.allData = [...data];
            this.invalidData = this.allData.some(item => item.is_valid === false);
            this.validData = data.filter(item => item.is_valid === true);

            // data.sort((a,b) => (a.is_valid > b.is_valid ? 1 : -1));
            data.map((item, idx) => {
              if (item.id === '') {
                data[idx].id = 'error'+this.numError;
                this.numError += 1;
              } 
            });

            this.currPage += 1;
            this.lastPage = response.data.last_page;
            this.totalData = response.data.total;

            this.idbService.bulkUpdate(data).then(res => {
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
    );
  };
  
  recursiveImport() {
    if (this.currPage <= this.lastPage) {
      this.spinTheWheelService.showImport({ page: this.currPage, per_page: this.pagination['per_page'] }).subscribe(response => {
        // console.log('dua');
        if (response && response.data) {
          const {data} = response.data;
          this.allData = [...this.allData, ...data];
          if (!this.invalidData) {
            this.invalidData = this.allData.some(item => item.is_valid === false);
          }

          const newData = data.filter(item => item.is_valid === true);
          this.validData = [...this.validData, ...newData];
          
          // data.sort((a,b) => (a.is_valid > b.is_valid ? 1 : -1));
          data.map((item, idx) => {
            if (item.id === '') {
              data[idx].id = 'error'+this.numError;
              this.numError += 1;
            } 
          })

          this.idbService.bulkUpdate(data).then(res => {
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
        if (this.invalidData) {
          this.dialogService.openSnackBar({
            message: this.translate.instant('global.label.invalid_data_double_check')
          });
        }
        
        this.pagination['per_page'] = 15;
        this.idbService.paginate(this.pagination)
          .then(res => {
            this.p_pagination = { page: this.p_page, per_page: 15, last_page: Math.ceil(this.totalData / 15), total: this.totalData };
            Page.renderPagination(this.pagination, this.p_pagination);
            this.rows = res && res[0] ? res[0] : [];
            this.dataService.showLoading(false);
          })
          .then(() => this.setPage({offset: 0}));
      }
    }
  }

  submit() {
    const {IMPORT_TYPE, min, max, trade_scheduler_id, type, audience_type} = this.detailData;
    if(IMPORT_TYPE === 'AUDIENCE') {
      const {is_valid, preview_id, preview_task_id} = this.previewData;

      if(is_valid && preview_id && preview_task_id) {
        this.audienceService.requestImportExcel({
          preview_id,
          preview_task_id,
          min, max,
          trade_scheduler_id, type,
          audience_type
        }).subscribe(res => {
          this.setRequesting('import')
          this.dialogRef.close({...this.previewData});
        })
      } else {
        this.dialogService.openSnackBar({ message: this.translate.instant('global.label.invalid_data') });
      }
    }
    else {
      if (this.totalData > 0) {
        this.dialogRef.close(this.validData);
      } else {
        this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text17') });
      }
    }
  }

  trialImport() {
    let trialsRes = [];
    this.trials.map(trial => {
      let response = this.spinTheWheelService.showImport({ page: trial, per_page: this.pagination['per_page'] });
      // console.log('tiga');
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
    this.audienceService.showPreviewImport({trade_audience_group_id}, this.pagination).subscribe(({data}) => {
      this.setPreview(data);
    }, err => {

      this.dataService.showLoading(false);

    })

  }

  getPreview() {
    this.dataService.showLoading(true);
    // this.idbService.reset();
    const {trade_audience_group_id} = this.detailData;
    this.offsetPagination = 0;

    this.audienceService.showPreviewImport({trade_audience_group_id}, this.pagination).subscribe(({data}) => {
      this.setPreview(data);
    }, err => {
      this.dataService.showLoading(false);
    });
    
  }
  setPreview(data) {
    this.lastPage = data.data.last_page;
    this.totalData = data.data.total;
    this.rows = (data.data.data || []).map(item => item.preview);
    this.previewData = {
      is_valid: data.is_valid,
      preview_id: data.preview_id,
      preview_task_id: data.preview_task_id,
      total_selected: data.data.total,
    }
    // this.p_pagination = { page: this.p_page, per_page: 15, last_page: this.lastPage, total: this.totalData };
    Page.renderPagination(this.pagination, data.data);
    this.dataService.showLoading(false);
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
    const newDetailAudience = {
      ...this.dataService.getFromStorage('detail_audience'),
      ...newStatus
    }
    this.dataService.setToStorage('detail_audience', newDetailAudience);
  }

  getRowClass = (row) => {
    return {
      'row-invalid': row.is_valid === false,
    };
  }
}
