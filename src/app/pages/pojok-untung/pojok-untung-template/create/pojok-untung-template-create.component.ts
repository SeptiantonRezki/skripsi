import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { Config } from 'app/classes/config';
import { PagesName } from 'app/classes/pages-name';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { PojokUntungTemplateService } from 'app/services/pojok-untung/pojok-untung-template.service';

@Component({
  selector: 'app-pojok-untung-template-create',
  templateUrl: './pojok-untung-template-create.component.html',
  styleUrls: ['./pojok-untung-template-create.component.scss']
})
export class PojokUntungTemplateCreateComponent implements OnInit {
  public optionsGeneral: Object = Config.FROALA_CUSTOM_HEIGHT_PLACEHOLDER_CONFIG();

  formTemplatePojokUntung: FormGroup;
  arr: FormArray;
  indexDelete: any;
  detailTemplate: any;

  imageUrl: any;
  imageUrl2: any;
  imageUrl3: any;
  imageUrl4: any;

  files: File | null = null;
  files2: File | null = null;
  files3: File | null = null;
  files4: File | null = null;

  story_image: File;
  story_images: File[] = [];
  story_image_urls: any[] = [];

  validComboDrag: Boolean;

  permission: any;
  roles: PagesName = new PagesName();
  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
    private PojokUntungTemplateService: PojokUntungTemplateService,
  ) { 
    this.permission = this.roles.getRoles('principal.pojokuntung_template');
  }

  ngOnInit() {
    this.initForm();

    this.getDetail();
  }

  initForm() {
    this.formTemplatePojokUntung = this.formBuilder.group({
      informasi_general: this.formBuilder.array([]),
      banner_1: [],
      banner_2: [],
      banner_3: [],
      banner_4: [],
    });
  }

  getDetail() {
    this.dataService.showLoading(true);
    this.PojokUntungTemplateService.get().subscribe(res => {
      this.detailTemplate = res.data && (res.data[0] || res.data);

      let informasiGeneralData;
      if (this.detailTemplate) {
        if ((typeof this.detailTemplate.informasi_general) as string === 'string') {
          informasiGeneralData = JSON.parse(this.detailTemplate.informasi_general);
        } else {
          informasiGeneralData = this.detailTemplate.informasi_general;
        }
      }

      let informasi_general = this.formTemplatePojokUntung.get("informasi_general") as FormArray;

      this.dataService.showLoading(false);
      if (!informasiGeneralData || !informasiGeneralData.length) {
        informasi_general.push(this.createInformasiGeneralFormArray());
      } else {
        informasiGeneralData.forEach((item, idx) => {
          let description_detail_array = [];
          if (item.description_detail && item.description_detail.length) {
            description_detail_array = item.description_detail.map((item_detail) => {
              return this.formBuilder.control(item_detail);
            });
          } else {
            description_detail_array = [this.formBuilder.control('')];
          };

          informasi_general.push(this.formBuilder.group({
            title: item.title,
            description: item.description,
            description_detail: this.formBuilder.array(description_detail_array),
            notes: item.notes ? ["undefined", "null"].indexOf(item.notes) === -1 ? item.notes : null : null
          }));
        });
      }

      this.formTemplatePojokUntung.get("banner_1").setValue(this.detailTemplate.banner_1 ? ["undefined", "null"].indexOf(this.detailTemplate.banner_1) === -1 ? this.detailTemplate.banner_1 : [] : []);
      this.formTemplatePojokUntung.get("banner_2").setValue(this.detailTemplate.banner_2 ? ["undefined", "null"].indexOf(this.detailTemplate.banner_2) === -1 ? this.detailTemplate.banner_2 : [] : []);
      this.formTemplatePojokUntung.get("banner_3").setValue(this.detailTemplate.banner_3 ? ["undefined", "null"].indexOf(this.detailTemplate.banner_3) === -1 ? this.detailTemplate.banner_3 : [] : []);
      this.formTemplatePojokUntung.get("banner_4").setValue(this.detailTemplate.banner_4 ? ["undefined", "null"].indexOf(this.detailTemplate.banner_4) === -1 ? this.detailTemplate.banner_4 : [] : []);

      this.files = this.detailTemplate.banner_1 ? ["undefined", "null"].indexOf(this.detailTemplate.banner_1) === -1 ? this.detailTemplate.banner_1 : null : null;
      this.files2 = this.detailTemplate.banner_2 ? ["undefined", "null"].indexOf(this.detailTemplate.banner_2) === -1 ? this.detailTemplate.banner_2 : null : null;
      this.files3 = this.detailTemplate.banner_3 ? ["undefined", "null"].indexOf(this.detailTemplate.banner_3) === -1 ? this.detailTemplate.banner_3 : null : null;
      this.files4 = this.detailTemplate.banner_4 ? ["undefined", "null"].indexOf(this.detailTemplate.banner_4) === -1 ? this.detailTemplate.banner_4 : null : null;

      this.imageUrl = this.detailTemplate.banner_1 ? ["undefined", "null"].indexOf(this.detailTemplate.banner_1) === -1 ? this.detailTemplate.banner_1 : null : null;
      this.imageUrl2 = this.detailTemplate.banner_2 ? ["undefined", "null"].indexOf(this.detailTemplate.banner_2) === -1 ? this.detailTemplate.banner_2 : null : null;
      this.imageUrl3 = this.detailTemplate.banner_3 ? ["undefined", "null"].indexOf(this.detailTemplate.banner_3) === -1 ? this.detailTemplate.banner_3 : null : null;
      this.imageUrl4 = this.detailTemplate.banner_4 ? ["undefined", "null"].indexOf(this.detailTemplate.banner_4) === -1 ? this.detailTemplate.banner_4 : null : null;

      if (this.detailTemplate.story && this.detailTemplate.story.length) {
        this.detailTemplate.story.forEach((item, idx) => {
          item.file_name ? ["undefined", "null"].indexOf(item.file_name) === -1 ? this.story_images.push(item.file_name) : [] : [];
          item.file_name ? ["undefined", "null"].indexOf(item.file_name) === -1 ? this.story_image_urls.push(item.file_name) : [] : [];
          // console.log('story images >>> ', this.story_images);
          // console.log('story image urls >>> ', this.story_image_urls);
        });
      } else {
        this.story_images = [],
        this.story_image_urls = []
      }

      if (!this.permission.ubah || !this.permission.buat) {
        this.formTemplatePojokUntung.disable();
      }
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  createInformasiGeneralFormArray() {
    return this.formBuilder.group({
      title: ["", Validators.required],
      description: ["", Validators.required],
      description_detail: this.formBuilder.array([this.formBuilder.control('')]),
      notes: [""]
    })
  }

  addDescDetail() {
    let arr;
    arr = (this.formTemplatePojokUntung as any).controls['informasi_general'].controls[0].controls.description_detail;
    arr.push(this.formBuilder.control(''));
  }

  deleteForm(idx: any) {
    let form = (this.formTemplatePojokUntung as any).controls['informasi_general'].controls[0].controls.description_detail;
    form.removeAt(idx);
  }

  changeImage(evt: any, index: any, type?: string) {
    this.readThis(evt, index, type);
  }

  readThis(inputValue: any, index: any, type?: string): void {
    const imageDimensions = {
      story: {
        width: 360,
        height: 160
      },
      banners: {
        width: 360,
        height: 137
      }
    };

    var file: File = inputValue;

    if (type) {
      if (type === 'story') {
        if (file.size > 2000 * 1000) {
          this.dialogService.openSnackBar({
            message: "File melebihi maksimum 2mb!"
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

    if (type && type === 'story') {
      this.story_images = [
        ...this.story_images,
        file
      ]
    }

    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      var img = new Image;
      img.onload = () => {
        var currentImageDimensions = imageDimensions[type || 'banners'];

        // store image to local memory
        if (type === 'story') {
          this.story_image_urls = [...this.story_image_urls, myReader.result];
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
    if (type === 'story') {
      this.story_images.splice(i, 1);
      this.story_image_urls.splice(i, 1);
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
    if (this.formTemplatePojokUntung.valid) {
      if (this.files || this.files2 || this.files3 || this.files4) {
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

        fd.append('id', (this.detailTemplate && this.detailTemplate.id) || '1');
        this.formTemplatePojokUntung.get('informasi_general').value.forEach((info, i) => {
          fd.append(`informasi_general[${i}][title]`, info.title);
          fd.append(`informasi_general[${i}][description]`, info.description);
          fd.append(`informasi_general[${i}][notes]`, info.notes);

          info.description_detail.forEach((detail, idx) => {
            fd.append(`informasi_general[${i}][description_detail][${idx}]`, detail);
          })
        });

        if (this.story_images.length) {
          this.story_images.forEach((story_image, i) => {
            fd.append(`story[${i}][file_name]`, story_image);
          });
        } else {
          fd.append(`story[0][file_name]`, null);
        }
          

        fd.append('banner_1', this.files);
        fd.append('banner_2', this.files2);
        fd.append('banner_3', this.files3);
        fd.append('banner_4', this.files4);

        this.PojokUntungTemplateService.store(fd).subscribe(res => {
          this.dataService.showLoading(false);
          this.dialogService.openSnackBar({
            message: this.ls.locale.notification.popup_notifikasi.text22
          });
          this.initForm();
          this.imageUrl = null;
          this.imageUrl2 = null;
          this.imageUrl3 = null;
          this.imageUrl4 = null;

          this.files = null;
          this.files2 = null;
          this.files3 = null;
          this.files4 = null;

          this.story_images = [];
          this.story_image_urls = [];
          this.getDetail();
        })
      } else {
        this.dialogService.openSnackBar({
          message: "Banner harus diisi minimal 1!"
        });
        commonFormValidator.validateAllFields(this.formTemplatePojokUntung);
      }
    } else {
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      });
      commonFormValidator.validateAllFields(this.formTemplatePojokUntung);
    }
  }

}
