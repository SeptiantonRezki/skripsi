import { Component, OnInit, ViewChild, Input, ElementRef, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { NotificationService } from 'app/services/notification.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from 'app/services/data.service';
import { Lightbox } from 'ngx-lightbox';

import * as _ from 'underscore';
import moment from 'moment';
import { Config } from 'app/classes/config';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { Observable, Subject } from 'rxjs';
import { RetailerService } from 'app/services/user-management/retailer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { ImportPopUpAudienceComponent } from 'app/pages/popup-notification/import-pop-up-audience/import-pop-up-audience.component';
import { GeotreeService } from 'app/services/geotree.service';
import { TemplateTaskService } from 'app/services/dte/template-task.service';
import { P } from '@angular/core/src/render3';
import { ImportCustomNotificationComponent } from './import/import-custom-notification.component';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-custom-notification-create',
  templateUrl: './custom-notification-create.component.html',
  styleUrls: ['./custom-notification-create.component.scss']
})
export class CustomNotificationCreateComponent implements OnInit {
  onLoad: boolean;
  loadingIndicator: boolean;

  formNotification: FormGroup;
  formNotificationError: any;
  dialogRef: any;
  areaFromLogin;
  minStartDate: any = new Date();

  listContentType: any[] = [{ name: this.translate.instant('global.label.static_page'), value: "static_page" }];
  listUserGroup: any[] = [{ name: this.translate.instant('global.menu.retailer'), value: "retailer" }, { name: this.translate.instant('customer.text1'), value: "customer" }];

  audienceSelected: any[] = [];

  listDates: number[];
  @ViewChild('downloadLink') downloadLink: ElementRef;
  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;
  SelecectionType = SelectionType;

  rows: any[];
  selected: any[] = [];
  id: any[];
  allRowsSelected = false;
  reorderable = true;
  pagination: Page = new Page();

  keyUp = new Subject<string>();

  // 2 geotree property
  endArea: String;
  area_id_list: any = [];
  areaType: any;
  lastLevel: any;
  actionType: string = 'create';
  idNotif: any = '';

  _typeOfRecurrence: string;
  _recurrenceType: string;
  pageName = this.translate.instant('notification.text');
  titleParam = {entity: this.pageName}

  @Input() get typeOfRecurrence(): string {
    return this._typeOfRecurrence
  }

  set typeOfRecurrence(val: string) {
    this._typeOfRecurrence = val;
    if(this._typeOfRecurrence !== 'Recurring') {
      this.recurrenceType = '';
    }
  }

  @Input() get recurrenceType(): string {
    return this._recurrenceType
  }

  set recurrenceType(val: string) {
    this._recurrenceType = val;
  }

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private _lightbox: Lightbox,
    private retailerService: RetailerService,
    private dialog: MatDialog,
    private geotreeService: GeotreeService,
    private taskTemplateService: TemplateTaskService,
    private route: ActivatedRoute,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    this.areaType = this.dataService.getDecryptedProfile()['area_type'];
    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
    this.formNotificationError = {
      title: {},
      body: {},
      user: {},
      user_group: {},
      age: {},
      notif_type: {},
    };
    this.rows = [];

    route.url.subscribe(params => {
      console.log({ params });
      this.idNotif = (params[2]) ? params[2].path : null;
      this.actionType = params[1].path;
    })
    
