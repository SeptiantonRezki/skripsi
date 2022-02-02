import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
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
import { LanguagesService } from 'app/services/languages/languages.service';

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
  @ViewChild('containerScroll') private myScrollContainer: ElementRef;

  private froalaControl: any;
  public options: Object = Config.FROALA_CONFIG;
  public initialize(initControls) {
    this.froalaControl = initControls;
    if (this.froalaControl) {
      this.froalaControl.initialize();
    }
  }

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
  disableForm: boolean = false;

  _data: any = null;
  @Input()
  set data(data: any) {
    this.detailVoucher = data;
    // this._data = data;
  }
  get data(): any { return this._data; }

  // tslint:disable-next-line:no-output-on-prefix
  @Output()
  onRefresh: any;

  @Output()
  setSelectedTab: any;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private b2cVoucherService: B2CVoucherService,
    private geotreeService: GeotreeService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private ls: LanguagesService
  ) {
    activatedRoute.url.subscribe(params => {
      this.isDetail = params[0].path === 'detail' ? true : false;
    });
    this.onRefresh = new EventEmitter<any>();
    this.setSelectedTab = new EventEmitter<any>();
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
    // this.detailVoucher = this.dataService.getFromStorage('detail_voucher_b2c');
    this.initDetail();
  }

  initDetail() {
    if (this.detailVoucher) {
      this.isPushNearbyPromotion.setValue(this.detailVoucher.is_push_nearby ? true : false);
      this.formDesignVoucher.get('body').setValue(this.detailVoucher.body);
      // disable form
      if(this.detailVoucher.status !== 'draft' && this.detailVoucher.status !== 'draft_saved' && this.detailVoucher.status !== 'reject') {
        this.formDesignVoucher.disable();
        this.disableForm = true;
        this.froalaControl.destroy();
        this.options = {
          ...this.options,
          events: {
            'froalaEditor.initialized': function(e, editor){
              setTimeout(() => {
                editor.el.id = e.currentTarget.getAttribute("data-froala-id");
                editor.edit.off();
              }, 500);
            },
          }
        }
      };
      setTimeout(() => {
        this.initialize(this.froalaControl);
      }, 100);
    } else {
      setTimeout(() => {
        this.initDetail();
      }, 1000);
    }
  }

  selectBannerTemplate(item: any) {
    if(!this.disableForm) {
      this.bannerSelected = item;
      this.formDesignVoucher.get('banner_selected').setValue(item);
    };
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
          // this.router.navigate(['b2c-voucher']);
          this.dataService.showLoading(false);
          this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
          this.onRefresh.emit();
          this.setSelectedTab.emit(5);
        }, err => {
          console.warn('err', err);
          this.dataService.showLoading(false);
        });
      } else {
        alert('Lengkapi bagian yang harus diisi!');
        commonFormValidator.validateAllFields(this.formDesignVoucher);
        try {
          this.myScrollContainer.nativeElement.scrollTop = 0;
        } catch (err) {
          console.error('Scrolling Error', err);
        }
      }
    } catch (ex) {
      console.warn('ex onUpdate', ex)
      this.dataService.showLoading(false);
    }
  }

  convertCanvasToImage(canvas: any) {
    const image = new Image();
    image.src = canvas.toDataURL('image/jpeg');
    return image.src;
  }

}
