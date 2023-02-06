import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { Config } from 'app/classes/config';
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

  imageUrl: any;
  imageUrl2: any;
  imageUrl3: any;
  imageUrl4: any;
  
  files: File;
  files2: File;
  files3: File;
  files4: File;

  story_image: File;
  story_images: File[] = [];
  story_image_urls: any[] = [];

  validComboDrag: Boolean;

  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private ls: LanguagesService,
    private PojokUntungTemplateService: PojokUntungTemplateService,
  ) { }

  ngOnInit() {
    this.formTemplatePojokUntung = this.formBuilder.group({
      informasi_general: this.formBuilder.array([this.createInformasiGeneralFormArray()]),
      banner_1: [],
      banner_2: [],
      banner_3: [],
      banner_4: [],
    });

    this.getDetail();
  }

  getDetail() {
    console.log('detail data template pojok untung')
  }

  createInformasiGeneralFormArray() {
    return this.formBuilder.group({
      title: ["", Validators.required],
      description: ["", Validators.required],
      description_detail: this.formBuilder.array([this.formBuilder.control('')]),
      notes: ["", Validators.required]
    })
  }

  addDescDetail() {
    this.arr = (this.formTemplatePojokUntung as any).controls['informasi_general'].controls[0].controls.description_detail.controls;
    this.arr.push(this.formBuilder.control(''));
  }

  deleteForm(idx: any) {
    let form = (this.formTemplatePojokUntung as any).controls['informasi_general'].controls[0].controls.description_detail.controls;
    form.splice(idx, 1);
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

    this.story_images = [
      ...this.story_images,
      file
    ]

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
        console.log('user melakukan submit template pojok untung')
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
