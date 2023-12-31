import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { GeotreeService } from 'app/services/geotree.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { RcaAgentService } from 'app/services/rca-agent.service';
import { FieldForceService } from 'app/services/user-management/field-force.service';
import { RetailerService } from 'app/services/user-management/retailer.service';
import { WholesalerService } from 'app/services/user-management/wholesaler.service';
@Component({
  selector: 'app-rca-agent-edit',
  templateUrl: './rca-agent-edit.component.html',
  styleUrls: ['./rca-agent-edit.component.scss']
})
export class RcaAgentEditComponent implements OnInit {
  formRcaAgent: FormGroup;
  position_codes: any[] = [];
  formFilter: FormGroup;

  typeArea: any[] = ["national", "zone", "region", "area", "salespoint", "district", "territory"];
  areaFromLogin;
  indexDelete: any;

  listLevelArea: any[];
  list: any;
  endArea: String;
  area_id_list: any = [];
  areaType: any;
  lastLevel: any;
  listExistingPositionCodes: any[] = [];
  existingPositionCode: FormControl = new FormControl('');

  showInvalidPassword: boolean = false;
  isDetail: boolean = false;

  detailRcaAgent: any;
  detailAreaSelected: any[] = [];
  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private rcaAgentService: RcaAgentService,
    private rotuer: Router,
    private wholesalerService: WholesalerService,
    private activatedRoute: ActivatedRoute,
    private fieldforceService: FieldForceService,
    private ls: LanguagesService
  ) {
    activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    });
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];
    this.detailRcaAgent = this.dataService.getFromStorage('detail_rca_agent');

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
    this.formRcaAgent = this.formBuilder.group({
      name: ["", Validators.required],
      username: ["", Validators.required],
      email: ["", Validators.required],
      position: [""],
      isNewPositionCode: [false],
      areas: this.formBuilder.array([]),
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    });

    this.getDetail();
  }

  getDetail() {
    this.rcaAgentService.getDetail({ agent_id: this.detailRcaAgent.id }).subscribe(res => {
      this.fieldforceService.getParentByCode({ parent: res.area_code && res.area_code.length > 0 ? res.area_code[0] : null }).subscribe(resArea => {
        this.detailAreaSelected = resArea.data;
        this.initArea();
        if (this.detailAreaSelected) {
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
            this.getAudienceArea(level_desc, item.id, item.name);
          });
        }
        this.formRcaAgent.get('name').setValue(res.fullname);
        this.formRcaAgent.get('email').setValue(res.email);
        this.formRcaAgent.get('username').setValue(res.username);
        this.formRcaAgent.get('position').setValue(res.position);
        this.formRcaAgent.get('position').disable();
        this.formRcaAgent.get('national').setValue(this.getArea('national'));
        this.formRcaAgent.get('national').disable();
        this.formRcaAgent.get('zone').setValue(this.getArea('division'));
        this.formRcaAgent.get('zone').disable();
        this.formRcaAgent.get('region').setValue(this.getArea('region'));
        this.formRcaAgent.get('region').disable();
        this.formRcaAgent.get('area').setValue(this.getArea('area'));
        this.formRcaAgent.get('area').disable();

      })
      if (this.isDetail) this.formRcaAgent.disable();
    })
  }

  getArea(selection, optional?) {
    if (this.detailAreaSelected) {
      let areas = this.detailAreaSelected.filter(item => item.level_desc === selection).map(item => item.id);
      return areas && areas[0] ? areas[0] : '';
    }
    return '';
  }

  initArea() {
    this.areaFromLogin.map(item => {
      let level_desc = '';
      switch (item.type.trim()) {
        case 'national':
          level_desc = 'zone';
          // this.formRcaAgent.get('national').setValue(item.id);
          this.formRcaAgent.get('national').disable();
          break
        case 'division':
          level_desc = 'region';
          // this.formRcaAgent.get('zone').setValue(item.id);
          this.formRcaAgent.get('zone').disable();
          break;
        case 'region':
          level_desc = 'area';
          // this.formRcaAgent.get('region').setValue(item.id);
          this.formRcaAgent.get('region').disable();
          break;
        case 'area':
          level_desc = 'salespoint';
          // this.formRcaAgent.get('area').setValue(item.id);
          this.formRcaAgent.get('area').disable();
          break;
        case 'salespoint':
          level_desc = 'district';
          // this.formRcaAgent.get('salespoint').setValue(item.id);
          this.formRcaAgent.get('salespoint').disable();
          break;
        case 'district':
          level_desc = 'territory';
          // this.formRcaAgent.get('district').setValue(item.id);
          this.formRcaAgent.get('district').disable();
          break;
        case 'territory':
          // this.formRcaAgent.get('territory').setValue(item.id);
          this.formRcaAgent.get('territory').disable();
          break;
      }
      console.log("kesini gak sih bangke!")
      // this.getAudienceArea(level_desc, item.id);
    });
  }

  getAudienceArea(selection, id, code?) {
    let item: any;
    if (selection === 'salespoint') this.getPositionCode(code);
    switch (selection) {
      case 'zone':
        this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
          this.list[selection] = res.filter(item => item.name !== 'all');
        });

        this.formRcaAgent.get('region').setValue('');
        this.formRcaAgent.get('area').setValue('');
        this.formRcaAgent.get('salespoint').setValue('');
        this.formRcaAgent.get('district').setValue('');
        this.formRcaAgent.get('territory').setValue('');
        this.list['region'] = [];
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'region':
        item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });
        } else {
          this.list[selection] = []
        }

        this.formRcaAgent.get('region').setValue('');
        this.formRcaAgent.get('area').setValue('');
        this.formRcaAgent.get('salespoint').setValue('');
        this.formRcaAgent.get('district').setValue('');
        this.formRcaAgent.get('territory').setValue('');
        this.list['area'] = [];
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'area':
        item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });
        } else {
          this.list[selection] = []
        }

        this.formRcaAgent.get('area').setValue('');
        this.formRcaAgent.get('salespoint').setValue('');
        this.formRcaAgent.get('district').setValue('');
        this.formRcaAgent.get('territory').setValue('');
        this.list['salespoint'] = [];
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'salespoint':
        item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });
        } else {
          this.list[selection] = []
        }

        this.formRcaAgent.get('salespoint').setValue('');
        this.formRcaAgent.get('district').setValue('');
        this.formRcaAgent.get('territory').setValue('');
        this.list['district'] = [];
        this.list['territory'] = [];
        break;
      case 'district':
        item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });
        } else {
          this.list[selection] = []
        }

        this.formRcaAgent.get('district').setValue('');
        this.formRcaAgent.get('territory').setValue('');
        this.list['territory'] = [];
        break;
      case 'territory':
        item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.wholesalerService.getListOtherChildren({ parent_id: id }).subscribe(res => {
            this.list[selection] = res.filter(item => item.name !== 'all');
          });
          console.log('list', this.list);
        } else {
          this.list[selection] = []
        }

        this.formRcaAgent.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  getPositionCode(id = null) {
    this.rcaAgentService.getRPPositionCode({ area_code: id }).subscribe(res => {
      console.log("res rpcode", res);
      this.listExistingPositionCodes = res.data;
    })
  }

  async submit() {
    let formRcaAgent = this.formRcaAgent.getRawValue();
    let formArea = {
      national: formRcaAgent['national'],
      zone: formRcaAgent['zone'],
      region: formRcaAgent['region'],
      area: formRcaAgent['area'],
      salespoint: formRcaAgent['salespoint'],
      district: formRcaAgent['district'],
      territory: formRcaAgent['territory'],
    }
    let areaSelected = Object.entries(formArea).map(([key, value]) => ({ key, value })).filter((item: any) => item.value !== null && item.value !== "" && item.value.length !== 0);
    let area_id = areaSelected[areaSelected.length - 1].value;


    let position_code = null;
    if (this.formRcaAgent.get('isNewPositionCode').value) {
      if (this.listExistingPositionCodes.length > 0) {
        let latestCode = this.listExistingPositionCodes.slice(0, 1);
        let latestIncrement = latestCode[0]['code'].split("-")
        if (latestIncrement.length > 0) {
          let latestNumber = Number(latestIncrement[1]);
          position_code = latestIncrement[0] + "-" + (latestNumber + 1);
        }
      } else {
        let areaSelectedRaw = areaSelected[areaSelected.length - 1];
        let areaCodeSelected = this.list[areaSelectedRaw['key']].find(val => val.id === areaSelectedRaw['value']);
        if (areaCodeSelected) position_code = areaCodeSelected['name'] + "-" + "1";
      }

      if (position_code === null) {
        return this.dialogService.openSnackBar({ message: "Gagal Generate New Position Code!" });
      }
    }
    if (this.formRcaAgent.valid) {
      this.dataService.showLoading(true);

      let body = {
        name: this.formRcaAgent.get('name').value,
        email: this.formRcaAgent.get('email').value,
        area_id: area_id,
        username: this.formRcaAgent.get('username').value,
        position_code: this.formRcaAgent.get('isNewPositionCode').value ? position_code : this.formRcaAgent.get('position').value,
        // password: this.formRcaAgent.get('password').value,
        status: "active"
      }

      this.rcaAgentService.put({ agent_id: this.detailRcaAgent.id }, body).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
        this.rotuer.navigate(['rca', 'agent-pengguna']);
      }, err => {
        console.log('err', err);
        this.dataService.showLoading(false);
      })
    } else {
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      });
      commonFormValidator.validateAllFields(this.formRcaAgent);
    }
  }
}
