import { Component, ViewChild, HostListener } from "@angular/core";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from "@angular/forms";
import { commonFormValidator } from "../../../../classes/commonFormValidator";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { UploadImageComponent } from "../dialog/upload-image/upload-image.component";
import { DialogService } from "../../../../services/dialog.service";
import { Router } from "@angular/router";
import { TemplateTaskService } from "../../../../services/dte/template-task.service";
import { DataService } from "../../../../services/data.service";
import * as _ from 'underscore';
import { Observable, Subject, ReplaySubject } from "rxjs";
import { ProductService } from "app/services/sku-management/product.service";
import { startWith, map } from "rxjs/operators";
import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
import { PengaturanAttributeMisiService } from 'app/services/dte/pengaturan-attribute-misi.service';
import { takeUntil } from 'rxjs/operators';
import { Page } from "app/classes/laravel-pagination";
import { Config } from 'app/classes/config';
import { Lightbox } from 'ngx-lightbox';
import { LanguagesService } from "app/services/languages/languages.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-template-create",
  templateUrl: "./template-create.component.html",
  styleUrls: ["./template-create.component.scss"]
})
export class TemplateCreateComponent {
  templateTaskForm: FormGroup;
  templateTaskFormError: any;
  dialogRef: any;
  frmIsBranching: FormControl = new FormControl(false);
  listCategoryResponse: any[] = [
    { value: false, name: this.translate.instant('dte.template_tugas.non_task_base_response') },
    { value: true, name: this.translate.instant('dte.template_tugas.task_base_response') }
  ];
  listIRType: any[] = [
    { value: 'full-ir', name: this.translate.instant('dte.template_tugas.full_ir') },
    { value: 'ir-for-comply', name: this.translate.instant('dte.template_tugas.ir_comply') },
    { value: 'ir-for-not-comply', name: this.translate.instant('dte.template_tugas.ir_not_comply') },
    { value: 'ir-for-checking-only', name: this.translate.instant('dte.template_tugas.ir_checking_only') },
  ];
  listBlockerSubmission: any[] = [
    { value: 'soft', name: 'Soft' },
    { value: 'med', name: 'Medium' },
    { value: 'hard', name: 'Hard' },
  ];
  isIRTypeError: boolean = false;
  // listKategoriToolbox: any[] = [{ value: '1', name: 'Toolbox 1' }, { value: '2', name: 'Toolbox 2' }];
  // listTipeMisi: any[] = [{ value: '1', name: 'Tipe Misi 1' }, { value: '2', name: 'Tipe Misi 2' }];

  listKategoriToolbox: any[];
  listTipeMisi: any[];
  listTingkatinternalMisi: any[];
  listKategoriMisi: any[];
  listProjectMisi: any[];
  listReason: any[];
  private _onDestroy = new Subject<void>();
  public filterLKT: FormControl = new FormControl();
  public filteredLKT: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterLTM: FormControl = new FormControl();
  public filteredLTM: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterLTKM: FormControl = new FormControl();
  public filteredLTKM: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterLKM: FormControl = new FormControl();
  public filteredLKM: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterProject: FormControl = new FormControl();
  public filteredProject: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filterReason: FormControl = new FormControl();
  public filteredReason: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public options: Object = Config.FROALA_CONFIG;

  listChoose: Array<any> = [
  ];

  listChooseOriginal: Array<any> = [
    { name: this.translate.instant('dte.template_tugas.short_answer'), value: "text", icon: "short_text" },
    { name: this.translate.instant('dte.template_tugas.paragraph'), value: "textarea", icon: "notes" },
    { name: this.translate.instant('dte.template_tugas.multiple_choice'), value: "radio", icon: "radio_button_checked" },
    { name: this.translate.instant('dte.template_tugas.multiple_choice_and_number'), value: "radio_numeric", icon: "check_box" },
    { name: this.translate.instant('dte.template_tugas.multiple_choice_and_short_answer'), value: "radio_text", icon: "cloud_upload" },
    { name: this.translate.instant('dte.template_tugas.multiple_choice_and_paragraph'), value: "radio_textarea", icon: "dialpad" },
    { name: this.translate.instant('dte.template_tugas.check_box'), value: "checkbox", icon: "check_box" },
    { name: this.translate.instant('global.label.upload_image'), value: "image", icon: "cloud_upload" },
    { name: this.translate.instant('dte.template_tugas.number'), value: "numeric", icon: "dialpad" },
    { name: this.translate.instant('dte.template_tugas.select_date'), value: "date", icon: "date_range" },
    { name: this.translate.instant('dte.template_tugas.stock_check'), value: "stock_check", icon: "insert_chart" },
  ];

  listChooseWithIr: Array<any> = [
    { name: this.translate.instant('dte.template_tugas.short_answer'), value: "text", icon: "short_text" },
    { name: this.translate.instant('dte.template_tugas.paragraph'), value: "textarea", icon: "notes" },
    { name: this.translate.instant('dte.template_tugas.multiple_choice'), value: "radio", icon: "radio_button_checked" },
    { name: this.translate.instant('dte.template_tugas.multiple_choice_and_number'), value: "radio_numeric", icon: "check_box" },
    { name: this.translate.instant('dte.template_tugas.multiple_choice_and_short_answer'), value: "radio_text", icon: "cloud_upload" },
    { name: this.translate.instant('dte.template_tugas.multiple_choice_and_paragraph'), value: "radio_textarea", icon: "dialpad" },
    { name: this.translate.instant('dte.template_tugas.check_box'), value: "checkbox", icon: "check_box" },
    { name: this.translate.instant('global.label.upload_image'), value: "image", icon: "cloud_upload" },
    { name: this.translate.instant('dte.template_tugas.number'), value: "numeric", icon: "dialpad" },
    { name: this.translate.instant('dte.template_tugas.select_date'), value: "date", icon: "date_range" },
    { name: this.translate.instant('dte.template_tugas.stock_check'), value: "stock_check", icon: "insert_chart" },
    { name: this.translate.instant('dte.template_tugas.stock_check_ir'), value: "stock_check_ir", icon: "check_box" },
    { name: this.translate.instant('dte.template_tugas.planogram_ir'), value: "planogram_ir", icon: "cloud_upload" },
  ];

  listChooseQuiz: Array<any> = [
    { name: this.translate.instant('dte.template_tugas.multiple_choice'), value: "radio", icon: "radio_button_checked" },
    { name: this.translate.instant('dte.template_tugas.check_box'), value: "checkbox", icon: "check_box" },
  ]

  shareable: FormControl = new FormControl(false);
  isIRTemplate: FormControl = new FormControl(false);
  isBackgroundMisi: FormControl = new FormControl(false);

  @ViewChild("autosize")
  autosize: CdkTextareaAutosize;

  saveData: Boolean;
  valueChange: Boolean;
  validComboDrag: boolean;
  validComboDragQuestionChild: boolean;
  duplicateTask: any;
  product: FormControl = new FormControl("");
  listProductSkuBank: Array<any> = [];
  filteredSkuOptions: Observable<string[]>;
  keyUp = new Subject<string>();
  stockOptionCtrl: FormControl = new FormControl();
  stockOptions = ["Ada", "Tidak Ada"];
  directBelanja: Boolean;
  listDirectBelanja: any = {};
  listProductSelected: any = {};
  allQuestionList: any[] = [];
  questionHasNext: any = {};
  childQuestions: any = {};
  filteredNext: any[] = [];
  pagination: Page = new Page();
  files: File;
  filesQuestion: File;
  filesQuestionChild: File;
  imageContentTypeBase64: any;
  imageContentTypeBase64Child: any;
  imageContentTypeBase64Question: any;
  imageContentTypeBase64QuestionChild: any;
  isDetailBanner: Boolean = false;
  isDetailBannerPertanyaan: Boolean = false;
  imageContentTypeDefault: File;
  listLandingPage: any[] = [];
  changeImageDetailQuestion: Boolean = false;
  changeImageDetailQuestionChild: Boolean = false;

