import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { GeotreeService } from 'app/services/geotree.service';
import { RcaAgentService } from 'app/services/rca-agent.service';
import { RetailerService } from 'app/services/user-management/retailer.service';
import { WholesalerService } from 'app/services/user-management/wholesaler.service';

@Component({
  selector: 'app-rca-agent-create',
  templateUrl: './rca-agent-create.component.html',
  styleUrls: ['./rca-agent-create.component.scss']
})
export class RcaAgentCreateComponent implements OnInit {
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

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private rcaAgentService: RcaAgentService,
    private rotuer: Router,
    private wholesalerService: WholesalerService,
  ) {
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];

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
      position: ["", Validators.required],
      password: ["", Validators.required],
      retype_password: ["", Validators.required],
      isNewPositionCode: [false],
      areas: this.formBuilder.array([]),
      national: ["", Validators.required],
      zone: ["", Validators.required],
      region: ["", Validators.required],
      area: ["", Validators.required],
      salespoint: ["", Validators.required],
      district: ["", Validators.required],
      territory: ["", Validators.required]
    }, {
      validator: this.checkPasswords
    });

    this.initArea();
  }

  initArea() {
    this.areaFromLogin.map(item => {
      let level_desc = '';
      switch (item.type.trim()) {
        case 'national':
          level_desc = 'zone';
          this.formRcaAgent.get('national').setValue(item.id);
          this.formRcaAgent.get('national').disable();
          break
        case 'division':
          level_desc = 'region';
          this.formRcaAgent.get('zone').setValue(item.id);
          this.formRcaAgent.get('zone').disable();
          break;
        case 'region':
          level_desc = 'area';
          this.formRcaAgent.get('region').setValue(item.id);
          this.formRcaAgent.get('region').disable();
          break;
        case 'area':
          level_desc = 'salespoint';
          this.formRcaAgent.get('area').setValue(item.id);
          this.formRcaAgent.get('area').disable();
          break;
        case 'salespoint':
          level_desc = 'district';
          this.formRcaAgent.get('salespoint').setValue(item.id);
          this.formRcaAgent.get('salespoint').disable();
          break;
        case 'district':
          level_desc = 'territory';
          this.formRcaAgent.get('district').setValue(item.id);
          this.formRcaAgent.get('district').disable();
          break;
        case 'territory':
          this.formRcaAgent.get('territory').setValue(item.id);
          this.formRcaAgent.get('territory').disable();
          break;
      }
      console.log("kesini gak sih bangke!")
      this.getAudienceArea(level_desc, item.id);
    });
  }

  getAudienceArea(selection, id) {
    let item: any;
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

  getPositionCode(id = 1) {
    this.rcaAgentService.getPositionCode({ area_id: id }).subscribe(res => {
      console.log("res", res);
    })
  }

  async submit() {
    if (this.formRcaAgent.valid) {
      this.dataService.showLoading(true);
      let body = {

      }
      // this.rcaAgentService.create(fd).subscribe(res => {
      //   this.dataService.showLoading(false);
      //   this.dialogService.openSnackBar({
      //     message: "Data berhasil disimpan!"
      //   });
      //   this.rotuer.navigate(['/src-catalogue', 'store-layout-template']);
      // }, err => {
      //   this.dataService.showLoading(false);
      // })
    } else {
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      });
      commonFormValidator.validateAllFields(this.formRcaAgent);
    }
  }

  checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    let pass = group.get('password').value;
    let confirmPass = group.get('retype_password').value

    return pass === confirmPass ? null : { notSame: true }
  }

}
