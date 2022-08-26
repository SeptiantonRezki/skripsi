import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { PayLaterTemplateFinancingService } from 'app/services/pay-later/pay-later-template-financing.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { LanguagesService } from 'app/services/languages/languages.service';
import { Config } from 'app/classes/config';
import { environment, serviceServer, server } from '../../../../../../environments/environment';
@Component({
  selector: 'app-pay-later-template-financing-edit',
  templateUrl: './pay-later-template-financing-edit.component.html',
  styleUrls: ['./pay-later-template-financing-edit.component.scss']
})
export class PayLaterTemplateFinancingEditComponent implements OnInit {
  formTemplate: FormGroup;
  arr: FormArray;
  indexDelete: any;
  public optionsGeneral: Object = Config.FROALA_CONFIG;
  public options: Object = Config.FROALA_CUSTOM_HEIGHT_PLACEHOLDER_CONFIG(100, "Penjelasan");
  public optionsFaq: Object = Config.FROALA_CUSTOM_HEIGHT_PLACEHOLDER_CONFIG(100, "Jawaban");
  AYO_API_SERVICE = serviceServer;
  SERVER = server

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

  shortDetail: any;
  detailTemplate: any;
  dataType: any;

  constructor(
    private router: Router,
    private dataService: DataService,
    private dialogService: DialogService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private PayLaterTemplateFinancingService: PayLaterTemplateFinancingService,
    private ls: LanguagesService
  ) { 
    this.shortDetail = this.dataService.getFromStorage('detail_paylater_template');
  }

  ngOnInit() {
    this.dataType = this.router.routerState.root.queryParams['value'].type;

    this.formTemplate = this.formBuilder.group({
      name: ["", Validators.required],
      information: ["", Validators.required],
      reason: this.formBuilder.array([], Validators.required),
      use: this.formBuilder.array([], Validators.required),
      faq: this.formBuilder.array([], Validators.required),
      tips: this.formBuilder.array([], Validators.required),
      banner_1: [],
      banner_2: [],
      banner_3: [],
      banner_4: [],
    });

    this.getDetail();
  }

