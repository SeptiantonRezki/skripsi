import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { CustomerCareService } from 'app/services/customer-care.service';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { isArray } from 'lodash';
import { Observable, Subject } from 'rxjs';
import moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-device-recovered',
  templateUrl: './device-recovered.component.html',
  styleUrls: ['./device-recovered.component.scss']
})
export class DeviceRecoveredComponent implements OnInit {
  selectedTab: number;
  rows: any[];
  selected: any[];
  id: any[];

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  keyUp = new Subject<string>();

  @ViewChild('activeCell')
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;

  roles: PagesName = new PagesName();
  permission: any;
  max_retailer: FormControl = new FormControl('', [Validators.required, Validators.min(0)]);
  reasonRecovery: FormControl = new FormControl('', Validators.required);
  formFilter: FormGroup;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private customerCareService: CustomerCareService,
    private formBuilder: FormBuilder,
    private ls: LanguagesService
  ) {
    this.onLoad = true;
    this.selected = [];

    this.permission = this.roles.getRoles('principal.popupnotification');
    console.log(this.permission);

    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter(data);
      });
  }

  ngOnInit() {
    this.formFilter = this.formBuilder.group({
      start_date: [''],
      end_date: [''],
    })
    this.getDeviceRecoveredList();
    this.getDeviceRecoverySettings();
  }

  getDeviceRecoverySettings() {
    this.customerCareService.getDeviceRecoverySettings().subscribe(res => {
      if (res && res.data && isArray(res.data)) {
        let settings = res.data.find(r => r.name === 'max_login');
        if (settings) this.max_retailer.setValue(settings.values);
      }
    })
  }

  getDeviceRecoveredList() {
    this.dataService.showLoading(true);
    this.customerCareService.getDeviceRecovered(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data ? res.data.data : [];
        this.onLoad = false;
        this.loadingIndicator = false;
        this.dataService.showLoading(false);
      },
      err => {
        console.error(err);
        this.onLoad = false;
        this.dataService.showLoading(false);
      }
    );
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.customerCareService.getDeviceRecovered(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    console.log('check pagination', this.pagination);

    this.customerCareService.getDeviceRecovered(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  updateFilter(string?) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;
    this.pagination['start_date'] = this.formFilter.get('start_date').value ? this.convertDate(this.formFilter.get('start_date').value) : null;
    this.pagination['end_date'] = this.formFilter.get('end_date').value ? this.convertDate(this.formFilter.get('end_date').value) : null;

    console.log(this.pagination);

    this.customerCareService.getDeviceRecovered(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return '';
  }

  submit(submitType) {
    let title = submitType === 'setting' ? 'Ubah Pengaturan' : 'Pulihkan Semua Perangkat';
    let caption = submitType === 'setting' ? `Anda akan merubah jumlah maksimal akun retailer yang dapat login pada 1 perangkat.
    <br>Jika angka terbaru < angka sebelumnya, anda perlu melakukan pemulihan perangkat agar system berjalan semestinya.
    <br><br>
    Yakin untuk melanjutkan ?
    ` : `Anda akan mereset semua historical akun pada device yang sudah ada.
    <br><br>
    Yakin untuk melanjutkan ?
    ` // TODO

    if (submitType === 'setting' && !this.max_retailer.valid) {
      this.dialogService.openSnackBar({ message: 'Periksa Data Pengaturan kembali karena data tidak valid!' }); // TODO
      return;
    }

    if (submitType === 'recovery' && !this.reasonRecovery.valid) {
      this.dialogService.openSnackBar({ message: 'Alasan Harus Diisi, periksa kembali!' }); // TODO
      return;
    }

    let data = {
      titleDialog: title,
      captionDialog: caption,
      htmlContent: true.valueOf,
      confirmCallback: () => this.confirmSubmit(submitType),
      buttonText: [this.ls.locale.global.button.yes_continue, this.ls.locale.global.button.cancel] // TODO
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmSubmit(submitType) {
    this.dataService.showLoading(true);
    let body = {
      type: submitType,
      value: submitType === 'setting' ? this.max_retailer.value : this.reasonRecovery.value
    }
    this.customerCareService.updateDeviceRecoverySettings(body).subscribe(res => {
      this.dataService.showLoading(false);
      this.dialogService.brodcastCloseConfirmation();
      this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
      if (submitType === 'setting') this.getDeviceRecoverySettings();
      if (submitType === 'recovery') {
        this.selectedTab = 0;
        this.ngOnInit();
      }
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  async export() {
    let params = {};
    params['start_date'] = this.formFilter.get('start_date').value ? this.convertDate(this.formFilter.get('start_date').value) : null;
    params['end_date'] = this.formFilter.get('end_date').value ? this.convertDate(this.formFilter.get('end_date').value) : null;
    this.dataService.showLoading(true);
    const fileName = `Perangkat_yang_Dipulihkan_${moment(new Date()).format('YYYY_MM_DD')}.xls`;
    try {
      const response = await this.customerCareService.exportListDeviceRecovered(params).toPromise();
      this.downLoadFile(response, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', fileName);
      this.dataService.showLoading(false);
    } catch (error) {
      if (!(error instanceof HttpErrorResponse)) {
        error = error.rejection;
      }
      console.log('err', error);
      alert('Terjadi kesalahan saat Export File');
      this.dataService.showLoading(false);
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


}