  videoMaster: any = null;
  questionVideo: any[] = [];
  templateList: any[] = [];
  templateListImageIR: any[] = [];
  listContentType: any[] = [
    { name: this.translate.instant('global.label.static_page'), value: "static_page" },
    { name: this.translate.instant('global.label.landing_page'), value: "landing_page" },
    { name: this.translate.instant('global.label.iframe'), value: "iframe" },
    { name: this.translate.instant('global.label.image'), value: "image" },
    { name: this.translate.instant('global.label.unlinked'), value: "unlinked" }
  ];
  listContentTypeQuestionChild: any[] = [
    { name: this.translate.instant('global.label.static_page'), value: "static_page" },
    { name: this.translate.instant('global.label.landing_page'), value: "landing_page" },
    { name: this.translate.instant('global.label.iframe'), value: "iframe" },
    { name: this.translate.instant('global.label.image'), value: "image" },
    { name: this.translate.instant('global.label.unlinked'), value: "unlinked" }
  ];

  freeTextPossibilities: any[] = [];
  frmQuiz: FormControl = new FormControl('non-quiz');
  listQuiz: any[] = [
    { name: this.translate.instant('dte.template_tugas.text14'), value: "non-quiz" },
    { name: this.translate.instant('dte.template_tugas.text13'), value: "quiz" },
  ]

  listAnswerKeys: any[] = [];
  
