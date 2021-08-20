import { Component, OnInit, ViewChild, Input, ElementRef, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { NotificationService } from 'app/services/notification.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from 'app/services/data.service';
import { Lightbox } from 'ngx-lightbox';

import * as _ from 'underscore';
import * as moment from "moment";
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

@Component({
  selector: 'app-custom-notification-create',
  templateUrl: './custom-notification-create.component.html',
  styleUrls: ['./custom-notification-create.component.scss']
})
export class CustomNotificationCreateComponent implements OnInit {
  onLoad: boolean;
  loadingIndicator: boolean;
  formFilter: FormGroup;

  formNotification: FormGroup;
  formArea: FormGroup;
  formNotificationError: any;

  formDailyRecurrence: FormGroup;
  formRecurrenceCommon: FormGroup;

  dialogRef: any;
  typeArea: any[] = ["national", "zone", "region", "area", "salespoint", "district", "territory"];
  areaFromLogin;
  indexDelete: any;
  minStartDate: any = new Date();

  listLevelArea: any[];
  list: any;
  listContentType: any[] = [{ name: "Static Page", value: "static_page" }];
  listUserGroup: any[] = [{ name: "Retailer", value: "retailer" }, { name: "Customer", value: "customer" }];

  imageContentType: File;
  imageContentTypeBase64: any;
  imagePrivew: string;

  multipleImageContentType: any[];
  videoContentType: File;
  videoContentTypeURL: any;

  // public options: Object = Config.FROALA_CONFIG;
  // public optionsStaticPage: Object = Config.FROALA_CONFIG_NOTIFICATION; // Static Page Only

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
  ) {
    this.multipleImageContentType = [];
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

    this.listLevelArea = [
      {
        "id": 1,
        "parent_id": null,
        "code": "SLSNTL      ",
        "name": "SLSNTL"
      }
    ];

    this.list = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }
    route.url.subscribe(params => {
      console.log({ params });
      this.idNotif = (params[2]) ? params[2].path : null;
      this.actionType = params[1].path;
    })
    
    this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter(data);
      });
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

    this.formNotification.controls['user_group'].valueChanges.debounceTime(50).subscribe(res => {
      // if (res === 'retailer' || res === 'tsm') {
      //   this.listLandingPage = [{ name: "Belanja", value: "belanja" }, { name: "Misi", value: "misi" }, { name: "Pelanggan", value: "pelanggan" }, { name: "Bantuan", value: "bantuan" }, { name: "Profil Saya", value: "profil_saya" }, { name: "Pojok Modal", value: "pojok_modal" }];
      //   // this.formNotification.controls['landing_page_value'].disable();
      // } else {
      //   this.listLandingPage = [{ name: "Kupon", value: "kupon" }, { name: "Terdekat", value: "terdekat" }, { name: "Profil Saya", value: "profil_saya" }, { name: "Bantuan", value: "bantuan" }];
      //   // this.formNotification.controls['landing_page_value'].enable();
      // }
      if (res === 'wholesaler') {
        this.listContentType = [{ name: "Static Page", value: "static_page" }];
      } else {
        this.listContentType = [{ name: "Static Page", value: "static_page" }];
      }

      if (res !== 'customer') {
        this.formNotification.get('notif_type').setValidators([]);
        this.formNotification.get('notif_type').setValue('');
        this.formNotification.updateValueAndValidity();
      } else {
        this.formNotification.get('notif_type').setValidators([Validators.required]);
        this.formNotification.get('notif_type').setValue('notif');
        this.formNotification.updateValueAndValidity();
      }

      // if (this.formNotification.get("is_target_audience").value === true) {
      //   this.getAudience();
      // };

      this.selected.splice(0, this.selected.length);
      this.audienceSelected = [];
      this.contentType(this.formNotification.controls['content_type'].value);
    });

    this.formNotification.controls['user_group'].setValue('retailer');
    this.formNotification.controls['url_iframe'].disable();

    this.formNotification.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formNotification, this.formNotificationError);
    });

    this.formRecurrenceCommon.get('recurrence_end_date').valueChanges.subscribe(val => {
      if(val) {
        this.formRecurrenceCommon.controls['end_option'].setValue('end_date');
      }
    })

    this.formRecurrenceCommon.get('end_recurrence_count').valueChanges.subscribe(val => {
      if(val) {
        this.formRecurrenceCommon.controls['end_option'].setValue('end_count');
      }
    })

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
    // console.log(e);
    if (e.source.value === 'tsm') {
      this.formNotification.get('user_group').patchValue('tsm');
    }

    if(e.source.value != 'customer') {
      this.typeOfRecurrence = 'OneTime';
      this.formNotification.controls.type_of_recurrence.disable();
      this.formNotification.controls.send_ayo.setValue(true);
      this.formNotification.controls.send_ayo.disable();
      this.formNotification.controls.subscription_status.setValue('all');
    } else {
      this.formNotification.controls.type_of_recurrence.enable();
      this.formNotification.controls.send_ayo.enable();
      this.formNotification.controls.send_ayo.setValue(false);
    }
    console.log(this.formNotification.value.user_group);
  }

  async submit() {    
    if (!this.formNotification.valid) {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
      commonFormValidator.validateAllFields(this.formNotification);
      return;
    }

    let startDate

    if(this.typeOfRecurrence == 'OneTime') {
      let startDateStr = this.formNotification.controls.recurrence_start_date.value
      startDate = moment(startDateStr)

      if(!this.idNotif && !startDate.isSameOrAfter(moment(), 'day')) {
        this.dialogService.openSnackBar({ message: "Tanggal mulai tidak boleh sebelum hari ini!" });
        return;
      }
    }

    if (!this.rows.length) {
      this.dialogService.openSnackBar({ message: "Silakan lengkapi data terlebih dahulu!" });
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
        this.dialogService.openSnackBar({ message: "Data berhasil disimpan" });
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

  contentType(value) {
    if (this.imageContentTypeBase64 && this.imageContentType) {
      this.imageContentType = undefined;
      this.imageContentTypeBase64 = undefined;
    }

    if (this.multipleImageContentType && this.imageContentType) {
      this.imageContentType = undefined;
      this.multipleImageContentType = [];
    }

    if (this.videoContentType && this.videoContentTypeURL) {
      this.videoContentType = undefined;
      this.videoContentTypeURL = null;
    }

    if (value !== 'static_page') {
      this.formNotification.controls['static_page_title'].setValue('');
      this.formNotification.controls['static_page_body'].setValue('');
      this.formNotification.controls['static_page_title'].disable();
      this.formNotification.controls['static_page_body'].disable();
    } else {
      this.formNotification.controls['static_page_title'].enable();
      this.formNotification.controls['static_page_body'].enable();
    }

    if (value === 'iframe') {
      this.formNotification.controls['url_iframe'].setValue('');
      this.formNotification.controls['url_iframe'].enable();
    } else {
      this.formNotification.controls['url_iframe'].disable();
    }

    if (value === 'landing_page') {
      this.formNotification.controls['landing_page_value'].setValue('');
      this.formNotification.controls['landing_page_value'].enable();
    } else {
      this.formNotification.controls['landing_page_value'].disable();
    }
  }

  getToolTipData(value, array) {
    if (value && array.length) {
      let msg = array.filter(item => item.id === value)[0]['name'];
      return msg;
    } else {
      return "";
    }
  }

  findDuplicate(array) {
    var object = {};
    var result = [];

    array.forEach(function (item) {
      if (!object[item])
        object[item] = 0;
      object[item] += 1;
    })

    for (var prop in object) {
      if (object[prop] >= 2) {
        result.push(prop);
      }
    }

    return result;
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  
  setPage(pageInfo) {
    // this.setPagination();
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;
    this.notificationService.getPushNotifAudience(this.pagination).subscribe(res => {
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
    this.formNotification.controls.search.disable();
    
    // this.setPagination();

    this.notificationService.getPushNotifAudience(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
      this.formNotification.controls.search.enable();
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;
    
    // this.setPagination();

    this.formNotification.controls.search.disable();

    this.notificationService.getPushNotifAudience(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.allRowsSelected = false;
      this.audienceSelected = [];
      this.onSelect({ selected: this.audienceSelected });
      this.loadingIndicator = false;
      this.formNotification.controls.search.enable();
    });
  }

  displayCheck(row) {
    return row.name !== 'Ethel Price';
  }

  onSelectAudience(event, row) {
    let index = this.audienceSelected.findIndex(id => id === row.id);
    if (index > - 1) {
      this.audienceSelected.splice(index, 1);
      this.allRowsSelected = false;
    } else {
      this.audienceSelected.push(row.id);
    }
    this.onSelect({ selected: this.audienceSelected });
    console.log('asdasd', this.audienceSelected);
  }

  selectCheck(row, column, value) {
    console.log('selectcheck', row, column, value);
    return row.id !== null;
  }

  bindSelector(isSelected, row) {
    let index = this.audienceSelected.findIndex(id => id === row.id);
    return index > -1;
  }

  onSelectAll(allRowsSelected: boolean) {
    console.log('allRowsSelected', allRowsSelected);
    this.allRowsSelected = allRowsSelected;
    if(this.allRowsSelected) {
      // this.setPagination();
      this.loadingIndicator = true;
      this.formNotification.controls.search.disable();
      this.audienceSelected = this.selected = [];
      (async () => {
        let loadMoreIds = true;
        let offset = 0;
        while(loadMoreIds) {
          let queryParams = {
            ...this.pagination,
            offset
          }
          const res = await this.notificationService.getPushNotifAudienceIDs(queryParams).toPromise();
          this.audienceSelected = [...this.audienceSelected, ...res];
          this.selected = [...this.audienceSelected];
          if(res.length >= 50000) {
            offset += res.length;
          } else {
            loadMoreIds = false;
          }
        }
        
        this.loadingIndicator = false;
        this.formNotification.controls.search.enable();
      })();
      
    } else {
      this.audienceSelected = [];
      this.onSelect({ selected: this.audienceSelected });
    }
  }

  // isTargetAudience(event) {
  //   if (event.checked) this.getAudience();
  // }

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

  handleError(error) {
    console.log('Here')
    console.log(error)

    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.log(error);
    // alert('Open console to see the error')
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
      frm.controls['type_of_recurrence'].setValue(data.type_of_recurrence);

      if(data.type == 'customer') {
        frm.controls['send_ayo'].setValue(data.send_sfmc == null || data.send_sfmc == 0 || data.send_sfmc == '0');
      } else {
        frm.controls['send_ayo'].setValue(true);
      }

      if (data.target_details.length) {
        let res = {
          total: data.target_details.length
        }
        Page.renderPagination(this.pagination, res);
        this.rows = data.target_details;
      }

      let publish = data.publish_at.split(" ");
      frm.controls['recurrence_start_date'].setValue(publish[0]);
      frm.controls['recurrence_time'].setValue(publish[1]);

      // end request
      frm.disable();
      this.dataService.showLoading(false);
    } catch (error) {
      console.log({ error });
      this.dataService.showLoading(false);

    }
  }
}