import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { PagesName } from 'app/classes/pages-name';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { GeotreeService } from 'app/services/geotree.service';
import { PengajuanSrcService } from 'app/services/user-management/pengajuan-src.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-pengajuan-src',
  templateUrl: './pengajuan-src.component.html',
  styleUrls: ['./pengajuan-src.component.scss']
})
export class PengajuanSrcComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any[];

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;
  listProvince: any[] = [];
  listCities: any[] = [];
  listDistricts: any[] = [];

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;

  listLevelArea: any[];
  list: any;
  areaFromLogin;
  formFilter: FormGroup;
  filterArea: Boolean;
  area_id_list: any = [];


  permission: any;
  roles: PagesName = new PagesName();

  offsetPagination: any;

  // 2 geotree property
  endArea: String;
  lastLevel: any;
  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private geotreeService: GeotreeService,
    private pengajuanSrcService: PengajuanSrcService
  ) {
    this.onLoad = true;
    this.selected = [];

    this.permission = this.roles.getRoles('principal.pengajuansrc');
    console.log(this.permission);

    this.areaFromLogin = this.dataService.getDecryptedProfile()['areas'];
    this.area_id_list = this.dataService.getDecryptedProfile()['area_id'];
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
      province_id: ["all_province"],
      city_id: [""],
      district_id: [""],
    })

    this.getPengajuanSRC();
    this.getProvinces();

    this.formFilter
      .get('province_id')
      .valueChanges
      .subscribe(res => {
        console.log('on change province', res);
        if (res) {
          this.listCities = [];
          this.listDistricts = [];
          this.formFilter.get('city_id').setValue("");
          this.formFilter.get('district_id').setValue("");
          this.getPengajuanSRC(res === -1 ? null : 'province_id');
          if (res && !res['value']) this.getCities(res && res['value'] ? res['value'] : res);
        }
      })
    this.formFilter
      .get('city_id')
      .valueChanges
      .subscribe(res => {
        if (res) {
          this.listDistricts = [];
          this.formFilter.get('district_id').setValue("");
          this.getPengajuanSRC('city_id');
          if (res && !res['value']) this.getDistricts(res);
        }
      })
    this.formFilter
      .get('district_id')
      .valueChanges
      .subscribe(res => {
        if (res) {
          this.getPengajuanSRC('district_id');
          // this.getDistricts(res);
        }
      })
  }

  getProvinces() {
    this.pengajuanSrcService.getProvinces()
      .subscribe(res => {
        console.log('res provinces', res);
        this.listProvince = res.data;
      }, err => {
        console.log('err get provinces', err);
      })
  }

  getCities(province_id) {
    this.pengajuanSrcService.getCities({ province_id })
      .subscribe(res => {
        console.log('res cities', res);
        this.listCities = res.data;
      }, err => {
        console.log('err get cities', err);
      })
  }

  getDistricts(city_id) {
    this.pengajuanSrcService.getDistricts({ city_id })
      .subscribe(res => {
        console.log('res districts', res);
        this.listDistricts = res.data;
      }, err => {
        console.log('err get districts', err);
      })
  }

  getPengajuanSRC(keyArea = null) {
    if (!!keyArea && !!this.formFilter.get(keyArea).value && !this.formFilter.get(keyArea).value['value']) {
      this.pagination[keyArea] = this.formFilter.get(keyArea).value;
    } else if (!!keyArea && !!this.formFilter.get(keyArea).value && !!this.formFilter.get(keyArea).value['value']) {
      console.log(this.formFilter.get(keyArea).value);
      let area = this.formFilter.get(keyArea).value;
      if (area.key == 'national') {
        delete this.pagination['province_id'];
        delete this.pagination['city_id'];
        delete this.pagination['district_id'];
      } else if (area.key == 'province_id') {
        delete this.pagination['city_id'];
        delete this.pagination['district_id'];
      } else if (area.key == 'city_id') {
        delete this.pagination['district_id'];
      }
    }

    if (this.formFilter.get('province_id').value == -1) {
      this.pagination['province_id'] = null;
      this.pagination['city_id'] = null;
      this.pagination['district_id'] = null;
    }

    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.pengajuanSrcService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data ? res.data.data : [];

        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        console.error(err);
        this.onLoad = false;
      }
    );
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

    this.pengajuanSrcService.get(this.pagination).subscribe(res => {
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

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.pengajuanSrcService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];

      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.pengajuanSrcService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];

      this.loadingIndicator = false;
    });
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage("detail_pengajuan_src", param);
    this.router.navigate(["user-management", "pengajuan-src", "edit"]);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage("detail_pengajuan_src", param);
    this.router.navigate(["user-management", "pengajuan-src", "detail"]);
  }

  renderStatusName(status) {
    switch (status) {
      case 'new':
        return { name: 'APLIKASI MASUK', bgColor: '#34a5eb', textColor: '#fff' };
      case 'processed':
        return { name: 'APLIKASI DALAM PROSES', bgColor: '#ebd034', textColor: '#000' };
      case 'approved':
        return { name: 'APLIKASI DISETUJUI', bgColor: '#35c704', textColor: '#fff' };
      default:
        return { name: 'APLIKASI DITOLAK', bgColor: '#ff2626', textColor: '#fff' }
    }
  }

  async export() {
    this.dataService.showLoading(true);
    try {
      const response = await this.pengajuanSrcService.export({ area: 1 }).toPromise();
      console.log('he', response.headers);
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `PengajuanSRC_${new Date().toLocaleString()}.xls`);
      // this.downloadLink.nativeElement.href = response;
      // this.downloadLink.nativeElement.click();
      this.dataService.showLoading(false);
    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
      // throw error;
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

}
