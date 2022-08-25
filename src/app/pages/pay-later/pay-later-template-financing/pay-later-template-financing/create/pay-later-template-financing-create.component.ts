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
  public optionsGeneral: Object = Config.FROALA_CONFIG;
  public options: Object = Config.FROALA_CUSTOM_HEIGHT_PLACEHOLDER_CONFIG(100, "Penjelasan");
  public optionsFaq: Object = Config.FROALA_CUSTOM_HEIGHT_PLACEHOLDER_CONFIG(100, "Jawaban");

  image_list: Array<any> = [];
  imageSku: any;
  files: File;
  fileList: Array<File> = [];
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
    this.formTemplate = this.formBuilder.group({
      information: ["", Validators.required],
      reason: this.formBuilder.array([this.createReasonFormArray()]),
      use: this.formBuilder.array([this.createUseFormArray()]),
      faq: this.formBuilder.array([this.createFaqFormArray()]),
      tips: this.formBuilder.array([this.createTipsFormArray()]),
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

  deleteReason(idx) {
    this.indexDelete = idx;
    let reason = this.formTemplate.controls['reason'] as FormArray;
    reason.removeAt(this.indexDelete);
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

  deleteUse(idx) {
    this.indexDelete = idx;
    let use = this.formTemplate.controls['use'] as FormArray;
    use.removeAt(this.indexDelete);
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

  deleteFaq(idx) {
    this.indexDelete = idx;
    let faq = this.formTemplate.controls['faq'] as FormArray;
    faq.removeAt(this.indexDelete);
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

  deleteTips(idx) {
    this.indexDelete = idx;
    let tips = this.formTemplate.controls['tips'] as FormArray;
    tips.removeAt(this.indexDelete);
  }

  changeImage(evt) {
    if (this.fileList && this.fileList.length >= 4) {
      this.dialogService.openSnackBar({
        message: "Gambar Banner maksimum 4"
      });
      evt = null;
      return;
    }
    this.readThis(evt);
  }

  readThis(inputValue: any): void {
    var file: File = inputValue;
    if (file.size > 2000000) {
      this.dialogService.openSnackBar({
        message: "File melebihi maksimum 2mb!"
      });
      return;
    }

    this.fileList = [
      ...this.fileList,
      file
    ]
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.image_list = [...this.image_list, myReader.result];
    }

    myReader.readAsDataURL(file);
  }

  removeImage(idx) {
    this.image_list.splice(idx, 1);
    this.fileList.splice(idx, 1);
  }

  //PRODUCT CATALOGUE CREATE FUNCTION

  submit() {
    if (this.formTemplate.valid && this.image_list.length > 0) {
      this.dataService.showLoading(true);
      let fd = new FormData();
      fd.append('name', this.formTemplate.get('name').value);
      fd.append('informasi_general', this.formTemplate.get('information').value);
      fd.append('alasan_bergabung', this.formTemplate.get('reason').value);
      fd.append('cara_penggunaan', this.formTemplate.get('use').value);
      fd.append('faq', this.formTemplate.get('faq').value);
      fd.append('tips_trick', this.formTemplate.get('tips').value);
      fd.append('paylater_company_type_id', '0');
      this.fileList.map(imgr => {
        fd.append('banner_file[]', imgr);
      });

      this.PayLaterTemplateFinancingService.create(fd).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: this.ls.locale.notification.popup_notifikasi.text22
        });
        this.router.navigate(['paylater', 'template']);
      })
    } else {
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      });

      commonFormValidator.validateAllFields(this.formTemplate);
    }
  }

}
