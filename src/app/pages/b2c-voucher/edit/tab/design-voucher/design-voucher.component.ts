import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { GeotreeService } from 'app/services/geotree.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { TemplateBanner } from 'app/classes/banner-template';
import { B2CVoucherService } from 'app/services/b2c-voucher.service';
import html2canvas from 'html2canvas';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { Config } from 'app/classes/config';

@Component({
  selector: 'app-design-voucher',
  templateUrl: './design-voucher.component.html',
  styleUrls: ['./design-voucher.component.scss']
})
export class DesignVoucherComponent implements OnInit {
  onLoad: boolean;
  isDetail: boolean;
  detailVoucher: any;
  isPushNearbyPromotion: FormControl = new FormControl(false);

  public options: Object = Config.FROALA_CONFIG;

  formDesignVoucher: FormGroup;

  templateBannerList: any[];
  bannerTemplate: TemplateBanner = new TemplateBanner();
  bannerSelected: any;

  files: File;
  imageContentType: File;
  imageContentTypeBase64: any;
  image: any;
  imageConverted: any;
  validComboDrag: boolean;

  _data: any = null;
  @Input()
  set data(data: any) {
    this.detailVoucher = data;
    this._data = data;
  }
  get data(): any { return this._data; }

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private b2cVoucherService: B2CVoucherService,
    private geotreeService: GeotreeService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {
    activatedRoute.url.subscribe(params => {
      this.isDetail = params[0].path === 'detail' ? true : false;
    });
    this.templateBannerList = this.bannerTemplate.getTemplateBanner('LOREM IPSUM');
  }

  ngOnInit() {
    this.formDesignVoucher = this.formBuilder.group({
      title: [''],
      banner_selected: this.formBuilder.group({
        'id': [''],
        'name': [''],
        'image': [''],
        'title': [''],
        'class': ['']
      }),
      body: ['', Validators.required]
    });
    this.getDetail();

    this.formDesignVoucher.get('banner_selected').valueChanges.debounceTime(300).subscribe(res => {
      this.bannerSelected = res;
    });
  }

  getDetail() {
    this.detailVoucher = this.dataService.getFromStorage('detail_voucher_b2c');
    if (this.detailVoucher) {
      this.isPushNearbyPromotion.setValue(this.detailVoucher.is_push_nearby ? true : false);
      this.formDesignVoucher.get('body').setValue(this.detailVoucher.body);
    }
  }

  selectBannerTemplate(item: any) {
    this.bannerSelected = item;
    this.formDesignVoucher.get('banner_selected').setValue(item);
  }

  changeImage(event) {
    this.readThis(event);
  }

  readThis(inputValue: any): void {
    const file: File = inputValue;
    const myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.image = myReader.result;
      this.bannerSelected['image'] = this.image;
      this.formDesignVoucher.get('banner_selected').get('image').setValue(this.image);
    };

    myReader.readAsDataURL(file);
  }

  async onUpdate() {
    try {
      if (this.formDesignVoucher.valid) {
        this.dataService.showLoading(true);
        await html2canvas(document.querySelector('#banner'), { scale: 3 }).then(canvas => {
          this.imageConverted = this.convertCanvasToImage(canvas);
          this.dataService.showLoading(false);
        });

        const bodyForm = new FormData();
        bodyForm.append('_method', 'PUT');
        bodyForm.append('is_push_nearby', this.isPushNearbyPromotion.value ? '1' : '0');
        bodyForm.append('image', this.imageConverted);
        bodyForm.append('body', this.formDesignVoucher.get('body').value);
        this.b2cVoucherService.updateDesign({ voucher_id: this.detailVoucher.id }, bodyForm).subscribe((res) => {
          this.router.navigate(['b2c-voucher']);
          console.log('res', res);
          this.dataService.showLoading(false);
        }, err => {
          console.log('err onUpdate', err);
          this.dataService.showLoading(false);
        });
      } else {
        alert('Lengkapi bagian yang harus diisi!');
        commonFormValidator.validateAllFields(this.formDesignVoucher);
      }
    } catch (ex) {
      console.log('ex onUpdate', ex)
      this.dataService.showLoading(false);
    }
  }

  convertCanvasToImage(canvas: any) {
    const image = new Image();
    image.src = canvas.toDataURL('image/jpeg');
    return image.src;
  }

}
