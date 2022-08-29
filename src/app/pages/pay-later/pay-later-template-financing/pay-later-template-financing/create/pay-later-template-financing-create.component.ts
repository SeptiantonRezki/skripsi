import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { PayLaterTemplateFinancingService } from 'app/services/pay-later/pay-later-template-financing.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { LanguagesService } from 'app/services/languages/languages.service';
import { Config } from 'app/classes/config';

@Component({
  selector: 'app-pay-later-template-financing-create',
  templateUrl: './pay-later-template-financing-create.component.html',
  styleUrls: ['./pay-later-template-financing-create.component.scss']
})
export class PayLaterTemplateFinancingCreateComponent implements OnInit {
  formTemplate: FormGroup;
  arr: FormArray;
  indexDelete: any;
  dataType: any;
  public optionsGeneral: Object = Config.FROALA_CONFIG;
  public options: Object = Config.FROALA_CUSTOM_HEIGHT_PLACEHOLDER_CONFIG(100, "Penjelasan");
  public optionsFaq: Object = Config.FROALA_CUSTOM_HEIGHT_PLACEHOLDER_CONFIG(100, "Jawaban");

  // image_list: Array<any> = [];
  imageUrl: any;
  imageUrl2: any;
  imageUrl3: any;
  imageUrl4: any;
  files: File;
  files2: File;
  files3: File;
  files4: File;
  // fileList: Array<File> = [];
  validComboDrag: Boolean;

  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private PayLaterTemplateFinancingService: PayLaterTemplateFinancingService,
    private ls: LanguagesService
  ) { 

  }

  ngOnInit() {
    this.dataType = this.router.routerState.root.queryParams['value'].type;

    this.formTemplate = this.formBuilder.group({
      name: ["", Validators.required],
      information: ["", Validators.required],
      reason: this.formBuilder.array([this.createReasonFormArray()]),
      use: this.formBuilder.array([this.createUseFormArray()]),
      faq: this.formBuilder.array([this.createFaqFormArray()]),
      tips: this.formBuilder.array([this.createTipsFormArray()]),
      banner_1: [],
      banner_2: [],
      banner_3: [],
      banner_4: [],
    });
  }

  createReasonFormArray() {
    return this.formBuilder.group({
      reason_title: ["", Validators.required],
      reason_body: ["", Validators.required]
    })
  }

  addReason() {
    this.arr = this.formTemplate.get('reason') as FormArray;
    this.arr.push(this.createReasonFormArray());
  }

  createUseFormArray(): FormGroup {
    return this.formBuilder.group({
      use_title: ["", Validators.required],
      use_body: ["", Validators.required]
    })
  }

  addUse() {
    this.arr = this.formTemplate.get('use') as FormArray;
    this.arr.push(this.createUseFormArray());
  }

  createFaqFormArray() {
    return this.formBuilder.group({
      question: ["", Validators.required],
      answer: ["", Validators.required],
    })
  }

  addFaq() {
    this.arr = this.formTemplate.get('faq') as FormArray;
    this.arr.push(this.createFaqFormArray());
  }

  createTipsFormArray() {
    return this.formBuilder.group({
      tips_title: ["", Validators.required],
      tips_body: ["", Validators.required]
    })
  }

  addTips() {
    this.arr = this.formTemplate.get('tips') as FormArray;
    this.arr.push(this.createTipsFormArray());
  }

  deleteForm(idx: any, value: any) {
    this.indexDelete = idx;
    let form = this.formTemplate.controls[value] as FormArray;
    form.removeAt(this.indexDelete);
  }

  changeImage(evt: any, index: any) {
    this.readThis(evt, index);
  }

  readThis(inputValue: any, index: any): void {
    var file: File = inputValue;
    if (file.size > 2000000) {
      this.dialogService.openSnackBar({
        message: "File melebihi maksimum 2mb!"
      });
      return;
    }
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      if (index) {
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
    }

    myReader.readAsDataURL(file);
  }

  removeImage(i: any): void {
    if (i) {
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
    if (this.formTemplate.valid) {
      if (this.files || this.files2 || this.files3 || this.files4) {
        this.dataService.showLoading(true);
        if (this.files) {
          this.files = new File([this.files], this.files.name.split(" ").join("_"), {type: this.files.type});
        }
        if (this.files2) {
          this.files2 = new File([this.files2], this.files2.name.split(" ").join("_"), {type: this.files2.type});
        }
        if (this.files3) {
          this.files3 = new File([this.files3], this.files3.name.split(" ").join("_"), {type: this.files3.type});
        }
        if (this.files4) {
          this.files4 = new File([this.files4], this.files4.name.split(" ").join("_"), {type: this.files4.type});
        }

        let fd = new FormData();
        fd.append('name', this.formTemplate.get('name').value);
        fd.append('informasi_general', this.formTemplate.get('information').value);
        fd.append('alasan_bergabung', JSON.stringify(this.formTemplate.get('reason').value));
        fd.append('cara_penggunaan', JSON.stringify(this.formTemplate.get('use').value));
        fd.append('faq', JSON.stringify(this.formTemplate.get('faq').value));
        fd.append('tips_trick', JSON.stringify(this.formTemplate.get('tips').value));
        fd.append('paylater_company_type_id', this.dataType === "invoice-financing" ? "1" : this.dataType === "retailer-financing" ? "2" : this.dataType === "kur" ? "3" : "null");
        if (!this.files) {
          fd.append('banner_file1', this.files);
          fd.append('banner_1', this.files);
        } else {
          fd.append('banner_file1', this.files);
        }

        if (!this.files2) {
          fd.append('banner_file2', this.files2);
          fd.append('banner_2', this.files2);
        } else {
          fd.append('banner_file2', this.files2);
        }

        if (!this.files3) {
          fd.append('banner_file3', this.files3);
          fd.append('banner_3', this.files3);
        } else {
          fd.append('banner_file3', this.files3);
        }

        if (!this.files4) {
          fd.append('banner_file4', this.files4);
          fd.append('banner_4', this.files4);
        } else {
          fd.append('banner_file4', this.files4);
        }
  
        this.PayLaterTemplateFinancingService.create(fd).subscribe(res => {
          this.dataService.showLoading(false);
          this.dialogService.openSnackBar({
            message: this.ls.locale.notification.popup_notifikasi.text22
          });
          this.router.navigate(['paylater', 'template_financing'], {queryParams:{type: this.dataType}});
        })
      } else {
        this.dialogService.openSnackBar({
          message: "Gambar harus diisi minimal 1!"
        });
  
        commonFormValidator.validateAllFields(this.formTemplate);
      }
    } else {
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      });

      commonFormValidator.validateAllFields(this.formTemplate);
    }
  }

}
