import { Component, OnInit } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CoinService } from 'app/services/sku-management/coin.service';
import { DataService } from 'app/services/data.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detail-retailer',
  templateUrl: './detail-retailer.component.html',
  styleUrls: ['./detail-retailer.component.scss']
})
export class DetailRetailerComponent {

  rows: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  formDetailRetailer: FormGroup;
  detailRetailer: any;

  listLevelArea: any[];
  list: any;

  areaFromLogin;
  detailAreaSelected: any[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private coinService: CoinService,
    private dataService: DataService,
    private formBuilder: FormBuilder
  ) { 

    this.detailRetailer = this.dataService.getFromStorage('coin_detail_retailer');
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];

    this.activatedRoute.url.subscribe(param => {
      this.id = param[2].path;
    });

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
  }

  ngOnInit() {
    this.formDetailRetailer = this.formBuilder.group({
      name: [""],
      address: [""],
      business_code: [""],
      owner: [""],
      phone: [""],
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""],
    });

    this.coinService.getParentArea({ parent: this.detailRetailer.area_id[0] }).subscribe(res => {
      this.detailAreaSelected = res.data;
      this.onLoad = false;

      // this.initArea();
      this.initFormGroup();
    })

    this.getRetailer();
    this.formDetailRetailer.disable();
  }

  initFormGroup() {
    this.detailAreaSelected.map(item => {
      let level_desc = '';
      switch (item.level_desc.trim()) {
        case 'national':
          level_desc = 'zone';
          break
        case 'division':
          level_desc = 'region';
          break;
        case 'region':
          level_desc = 'area';
          break;
        case 'area':
          level_desc = 'salespoint';
          break;
        case 'salespoint':
          level_desc = 'district';
          break;
        case 'district':
          level_desc = 'territory';
          break;
      }
      this.getAudienceArea(level_desc, item.id);
    });

    this.formDetailRetailer.setValue({
      name: this.detailRetailer.name,
      address: this.detailRetailer.address_line1,
      business_code: this.detailRetailer.code,
      owner: this.detailRetailer.owner,
      phone: this.detailRetailer.phone,
      national: this.getArea('national'),
      zone: this.getArea('division'),
      region: this.getArea('region'),
      area: this.getArea('area'),
      salespoint: this.getArea('salespoint'),
      district: this.getArea('district'),
      territory: this.getArea('teritory'),
    });
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
          this.coinService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });

          this.formDetailRetailer.get('region').setValue('');
          this.formDetailRetailer.get('area').setValue('');
          this.formDetailRetailer.get('salespoint').setValue('');
          this.formDetailRetailer.get('district').setValue('');
          this.formDetailRetailer.get('territory').setValue('');
          this.list['region'] = [];
          this.list['area'] = [];
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'region':
          item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.coinService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formDetailRetailer.get('region').setValue('');
          this.formDetailRetailer.get('area').setValue('');
          this.formDetailRetailer.get('salespoint').setValue('');
          this.formDetailRetailer.get('district').setValue('');
          this.formDetailRetailer.get('territory').setValue('');
          this.list['area'] = [];
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'area':
          item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.coinService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formDetailRetailer.get('area').setValue('');
          this.formDetailRetailer.get('salespoint').setValue('');
          this.formDetailRetailer.get('district').setValue('');
          this.formDetailRetailer.get('territory').setValue('');
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'salespoint':
          item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.coinService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formDetailRetailer.get('salespoint').setValue('');
          this.formDetailRetailer.get('district').setValue('');
          this.formDetailRetailer.get('territory').setValue('');
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'district':
          item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.coinService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formDetailRetailer.get('district').setValue('');
          this.formDetailRetailer.get('territory').setValue('');
          this.list['territory'] = [];
        break;
      case 'territory':
          item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.coinService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formDetailRetailer.get('territory').setValue('');
        break;
    
      default:
        break;
    }
  }

  getArea(selection) {
    return this.detailAreaSelected.filter(item => item.level_desc === selection).map(item => item.id)[0]
  }

  getRetailer() {
    this.pagination.sort = 'name';
    this.pagination.sort_type = 'asc';
    this.coinService.detailRetailer({ retailer_id: this.id }, this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
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
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.coinService.detailRetailer({ retailer_id: this.id }, this.pagination).subscribe(res => {
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

    this.coinService.detailRetailer({ retailer_id: this.id }, this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

}
