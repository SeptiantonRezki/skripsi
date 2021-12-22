import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { PengajuanSrcService } from 'app/services/user-management/pengajuan-src.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { LanguagesService } from 'app/services/languages/languages.service';

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
  listProvinces: any[] = [];
  listCities: any[] = [];
  listDistricts: any[] = [];
  image: any;
  showListProduct: Boolean = false;
  submitting: Boolean = false;
  listProductSells: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private pengajuanSrcService: PengajuanSrcService,
    private ls: LanguagesService
  ) {

  }

  ngOnInit() {
    this.verticalStepperStep1 = this.formBuilder.group({
      name: ["", Validators.required],
      address: ["", Validators.required],
      province_id: ["", Validators.required],
      city_id: ["", Validators.required],
      district_id: ["", Validators.required],
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

    this.verticalStepperStep1
      .get('province_id')
      .valueChanges
      .subscribe(res => {
        if (res) {
          this.getCities(res);
        }
      })
    this.verticalStepperStep1
      .get('city_id')
      .valueChanges
      .subscribe(res => {
        if (res) {
          this.getDistricts(res);
        }
      })

    this.getListChannels();
    this.getListProducts();
    this.getListSource();
    this.getProvinces();
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

  getProvinces() {
    this.pengajuanSrcService.getProvinces()
      .subscribe(res => {
        console.log('res provinces', res);
        this.listProvinces = res.data;
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

  addToProducts(product) {
    let index = this.listProductSells.findIndex(prd => prd === product);
    if (index === -1) {
      this.listProductSells.push(product);
    } else {
      this.listProductSells.splice(index, 1);
    }
  }

  submit() {
    if (this.verticalStepperStep1.valid && this.verticalStepperStep2.valid && this.verticalStepperStep3.valid) {
      this.submitting = true;
      let phoneNumber = this.verticalStepperStep2.getRawValue()["phone"] && this.verticalStepperStep2.getRawValue()["phone"].slice(0, 3) === this.ls.locale.global.country_calling_code ? this.verticalStepperStep2.getRawValue()["phone"].slice(3, this.verticalStepperStep2.getRawValue()["phone"].length) : `${this.ls.locale.global.country_calling_code}${this.verticalStepperStep2.getRawValue()["phone"]}`

      let fd = new FormData();
      fd.append('name', this.verticalStepperStep1.get('name').value);
      fd.append('address', this.verticalStepperStep1.get('address').value);
      fd.append('province_id', this.verticalStepperStep1.get('province_id').value);
      fd.append('city_id', this.verticalStepperStep1.get('city_id').value);
      fd.append('district_id', this.verticalStepperStep1.get('district_id').value);
      fd.append('latitude', this.verticalStepperStep1.get('lat').value);
      fd.append('longitude', this.verticalStepperStep1.get('lng').value);
      fd.append('owner', this.verticalStepperStep2.get('owner').value);
      fd.append('phone', phoneNumber);
      fd.append('source', this.verticalStepperStep2.get('source').value);
      fd.append('channel', this.verticalStepperStep2.get('channel').value);
      fd.append('image', this.verticalStepperStep3.get('image').value);
      this.listProductSells.map(prd => {
        fd.append('product[]', prd);
      })

      this.pengajuanSrcService.create(fd).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: "Data Pengajuan SRC berhasil disimpan!" });
          this.router.navigate(["user-management", "pengajuan-src"]);
        },
        err => {
          this.submitting = false;
        }
      );
    } else {
      commonFormValidator.validateAllFields(this.verticalStepperStep1);
      commonFormValidator.validateAllFields(this.verticalStepperStep2);
    }
  }
}