  getDetail() {
    this.dataService.showLoading(true);
    this.PayLaterTemplateFinancingService.show({ id: this.shortDetail.id }).subscribe(res => {
      this.detailTemplate = res.data;
      let reasonData = JSON.parse(res.data.alasan_bergabung),
          useData = JSON.parse(res.data.cara_penggunaan),
          faqData = JSON.parse(res.data.faq),
          tipsData = JSON.parse(res.data.tips_trick);

      let arrayReason = [
        {
          "reason_title": "Judul Alasan 1", 
          "reason_body": "Penjelasan Alasan 1"
        },
        {
          "reason_title": "Judul Alasan 2", 
          "reason_body": "Penjelasan Alasan 2"
        },
        {
          "reason_title": "Judul Alasan 3", 
          "reason_body": "Penjelasan Alasan 3"
        }
      ]
      
      let arrayUse = [
        {
          "use_title": "Judul Langkah 1", 
          "use_body": "Penjelasan Langkah 1"
        },
        {
          "use_title": "Judul Langkah 2", 
          "use_body": "Penjelasan Langkah 2"
        },
        {
          "use_title": "Judul Langkah 3", 
          "use_body": "Penjelasan Langkah 3"
        }
      ]

      let arrayFaq = [
        {
          "question": "Pertanyaan 1", 
          "answer": "Jawaban 1"
        },
        {
          "question": "Pertanyaan 2", 
          "answer": "Jawaban 2"
        },
        {
          "question": "Pertanyaan 3", 
          "answer": "Jawaban 3"
        }
      ]

      let arrayTips = [
        {
          "tips_title": "Judul Tips 1", 
          "tips_body": "Penjelasan Tips 1"
        },
        {
          "tips_title": "Judul Tips 2", 
          "tips_body": "Penjelasan Tips 2"
        },
        {
          "tips_title": "Judul Tips 3", 
          "tips_body": "Penjelasan Tips 3"
        }
      ]

      this.formTemplate.get("name").setValue(res.data.name);
      this.formTemplate.get("information").setValue(res.data.informasi_general);
      this.formTemplate.get("banner_1").setValue(res.data.banner_1 ? ["undefined", "null"].indexOf(res.data.banner_1) === -1 ? res.data.banner_1 : [] : []);
      this.formTemplate.get("banner_2").setValue(res.data.banner_2 ? ["undefined", "null"].indexOf(res.data.banner_2) === -1 ? res.data.banner_2 : [] : []);
      this.formTemplate.get("banner_3").setValue(res.data.banner_3 ? ["undefined", "null"].indexOf(res.data.banner_3) === -1 ? res.data.banner_3 : [] : []);
      this.formTemplate.get("banner_4").setValue(res.data.banner_4 ? ["undefined", "null"].indexOf(res.data.banner_4) === -1 ? res.data.banner_4 : [] : []);

      let reason = this.formTemplate.get("reason") as FormArray;
      reasonData.map((item, idx) => {
        reason.push(this.formBuilder.group({
          reason_title: item.reason_title,
          reason_body: item.reason_body
        }));
      });

      let use = this.formTemplate.get("use") as FormArray;
      useData.map((item, idx) => {
        use.push(this.formBuilder.group({
          use_title: item.use_title,
          use_body: item.use_body
        }));
      });

      let faq = this.formTemplate.get("faq") as FormArray;
      faqData.map((item, idx) => {
        faq.push(this.formBuilder.group({
          question: item.question,
          answer: item.answer
        }));
      });

      let tips = this.formTemplate.get("tips") as FormArray;
      tipsData.map((item, idx) => {
        tips.push(this.formBuilder.group({
          tips_title: item.tips_title,
          tips_body: item.tips_body
        }));
      });

      this.files = res.data.banner_1 ? ["undefined", "null"].indexOf(res.data.banner_1) === -1 ? res.data.banner_1 : undefined : undefined
      this.files2 = res.data.banner_2 ? ["undefined", "null"].indexOf(res.data.banner_2) === -1 ? res.data.banner_2 : undefined : undefined
      this.files3 = res.data.banner_3 ? ["undefined", "null"].indexOf(res.data.banner_3) === -1 ? res.data.banner_3 : undefined : undefined
      this.files4 = res.data.banner_4 ? ["undefined", "null"].indexOf(res.data.banner_4) === -1 ? res.data.banner_4 : undefined : undefined

      this.imageUrl = res.data.banner_1 ? ["undefined", "null"].indexOf(res.data.banner_1) === -1 ? res.data.banner_1 : undefined : undefined
      this.imageUrl2 = res.data.banner_2 ? ["undefined", "null"].indexOf(res.data.banner_2) === -1 ? res.data.banner_2 : undefined : undefined
      this.imageUrl3 = res.data.banner_3 ? ["undefined", "null"].indexOf(res.data.banner_3) === -1 ? res.data.banner_3 : undefined : undefined
      this.imageUrl4 = res.data.banner_4 ? ["undefined", "null"].indexOf(res.data.banner_4) === -1 ? res.data.banner_4 : undefined : undefined

      this.dataService.showLoading(false);
    }, err => {
      this.dataService.showLoading(false);
    })
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
        if (this.files && this.files.name && (typeof this.files !== 'string')) {
          this.files = new File([this.files], this.files.name.split(" ").join("_"), {type: this.files.type});
        }
        if (this.files2 && this.files2.name && (typeof this.files2 !== 'string')) {
          this.files2 = new File([this.files2], this.files2.name.split(" ").join("_"), {type: this.files2.type});
        }
        if (this.files3 && this.files3.name && (typeof this.files3 !== 'string')) {
          this.files3 = new File([this.files3], this.files3.name.split(" ").join("_"), {type: this.files3.type});
        }
        if (this.files4 && this.files4.name && (typeof this.files4 !== 'string')) {
          this.files4 = new File([this.files4], this.files4.name.split(" ").join("_"), {type: this.files4.type});
        }

        let fd = new FormData();
        fd.append('id', this.detailTemplate.id);
        fd.append('name', this.formTemplate.get('name').value);
        fd.append('informasi_general', this.formTemplate.get('information').value);
        fd.append('alasan_bergabung', JSON.stringify(this.formTemplate.get('reason').value));
        fd.append('cara_penggunaan', JSON.stringify(this.formTemplate.get('use').value));
        fd.append('faq', JSON.stringify(this.formTemplate.get('faq').value));
        fd.append('tips_trick', JSON.stringify(this.formTemplate.get('tips').value));
         // fd.append('paylater_company_type_id', this.dataType === "invoice-financing" ? "1" : this.dataType === "retailer-financing" ? "2" : this.dataType === "kur" ? "3" : "");
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

        this.PayLaterTemplateFinancingService.update(fd).subscribe(res => {
          this.dataService.showLoading(false);
          this.dialogService.openSnackBar({
            message: this.ls.locale.notification.popup_notifikasi.text22
          });
          this.router.navigate(['paylater', 'template'], {queryParams:{type: this.dataType}});
        }, err => {
          this.dataService.showLoading(false);
        })
      } else {
          this.dataService.showLoading(false);
          commonFormValidator.validateAllFields(this.formTemplate);
          this.dialogService.openSnackBar({
            message: "Gambar harus diisi minimal 1!"
          })
      }
    } else {
      this.dataService.showLoading(false);
      commonFormValidator.validateAllFields(this.formTemplate);
      this.dialogService.openSnackBar({
        message: "Silahkan lengkapi pengisian data!"
      })
    }
  }

}
