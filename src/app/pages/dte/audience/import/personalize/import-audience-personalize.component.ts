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
  selector: 'app-import-audience-personalize',
  templateUrl: './import-audience-personalize.component.html',
  styleUrls: ['./import-audience-personalize.component.scss']
})
export class ImportAudiencePersonalizeComponent implements OnInit {

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
    public dialogRef: MatDialogRef<ImportAudiencePersonalizeComponent>,
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

  ngOnInit() {}

  requestPreview(event) {
    this.files = undefined;
    this.files = event;
    
    if (this.requestingPreview) {
      this.dialogService.openSnackBar({ message: this.translate.instant('dte.approval_coin_adjustment.request_preview_onprogress') });
      return;
    }

    let fd = new FormData();
    this.idbService.reset();
    fd.append('file', this.files);
    fd.append('create_data[business_type]', this.detailData.business_type);
    
    this.dataService.showLoading(true);
    
    this.audienceService.requestPreviewImportPerso(fd).subscribe((res) => {

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

  submit() {
    const {is_valid, preview_id, preview_task_id} = this.previewData;

    if(is_valid && preview_id && preview_task_id) {
      this.setRequesting('import');
      this.dialogRef.close({...this.previewData});
    } else {
      this.dialogService.openSnackBar({ message: this.translate.instant('global.label.invalid_data') });
    }
  }

  onPageChange(pageInfo) {
    this.setPageFromServer(pageInfo)
  }

  setPageFromServer({offset}) {
    this.dataService.showLoading(true);
    
    this.offsetPagination = offset;
    this.pagination.page = offset + 1;

    this.audienceService.showPreviewImportPerso(this.pagination).subscribe(({data}) => {
      this.setPreview(data);
    }, err => {
      this.dataService.showLoading(false);
    });
  }

  getPreview() {
    this.dataService.showLoading(true);
    // this.idbService.reset();
    const {trade_audience_group_id} = this.detailData;
    this.offsetPagination = 0;

    this.audienceService.showPreviewImportPerso(this.pagination).subscribe(({data}) => {
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
