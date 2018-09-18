import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { FieldForceService } from 'app/services/user-management/field-force.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-field-force-edit',
  templateUrl: './field-force-edit.component.html',
  styleUrls: ['./field-force-edit.component.scss']
})
export class FieldForceEditComponent {
  formFF: FormGroup;
  formdataErrors: any;
  onLoad: Boolean;

  detailFF: any;
  listStatus: any[] = [
    { name: "Status Aktif", value: "active" },
    { name: "Status Non Aktif", value: "inactive" }
  ];

  listLevelArea: any[];
  list: any;

  areaFromLogin;
  detailAreaSelected: any[];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private dataService: DataService,
    private fieldforceService: FieldForceService,
  ) { 
    this.formdataErrors = {
      status: {},
      national: {},
      zone: {},
      region: {},
      area: {},
      salespoint: {},
      district: {},
      territory: {}
    };

    this.detailFF = this.dataService.getFromStorage("detail_field_force");
    this.areaFromLogin = this.dataService.getFromStorage('profile')['area_type'];

    this.listLevelArea = [
      {
        "id": 1,
        "parent_id": null,
        "code": "SLSNTL      ",
        "name": "Sales National"
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
    this.onLoad = true;

    this.formFF = this.formBuilder.group({
      fullname: [""],
      username: [""],
      status: ["", Validators.required],
      national: ["", Validators.required],
      zone: ["", Validators.required],
      salespoint: ["", Validators.required],
      region: ["", Validators.required],
      area: ["", Validators.required],
      district: ["", Validators.required],
      territory: ["", Validators.required],
      password: [""],
      password_confirmation: [""],
    });

    this.formFF.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(this.formFF, this.formdataErrors);
    });

    this.fieldforceService.getParentArea({ parent: this.detailFF.area_code[0] }).subscribe(res => {
      this.detailAreaSelected = res.data;
      this.onLoad = false;

      this.initArea();
      this.initFormGroup();
    })

    this.formFF.get('fullname').disable();
    this.formFF.get('username').disable();
  }

  initArea() {
    this.areaFromLogin.map(item => {
      switch (item.type.trim()) {
        case 'national':
          this.formFF.get('national').disable();
          // this.formFF.get('national').setValue(item.id);
          break
        case 'division':
          this.formFF.get('zone').disable();
          // this.formFF.get('national').setValue(item.id);
          break;
        case 'region':
          this.formFF.get('region').disable();
          // this.formFF.get('national').setValue(item.id);
          break;
        case 'area':
          this.formFF.get('area').disable();
          // this.formFF.get('national').setValue(item.id);
          break;
        case 'salespoint':
          this.formFF.get('salespoint').disable();
          // this.formFF.get('national').setValue(item.id);
          break;
        case 'district':
          this.formFF.get('district').disable();
          // this.formFF.get('national').setValue(item.id);
          break;
        case 'territory':
          this.formFF.get('territory').disable();
          // this.formFF.get('national').setValue(item.id);
          break;
      }
    })
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

    this.formFF.setValue({
      fullname: this.detailFF.fullname,
      username: this.detailFF.username,
      status: this.detailFF.status,
      national: this.getArea('national'),
      zone: this.getArea('division'),
      region: this.getArea('region'),
      area: this.getArea('area'),
      salespoint: this.getArea('salespoint'),
      district: this.getArea('district'),
      territory: this.getArea('teritory'),
      password: [""],
      password_confirmation: [""],
    });
  }

  getAudienceArea(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
          this.fieldforceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });

          this.formFF.get('region').setValue('');
          this.formFF.get('area').setValue('');
          this.formFF.get('salespoint').setValue('');
          this.formFF.get('district').setValue('');
          this.formFF.get('territory').setValue('');
          this.list['region'] = [];
          this.list['area'] = [];
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'region':
          item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.fieldforceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formFF.get('region').setValue('');
          this.formFF.get('area').setValue('');
          this.formFF.get('salespoint').setValue('');
          this.formFF.get('district').setValue('');
          this.formFF.get('territory').setValue('');
          this.list['area'] = [];
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'area':
          item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.fieldforceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formFF.get('area').setValue('');
          this.formFF.get('salespoint').setValue('');
          this.formFF.get('district').setValue('');
          this.formFF.get('territory').setValue('');
          this.list['salespoint'] = [];
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'salespoint':
          item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.fieldforceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formFF.get('salespoint').setValue('');
          this.formFF.get('district').setValue('');
          this.formFF.get('territory').setValue('');
          this.list['district'] = [];
          this.list['territory'] = [];
        break;
      case 'district':
          item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.fieldforceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formFF.get('district').setValue('');
          this.formFF.get('territory').setValue('');
          this.list['territory'] = [];
        break;
      case 'territory':
          item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
          if (item.name !== 'all') {
            this.fieldforceService.getListOtherChildren({ parent_id: id }).subscribe(res => {
              this.list[selection] = res.filter(item => item.name !== 'all');
            });
          } else {
            this.list[selection] = []
          }

          this.formFF.get('territory').setValue('');
        break;
    
      default:
        break;
    }
  }

  getArea(selection) {
    return this.detailAreaSelected.filter(item => item.level_desc === selection).map(item => item.id)[0]
  }

  submit() {
    if (this.formFF.valid) {

    } else {
      commonFormValidator.validateAllFields(this.formFF);
    }
  }

}
