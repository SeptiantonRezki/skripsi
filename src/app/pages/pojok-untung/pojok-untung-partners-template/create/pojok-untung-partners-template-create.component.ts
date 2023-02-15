import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { Config } from 'app/classes/config';
import { PagesName } from 'app/classes/pages-name';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { PojokUntungPartnersTemplateService } from 'app/services/pojok-untung/pojok-untung-partners-template.service';
import { PojokUntungPartnersListService } from 'app/services/pojok-untung/pojok-untung-partners-list.service';

@Component({
  selector: 'app-pojok-untung-partners-template-create',
  templateUrl: './pojok-untung-partners-template-create.component.html',
  styleUrls: ['./pojok-untung-partners-template-create.component.scss']
})
export class PojokUntungPartnersTemplateCreateComponent implements OnInit {
  formTemplatePartner: FormGroup;
  arr: FormArray;
  indexDelete: any;
  partner_type: any = '-9';
  partnerList: Array<any> = [];

  public options: Object = Config.FROALA_CUSTOM_HEIGHT_PLACEHOLDER_CONFIG(100, "Penjelasan");

  imageUrl: any;
  imageUrl2: any;
  imageUrl3: any;
  imageUrl4: any;
  
  files: File;
  files2: File;
  files3: File;
  files4: File;

  validComboDrag: Boolean;