    // this.keyUp.debounceTime(1000)
    //   .distinctUntilChanged()
    //   .flatMap(search => {
    //     return Observable.of(search).delay(500);
    //   })
    //   .subscribe(data => {
    //     this.updateFilter(data);
    //   });
  }

  ngOnInit() {
    if (this.actionType == 'detail-custom') {
      this.getDetails();
    }
    this.formNotification = this.formBuilder.group({
      user_group: ["retailer", Validators.required],
      content_type: ["static_page", Validators.required],
      type_of_recurrence: ["OneTime", Validators.required],
      recurrence_type: [""],
      send_ayo: [false],
      status: ["Active"],
      recurrence_start_date: ["", Validators.required],
      recurrence_time: ["", Validators.required]
    });

    this.listDates = Array.from({length: 31}, (_, i) => i + 1)

    this.typeOfRecurrence = 'OneTime';

    this.formNotification.controls['user_group'].setValue('retailer');

    this.formNotification.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formNotification, this.formNotificationError);
    });

    if(this.formNotification.controls.user_group.value !== 'customer') {
      this.formNotification.controls.type_of_recurrence.disable();
      this.formNotification.controls.send_ayo.setValue(true);
      this.formNotification.controls.send_ayo.disable();
    }
  }

  onDocUpload() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = {type: this.formNotification.value.user_group};

    this.dialogRef = this.dialog.open(ImportCustomNotificationComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(res => {
      if (res) {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
      } else{
        console.log('res => ', res);
      }
    });
  }

  selectChange(e: any) {
    if(e.source.value != 'customer') {
      this.typeOfRecurrence = 'OneTime';
      this.formNotification.controls.send_ayo.setValue(true);
      this.formNotification.controls.send_ayo.disable();
    } else {
      this.formNotification.controls.send_ayo.enable();
      this.formNotification.controls.send_ayo.setValue(false);
    }
    console.log(this.formNotification.value.user_group);
  }

  async submit() {    
    if (!this.formNotification.valid) {
      this.dialogService.openSnackBar({ message: this.translate.instant('global.label.please_complete_data') });
      commonFormValidator.validateAllFields(this.formNotification);
      return;
    }

    let startDate

    if(this.typeOfRecurrence == 'OneTime') {
      let startDateStr = this.formNotification.controls.recurrence_start_date.value
      startDate = moment(startDateStr)

      if(!this.idNotif && !startDate.isSameOrAfter(moment(), 'day')) {
        this.dialogService.openSnackBar({ message: this.translate.instant('notification.buat_notifikasi.message1') });
        return;
      }
    }

    if (!this.rows.length) {
      this.dialogService.openSnackBar({ message: this.translate.instant('global.label.please_complete_data') });
      commonFormValidator.validateAllFields(this.formNotification);
      return;
    }

    let body: any = {
      type: this.formNotification.get("user_group").value,
      content_type: this.formNotification.get('content_type').value,
      type_of_recurrence: this.typeOfRecurrence,
      send_sfmc: this.formNotification.get('send_ayo').value ? '0': '1',
      status: this.formNotification.get('status').value,
      publish_at:'',
      target_details: this.rows,
      area_id: 1,
    };

    let recurrence_time = this.formNotification.get('recurrence_time').value;
    let recurrence_start_date = startDate.format('YYYY-MM-DD');
    body.publish_at = recurrence_start_date + " " + recurrence_time + ":00";
    
    // if (this.actionType === 'detail-custom') {
    //   let timeLength = recurrence_time.split(":").length;
    //   if (timeLength > 2) {
    //     body.publish_at = recurrence_start_date + " " + recurrence_time;        
    //   } else{
    //     body.publish_at = recurrence_start_date + " " + recurrence_time + ":00";
    //   }
    // } else{
    //   body.publish_at = recurrence_start_date + " " + recurrence_time + ":00";
    // }
    
    // //if edit
    // if(this.idNotif) {
    //   body.id = Number(this.idNotif);
    // }

    this.dataService.showLoading(true);
    console.log('body',body);
    
    this.notificationService.createCustom(body).subscribe(
      res => {
        this.router.navigate(["notifications"]);
        this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
        this.dataService.showLoading(false);
      },
      err => {
        // this.dialogService.openSnackBar({ message: err.error.message });
        // this.loadingIndicator = false;
        console.log('err',err);
        this.dataService.showLoading(false);
      }
    );
  }
  
  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;
    this.notificationService.getCustom(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.notificationService.getCustom(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  async export() {
    this.dataService.showLoading(true);

    let params = this.idNotif ? {id: this.idNotif} : '';

    try {
      const response = await this.notificationService.exportCustom(params).toPromise();
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `CustomizedNotification_${this.formNotification.get("user_group").value}_${new Date().toLocaleString()}.xlsx`);
      this.dataService.showLoading(false);
    } catch (error) {
      console.log('err', error);
      this.dataService.showLoading(false);
      throw error;
    }
  }

  downLoadFile(data: any, type: string, fileName: string) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    var newBlob = new Blob([data], { type: type });

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(newBlob);
      return;
    }

    // For other browsers: 
    // Create a link pointing to the ObjectURL containing the blob.
    const url = window.URL.createObjectURL(newBlob);

    var link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    setTimeout(function () {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(url);
      link.remove();
    }, 100);
  }

  async getDetails() {
    try {
      this.dataService.showLoading(true);
      
      const {data} = await this.notificationService.showCustom({ notification_id: this.idNotif }).toPromise();

      const frm = this.formNotification;
      frm.controls['user_group'].setValue(data.type);
      frm.controls['content_type'].setValue(data.content_type);
      frm.controls['status'].setValue(data.status);
      frm.controls['type_of_recurrence'].setValue(data.type_of_recurrence);

      if(data.type == 'customer') {
        frm.controls['send_ayo'].setValue(data.send_sfmc == null || data.send_sfmc == 0 || data.send_sfmc == '0');
      } else {
        frm.controls['send_ayo'].setValue(true);
      }

      let publish = data.publish_at.split(" ");
      frm.controls['recurrence_start_date'].setValue(publish[0]);
      frm.controls['recurrence_time'].setValue(publish[1]);

      this.getTargetDetails();

      // end request
      frm.disable();
      this.dataService.showLoading(false);
    } catch (error) {
      console.log({ error });
      this.dataService.showLoading(false);

    }
  }

  getTargetDetails(){
    this.pagination.notification_id = this.idNotif;
    this.notificationService.getCustom(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
        this.loadingIndicator = false;
      },
      err => {
        console.error(err);
      }
    );
  }
}