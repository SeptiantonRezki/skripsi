import { Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from "@angular/forms";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { AdminPrincipalService } from "../../../../services/user-management/admin-principal.service";
import { DialogService } from "../../../../services/dialog.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DataService } from "app/services/data.service";
import * as _ from 'underscore';
import { LanguagesService } from "app/services/languages/languages.service";

@Component({
  selector: "app-admin-principal-create",
  templateUrl: "./admin-principal-create.component.html",
  styleUrls: ["./admin-principal-create.component.scss"]
})
export class AdminPrincipalCreateComponent {
  // Vertical Stepper
  verticalStepperStep1: FormGroup;
  verticalStepperStep2: FormGroup;
  wilayah: FormGroup;
  wilayah_2: FormGroup;

  verticalStepperStep1Errors: any;
  verticalStepperStep2Errors: any;

  listRole: Array<any>;
  submitting: Boolean;

  listLevelArea: any[];
  list: any;
  list3: any;
  list4: any;
  list5: any;
  list6: any;
  list7: any;
  list8: any;
  list9: any;
  list10: any;
  list2: any;

  typeArea: any[] = ["national", "zone", "region", "area", "district", "salespoint", "territory"];
  areaFromLogin;
  Country: any[];
  listArea: any[];

  constructor(
    private formBuilder: FormBuilder,
    private adminPrincipalService: AdminPrincipalService,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private ls: LanguagesService
  ) {
    this.submitting = false;
    this.areaFromLogin = this.dataService.getDecryptedProfile()['area_type'];

    this.verticalStepperStep1Errors = {
      nama: {},
      username: {},
      email: {},
      country: {}
    };
    this.verticalStepperStep2Errors = {
      role: {}
    };

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
     
    this.list2 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.list3 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.list4 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.list5 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.list6 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.list7 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.list8 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.list9 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.list10 = {
      zone: [],
      region: [],
      area: [],
      salespoint: [],
      district: [],
      territory: []
    }

    this.listRole = this.activatedRoute.snapshot.data["listRole"].data;
    console.log('listROLE__', this.listRole);
  }

  ngOnInit() {
    this.verticalStepperStep1 = this.formBuilder.group({
      nama: ["", Validators.required],
      username: [""],
      email: ["", Validators.required],
      country: [""]
    });

    this.wilayah = this.formBuilder.group({
      areas: this.formBuilder.array([this.createEmailFormGroup()])
    })

    this.wilayah_2 = this.formBuilder.group({
      national: ["", Validators.required],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    })

    this.verticalStepperStep2 = this.formBuilder.group({
      role: ["", Validators.required]
    });

    this.verticalStepperStep1.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.verticalStepperStep1,
        this.verticalStepperStep1Errors
      );
    });

    this.verticalStepperStep2.valueChanges.subscribe(() => {
      commonFormValidator.parseFormChanged(
        this.verticalStepperStep2,
        this.verticalStepperStep2Errors
      );
    });

    // this.initArea();
    // this.initArea2();
    this.getCountry();
  }

  initArea() {
    this.areaFromLogin.map(item => {
      let level_desc = '';
      switch (item.type.trim()) {
        case 'national':
          level_desc = 'zone';
          this.wilayah.get('national').setValue(item.id);
          this.wilayah.get('national').disable();
          break
        case 'division':
          level_desc = 'region';
          this.wilayah.get('zone').setValue(item.id);
          this.wilayah.get('zone').disable();
          break;
        case 'region':
          level_desc = 'area';
          this.wilayah.get('region').setValue(item.id);
          this.wilayah.get('region').disable();
          break;
        case 'area':
          level_desc = 'salespoint';
          this.wilayah.get('area').setValue(item.id);
          this.wilayah.get('area').disable();
          break;
        case 'salespoint':
          level_desc = 'district';
          this.wilayah.get('salespoint').setValue(item.id);
          this.wilayah.get('salespoint').disable();
          break;
        case 'district':
          level_desc = 'territory';
          this.wilayah.get('district').setValue(item.id);
          this.wilayah.get('district').disable();
          break;
        case 'territory':
          this.wilayah.get('territory').setValue(item.id);
          this.wilayah.get('territory').disable();
          break;
      }
      // this.getAudienceArea(level_desc, item.id);
    });
  }

  initArea2() {
    this.areaFromLogin.map(item => {
      let level_desc = '';
      switch (item.type.trim()) {
        case 'national':
          level_desc = 'zone';
          this.wilayah_2.get('national').setValue(item.id);
          this.wilayah_2.get('national').disable();
          break
        case 'division':
          level_desc = 'region';
          this.wilayah_2.get('zone').setValue(item.id);
          this.wilayah_2.get('zone').disable();
          break;
        case 'region':
          level_desc = 'area';
          this.wilayah_2.get('region').setValue(item.id);
          this.wilayah_2.get('region').disable();
          break;
        case 'area':
          level_desc = 'salespoint';
          this.wilayah_2.get('area').setValue(item.id);
          this.wilayah_2.get('area').disable();
          break;
        case 'salespoint':
          level_desc = 'district';
          this.wilayah_2.get('salespoint').setValue(item.id);
          this.wilayah_2.get('salespoint').disable();
          break;
        case 'district':
          level_desc = 'territory';
          this.wilayah_2.get('district').setValue(item.id);
          this.wilayah_2.get('district').disable();
          break;
        case 'territory':
          this.wilayah_2.get('territory').setValue(item.id);
          this.wilayah_2.get('territory').disable();
          break;
      }
      this.getAudienceArea2(level_desc, item.id);
    });
  }

  getAudienceArea(selection, id, index) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.verticalStepperStep1.get("country").value }).subscribe(res => {
          // this.list[selection] = res.filter(item => item.name !== 'all');
          if(index == 0){
          this.list[selection] = res;
        }
        else if(index == 1){
          this.list2[selection] = res;
          
        }
        else if(index == 2){
          this.list3[selection] = res;
         
        }
        else if(index == 3){
          this.list4[selection] = res;
          
        }
        else if(index == 4){
          this.list5[selection] = res;
         
        }
        else if(index == 5){
          this.list6[selection] = res;
          
        }
        else if(index == 6){
          this.list7[selection] = res;
          
        }
        else if(index == 7){
          this.list8[selection] = res;
          
        }
        else if(index == 8){
          this.list9[selection] = res;
          
        }
        else if(index == 9){
          this.list10[selection] = res;
          
        }
        });
        // let wilayahs = this.wilayah.get('areas') as FormArray;
        // wilayahs.at(index).get('region').setValue('');
        // wilayahs.at(index).get('area').setValue('');
        // wilayahs.at(index).get('salespoint').setValue('');
        // wilayahs.at(index).get('district').setValue('');
        // wilayahs.at(index).get('territory').setValue('');
        // this.list['region'] = [];
        // this.list['area'] = [];
        // this.list['salespoint'] = [];
        // this.list['district'] = [];
        // this.list['territory'] = [];
        
        break;
      case 'region':
        item = this.list['zone'].length > 0 ? this.list['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.verticalStepperStep1.get("country").value }).subscribe(res => {
            // this.list[selection] = res.filter(item => item.name !== 'all');
            if(res.status == false)
            {}
            else{
            if(index == 0){
              this.list[selection] = res;
              
            }
            else if(index == 1){
              this.list2[selection] = res;
              
            }
            else if(index == 2){
              this.list3[selection] = res;
              
            }
            else if(index == 3){
              this.list4[selection] = res;
            
            }
            else if(index == 4){
              this.list5[selection] = res;
              
            }
            else if(index == 5){
              this.list6[selection] = res;
              
            }
            else if(index == 6){
              this.list7[selection] = res;
              
            }
            else if(index == 7){
              this.list8[selection] = res;
              
            }
            else if(index == 8){
              this.list9[selection] = res;
             
            }
            else if(index == 9){
              this.list10[selection] = res;
              
            }
          }
          });
        } else {
          this.list[selection] = []
        }

        // wilayahs = this.wilayah.get('areas') as FormArray;
        // wilayahs.at(index).get('region').setValue('');
        // wilayahs.at(index).get('area').setValue('');
        // wilayahs.at(index).get('salespoint').setValue('');
        // wilayahs.at(index).get('district').setValue('');
        // wilayahs.at(index).get('territory').setValue('');
        // this.list['area'] = [];
        // this.list['salespoint'] = [];
        // this.list['district'] = [];
        // this.list['territory'] = [];
            
        break;
      case 'area':
        item = this.list['region'].length > 0 ? this.list['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.verticalStepperStep1.get("country").value }).subscribe(res => {
            // this.list[selection] = res.filter(item => item.name !== 'all');
            if(res.status == false)
            {}
            else{
            if(index == 0){
              this.list[selection] = res;
             
            }
            else if(index == 1){
              this.list2[selection] = res;
              
            }
            else if(index == 2){
              this.list3[selection] = res;
              
            }
            else if(index == 3){
              this.list4[selection] = res;
              
            }
            else if(index == 4){
              this.list5[selection] = res;
              
            }
            else if(index == 5){
              this.list6[selection] = res;
              
            }
            else if(index == 6){
              this.list7[selection] = res;
              
            }
            else if(index == 7){
              this.list8[selection] = res;
              
            }
            else if(index == 8){
              this.list9[selection] = res;
              
            }
            else if(index == 9){
              this.list10[selection] = res;
              
            }
          }
          });
        } else {
          this.list[selection] = []
        }

        // wilayahs = this.wilayah.get('areas') as FormArray;
        // wilayahs.at(index).get('area').setValue('');
        // wilayahs.at(index).get('salespoint').setValue('');
        // wilayahs.at(index).get('district').setValue('');
        // wilayahs.at(index).get('territory').setValue('');
        // this.list['salespoint'] = [];
        // this.list['district'] = [];
        // this.list['territory'] = [];
        
        break;
      case 'salespoint':
        item = this.list['area'].length > 0 ? this.list['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.verticalStepperStep1.get("country").value }).subscribe(res => {
            // this.list[selection] = res.filter(item => item.name !== 'all');
            if(res.status == false)
            {}
            else{
            if(index == 0){
              this.list[selection] = res;
              
            }
            else if(index == 1){
              this.list2[selection] = res;
              
            }
            else if(index == 2){
              this.list3[selection] = res;
              
            }
            else if(index == 3){
              this.list4[selection] = res;
              
            }
            else if(index == 4){
              this.list5[selection] = res;
              
            }
            else if(index == 5){
              this.list6[selection] = res;
              
            }
            else if(index == 6){
              this.list7[selection] = res;
              
            }
            else if(index == 7){
              this.list8[selection] = res;
              
            }
            else if(index == 8){
              this.list9[selection] = res;
              
            }
            else if(index == 9){
              this.list10[selection] = res;
              
            }
          }
          });
        } else {
          this.list[selection] = []
        }

        // wilayahs = this.wilayah.get('areas') as FormArray;
        // wilayahs.at(index).get('salespoint').setValue('');
        // wilayahs.at(index).get('district').setValue('');
        // wilayahs.at(index).get('territory').setValue('');
        // this.list['district'] = [];
        // this.list['territory'] = [];
        
        break;
      case 'district':
        item = this.list['salespoint'].length > 0 ? this.list['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.verticalStepperStep1.get("country").value }).subscribe(res => {
            // this.list[selection] = res.filter(item => item.name !== 'all');
            if(res.status == false)
            {}
            else{
            if(index == 0){
              this.list[selection] = res;
              
            }
            else if(index == 1){
              this.list2[selection] = res;
              
            }
            else if(index == 2){
              this.list3[selection] = res;
              
            }
            else if(index == 3){
              this.list4[selection] = res;
              
            }
            else if(index == 4){
              this.list5[selection] = res;
              
            }
            else if(index == 5){
              this.list6[selection] = res;
              
            }
            else if(index == 6){
              this.list7[selection] = res;
              
            }
            else if(index == 7){
              this.list8[selection] = res;
            
            }
            else if(index == 8){
              this.list9[selection] = res;
              
            }
            else if(index == 9){
              this.list10[selection] = res;
              
            }
          }
          });
        } else {
          this.list[selection] = []
        }

        // wilayahs = this.wilayah.get('areas') as FormArray;
        // wilayahs.at(index).get('district').setValue('');
        // wilayahs.at(index).get('territory').setValue('');
        // this.list['territory'] = [];
        
        break;
      case 'territory':
        item = this.list['district'].length > 0 ? this.list['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.verticalStepperStep1.get("country").value }).subscribe(res => {
            // this.list[selection] = res.filter(item => item.name !== 'all');
            if(res.status == false)
            {}
            else{
            if(index == 0){
              this.list[selection] = res;
              
            }
            else if(index == 1){
              this.list2[selection] = res;
              
            }
            else if(index == 2){
              this.list3[selection] = res;
              
            }
            else if(index == 3){
              this.list4[selection] = res;
              
            }
            else if(index == 4){
              this.list5[selection] = res;
              
            }
            else if(index == 5){
              this.list6[selection] = res;
              
            }
            else if(index == 6){
              this.list7[selection] = res;
              
            }
            else if(index == 7){
              this.list8[selection] = res;
              
            }
            else if(index == 8){
              this.list9[selection] = res;
             
            }
            else if(index == 9){
              this.list10[selection] = res;
              
            }
          }
          });
        } else {
          this.list[selection] = []
        }

        // wilayahs = this.wilayah.get('areas') as FormArray;
        // wilayahs.at(index).get('territory').setValue('');
        
        break;

      default:
        break;
    }
  }

  getAudienceArea2(selection, id) {
    let item: any;
    switch (selection) {
      case 'zone':
        this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.verticalStepperStep1.get("country").value }).subscribe(res => {
          // this.list2[selection] = res.filter(item => item.name !== 'all');
          this.list2[selection] = res;
        });

        this.wilayah_2.get('region').setValue('');
        this.wilayah_2.get('area').setValue('');
        this.wilayah_2.get('salespoint').setValue('');
        this.wilayah_2.get('district').setValue('');
        this.wilayah_2.get('territory').setValue('');
        this.list2['region'] = [];
        this.list2['area'] = [];
        this.list2['salespoint'] = [];
        this.list2['district'] = [];
        this.list2['territory'] = [];
        break;
      case 'region':
        item = this.list2['zone'].length > 0 ? this.list2['zone'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.verticalStepperStep1.get("country").value }).subscribe(res => {
            // this.list2[selection] = res.filter(item => item.name !== 'all');
            this.list2[selection] = res;
          });
        } else {
          this.list2[selection] = []
        }

        this.wilayah_2.get('region').setValue('');
        this.wilayah_2.get('area').setValue('');
        this.wilayah_2.get('salespoint').setValue('');
        this.wilayah_2.get('district').setValue('');
        this.wilayah_2.get('territory').setValue('');
        this.list2['area'] = [];
        this.list2['salespoint'] = [];
        this.list2['district'] = [];
        this.list2['territory'] = [];
        break;
      case 'area':
        item = this.list2['region'].length > 0 ? this.list2['region'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.verticalStepperStep1.get("country").value }).subscribe(res => {
            // this.list2[selection] = res.filter(item => item.name !== 'all');
            this.list2[selection] = res;
          });
        } else {
          this.list2[selection] = []
        }

        this.wilayah_2.get('area').setValue('');
        this.wilayah_2.get('salespoint').setValue('');
        this.wilayah_2.get('district').setValue('');
        this.wilayah_2.get('territory').setValue('');
        this.list2['salespoint'] = [];
        this.list2['district'] = [];
        this.list2['territory'] = [];
        break;
      case 'salespoint':
        item = this.list2['area'].length > 0 ? this.list2['area'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.verticalStepperStep1.get("country").value }).subscribe(res => {
            // this.list2[selection] = res.filter(item => item.name !== 'all');
            this.list2[selection] = res;
          });
        } else {
          this.list2[selection] = []
        }

        this.wilayah_2.get('salespoint').setValue('');
        this.wilayah_2.get('district').setValue('');
        this.wilayah_2.get('territory').setValue('');
        this.list2['district'] = [];
        this.list2['territory'] = [];
        break;
      case 'district':
        item = this.list2['salespoint'].length > 0 ? this.list2['salespoint'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.verticalStepperStep1.get("country").value }).subscribe(res => {
            // this.list2[selection] = res.filter(item => item.name !== 'all');
            this.list2[selection] = res;
          });
        } else {
          this.list2[selection] = []
        }

        this.wilayah_2.get('district').setValue('');
        this.wilayah_2.get('territory').setValue('');
        this.list2['territory'] = [];
        break;
      case 'territory':
        item = this.list2['district'].length > 0 ? this.list2['district'].filter(item => item.id === id)[0] : {};
        if (item.name !== 'all') {
          this.adminPrincipalService.getListOtherChildrens({ parent_id: id},{country: this.verticalStepperStep1.get("country").value }).subscribe(res => {
            // this.list2[selection] = res.filter(item => item.name !== 'all');
            this.list2[selection] = res;
          });
        } else {
          this.list2[selection] = []
        }

        this.wilayah_2.get('territory').setValue('');
        break;

      default:
        break;
    }
  }

  selectionChange(event) {
    console.log(event.value);
  }

  step1() {
    commonFormValidator.validateAllFields(this.verticalStepperStep1);
    document.getElementById("id0").style.display='none';
    // this.initArea();
  }

  step2() {
    commonFormValidator.validateAllFields(this.verticalStepperStep2);
  }

  submit() {
    if (this.verticalStepperStep1.valid && this.verticalStepperStep2.valid) {
      this.submitting = true;

      let areas = [];
      let areas1 = [];
      let areas2 = [];
      let areas3 = [];
      let areas4 = [];
      let areas5 = [];
      let areas6 = [];
      let areas7 = [];
      let areas8 = [];
      let areas9 = [];
      let value = this.wilayah.getRawValue().areas;
      var newArray = [];
      var lookupObject  = {};


      let area2Value = this.wilayah_2.getRawValue();
      
      for(let i=0; i<value.length; i++){
      value[i] = Object.entries(value[i]).map(([key, value]) => ({ key, value }));
      
      }
      area2Value = Object.entries(area2Value).map(([key, value]) => ({ key, value }));

      this.typeArea.map(type => {
        for(let i=0; i<value.length; i++){
          const filteredValue = value[i].filter(item => item.key === type && item.value);
          if (filteredValue.length > 0 && i == 0) areas.push(parseInt(filteredValue[0].value));
          if (filteredValue.length > 0 && i == 1) areas1.push(parseInt(filteredValue[0].value));
          if (filteredValue.length > 0 && i == 2) areas2.push(parseInt(filteredValue[0].value));
          if (filteredValue.length > 0 && i == 3) areas3.push(parseInt(filteredValue[0].value));
          if (filteredValue.length > 0 && i == 4) areas4.push(parseInt(filteredValue[0].value));
          if (filteredValue.length > 0 && i == 5) areas5.push(parseInt(filteredValue[0].value));
          if (filteredValue.length > 0 && i == 6) areas6.push(parseInt(filteredValue[0].value));
          if (filteredValue.length > 0 && i == 7) areas7.push(parseInt(filteredValue[0].value));
          if (filteredValue.length > 0 && i == 8) areas8.push(parseInt(filteredValue[0].value));
          if (filteredValue.length > 0 && i == 9) areas9.push(parseInt(filteredValue[0].value));
          }
          // const filteredValueArea2 = area2Value.filter(item => item.key === type && item.value);
          // console.log("+++as+", filteredValueArea2);
          // if (filteredValueArea2.length > 0) areas2.push(parseInt(filteredValueArea2[0].value));
      });
      let area_id = [_.last(areas), _.last(areas1),_.last(areas2), _.last(areas3),_.last(areas4), _.last(areas5),_.last(areas6), _.last(areas7),_.last(areas8), _.last(areas9)];
      area_id = area_id.filter(function( element ) {
        return element !== undefined;
     });
     for(let i=0; i<area_id.length; i++){
      for(let j=i+1; j<area_id.length; j++){
          if(area_id[i] == area_id[j]){
            newArray.push(i+1);
            newArray.push(j+1);
          }
          
      }
    }
    var uniqueArray = newArray.filter(function(item, pos, self) {
      return self.indexOf(item) == pos;
  })
console.log("NEWARRAY", uniqueArray);
if(uniqueArray.length > 0){
 if(this.ls.selectedLanguages == 'id'){
this.dialogService.openSnackBar({ message: "Area " + uniqueArray +" adalah duplikat, silakan periksa" });
 }
 else if(this.ls.selectedLanguages == 'km'){
  this.dialogService.openSnackBar({ message: "តំបន់ " + uniqueArray +" គឺស្ទួន សូមពិនិត្យមើល" });
 }
 else if(this.ls.selectedLanguages == 'en-ph'){
  this.dialogService.openSnackBar({ message: "Area " + uniqueArray +" are duplicate, please check" });
}
}
else{
      let body = {
        name: this.verticalStepperStep1.get("nama").value,
        username: this.verticalStepperStep1.get("username").value,
        email: this.verticalStepperStep1.get("email").value,
        role_id: this.verticalStepperStep2.get("role").value,
        area_id: area_id,
        status: 'active',
        country: this.verticalStepperStep1.get("country").value
      };
      console.log('body', body);

      this.adminPrincipalService.create(body).subscribe(
        res => {
          this.dialogService.openSnackBar({
            message: this.ls.locale.notification.popup_notifikasi.text22
          });
          this.router.navigate(["user-management", "admin-principal"]);
        },
        err => {
          this.submitting = false;
        }
      );
    }
    } else {
      commonFormValidator.validateAllFields(this.verticalStepperStep1);
      commonFormValidator.validateAllFields(this.verticalStepperStep2);
    }
  }

  getCountry() {

    this.adminPrincipalService.getCountry().subscribe(
      res => {
        this.Country = res.data;
      },
      err => {
        console.error(err);
      }
    );

  }

  public addEmailFormGroup(i: number) {
    document.getElementById("id0").style.display='block';
    document.getElementById(""+i).style.display='none';
    const emails = this.wilayah.get('areas') as FormArray
    emails.push(this.createEmailFormGroup())
    
    if(this.wilayah.getRawValue().areas.length == 10){
      document.getElementById("9").style.display='none'
    }
    
  }

  public removeOrClearEmail(i: number) {

    if(this.wilayah.getRawValue().areas.length<10  && i>0){
            
      if(this.wilayah.getRawValue().areas.length-i == 1){
        var j = this.wilayah.getRawValue().areas.length-2;
        
            document.getElementById(""+j).style.display='block';
          }
          else{
            var j = this.wilayah.getRawValue().areas.length-1;
      
            document.getElementById(""+j).style.display='block';
          }
          
          for(var k=0; k<this.wilayah.getRawValue().areas.length; k++){
            if(k != j){
              document.getElementById(""+k).style.display='none';
            }
          }
      }
      if(this.wilayah.getRawValue().areas.length==2 && i == 0 ){
        
        
        document.getElementById("id0").style.display='none';
        }
      if(this.wilayah.getRawValue().areas.length== 2){
        document.getElementById("0").style.display='block';
        document.getElementById("id0").style.display='none';
      }

    const emails = this.wilayah.get('areas') as FormArray
    if (emails.length > 1) {
      emails.removeAt(i)
    } else {
      emails.reset()
    }
    if(this.wilayah.getRawValue().areas.length == 9 && i == 9){
      document.getElementById("0").style.display='none';
      document.getElementById("1").style.display='none';
      document.getElementById("2").style.display='none';
      document.getElementById("3").style.display='none';
      document.getElementById("4").style.display='none';
      document.getElementById("5").style.display='none';
      document.getElementById("6").style.display='none';
      document.getElementById("7").style.display='none';
      document.getElementById("8").style.display='block';
      }
  }

  private createEmailFormGroup(): FormGroup {
    return new FormGroup({
      'national': new FormControl('', Validators.required),
      'zone': new FormControl(''),
      'region': new FormControl(''),
      'area': new FormControl(''),
      'salespoint': new FormControl(''),
      'district': new FormControl(''),
      'territory': new FormControl('')
    })
  }

  ClearForm(){
  
    const aers = this.wilayah.get('areas') as FormArray
    aers.reset()
    
    this.getRole();
  }

  getRole() {

    this.adminPrincipalService.getListRoleCountry({country: this.verticalStepperStep1.get("country").value }).subscribe(
      res => {
        this.listRole = res.data;
        console.log("this.listRole", this.listRole);
      },
      err => {
        console.error(err);
      }
    );
    console.log("COUNTRY2", this.Country);

  }

}