  info_general_icons: File[] = [];
  info_general_icon_urls: any[] = [];
  benefit_icons: File[] = [];
  benefit_icon_urls: any[] = [];
  step_icons: File[] = [];
  step_icon_urls: any[] = [];

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
    private PojokUntungPartnersTemplateService: PojokUntungPartnersTemplateService,
    private PojokUntungPartnersListService: PojokUntungPartnersListService
    ) { 
    this.permission = this.roles.getRoles('principal.pojokuntung_template_partner');
    }

  ngOnInit() {
    this.formTemplatePartner = this.formBuilder.group({
      partner_id: ["", Validators.required],
      name: ["", Validators.required],
      alias: [""],
      info_detail: [""],
      agreement_text: [""],
      benefit_title: [""],
      step_title: [""],
      info_general: this.formBuilder.array([this.createInfoGeneralFormArray()]),
      benefit: this.formBuilder.array([this.createBenefitFormArray()]),
      step: this.formBuilder.array([this.createStepFormArray()]),
      banner_1: [],
      banner_2: [],
      banner_3: [],
      banner_4: [],
    });

    this.PojokUntungPartnersListService.get({partner_type: this.partner_type}).subscribe(res => {
      this.partnerList = res.data;
    }, err=> { })

    if (!this.permission.buat) {
      this.formTemplatePartner.disable();
    }
  }

  createInfoGeneralFormArray() {
    return this.formBuilder.group({
      info_general_title: [""],
      info_general_description: [""],
      info_general_link: [""]
    })
  }

  createBenefitFormArray() {
    return this.formBuilder.group({
      benefit_detail_title: [""],
      benefit_detail_description: [""],
    })
  }

  addBenefit() {
    this.arr = this.formTemplatePartner.get('benefit') as FormArray;
    this.arr.push(this.createBenefitFormArray());
  }

  createStepFormArray(): FormGroup {
    return this.formBuilder.group({
      // step__detail_title: [""],
      step_detail_content: [""],
    })
  }

  addStep() {
    this.arr = this.formTemplatePartner.get('step') as FormArray;
    this.arr.push(this.createStepFormArray());
  }

  deleteForm(idx: any, type: any) {
    this.indexDelete = idx;
    let form = this.formTemplatePartner.controls[type] as FormArray;
    form.removeAt(this.indexDelete);
    
    if (this[type + '_icons']) {
      this[type + '_icons'].splice(idx, 1);
    }

    if (this[type + '_icon_urls']) {
      this[type + '_icon_urls'].splice(idx, 1);
    }
  }

  changeImage(evt: any, index: any, type?: string) {
    this.readThis(evt, index, type);
  }

  readThis(inputValue: any, index: any, type?: string): void {
    const imageDimensions = {
      benefit: {
        width: 100,
        height: 100
      },
      step: {
        width: 150,
        height: 200
      },
      info_general: {
        width: 100,
        height: 100
      },
      banners: {
        width: 360,
        height: 137
      }
    };
    
    var file: File = inputValue;

    if (type) {
      if (type === 'step') {
        if (file.size > 1000 * 1000) {
          this.dialogService.openSnackBar({
            message: "File melebihi maksimum 1mb!"
          });
          return;
        }
      } else {
        if (file.size > 100 * 1000) {
          this.dialogService.openSnackBar({
            message: "File melebihi maksimum 100kb!"
          });
          return;
        }
      }
    }
    
    if (file.size > 2000000) {
      this.dialogService.openSnackBar({
        message: "File melebihi maksimum 2mb!"
      });
      return;
    }
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      var img = new Image;
      img.onload = () => {
          var currentImageDimensions = imageDimensions[type || 'banners'];
          // if (!type) {
          //   if (img.width !== currentImageDimensions.width || img.height !== currentImageDimensions.height) {
          //     this.dialogService.openSnackBar({
          //       message: "Resolusi gambar tidak sesuai! Silakan upload ulang."
          //     });
          //     return;
          //   }
          // }

          // store image to local memory
          if (type === 'benefit') {
            this.benefit_icon_urls[index] = myReader.result;
          }
          if (type === 'step') {
            this.step_icon_urls[index] = myReader.result;
          }
          if (type === 'info_general') {
            this.info_general_icon_urls[index] = myReader.result;
          }
    
          if (index && !type) {
            if (index === '1') {
              this.imageUrl = myReader.result;
            }
            if (index === '2') {
              this.imageUrl2 = myReader.result;
            }
            if (index === '3') {
              this.imageUrl3 = myReader.result;
            }
            if (index === '4') {
              this.imageUrl4 = myReader.result;
            }
          }
      };
      img.src = myReader.result as string;
    }

    myReader.readAsDataURL(file);
  }

  removeImage(i: any, type?: string): void {
    if (type === 'benefit') {
      this.benefit_icons[i] = null;
      this.benefit_icon_urls[i] = null;
    }
    if (type === 'step') {
      this.step_icons[i] = null;
      this.step_icon_urls[i] = null;
    }
    if (type === 'info_general') {
      this.info_general_icons[i] = null;
      this.info_general_icon_urls[i] = null;
    }

    if (i && !type) {
      if (i === '1') {
        this.files = null;
        this.imageUrl = null;
      }
      if (i === '2') {
        this.files2 = null;
        this.imageUrl2 = null;
      }
      if (i === '3') {
        this.files3 = null;
        this.imageUrl3 = null;
      }
      if (i === '4') {
        this.files4 = null;
        this.imageUrl4 = null;
      }
    }
  }

  submit() {
    if (this.formTemplatePartner.valid) {
      // if (this.files || this.files2 || this.files3 || this.files4) {
        this.dataService.showLoading(true);
        if (this.files && this.files.name) {
          this.files = new File([this.files], this.files.name.split(" ").join("_"), {type: this.files.type});
        }
        if (this.files2 && this.files2.name) {
          this.files2 = new File([this.files2], this.files2.name.split(" ").join("_"), {type: this.files2.type});
        }
        if (this.files3 && this.files3.name) {
          this.files3 = new File([this.files3], this.files3.name.split(" ").join("_"), {type: this.files3.type});
        }
        if (this.files4 && this.files4.name) {
          this.files4 = new File([this.files4], this.files4.name.split(" ").join("_"), {type: this.files4.type});
        }

        let fd = new FormData();
        fd.append('id', "0");
        fd.append('partner_id', this.formTemplatePartner.get('partner_id').value);
        fd.append('name', this.formTemplatePartner.get('name').value);
        fd.append('alias', this.formTemplatePartner.get('alias').value);
        fd.append('info_detail', this.formTemplatePartner.get('info_detail').value);
        fd.append('agreement_text', this.formTemplatePartner.get('agreement_text').value);

        this.formTemplatePartner.get('info_general').value.forEach((info, i) => {
          fd.append(`informasi_general[${i}][title]`, info.info_general_title);
          fd.append(`informasi_general[${i}][description]`, info.info_general_description);
          fd.append(`informasi_general[${i}][link]`, info.info_general_link);
        });
        this.info_general_icons.forEach((info_general_icon, i) => {
          fd.append(`informasi_general[${i}][icon]`, info_general_icon);
        });

        fd.append('benefit_title', this.formTemplatePartner.get('benefit_title').value);
        this.formTemplatePartner.get('benefit').value.forEach((benefit, i) => {
          fd.append(`benefit_detail[${i}][title]`, benefit.benefit_detail_title);
          fd.append(`benefit_detail[${i}][description]`, benefit.benefit_detail_description);
        });
        this.benefit_icons.forEach((benefit_icon, i) => {
          fd.append(`benefit_detail[${i}][icon]`, benefit_icon);
        });

        fd.append('how_to_title', this.formTemplatePartner.get('step_title').value);
        this.formTemplatePartner.get('step').value.forEach((step, i) => {
          // fd.append(`how_to_detail[${i}][title]`, step.step_detail_title);
          fd.append(`how_to_detail[${i}][content]`, step.step_detail_content);
        });
        this.step_icons.forEach((step_icon, i) => {
          fd.append(`how_to_detail[${i}][icon]`, step_icon);
        });

        fd.append('banner_1', this.files);
        fd.append('banner_2', this.files2);
        fd.append('banner_3', this.files3);
        fd.append('banner_4', this.files4);

        this.PojokUntungPartnersTemplateService.create(fd).subscribe(res => {
          this.dataService.showLoading(false);
          this.dialogService.openSnackBar({
            message: this.ls.locale.notification.popup_notifikasi.text22
          });
          this.router.navigate(['pojok-untung', 'partners-template']);
        })

      // } else {
      //   this.dialogService.openSnackBar({
      //     message: "Banner harus diisi minimal 1!"
      //   });
      //   commonFormValidator.validateAllFields(this.formTemplatePartner);
      // }
    } else {
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      });
      commonFormValidator.validateAllFields(this.formTemplatePartner);
    }
  }

}
