import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { AudienceService } from 'app/services/dte/audience.service';
import { DataService } from 'app/services/data.service';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, forkJoin } from 'rxjs';
import { PagesName } from 'app/classes/pages-name';
import { IdbService } from 'app/services/idb.service';
import { DSDMulticategoryService } from "app/services/dsd-multicategory.service";
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  templateUrl: './trs-cancel-reason.component.html',
  styleUrls: ['./trs-cancel-reason.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TrsCancelReasonComponent {

  formCacelation: FormGroup;
  formExecutor: FormGroup;
  formFilter: FormGroup;

  loaded: Boolean;
  loadingIndicator = false;
  reorderable = true;
  onLoad: boolean;

  rows: any;
  temp: any[] = [];

  selected: any[];
  detailData: any;

  selectedMitra: any;
  profile: any;

  previewData: any = {
    is_valid: 0,
    preview_id: null,
    preview_task_id: null,
    total_selected: 0,
  };

  totalData: number = 0;
  checkDisabled: boolean = false;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    public dialogRef: MatDialogRef<TrsCancelReasonComponent>,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private audienceService: AudienceService,
    private dataService: DataService,
    private TRSService: DSDMulticategoryService,
    private idbService: IdbService,
    private ls: LanguagesService,
    @Inject(MAT_DIALOG_DATA) data: any,
    private translate: TranslateService,
  ) {
    this.selected = [];
    this.rows = [];
    this.detailData = data;
    this.profile = null;
    this.dataService.showLoading(false);
  }

  ngOnInit() {
    this.formCacelation = this.formBuilder.group({
      reason: ["", Validators.required]
    })

    this.aturPanelMitra();
  }

  aturPanelMitra() {
    this.selectedMitra = [];
    //this.onSelect({ selected: [] });

    this.dataService.showLoading(true);

    let request = {
      level: 6,
    };

    this.TRSService.getMasterReason(request).subscribe(res => {
      this.loaded = true;
      this.selectedMitra = res.data;

      let rows = [];
      res.data.forEach(function(detail) {
        rows.push({ name: detail.reason, value: detail.id });
      });

      this.rows = rows;
      this.dataService.showLoading(false);

    }, err => {
      console.log('err occured', err);
      this.dataService.showLoading(false);
    })
  }

  submit() {
    if (this.formCacelation.valid) {
      if (true){
        this.dataService.showLoading(true);
        let fd = new FormData();
        fd.append('reason', this.formCacelation.get('reason').value);
        
        this.TRSService.cancelProposal(fd, this.detailData.program_code).subscribe(res => {
          this.dataService.showLoading(false);

          if (res.status == 'success'){
            this.dialogService.openSnackBar({
              message: 'Program berhasil dibatalkan'
            });
          } else {
            this.dialogService.openSnackBar({
              message: 'GAGAL'
            });
            
          }
          this.dialogRef.close(res.status);
          
        }, err => {
          this.dataService.showLoading(false);
        })
      }
    } else {
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({
        message: "Reason harus diisi!"
      });
      commonFormValidator.validateAllFields(this.formCacelation);
    }
  }
}

