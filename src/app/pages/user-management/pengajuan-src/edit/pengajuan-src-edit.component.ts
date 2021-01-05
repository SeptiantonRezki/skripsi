import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { PengajuanSrcService } from 'app/services/user-management/pengajuan-src.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-pengajuan-src-edit',
  templateUrl: './pengajuan-src-edit.component.html',
  styleUrls: ['./pengajuan-src-edit.component.scss']
})
export class PengajuanSrcEditComponent implements OnInit {
  formPengajuanSrc: FormGroup;
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
  shortDetail: any;
  detailPengajuan: any;
  productChecked: any = {};

  files: File;
  validComboDrag: Boolean;

  constructor(
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private pengajuanSrcService: PengajuanSrcService
  ) {
    this.shortDetail = this.dataService.getFromStorage('detail_pengajuan_src');
  }

  ngOnInit() {
    this.formPengajuanSrc = this.formBuilder.group({
      name: ["", Validators.required],
      address: ["", Validators.required],
      province_id: ["", Validators.required],
      city_id: ["", Validators.required],
      district_id: ["", Validators.required],
      lat: [""],
      lng: [""],
      owner: ["", Validators.required],
      phone: ["", Validators.required],
      source: ["", Validators.required],
      channel: ["", Validators.required],
      image: ["", Validators.required],
      snk: [false],
      pnp: [false]
    })

    this.formPengajuanSrc
      .get('province_id')
      .valueChanges
      .subscribe(res => {
        if (res) {
          this.listDistricts = [];
          this.listCities = [];
          this.formPengajuanSrc.get("district_id").setValue("");
          this.formPengajuanSrc.get("city_id").setValue("");
          this.getCities(res);
        }
      })
    this.formPengajuanSrc
      .get('city_id')
      .valueChanges
      .subscribe(res => {
        if (res) {
          this.listDistricts = [];
          this.formPengajuanSrc.get("district_id").setValue("");
          this.getDistricts(res);
        }
      })

    this.getDetail();
    this.getListChannels();
    this.getListProducts();
    this.getListSource();
    this.getProvinces();
  }

  getDetail() {
    this.pengajuanSrcService.show({ pengajuan_id: this.shortDetail.id })
      .subscribe(res => {
        console.log('res', res);
        this.detailPengajuan = res.data;
        if (this.detailPengajuan.province_id) this.getCities(this.detailPengajuan.province_id);
        if (this.detailPengajuan.city_id) this.getDistricts(this.detailPengajuan.city_id);
        if (!!this.detailPengajuan.product && this.detailPengajuan.product.length > 0) {
          this.detailPengajuan.product.map(prd => {
            this.productChecked[prd] = true;
          });
          this.listProductSells = this.detailPengajuan.product;
        }
        this.formPengajuanSrc.setValue({
          name: this.detailPengajuan.name,
          address: this.detailPengajuan.address,
          province_id: this.detailPengajuan.province_id ? this.detailPengajuan.province_id : '',
          city_id: this.detailPengajuan.city_id ? this.detailPengajuan.city_id : '',
          district_id: this.detailPengajuan.district_id ? this.detailPengajuan.district_id : '',
          lat: this.detailPengajuan.latitude,
          lng: this.detailPengajuan.longitude,
          owner: this.detailPengajuan.owner,
          phone: this.detailPengajuan.phone ? (this.detailPengajuan.phone.slice(0, 3) === '+62' ? this.detailPengajuan.phone.split("+62")[1] : this.detailPengajuan.phone) : '',
          source: this.detailPengajuan.source,
          channel: this.detailPengajuan.channel,
          image: this.detailPengajuan.image_url,
          snk: this.detailPengajuan.is_syarat_ketentuan ? true : false,
          pnp: this.detailPengajuan.is_pemberitahuan_privasi ? true : false
        });

        this.image = this.detailPengajuan.image_url;
        // if (res && res.data && res.data.product) {
        //   this.productList = res.data.product;
        // }
        // if (res && res.data && res.data.available_status) {
        //   this.orderStatuses = res.data.available_status;
        // }
      }, err => {
        console.log('err', err);
      })
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

  addToProducts(product) {
    let index = this.listProductSells.findIndex(prd => prd === product);
    if (index === -1) {
      this.listProductSells.push(product);
    } else {
      this.listProductSells.splice(index, 1);
    }
  }

  changeImage(inputValue: any): void {
    var file: File = inputValue;
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.image = myReader.result;
      this.formPengajuanSrc.get('image').setValue(this.image);
    }

    myReader.readAsDataURL(file);
  }

  showList() {
    this.showListProduct = !this.showListProduct;
  }

  submit() {
    if (this.formPengajuanSrc.valid) {
      this.submitting = true;
      let phoneNumber = this.formPengajuanSrc.getRawValue()["phone"] && this.formPengajuanSrc.getRawValue()["phone"].slice(0, 3) === '+62' ? this.formPengajuanSrc.getRawValue()["phone"].slice(3, this.formPengajuanSrc.getRawValue()["phone"].length) : `+62${this.formPengajuanSrc.getRawValue()["phone"]}`

      let fd = new FormData();
      fd.append('_method', 'PUT');
      fd.append('name', this.formPengajuanSrc.get('name').value);
      fd.append('address', this.formPengajuanSrc.get('address').value);
      fd.append('province_id', this.formPengajuanSrc.get('province_id').value);
      fd.append('city_id', this.formPengajuanSrc.get('city_id').value);
      fd.append('district_id', this.formPengajuanSrc.get('district_id').value);
      fd.append('latitude', this.formPengajuanSrc.get('lat').value);
      fd.append('longitude', this.formPengajuanSrc.get('lng').value);
      fd.append('owner', this.formPengajuanSrc.get('owner').value);
      fd.append('phone', phoneNumber);
      fd.append('source', this.formPengajuanSrc.get('source').value);
      fd.append('channel', this.formPengajuanSrc.get('channel').value);
      fd.append('image', this.formPengajuanSrc.get('image').value);
      fd.append('is_syarat_ketentuan', this.formPengajuanSrc.get('snk').value ? '1' : '0');
      fd.append('is_pemberitahuan_privasi', this.formPengajuanSrc.get('pnp').value ? '1' : '0');
      this.listProductSells.map(prd => {
        fd.append('product[]', prd);
      });
      this.pengajuanSrcService.put(fd, { pengajuan_id: this.detailPengajuan.id }).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: "Data Pengajuan SRC berhasil disimpan!" });
          this.router.navigate(["user-management", "pengajuan-src"]);
          this.submitting = false;
        },
        err => {
          this.submitting = false;
        }
      );
    } else {
      commonFormValidator.validateAllFields(this.formPengajuanSrc);
      commonFormValidator.validateAllFields(this.formPengajuanSrc);
    }
  }
}