  pageName = this.translate.instant('dte.template_tugas.text1');
  titleParam = { entity: this.pageName };
  questionParam = this.translate.instant('dte.template_tugas.text10');


  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.valueChange && !this.saveData || this.duplicateTask && !this.saveData) {
      return false;
    }

    return true;
  }

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private dialogService: DialogService,
    private _lightbox: Lightbox,
    private taskTemplateService: TemplateTaskService,
    private dataService: DataService,
    private productService: ProductService,
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService,
    private ls: LanguagesService,
    private translate: TranslateService,
  ) {
    this.duplicateTask = this.dataService.getFromStorage('duplicate_template_task');

    this.listLandingPage = [
      { name: this.translate.instant('iklan_dalam_aplikasi.spanduk_online.shopping'), value: "belanja" },
      { name: this.translate.instant('global.label..mission'), value: "misi" },
      { name: this.translate.instant('global.label.customer'), value: "pelanggan" },
      { name: this.translate.instant('bantuan.text1'), value: "bantuan" },
      { name: this.translate.instant('global.label.my_profile'), value: "profil_saya" },
      { name: this.translate.instant('global.label.promotion'), value: "promosi" },
      { name: this.translate.instant('global.label.capital_corner'), value: "pojok_modal" },
      { name: this.translate.instant('global.label.src_catalog'), value: "katalog_src" }
    ];
    this.saveData = false;
    this.templateTaskFormError = {
      name: {},
      description: {},
      image: {}
    };
  }

  ngOnInit() {
    this.getListKategoriToolbox();
    this.getListTipeMisi();
    this.getListTingkatInternalMisi();
    this.getListKategoriMisi();
    this.getListKategoriProject();
    this.getListReason();

    this.frmQuiz.valueChanges.subscribe(res => {
      if (res && res === 'quiz') {
        this.frmIsBranching.setValue(false);
        this.listChoose = this.listChooseQuiz.slice();
      } else {
        this.listChoose = this.listChooseOriginal.slice();
      }
    })

    this.frmIsBranching.valueChanges.subscribe(res => {
      if (res && res === true) {
        this.frmQuiz.setValue('non-quiz');
      }
    })

    this.filterLKT.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringLKT();
      });

    this.filterLTM.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringLTM();
      });

    this.filterLTKM.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringLTKM();
      });

    this.filterLKM.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringLKM();
      });
    this.filterProject.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filteringProject();
    });
    this.filterReason.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filteringReason();
    });

    this.listChoose = this.listChooseOriginal.slice();
    this.keyUp.debounceTime(300)
      .flatMap(key => {
        return Observable.of(key).delay(300);
      })
      .subscribe(res => {
        this.getListProduct(res);
        this.resetField(res);
      });
    this.templateTaskForm = this.formBuilder.group({
      name: ["", Validators.required],
      other_name: [""],
      description: ["", Validators.required],
      kategori_toolbox: ["", Validators.required],
      tipe_misi: ["", Validators.required],
      tingkat_internal_misi: ["", Validators.required],
      kategori_misi: ["", Validators.required],
      project_misi: ["", Validators.required],
      image: [""],
      background_image: [""],
      background_font_color: [""],
      video: [""],
      material: false,
      material_description: ["", Validators.required],
      questions: this.formBuilder.array([], Validators.required),
      image_description: this.formBuilder.array([this.formBuilder.group({
        content_type: '',
        landing_page: '',
        body: '',
        title: '',
        url_iframe: '',
        imageDetailBanner: ''
      })]),
      rejected_reason_choices: this.formBuilder.array([this.createRejectedReson()], Validators.required),
      ir_type: [""],
    });

    this.templateTaskForm.valueChanges.subscribe(res => {
      commonFormValidator.parseFormChanged(this.templateTaskForm, this.templateTaskFormError);
    })

    this.templateTaskForm.get('material_description').disable();

    if (this.duplicateTask) this.setValue();

    this.templateTaskForm.valueChanges.subscribe(res => {
      this.valueChange = true;
    })
  }

  selectForm(form?: any){
    if (form) {
      if (form === 'tipeQuestion') {
        const listID = ['JawabanSingkat','QuestionParagraf','QuestionPilGan','QuestionPilGanAngka','QuestionPilGanJwbnSingkat','QuestionPilGanParagraf','QuestionCheckbox','QuestionUploadImage','QuestionAngka','QuestionSelectDate','QuestionStockCheck'];

        let matOption = document.querySelectorAll('mat-option');
        if (matOption) {
          for (let index = 0; index < matOption.length; index++) {
            matOption[index].id = 'tipe'+listID[index];
          }
        }
      }
      else {    // untuk option yang ada search
        const selectSearch = document.getElementById('select-search-'+form);
        let inputTag = selectSearch.querySelectorAll('input');
        for (let index = 0; index < inputTag.length; index++) {
          inputTag[index].id = "search-"+form;
        }
        
        let matOption = selectSearch.parentElement.querySelectorAll('mat-option');
        if (matOption) {
          for (let index = 0; index < matOption.length; index++) {
            matOption[index].id = 'options';
          }
        }
      }      
    } else {    // untuk option saja
      const matOption = document.querySelectorAll('mat-option');
      for (let index = 0; index < matOption.length; index++) {
        matOption[index].id = "options";
      }
    }
  }

  filteringLKT() {
    if (!this.listKategoriToolbox) {
      return;
    }
    // get the search keyword
    let search = this.filterLKT.value;
    if (!search) {
      this.filteredLKT.next(this.listKategoriToolbox.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredLKT.next(
      this.listKategoriToolbox.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getListKategoriToolbox() {
    this.pagination.per_page = 99999999;
    this.pagination.status = 'active';
    this.pengaturanAttributeMisiService.getToolbox(this.pagination).subscribe(
      (res) => {
        // console.log("res trade listKategoriToolbox", res);
        this.listKategoriToolbox = res.data.data;
        this.filteredLKT.next(this.listKategoriToolbox.slice());
        // this.listKategoriToolbox = res.data;
      },
      (err) => {
        console.log("err List Kategori Toolbox", err);
      }
    );
  }

  filteringLTM() {
    if (!this.listTipeMisi) {
      return;
    }
    // get the search keyword
    let search = this.filterLTM.value;
    if (!search) {
      this.filteredLTM.next(this.listTipeMisi.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredLTM.next(
      this.listTipeMisi.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getListTipeMisi() {
    this.pagination.per_page = 99999999;
    this.pagination.status = 'active';
    this.pengaturanAttributeMisiService.getTipeMisi(this.pagination).subscribe(
      (res) => {
        // console.log("res trade List Tipe Misi", res);
        this.listTipeMisi = res.data.data;
        this.filteredLTM.next(this.listTipeMisi.slice());
        // this.listTipeMisi = res.data;
      },
      (err) => {
        console.log("err List Tipe Misi", err);
      }
    );
  }

  filteringLTKM() {
    if (!this.listTingkatinternalMisi) {
      return;
    }
    // get the search keyword
    let search = this.filterLTKM.value;
    if (!search) {
      this.filteredLTKM.next(this.listTingkatinternalMisi.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredLTKM.next(
      this.listTingkatinternalMisi.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getListTingkatInternalMisi() {
    this.pagination.per_page = 99999999;
    this.pagination.status = 'active';
    this.pengaturanAttributeMisiService.getInternalMisi(this.pagination).subscribe(
      (res) => {
        this.listTingkatinternalMisi = res.data.data;
        this.filteredLTKM.next(this.listTingkatinternalMisi.slice());
      },
      (err) => {
      }
    );
  }
  contentType(value) {
    if (this.imageContentTypeBase64 && this.imageContentTypeDefault) {
      this.imageContentTypeDefault = undefined;
      this.imageContentTypeBase64 = undefined;
    }
  }
  imagesContentType(image, i) {
    var file: File = image;
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.imageContentTypeBase64Child = myReader.result;
      let image_description = this.templateTaskForm.get('image_description') as FormArray;
      image_description.at(i).get('imageDetailBanner').setValue(this.imageContentTypeBase64Child);
    };

    myReader.readAsDataURL(file);
  }

  imagesContentTypeQuestionChild(image, index) {
    console.log('index', index);
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let question_image_description = questions.at(index).get('question_image_description').value as FormArray;
    question_image_description[0].changeImageDetailQuestionChild = true;
    // console.log('question_image_description', question_image_description);
    var file: File = image;
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      // this.imageContentTypeBase64QuestionChild = myReader.result;
      question_image_description[0].question_image_detail_photo = myReader.result;
    };
    // console.log('change', question_image_description.get('changeImageDetailQuestionChild'));
    // console.log('change', question_image_description.at(index).get('question_image_detail_photo'));
    myReader.readAsDataURL(file);
  }
  deleteImg() {
    this.imageContentTypeDefault = undefined;
    this.imageContentTypeDefault = null;
  }
  removeImage(): void {
    this.files = undefined;
  }
  removeImageQuestion(): void {
    this.filesQuestion = undefined;
  }
  removeImageQuestionChild(): void {
    this.filesQuestionChild = undefined;
  }

  filteringLKM() {
    if (!this.listKategoriMisi) {
      return;
    }
    // get the search keyword
    let search = this.filterLKM.value;
    if (!search) {
      this.filteredLKM.next(this.listKategoriMisi.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredLKM.next(
      this.listKategoriMisi.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getListKategoriMisi() {
    this.pagination.per_page = 99999999;
    this.pagination.status = 'active';
    this.pengaturanAttributeMisiService.getKategoriMisi(this.pagination).subscribe(
      (res) => {
        // console.log("res Kategori Misi", res);
        this.listKategoriMisi = res.data.data;
        this.filteredLKM.next(this.listKategoriMisi.slice());
        // this.listKategoriMisi = res.data;
      },
      (err) => {
        console.log("err List Kategori Misi", err);
      }
    );
  }

  filteringProject() {
    if (!this.listProjectMisi) {
      return;
    }
    // get the search keyword
    let search = this.filterProject.value;
    if (!search) {
      this.filteredProject.next(this.listProjectMisi.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredProject.next(
      this.listProjectMisi.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getListKategoriProject() {
    this.pagination.per_page = 99999999;
    this.pagination.status = 'active';
    this.pengaturanAttributeMisiService.getProject(this.pagination).subscribe(
      (res) => {
        // console.log("res Kategori Misi", res);
        this.listProjectMisi = res.data.data;
        this.filteredProject.next(this.listProjectMisi.slice());
        // this.listKategoriMisi = res.data;
      },
      (err) => {
        console.log("err List Kategori Misi", err);
      }
    );
  }

  filteringReason() {
    if (!this.listReason) {
      return;
    }
    // get the search keyword
    let search = this.filterReason.value;
    if (!search) {
      this.filteredReason.next(this.listReason.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredReason.next(
      this.listReason.filter(item => item.name.toLowerCase().indexOf(search) > -1)
    );
  }

  getListReason() {
    this.pagination.per_page = 99999999;
    this.pagination.status = 'active';
    this.pengaturanAttributeMisiService.getVerificationRemark(this.pagination).subscribe(
      (res) => {
        this.listReason = res.data;
        this.filteredReason.next(this.listReason.slice());
      },
      (err) => {
        console.log("err List Alasan", err);
      }
    );
  }


  splitCheckList(template) {
    console.log('template', template);
  }

  _filterSku(value): any[] {
    const filterValue = typeof value == "object" ? value.name.toLowerCase() : value.toLowerCase();
    return this.listProductSkuBank.filter(item => item.name.toLowerCase().includes(filterValue));
  }

  resetField(data?: any): void {
    const filteredItem = this.listProductSkuBank.filter(item => item.name.toLowerCase() === data.toLowerCase());

    if (filteredItem.length == 0) {
      // this.product = undefined;
    }
  }

  getListProduct(param?): void {
    console.log(param);
    if (param.length >= 3) {
      this.productService.getProductSkuBank(param).subscribe(res => {
        this.listProductSkuBank = res.data ? res.data.data : [];
        this.filteredSkuOptions = this.product.valueChanges.pipe(startWith(""), map(value => this._filterSku(value)));
      })
    } else {
      this.listProductSkuBank = [];
      this.filteredSkuOptions = this.product.valueChanges.pipe(startWith(""), map(value => this._filterSku(value)));
    }
  }

  getProductObj(event, index) {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    console.log('event', event, index);
    if (event.source.selected) {
      questions.at(index).get('question').setValue(`Apakah Anda Memiliki stok ${event.source.value.name} ?`)
      questions.at(index).get('question_image').setValue(event.source.value.image ? event.source.value.image_url : "");
      questions.at(index).get('question_video').setValue(event.source.value.video ? event.source.value.video_url : "");
      this.listProductSelected[index] = {
        ...this.listProductSelected[index],
        ...event.source.value
      };
    }
  }

  displayProductName(param?): any {
    return param ? param.name : param;
  }

  setValue() {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let rejected = this.templateTaskForm.get('rejected_reason_choices') as FormArray;
    let image_description = this.templateTaskForm.get('image_description') as FormArray;

    this.templateTaskForm.get('kategori_toolbox').setValue(this.duplicateTask.task_toolbox_id);
    this.templateTaskForm.get('tipe_misi').setValue(this.duplicateTask.task_toolbox_type_id);
    this.templateTaskForm.get('tingkat_internal_misi').setValue(this.duplicateTask.task_toolbox_internal_id);
    this.templateTaskForm.get('kategori_misi').setValue(this.duplicateTask.task_toolbox_categories_id);
    this.templateTaskForm.get('project_misi').setValue(this.duplicateTask.task_toolbox_project_id);
    this.templateTaskForm.get('name').setValue(this.duplicateTask.name);
    this.templateTaskForm.get('other_name').setValue(this.duplicateTask.other_name);
    this.templateTaskForm.get('description').setValue(this.duplicateTask.description);
    this.templateTaskForm.get('material').setValue(this.duplicateTask.material === 'yes' ? true : false);
    this.templateTaskForm.get('material_description').setValue(this.duplicateTask['material_description'] ? this.duplicateTask['material_description'] : 'Jenis Material');
    this.templateTaskForm.get('image').setValue(this.duplicateTask.image ? this.duplicateTask.image_url : '');
    this.templateTaskForm.get('video').setValue(this.duplicateTask.video ? this.duplicateTask.video_url : '');
    this.duplicateTask['questions'].map(item => {
      questions.push(this.formBuilder.group({
        id: item.id,
        question: item.question,
        question_image: item['question_image'] ? item['question_image'] : '',
        question_video: item['question_video'] ? item['question_video'] : '',
        type: item.type,
        typeSelection: this.listChoose.filter(val => val.value === item.type)[0],
        image_detail: false,
        encryption: false,
        image_quality_detection: false,
        blocker_submission: ["", Validators.required],
        // required: item.required,
        question_image_description: this.formBuilder.array(item.question_image_description.map(item => {
          return this.formBuilder.group({
            content_typePertanyaan: '',
            title: '',
            body: '',
            landing_page: '',
            url_iframe: '',
            question_image_detail_photo: [''],
            changeImageDetailQuestionChild: false,
          });
        })),
        coin: [0, this.frmQuiz.value === 'quiz' ? Validators.required : null],
        additional: this.formBuilder.array(
          item.additional.map(item => {
            return this.formBuilder.group({ option: item, next_question: '' })
          })
        )
      }))
    });
    this.duplicateTask['image_description'].map(item => {
      image_description.push(this.formBuilder.group({
        content_type: item.content_type,
        title: item.title,
        body: item.body,
        landing_page: item.landing_page,
        url_iframe: item.url_iframe,
        imageDetailBanner: item.imageDetailBanner
      }));
    });
    if (this.duplicateTask.material === 'no')
      this.templateTaskForm.get('material_description').disable();
    else
      this.templateTaskForm.get('material_description').enable();

    this.duplicateTask['rejected_reason_choices'].map(item => {
      return rejected.push(this.formBuilder.group({ reason: item }))
    });
    this.templateTaskForm.get('ir_type').setValue(this.duplicateTask.ir_type);
  }

  addAdditional(idx) {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let additional = questions.at(idx).get('additional') as FormArray;

    let rawAddt = questions.at(idx).get('additional').value;
    let rawType = questions.at(idx).get('type').value;
    let idxOther = rawAddt.findIndex(addt => addt.option && addt.option.includes(this.translate.instant('dte.template_tugas.other_explain')));
    let idxOtherInPossibilities = this.allQuestionList[idx]['possibilities'].findIndex(psb => psb.key.includes(this.translate.instant('dte.template_tugas.other_explain')));
    let tempOption = {
      possibilities: null,
      additional: null
    }
    if (idxOther !== -1) {
      if (idxOtherInPossibilities !== -1) {
        tempOption['possibilities'] = { ...this.allQuestionList[idx]['possibilities'][idxOtherInPossibilities] }
        this.allQuestionList[idx]['possibilities'].splice(idxOtherInPossibilities, 1);
      }
      tempOption['additional'] = { ...additional.at(idxOther).value };
      additional.removeAt(idxOther);
    }


    this.allQuestionList[idx]['possibilities'].push({ key: `Opsi ${additional.length + 1}`, next: '', isBranching: false });
    additional.push(this.formBuilder.group({ option: `Opsi ${additional.length + 1}`, next_question: '' }));

    if (rawType.includes("radio_")) {
      this.allQuestionList[idx]['possibilities'].push({ key: `${this.translate.instant('dte.template_tugas.other_explain')} (${this.checkWordingRadioFreeType(rawType)})`, next: tempOption['possibilities'] ? tempOption['possibilities']['next'] : '', isBranching: tempOption['possibilities'] ? tempOption['possibilities']['isBranching'] : false });
      additional.push(this.formBuilder.group({ option: `${this.translate.instant('dte.template_tugas.other_explain')} (${this.checkWordingRadioFreeType(rawType)})`, next_question: tempOption['additional'] ? tempOption['additional']['next_question'] : '' }))
    }

    // let indexQuestionInKeys = this.listAnswerKeys.findIndex(answ => answ.indexKey === idx);
    // if (idx > -1) {
    //   this.listAnswerKeys[indexQuestionInKeys].push({ indexKey: additional.length, valid: false });
    // }
  }

  defaultValue(event?, type?, text?, questionsIdx?, additionalIdx?) {

    if (type === 'rejected_reason_choices' && event.target.value === "") {
      let rejected_reason = this.templateTaskForm.get(type) as FormArray;
      return rejected_reason.at(questionsIdx).get('reason').setValue(text + (questionsIdx + 1))
    }

    if (questionsIdx !== undefined && additionalIdx === undefined && event.target.value === "") {
      let questions = this.templateTaskForm.get(type) as FormArray;
      return questions.at(questionsIdx).get('question').setValue(text);
    }

    if (questionsIdx !== undefined && additionalIdx !== undefined && event.target.value === "") {
      let questions = this.templateTaskForm.get(type) as FormArray;
      let additional = questions.at(questionsIdx).get('additional') as FormArray;
      additional.at(additionalIdx).get('option').setValue(text + (additionalIdx + 1));
      additional.at(additionalIdx).get('next_question').setValue('');
      return;
      // return additional.at(additionalIdx).get('option').setValue(text + (additionalIdx + 1));
    }

    if (event.target.value === "") {
      this.templateTaskForm.get(type).setValue(text);
    }
  }

  changeValue(key1, key2): void {
    if (this.templateTaskForm.get(key1).value) {
      this.templateTaskForm.get(key2).enable();
    } else {
      this.templateTaskForm.get(key2).disable();
    }
  }

  handleChangeImageDetection(index): void {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    
    if (questions.at(index).get("image_quality_detection").value) {
      questions.at(index).get("blocker_submission").enable();
    } else {
      questions.at(index).get("blocker_submission").setValue("");
      questions.at(index).get("blocker_submission").disable();
    }
  }

  selectedImageIR(selectedIR, template) {
    console.log('selectedIR IR', selectedIR, template);
    let indexExist = this.templateListImageIR.findIndex(tlir => tlir.item_id === template.value.id);
    if (indexExist > -1) {
      this.templateListImageIR[indexExist]['ir_id'] = selectedIR.value.id;
      this.templateListImageIR[indexExist]['ir_code'] = selectedIR.value.code;
      this.templateListImageIR[indexExist]['ir_name'] = selectedIR.value.name;
      this.templateListImageIR[indexExist]['image'] = selectedIR.value.image;
      this.templateListImageIR[indexExist]['check_list'] = selectedIR.value.check_list ? JSON.parse(selectedIR.value.check_list) : [];
    } else {
      this.templateListImageIR.push({ item_id: template.value.id, image: selectedIR.value.image, ir_id: selectedIR.value.id, ir_code: selectedIR.value.code, ir_name: selectedIR.value.name, check_list: JSON.parse(selectedIR.value.check_list) });
    }

    console.log('template image IR', this.templateListImageIR);
  }

  onChangeTemplateIR(event) {
    console.log('the event dude!!!', event);
    if (event.checked) {
      this.listChoose = [...this.listChooseWithIr]
      this.listAnswerKeys = [];
    }
    else {
      this.templateTaskForm.get('ir_type').setValue('');
      this.isIRTypeError = false;

      if (this.frmQuiz.value === 'quiz') {
        this.listChoose = [...this.listChooseQuiz];
      } else {
        this.listChoose = [...this.listChooseOriginal]
      }
    }
  }

  changeType(item, idx?) {
    this.checkIsIRExist();

    if (item.value.type.includes("_ir")) {
      let typeService = item.value.type.includes("planogram") ? "getPlanogramIRTemplates" : "getStockCheckIRTemplates";
      // if (item.value.type.includes("planogram")) { }
      this.taskTemplateService[typeService]().subscribe(results => {
        console.log('result ir', results);
        this.templateList[idx] = results.data.data;
      });
    }

    const questions = this.templateTaskForm.get('questions') as FormArray;
    const type = questions.at(idx).get('type').value;
    const typeSelection = this.listChoose.filter(item => item.value === type)[0];
    let additional = questions.at(idx).get('additional') as FormArray;

    if (additional.length === 0 && this.checkIsRadioType(type) || additional.length === 0 && type == 'checkbox') {
      additional.push(this.createAdditional());
      this.allQuestionList[idx]['possibilities'].push({ key: `Opsi ${additional.length + 1}`, next: '', isBranching: false });
    }

    if (type.includes("radio_")) {
      let rawAddt = questions.at(idx).get('additional').value;
      let idxOther = rawAddt.findIndex(addt => addt.option && addt.option.includes(this.translate.instant('dte.template_tugas.other_explain')));
      let idxOtherInPossibilities = this.allQuestionList[idx]['possibilities'].findIndex(psb => psb.key.includes(this.translate.instant('dte.template_tugas.other_explain')));
      let tempOption = {
        possibilities: null,
        additional: null
      }

      if (idxOther === -1) {
        additional.push(this.formBuilder.group({ option: `${this.translate.instant('dte.template_tugas.other_explain')} (${this.checkWordingRadioFreeType(type)})`, next_question: '' }))
        this.allQuestionList[idx]['possibilities'].push({ key: `${this.translate.instant('dte.template_tugas.other_explain')} (${this.checkWordingRadioFreeType(type)})`, next: '', isBranching: false });
      } else {
        tempOption['additional'] = { ...additional.at(idxOther).value };
        additional.removeAt(idxOther);
        if (idxOtherInPossibilities !== -1) {
          tempOption['possibilities'] = { ...this.allQuestionList[idx]['possibilities'][idxOtherInPossibilities] }
          this.allQuestionList[idx]['possibilities'].splice(idxOtherInPossibilities, 1);
        }
        additional.push(this.formBuilder.group({ option: `${this.translate.instant('dte.template_tugas.other_explain')} (${this.checkWordingRadioFreeType(type)})`, next_question: tempOption['additional'] ? tempOption['additional']['next_question'] : '' }))
        this.allQuestionList[idx]['possibilities'].push({ key: `${this.translate.instant('dte.template_tugas.other_explain')} (${this.checkWordingRadioFreeType(type)})`, next: tempOption['possibilities'] ? tempOption['possibilities']['next'] : '', isBranching: tempOption['possibilities'] ? tempOption['possibilities']['isBranching'] : false });
      }
    } else if (!type.includes("radio_")) {
      let rawAddt = questions.at(idx).get('additional').value;
      let idxOther = rawAddt.findIndex(addt => addt.option && addt.option.includes(this.translate.instant('dte.template_tugas.other_explain')));
      let idxOtherInPossibilities = this.allQuestionList[idx]['possibilities'].findIndex(psb => psb.key.includes(this.translate.instant('dte.template_tugas.other_explain')));
      if (idxOther > -1) additional.removeAt(idxOther);
      if (idxOtherInPossibilities > -1) this.allQuestionList[idx]['possibilities'].splice(idxOtherInPossibilities, 1);
    }

    if (additional.length > 0 && !this.checkIsRadioType(type) && type !== 'checkbox') {
      while (additional.length > 0) {
        additional.removeAt(additional.length - 1);
      }
    }

    questions.at(idx).get('typeSelection').setValue(typeSelection);
    questions.at(idx).get('image_quality_detection').setValue(false);
    this.handleChangeImageDetection(idx)
  }

  checkWordingRadioFreeType(item) {
    switch (item) {
      case "radio_numeric":
        return this.translate.instant('dte.template_tugas.number');
      case "radio_text":
        return this.translate.instant('dte.template_tugas.short_answer');
      case "radio_textarea":
        return this.translate.instant('dte.template_tugas.paragraph');
      default:
        return null;
    }
  }

  checkIsRadioType(item) {
    return item.includes("radio")
  }

  checkIsRadioTypeWasOther(item) {
    return item.option && item.option.includes(this.translate.instant('dte.template_tugas.other_explain'));
  }

  checkWording(selection) {
    return selection.includes("_ir");
  }

  defineQuestion(): FormGroup {
    return this.formBuilder.group({
      id: 1,
      question: this.questionParam,
      type: 'radio',
      content_typePertanyaan: "static_page",
      image_detail: false,
      typeSelection: this.formBuilder.group({ name: this.translate.instant('dte.template_tugas.multiple_choice'), value: "radio", icon: "radio_button_checked" }),
      additional: this.formBuilder.array([this.createAdditional()]),
      question_image_description: this.formBuilder.array([this.formBuilder.group({
        content_typePertanyaan: '',
        title: '',
        body: '',
        landing_page: '',
        url_iframe: '',
        changeImageDetailQuestionChild: false,
        question_image_detail_photo: ['']
      })]),
      question_image: [''],
      question_video: [''],
      encryption: false,
      image_quality_detection: false,
      blocker_submission: ["", Validators.required],
    });
  }

  filteringPossibilitiesQuestion(questionId) {
    let questions = this.templateTaskForm.get('questions') as FormArray;

    return questions.value.filter(val => val.id !== questionId);
  }

  onPossibilitiesChange(questionPossibility, qIdx, additionalIdx) {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let additionalValue = questions.at(qIdx).get('additional').value;
    let hasNextQuestion = additionalValue.find(val => val.next_question !== '');
    let referenceQIdx = { next: this.allQuestionList[qIdx]['possibilities'][additionalIdx]['next'], index: additionalIdx };


    // this.allQuestionList[qIdx]['is_next_question'] = hasNextQuestion ? true : false;

    if (questionPossibility === 'none ') {
      this.allQuestionList[qIdx]['possibilities'][additionalIdx]['next'] = '';
    } else if (questionPossibility == '-99') {
      this.allQuestionList[qIdx]['possibilities'][additionalIdx]['next'] = -99;
    } else {
      this.allQuestionList[qIdx]['possibilities'][additionalIdx]['next'] = questionPossibility.id ? questionPossibility.id : '';
    }

    let hasNext = this.allQuestionList[qIdx]['possibilities'].filter(ps => !!ps.next && ps.next !== "" && ps.next != "-99");
    console.log('hax next onchange', hasNext);
    this.questionHasNext[this.allQuestionList[qIdx].id] = hasNext.length > 0 ? true : false;
    if (referenceQIdx.next) {
      let referenceHasNext = this.allQuestionList[referenceQIdx.next]['possibilities'].filter(ps => !!ps.next && ps.next !== "" && ps.next != "-99");
      this.questionHasNext[referenceQIdx.next] = referenceHasNext.length > 0 ? true : false;
    }

    this.findQuestionsHasNext();
  }

  showNextQuestion(qIdx, addIdx) {
    this.allQuestionList[qIdx]['possibilities'][addIdx]['isBranching'] = !this.allQuestionList[qIdx]['possibilities'][addIdx]['isBranching'];

    if (this.allQuestionList[qIdx]['possibilities'][addIdx]['isBranching'] === false) {
      let referenceQIdx = { next: this.allQuestionList[qIdx]['possibilities'][addIdx]['next'], index: addIdx };
      this.allQuestionList[qIdx]['possibilities'][addIdx]['next'] = "";
      let questions = this.templateTaskForm.get('questions') as FormArray;
      let additionals = questions.at(qIdx).get('additional') as FormArray;
      additionals.at(addIdx).get('next_question').setValue('');
      let hasNext = this.allQuestionList[qIdx]['possibilities'].filter(ps => !!ps.next && ps.next !== "" && ps.next != "-99");
      if (referenceQIdx.next) {
        let referenceHasNext = this.allQuestionList[referenceQIdx.next]['possibilities'].filter(ps => !!ps.next && ps.next !== "" && ps.next != "-99");
        console.log('on show Next Question', referenceHasNext, referenceQIdx, this.allQuestionList[referenceQIdx.index]);
        this.questionHasNext[referenceQIdx.next] = referenceHasNext.length > 0 ? true : false;
      }
      this.questionHasNext[this.allQuestionList[qIdx].id] = hasNext.length > 0 ? true : false;

      this.findQuestionsHasNext();
    }
  }

  findQuestionsHasNext() {
    // let questions = this.templateTaskForm.get('questions').value;
    let allNexts = [];
    this.allQuestionList.map(q => {
      let qData = q.possibilities.filter(qa => (!!qa.next && qa.next !== "" && qa.next != "-99"));
      allNexts = [
        ...allNexts,
        ...qData
      ];
      // console.log('data', qData, q);
      // if (qData.length > 0) {
      //   this.questionHasNext[q.id] = true;
      // } else {
      //   this.questionHasNext[q.id] = false;
      // }
    });
    console.log('all next', allNexts);
    this.filteredNext = [...allNexts];
    let filteredNext = allNexts.map(nxt => nxt.next).filter((elem, index, self) => {
      return index === self.indexOf(elem);
    }).map(elem => {
      this.questionHasNext[elem] = true;
    });
  }
  addQuestion(): void {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let newId = _.max(questions.value, function (item) { return item.id })
    if (newId === -Infinity) newId = { id: 0 }
    this.filesQuestionChild = undefined;

    questions.push(this.formBuilder.group({
      id: newId.id + 1,
      question: this.questionParam,
      type: 'radio',
      typeSelection: this.formBuilder.group({ name: this.translate.instant('dte.template_tugas.multiple_choice'), value: "radio", icon: "radio_button_checked" }),
      content_typePertanyaan: 'static_page',
      image_detail: false,
      additional: this.formBuilder.array([this.createAdditional()]),
      question_image_description: this.formBuilder.array([this.formBuilder.group({
        content_typePertanyaan: '',
        title: '',
        body: '',
        landing_page: '',
        url_iframe: '',
        changeImageDetailQuestionChild: false,
        question_image_detail_photo: ['']
      })]),
      coin: [0, this.frmQuiz.value === 'quiz' ? Validators.required : null],
      question_image: [''],
      question_video: [''],
      encryption: false,
      image_quality_detection: false,
      blocker_submission: ["", Validators.required],
      // others: false,
      // required: false
    }));

    this.allQuestionList.push({
      id: newId.id + 1,
      question: this.questionParam,
      is_next_question: false,
      possibilities: [{ key: 'Opsi 1', next: '', isBranching: false }],
    })
    this.listDirectBelanja[questions.length - 1] = false;
    this.listProductSelected[questions.length - 1] = { product: new FormControl("") };
    this.templateList.push([]);
    this.templateListImageIR.push({ item_id: newId.id + 1 });

    this.handleChangeImageDetection(newId.id);
  }

  addRejectedReason() {
    let rejected_reason = this.templateTaskForm.get('rejected_reason_choices') as FormArray;
    rejected_reason.push(this.formBuilder.group({ reason: ['', Validators.required] }))
  }

  createAdditional(): FormGroup {
    return this.formBuilder.group({ option: 'Opsi 1', next_question: '' })
  }

  createRejectedReson(): FormGroup {
    return this.formBuilder.group({ reason: ['', Validators.required] });
  }

  addOthers(idx): void {
    // this.dataTemplateTask.questions[idx].others = !this.dataTemplateTask.questions[idx].others;
  }

  deleteQuestion(idx): void {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let idQUestion = questions.at(idx).get('id').value;
    if (this.frmIsBranching.value && this.checkIsRadioType(questions.at(idx).get('typeSelection').value['value']) && this.checkHasLinked(idx, idQUestion)) {
      // this.dialogService.openCustomDialog('Tidak Bisa Menghapus Pertanyaan', 'Pertanyaan ini terhubung sebagai Response Pertanyaan lain, Silahkan mengubah Next Question yang bersangkutan.');
      this.dialogService.openSnackBar({
        message: this.translate.instant('dte.template_tugas.delete_question_connected')
      })
      return;
    }
    if (this.listAnswerKeys[idx]) {
      this.listAnswerKeys.splice(idx, 1);
    }
    questions.removeAt(idx);
    this.allQuestionList.splice(idx, 1);
    if (this.listDirectBelanja[idx]) delete this.listDirectBelanja[idx];
    if (this.listProductSelected[idx]) {
      delete this.listProductSelected[idx];
    }
    if (this.templateListImageIR[idx]) this.templateListImageIR.splice(idx, 1);
    if (this.templateList[idx]) this.templateList.splice(idx, 1);
    this.checkIsIRExist();
    this.findQuestionsHasNext();
  }

  checkIsIRExist() {
    let rawValue = this.templateTaskForm.getRawValue();
    console.log('value raw', rawValue);
    let isIR = rawValue['questions'].map(tp => tp.type).find(typ => typ.includes("_ir"));
    // if (isIR) this.isIRTemplate.setValue(true);
    // else this.isIRTemplate.setValue(false);
  }

  checkHasLinked(idx, idQuestion): Boolean {
    let anotherQuestions = [...this.allQuestionList].filter(qs => qs.id !== idQuestion);
    let allPossibilities = [];
    anotherQuestions.map(qs => qs.possibilities.map(ps => {
      allPossibilities = [
        ...allPossibilities,
        ps.next
      ]
    }));
    if (allPossibilities.indexOf(idQuestion) > -1) {
      console.log('ada cuk')
      return true
    }

    return false;
  }

  deleteReason(idx): void {
    let rejected_reason_choices = this.templateTaskForm.get('rejected_reason_choices') as FormArray;
    rejected_reason_choices.removeAt(idx);
  }

  deleteAdditional(idx1?, idx2?, selectionValue?): void {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let additional = questions.at(idx1).get('additional') as FormArray;

    if (this.frmQuiz.value === 'quiz') {
      let isAnswerIsExist = this.listAnswerKeys[idx1].findIndex(key => key === idx2);
      if (isAnswerIsExist > -1) {
        this.listAnswerKeys[idx1].splice(isAnswerIsExist, 1);
        if (selectionValue && selectionValue === 'checkbox') {
          this.listAnswerKeys[idx1] = this.listAnswerKeys[idx1].map(answer => {
            if (answer !== 0 && (answer > idx2)) {
              answer -= 1;
            }
            return answer;
          });
        }
      }
      else {
        if (selectionValue && selectionValue === 'radio') {
          let answerKey = this.listAnswerKeys[idx1] && this.listAnswerKeys[idx1][0] ? this.listAnswerKeys[idx1][0] : null;
          if (answerKey && (answerKey > idx2)) {
            this.listAnswerKeys[idx1] = [answerKey - 1];
          }
        } else if (selectionValue && selectionValue === 'checkbox') {
          this.listAnswerKeys[idx1] = this.listAnswerKeys[idx1].map(answer => {
            if (answer !== 0 && (answer > idx2)) {
              answer -= 1;
            }
            return answer;
          });
        }
      }
    }

    this.allQuestionList[idx1]['possibilities'].splice(idx2, 1);
    additional.removeAt(idx2);
    this.findQuestionsHasNext();
  }
  previewImage() {
    let album = {
      src: this.imageContentTypeBase64Child,
      caption: '',
      thumb: this.imageContentTypeBase64Child
    };

    this._lightbox.open([album], 0);
  }
  previewImageChild(index) {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let question_image_description = questions.at(index).get('question_image_description').value as FormArray;
    let album = {
      src: question_image_description[0].question_image_detail_photo,
      caption: '',
      thumb: question_image_description[0].question_image_detail_photo
    };
    console.log('album', [album]);

    this._lightbox.open([album], 0);
  }
  delay() {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  onChangeDetailBannerQuestion(event, index) {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    if (event.checked) {
      questions.at(index).get('image_detail').setValue(true);
    } else {
      questions.at(index).get('image_detail').setValue(false);
    }
  }
  onChangeDetailBanner(event) {
    if (event.checked) {
      this.isDetailBanner = true;
    } else {
      this.isDetailBanner = false;
    }
    console.log('ini is', this.isDetailBanner);
  }
  
  async submit() {
    if (this.templateTaskForm.valid) {
      this.dataService.showLoading(true);
      // this.saveData = !this.saveData;
      this.saveData = true;
      let questions: any[] = this.templateTaskForm.get('questions').value;
      let rejected_reason: any[] = this.templateTaskForm.get('rejected_reason_choices').value;
      let image_description: any[] = this.templateTaskForm.get('image_description').value;
      let questionsIsEmpty = [];
      let questionVideoList = []
      let body = {
        task_toolbox_id: this.templateTaskForm.get('kategori_toolbox').value,
        task_toolbox_type_id: this.templateTaskForm.get('tipe_misi').value,
        task_toolbox_internal_id: this.templateTaskForm.get('tingkat_internal_misi').value,
        task_toolbox_categories_id: this.templateTaskForm.get('kategori_misi').value,
        task_toolbox_project_id: this.templateTaskForm.get('project_misi').value,
        name: this.templateTaskForm.get('name').value,
        other_name: this.templateTaskForm.get('other_name').value,
        description: this.templateTaskForm.get('description').value,
        material: this.templateTaskForm.get('material').value ? 'yes' : 'no',
        material_description: this.templateTaskForm.get('material').value ? this.templateTaskForm.get('material_description').value : '',
        image: this.templateTaskForm.get('image').value ? this.templateTaskForm.get('image').value : '',
        background_image: this.templateTaskForm.get('background_image').value ? this.templateTaskForm.get('background_image').value : '',
        background_font_color: this.templateTaskForm.get('background_font_color').value ? this.templateTaskForm.get('background_font_color').value : '',
        image_detail: this.isDetailBanner ? 1 : 0,
        video: this.templateTaskForm.get('video').value ? this.templateTaskForm.get('video').value : '',
        is_branching: this.frmIsBranching.value ? 1 : 0,
        is_shareable: this.shareable.value ? 1 : 0,
        is_ir_template: this.isIRTemplate.value ? 1 : 0,
        is_quiz: this.frmQuiz.value === 'quiz' ? 1 : 0,
        image_description: image_description.map((item, index) => {
          if (item.content_type === 'image' && this.isDetailBanner) {
            let tmp = {
              content_type: item.content_type,
              content_image: item.imageDetailBanner
            };
            return tmp;
          } else if (item.content_type === 'landing_page' && this.isDetailBanner) {
            let tmp = {
              content_type: item.content_type,
              landing_page: item.landing_page,
            };
            return tmp;
          } else if (item.content_type === 'static_page' && this.isDetailBanner) {
            let tmp = {
              content_type: item.content_type,
              title: item.title,
              body: item.body,
            };
            return tmp;
          } else if (item.content_type === 'iframe' && this.isDetailBanner) {
            let tmp = {
              content_type: item.content_type,
              url_iframe: item.url_iframe,
            };
            return tmp;
          } else if (item.content_type === 'unlinked' && this.isDetailBanner) {
            let tmp = {
              content_type: item.content_type,
            };
            return tmp;
          }
        }),
        questions: questions.map((item, index) => {
          // if (item.question_image) {
          console.log('fioter', this.filteredNext);
          if (item.type === 'stock_check' && this.listProductSelected[index].sku_id == null || this.listProductSelected[index].sku_id == "") {
            questionsIsEmpty.push({ qId: item.id });
          }
          let isNext = this.filteredNext.find(nxt => nxt.next == item.id);
          let mockup = {
            id: item.id,
            question: item.question,
            type: item.type,
            required: item.type === 'stock_check' ? 1 : null,
            is_child: isNext ? 1 : 0,
            is_next_question: (this.questionHasNext[item.id] === true ? 1 : 0),
            possibilities: (this.frmIsBranching.value && this.checkIsRadioType(item.type)) ? this.allQuestionList[index]['possibilities'].map((pos, idx) => ({
              key: item.additional[idx].option,
              next: this.frmIsBranching ? pos.next === "" ? null : pos.next : null
            })) : [],
            // required: item.required,
            question_image: item.question_image || '',
            question_image_detail: item.image_detail ? 1 : 0,
            encryption: item.encryption ? 1 : 0,
            image_quality_detection: item.image_quality_detection ? 1 : 0,
            blocker_submission: item.blocker_submission || "",
            question_video: item.question_video || '',
            question_image_description: item.question_image_description.map((tmp, index) => {
              if (tmp.content_typePertanyaan === 'image' && item.image_detail) {
                let tmpung = {
                  content_type: tmp.content_typePertanyaan,
                  content_image: tmp.question_image_detail_photo
                };
                return tmpung;
              } else if (tmp.content_typePertanyaan === 'landing_page' && item.image_detail) {
                let tmpung = {
                  content_type: tmp.content_typePertanyaan,
                  landing_page: tmp.landing_page,
                };
                return tmpung;
              } else if (tmp.content_typePertanyaan === 'static_page' && item.image_detail) {
                let tmpung = {
                  content_type: tmp.content_typePertanyaan,
                  title: tmp.title,
                  body: tmp.body,
                };
                return tmpung;
              } else if (tmp.content_typePertanyaan === 'iframe' && item.image_detail) {
                let tmpung = {
                  content_type: tmp.content_typePertanyaan,
                  url_iframe: tmp.url_iframe,
                };
                return tmpung;
              } else if (tmp.content_typePertanyaan === 'unlinked' && item.image_detail) {
                let tmpung = {
                  content_type: tmp.content_typePertanyaan,
                };
                return tmpung;
              }
            }),
            additional: this.checkIsRadioType(item.type) || item.type === 'checkbox' ? item.additional.map(item => item.option) : (item.type === 'stock_check' ? ["Ada", "Tidak Ada"] : []),
            stock_check_data: item.type === 'stock_check' ? ({
              sku_id: this.listProductSelected[index].sku_id,
              name: this.listProductSelected[index].name,
              directly: this.listDirectBelanja[index]
            }) : null,
          };

          if (this.frmQuiz.value === 'quiz') {
            mockup['coin'] = item.coin;
            mockup['question_answer'] = this.listAnswerKeys[index].map(answer => item.additional[answer] && item.additional[answer]['option'] ? item.additional[answer]['option'] : item.additional[answer]);
          }

          if (item.type === 'stock_check_ir' && this.templateListImageIR[index]['ir_id']) {
            mockup['type'] = 'stock_check_ir';
            mockup['stock_check_ir_id'] = this.templateListImageIR[index] ? this.templateListImageIR[index]['ir_code'] : null;
            mockup['stock_check_ir_name'] = this.templateListImageIR[index] ? this.templateListImageIR[index]['ir_name'] : null;
            mockup['stock_check_ir_list'] = this.templateListImageIR[index] ? this.templateListImageIR[index]['check_list'] : null;
          }

          if (item.type === 'planogram_ir' && this.templateListImageIR[index]['ir_id']) {
            mockup['type'] = 'planogram';
            mockup['planogram_id'] = this.templateListImageIR[index] ? this.templateListImageIR[index]['ir_id'] : null;
            mockup['planogram_name'] = this.templateListImageIR[index] ? this.templateListImageIR[index]['ir_name'] : null;
            mockup['planogram_image'] = this.templateListImageIR[index] ? this.templateListImageIR[index]['image'] : null;
          }
          return mockup;
        }),
        rejected_reason_choices: rejected_reason.map(item => item.reason),
        rejected_reason_ids: rejected_reason.map(item => 
          (this.listReason.filter(list => list.name.toUpperCase() === item.reason.toUpperCase()))[0].id
        ),
        ir_type: this.templateTaskForm.get('ir_type').value,
      }
      
      if (questionsIsEmpty.length > 0) {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: this.translate.instant('dte.template_tugas.complete_question_message') });
        return;
      }

      if (this.isIRTemplate.value && !body.ir_type) {
        this.dataService.showLoading(false);
        this.isIRTypeError = true;
        this.dialogService.openSnackBar({ message: this.translate.instant('dte.template_tugas.please_select_ir') });
        return;
      }

      console.log('ini masuk body', body);
      if (this.templateTaskForm.get('video').value && this.videoMaster || this.questionVideo.length > 0) {
        if (this.videoMaster) {
          let bodyMasterVideo = new FormData();
          bodyMasterVideo.append('file', this.videoMaster);
          this.taskTemplateService.uploadVideo(bodyMasterVideo).subscribe(
            async res => {
              body.video = res.data;
              if (this.questionVideo.length > 0) {
                const promise1 = await this.questionVideo.map(async (qv) => {
                  let bodyQuestionVideo = new FormData();
                  bodyQuestionVideo.append('file', qv.event);
                  await new Promise(async (resolve, reject) => {
                    this.taskTemplateService.uploadVideo(bodyQuestionVideo).subscribe(
                      resQuestionVideo => {
                        resolve(body.questions[qv.idx].question_video = resQuestionVideo.data);
                      }, err => {
                        console.log(err.error);
                        reject(err);
                        this.dataService.showLoading(false);
                        return;
                      });
                  });
                  return qv;
                });

                Promise.all(promise1).then(() => {
                  this.taskTemplateService.create(body).subscribe(
                    res => {
                      this.dataService.showLoading(false);
                      this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
                      this.router.navigate(['dte', 'template-task']);
                    }, err => {
                      console.log(err.error)
                      this.dataService.showLoading(false);
                      return;
                    })
                });
              } else {
                this.taskTemplateService.create(body).subscribe(
                  res => {
                    this.dataService.showLoading(false);
                    this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
                    this.router.navigate(['dte', 'template-task']);
                  },
                  err => {
                    console.log(err.error)
                    this.dataService.showLoading(false);
                    return;
                  }
                )
              }
            },
            err => {
              console.log(err.error)
              this.dataService.showLoading(false);
              return;
            }
          )
        } else {
          if (this.questionVideo.length > 0) {
            const promise1 = await this.questionVideo.map(async (qv) => {
              let bodyQuestionVideo = new FormData();
              bodyQuestionVideo.append('file', qv.event);
              await new Promise(async (resolve, reject) => {
                this.taskTemplateService.uploadVideo(bodyQuestionVideo).subscribe(
                  resQuestionVideo => {
                    resolve(body.questions[qv.idx].question_video = resQuestionVideo.data);
                  }, err => {
                    console.log(err.error);
                    reject(err);
                    this.dataService.showLoading(false);
                    return;
                  });
              });
              return qv;
            });

            Promise.all(promise1).then(() => {
              this.taskTemplateService.create(body).subscribe(
                res => {
                  this.dataService.showLoading(false);
                  this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
                  this.router.navigate(['dte', 'template-task']);
                }, err => {
                  console.log(err.error);
                  this.dataService.showLoading(false);
                  return;
                })
            });
          } else {
            this.taskTemplateService.create(body).subscribe(
              res => {
                this.dataService.showLoading(false);
                this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
                this.router.navigate(['dte', 'template-task']);
              },
              err => {
                console.log(err.error);
                this.dataService.showLoading(false);
                return;
              }
            )
          }
        }
      } else {
        this.taskTemplateService.create(body).subscribe(
          res => {
            this.dataService.showLoading(false);
            this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
            this.router.navigate(['dte', 'template-task']);
          },
          err => {
            console.log(err.error);
            this.dataService.showLoading(false);
            // this.dialogService.openSnackBar({ message: err.error.message });
          }
        )
      }

    } else {
      commonFormValidator.validateAllFields(this.templateTaskForm);
      const questions = this.templateTaskForm.get('questions') as FormArray;
      
      if (this.templateTaskForm.controls['name'].invalid || this.templateTaskForm.controls['description'].invalid || this.templateTaskForm.controls['material_description'].invalid)
        return this.dialogService.openSnackBar({ message: this.translate.instant('global.label.please_complete_data') });

      if (this.templateTaskForm.get('image').invalid)
        return this.dialogService.openSnackBar({ message: this.translate.instant('dte.template_tugas.not_selected_image') });
      if (this.templateTaskForm.get('questions').invalid) {
        if (questions.value.length) {
          for (const item of questions.value) {
            if (item.image_quality_detection && !item.blocker_submission) {
              return this.dialogService.openSnackBar({ message: this.translate.instant('dte.template_tugas.not_filled_blocker_submission') })
            }
          }
        } else {
          return this.dialogService.openSnackBar({ message: this.translate.instant('dte.template_tugas.not_created_question_min_one') })
        }
      }
      else
        return this.dialogService.openSnackBar({ message: this.translate.instant('global.label.please_complete_data') });
    }
  }

  uploadImage(type, idx) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { password: 'P@ssw0rd', fileType: 'image' };

    this.dialogRef = this.dialog.open(UploadImageComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        switch (type) {
          case 'master':
            this.templateTaskForm.get('video').setValue('');
            this.templateTaskForm.get('image').setValue(response.res);
            break;
          case 'question':
            let questions = this.templateTaskForm.get('questions') as FormArray;
            questions.at(idx).get('question_video').setValue('');
            questions.at(idx).get('question_image').setValue(response.res);
            break;
          default:
            break;
        }
      }
    });
  }

  uploadImageBgMisi(e: any){
    this.templateTaskForm.get('background_image').setValue(e.image);    
    this.templateTaskForm.get('background_font_color').setValue(e.color);    
    console.log('update => ', this.templateTaskForm);
  }

  onChangeBgMisi(){
    if (!this.isBackgroundMisi.value) {
      const update = {
        image: '',
        color: ''
      }
      this.uploadImageBgMisi(update);
    }
  }

  deleteImage(type, idx) {
    switch (type) {
      case 'master':
        this.templateTaskForm.get('image').setValue('');
        this.templateTaskForm.get('video').setValue('');
        break;
      case 'question':
        let questions = this.templateTaskForm.get('questions') as FormArray;
        questions.at(idx).get('question_image').setValue('');
        questions.at(idx).get('question_video').setValue('');
        break;
      default:
        break;
    }
  }

  onDirectBelanja(idx) {
    console.log(this.listDirectBelanja, idx);
    this.listDirectBelanja[idx] = !this.listDirectBelanja[idx];
  }

  uploadVideo(type, idx) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { password: 'P@ssw0rd', fileType: 'video' };

    this.dialogRef = this.dialog.open(UploadImageComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        switch (type) {
          case 'master':
            this.templateTaskForm.get('image').setValue('');
            this.templateTaskForm.get('video').setValue(response.res);
            this.videoMaster = response.event;
            break;
          case 'question':
            let questions = this.templateTaskForm.get('questions') as FormArray;
            questions.at(idx).get('question_image').setValue('');
            questions.at(idx).get('question_video').setValue(response.res);
            const index = this.questionVideo.map((data) => data.idx).indexOf(idx);
            if (index > -1) {
              this.questionVideo[index] = { idx: idx, event: response.event };
            } else {
              this.questionVideo.push({ idx: idx, event: response.event });
            }
            break;
          default:
            break;
        }
      }
    });
  }

  selectAnswerKey(qIdx, idx, data, isRadio) {
    if (this.listAnswerKeys.length > 0 && this.listAnswerKeys[qIdx]) {
      let isAnswerIsExist = this.listAnswerKeys[qIdx].findIndex(key => key === idx);
      if (isRadio) {
        if (isAnswerIsExist > -1) {
          this.listAnswerKeys[qIdx].splice(isAnswerIsExist, 1);
        } else {
          this.listAnswerKeys[qIdx] = [idx];
        }
      } else {
        if (isAnswerIsExist > -1) {
          this.listAnswerKeys[qIdx].splice(isAnswerIsExist, 1);
        } else {
          this.listAnswerKeys[qIdx].push(idx);
        }
      }
    } else {
      this.listAnswerKeys = [
        ...this.listAnswerKeys,
        [idx]
      ]
    }
  }

  iconRadioState(qIdx, idx) {
    if (this.listAnswerKeys[qIdx]) {
      let isExistInAnswerKeys = this.listAnswerKeys[qIdx].findIndex(key => key === idx);
      return isExistInAnswerKeys > -1 ? 'radio_button_checked' : 'radio_button_unchecked'
    } else {
      return 'radio_button_unchecked';
    }
  }

  iconCheckboxState(qIdx, idx) {
    if (this.listAnswerKeys[qIdx]) {
      let isExistInAnswerKeys = this.listAnswerKeys[qIdx].findIndex(key => key === idx);
      return isExistInAnswerKeys > -1 ? 'check_box' : 'check_box_outline_blank'
    } else {
      return 'check_box_outline_blank';
    }
  }

}
