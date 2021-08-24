import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { GeotreeService } from 'app/services/geotree.service';
import { RcaAgentService } from 'app/services/rca-agent.service';
import { RetailerService } from 'app/services/user-management/retailer.service';

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

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private rcaAgentService: RcaAgentService,
    private rotuer: Router,
    private retailerService: RetailerService,
    private geotreeService: GeotreeService
  ) {

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
      re_password: ["", Validators.required],
      areas: this.formBuilder.array([]),
    })

    this.formFilter = this.formBuilder.group({
      national: [""],
      zone: [""],
      region: [""],
      area: [""],
      salespoint: [""],
      district: [""],
      territory: [""]
    })
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

}
