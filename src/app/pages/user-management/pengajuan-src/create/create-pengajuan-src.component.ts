import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { PengajuanSrcService } from 'app/services/user-management/pengajuan-src.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-create-pengajuan-src',
  templateUrl: './create-pengajuan-src.component.html',
  styleUrls: ['./create-pengajuan-src.component.scss']
})
export class CreatePengajuanSrcComponent implements OnInit {
  verticalStepperStep1: FormGroup;
  verticalStepperStep2: FormGroup;
  verticalStepperStep3: FormGroup;

  verticalStepperStep1Errors: any;
  verticalStepperStep2Errors: any;
  verticalStepperStep3Errors: any;

  listProducts: any[] = [];
  listSources: any[] = [];
  listChannel: any[] = [];
  image: any;
  showListProduct: Boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private pengajuanSrcService: PengajuanSrcService
  ) {

  }

  ngOnInit() {
    this.verticalStepperStep1 = this.formBuilder.group({
      name: ["", Validators.required],
      address: ["", Validators.required],
      province_id: [""],
      // province_id: ["", Validators.required],
      city_id: [""],
      // city_id: ["", Validators.required],
      district_id: [""],
      // district_id: ["", Validators.required],
      lat: [""],
      lng: [""]
    });

    this.verticalStepperStep2 = this.formBuilder.group({
      owner: ["", Validators.required],
      phone: ["", Validators.required],
      source: ["", Validators.required],
      channel: ["", Validators.required],
    });

    this.verticalStepperStep3 = this.formBuilder.group({
      image: ["", Validators.required]
    })

    this.getListChannels();
    this.getListProducts();
    this.getListSource();
  }

  getListProducts() {
    this.pengajuanSrcService.getProducts()
      .subscribe(res => {
        this.listProducts = res.data;
      }, err => {
        console.log('err', err);
      })
  }

  getListSource() {
    this.pengajuanSrcService.getSources()
      .subscribe(res => {
        this.listSources = res.data;
      }, err => {
        console.log('err sources', err);
      })
  }

  getListChannels() {
    this.pengajuanSrcService.getChannels()
      .subscribe(res => {
        this.listChannel = res.data;
      }, err => {
        console.log('err channe;', err);
      })
  }

  step1() {
    commonFormValidator.validateAllFields(this.verticalStepperStep1);
  }

  step2() {
    commonFormValidator.validateAllFields(this.verticalStepperStep2);
  }

  changeImage(inputValue: any): void {
    var file: File = inputValue;
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.image = myReader.result;
      this.verticalStepperStep3.get('image').setValue(this.image);
    }

    myReader.readAsDataURL(file);
  }

  showList() {
    this.showListProduct = !this.showListProduct;
  }

}
