import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { TemplateTaskService } from 'app/services/dte/template-task.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';
import { UploadImageComponent } from '../dialog/upload-image/upload-image.component';
import { DataService } from '../../../../services/data.service';
import * as _ from 'underscore';
import { Observable, Subject, ReplaySubject, iif } from 'rxjs';
import { ProductService } from 'app/services/sku-management/product.service';
import { startWith, map, takeUntil } from 'rxjs/operators';
import { PengaturanAttributeMisiService } from 'app/services/dte/pengaturan-attribute-misi.service';
import { Config } from 'app/classes/config';
import { Lightbox } from 'ngx-lightbox';

@Component({
  selector: 'app-template-edit',
  templateUrl: './template-edit.component.html',
  styleUrls: ['./template-edit.component.scss']
})
export class TemplateEditComponent {

  templateTaskForm: FormGroup;
  templateTaskFormError: any;
  dialogRef: any;
  detailTask: any;
  frmIsBranching: FormControl = new FormControl(false);
  listCategoryResponse: any[] = [{ value: false, name: 'Non - Task Based Response' }, { value: true, name: 'Task Based Response' }];
  listKategoriToolbox: any[];
  listTipeMisi: any[];
  listTingkatinternalMisi: any[];
  listKategoriMisi: any[];
  listProjectMisi: any[];
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
  public options: Object = Config.FROALA_CONFIG;
  

  listChoose: Array<any> = [
  ];

  listChooseOriginal: Array<any> = [
    { name: "Jawaban Singkat", value: "text", icon: "short_text" },
    { name: "Paragraf", value: "textarea", icon: "notes" },
    { name: "Pilihan Ganda", value: "radio", icon: "radio_button_checked" },
    { name: "Kotak Centang", value: "checkbox", icon: "check_box" },
    { name: "Unggah Gambar", value: "image", icon: "cloud_upload" },
    { name: "Angka", value: "numeric", icon: "dialpad" },
    { name: "Pilihan Tanggal", value: "date", icon: "date_range" },
    { name: "Stock Check", value: "stock_check", icon: "insert_chart" },
  ];

  listChooseWithIr: Array<any> = [
    { name: "Jawaban Singkat", value: "text", icon: "short_text" },
    { name: "Paragraf", value: "textarea", icon: "notes" },
    { name: "Pilihan Ganda", value: "radio", icon: "radio_button_checked" },
    { name: "Kotak Centang", value: "checkbox", icon: "check_box" },
    { name: "Unggah Gambar", value: "image", icon: "cloud_upload" },
    { name: "Angka", value: "numeric", icon: "dialpad" },
    { name: "Pilihan Tanggal", value: "date", icon: "date_range" },
    { name: "Stock Check", value: "stock_check", icon: "insert_chart" },
    { name: "Stock Check IR", value: "stock_check_ir", icon: "check_box" },
    { name: "Planogram IR", value: "planogram_ir", icon: "cloud_upload" },
  ];
  shareable: FormControl = new FormControl(false);
  isIRTemplate: FormControl = new FormControl(false);

  @ViewChild("autosize")
  autosize: CdkTextareaAutosize;

  saveData: Boolean;
  valueChange: Boolean;
  isDetail: Boolean;
  validComboDrag: boolean;
  validComboDragQuestionChild: boolean;
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
  listContentType: any[] = [{ name: "Static Page", value: "static_page" }, { name: "Landing Page", value: "landing_page" }, { name: "Iframe", value: "iframe" }, { name: "Image", value: "image" }, { name: "Unlinked", value: "unlinked" }
  ];
  listContentTypeQuestionChild: any[] = [{ name: "Static Page", value: "static_page" }, { name: "Landing Page", value: "landing_page" }, { name: "Iframe", value: "iframe" }, { name: "Image", value: "image" }, { name: "Unlinked", value: "unlinked" }
  ];

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
  filteredNext: any[] = [];

  videoMaster: any = null;
  questionVideo: any[] = [];
  templateList: any[] = [];
  templateListImageIR: any[] = [];

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if (this.isDetail) return true;

    if (this.valueChange && !this.saveData) {
      return false;
    }

    return true;
  }

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private taskTemplateService: TemplateTaskService,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private _lightbox: Lightbox,
    private pengaturanAttributeMisiService: PengaturanAttributeMisiService
  ) {
    this.listLandingPage = [{ name: "Belanja", value: "belanja" }, { name: "Misi", value: "misi" }, { name: "Pelanggan", value: "pelanggan" }, { name: "Bantuan", value: "bantuan" }, { name: "Profil Saya", value: "profil_saya" }, { name: "Promosi", value: "promosi" }, { name: "Pojok Modal", value: "pojok_modal" }, { name: "Katalog SRC", value: "katalog_src" }, { name: "Pathnership", value: "pathnership" }];
    this.saveData = false;
    this.templateTaskFormError = {
      name: {},
      description: {},
      image: {}
    }

    activatedRoute.url.subscribe( params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })

    this.detailTask = this.dataService.getFromStorage('detail_template_task');
  }

  ngOnInit() {

    this.getListKategoriToolbox();
    this.getListTipeMisi();
    this.getListTingkatInternalMisi();
    this.getListKategoriMisi();
    this.getListKategoriProject();

    this.listChoose = this.listChooseOriginal.slice();
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
    this.filterProject.valueChanges.pipe(takeUntil(this._onDestroy)). subscribe(() => {
      this.filteringProject();
    });

    this.keyUp.debounceTime(300)
      .flatMap(key => {
        return Observable.of(key).delay(300);
      })
      .subscribe(res => {
        console.log('reas ngetik cuk', res);
        this.getListProduct(res);
        this.resetField(res);
      });
    this.templateTaskForm = this.formBuilder.group({
      name: ["", Validators.required],
      description: ["", Validators.required],
      kategori_toolbox: ["", Validators.required],
      tipe_misi: ["", Validators.required],
      tingkat_internal_misi: ["", Validators.required],
      kategori_misi: ["", Validators.required],
      project_misi: ["", Validators.required],
      image: [""],
      video: [""],
      material: false,
      material_description: ["", Validators.required],
      questions: this.formBuilder.array([], Validators.required),
      rejected_reason_choices: this.formBuilder.array([], Validators.required),
      image_description: this.formBuilder.array([]),
    });

    this.templateTaskForm.valueChanges.subscribe(res => {
      commonFormValidator.parseFormChanged(this.templateTaskForm, this.templateTaskFormError);
    })

    if (this.detailTask.material === 'no')
      this.templateTaskForm.get('material_description').disable();

    this.setValue();

    this.templateTaskForm.valueChanges.subscribe(res => {
      this.valueChange = true;
    })
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
    this.pengaturanAttributeMisiService.getToolbox({ status: 'active' }).subscribe(
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

  splitCheckList(template) {
    console.log('template', template);
  }
  onChangeDetailBannerQuestion(event) {
    if (event.checked) {
    this.isDetailBannerPertanyaan = true;
    } else {
      this.isDetailBannerPertanyaan = false;
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

  getListTipeMisi() {
    this.pengaturanAttributeMisiService.getTipeMisi({ status: 'active' }).subscribe(
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
    this.pengaturanAttributeMisiService.getInternalMisi({ status: 'active' }).subscribe(
      (res) => {
        this.listTingkatinternalMisi = res.data.data;
        this.filteredLTKM.next(this.listTingkatinternalMisi.slice());
      },
      (err) => {
        console.log("err List Internal Misi", err);
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
    this.pengaturanAttributeMisiService.getProject({status: 'active'}).subscribe(
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
  imagesContentTypeQuestionChild(image, index) {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let question_image_description = questions.at(index).get('question_image_description') as FormArray;
    this.changeImageDetailQuestionChild = true;
      var file: File = image;
      var myReader: FileReader = new FileReader();

      myReader.onloadend = (e) => {
        this.imageContentTypeBase64QuestionChild = myReader.result;
        question_image_description.at(index).get('question_image_detail_photo').setValue(this.imageContentTypeBase64QuestionChild);
      };

      myReader.readAsDataURL(file);
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
  previewImage() {
    let album = {
      src: this.imageContentTypeBase64Child,
      caption: '',
      thumb: this.imageContentTypeBase64Child
    };

    this._lightbox.open([album], 0);
  }
  previewImageChild(index) {
    let album = {
      src: this.imageContentTypeBase64QuestionChild,
      caption: '',
      thumb: this.imageContentTypeBase64QuestionChild
    };

    this._lightbox.open([album], 0);
  }
  deleteImg() {
    this.changeImageDetailQuestionChild = false;
  }
  deleteImgAtas() {
    this.imageContentTypeDefault = undefined;
    this.imageContentTypeDefault = null;
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
    this.pengaturanAttributeMisiService.getKategoriMisi({ status: 'active' }).subscribe(
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
        console.log('listProductSkuBank', this.listProductSkuBank);
        this.filteredSkuOptions = this.product.valueChanges.pipe(startWith(""), map(value => this._filterSku(value)));
        console.log('on get sku options', this.filteredSkuOptions);
      })
    } else {
      this.listProductSkuBank = [];
      this.filteredSkuOptions = this.product.valueChanges.pipe(startWith(""), map(value => this._filterSku(value)));
    }
  }

  onChangeListChoose(selection) {
    console.log('selection', selection);
  }

  getProductObj(event, index) {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    console.log('event', event, index);
    if (event.source.selected) {
      questions.at(index).get('question').setValue(`Apakah Anda Memiliki stok ${event.source.value.name} ?`)
      questions.at(index).get('question_image').setValue(event.source.value.image ? event.source.value.image_url : "");
      questions.at(index).get('question_image').setValue(event.source.value.video ? event.source.value.video_url : "");
      console.log('current', this.listProductSkuBank[index]);
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
    console.log('inii detail', this.detailTask);
    this.isDetailBanner = this.detailTask.image_detail;
    if (this.detailTask.image_description[0].content_image != null || this.detailTask.image_description[0].content_image !== undefined ) {
      this.imageContentTypeDefault = this.detailTask.image_description[0].content_image;
      this.imageContentTypeBase64Child = this.detailTask.image_description[0].content_image;
    }

    this.templateTaskForm.get('kategori_toolbox').setValue(this.detailTask.task_toolbox_id);
    this.templateTaskForm.get('tipe_misi').setValue(this.detailTask.task_toolbox_type_id);
    this.templateTaskForm.get('tingkat_internal_misi').setValue(this.detailTask.task_toolbox_internal_id);
    this.templateTaskForm.get('kategori_misi').setValue(this.detailTask.task_toolbox_categories_id);
    this.templateTaskForm.get('project_misi').setValue(this.detailTask.task_toolbox_project_id);
    this.templateTaskForm.get('name').setValue(this.detailTask.name);
    this.templateTaskForm.get('description').setValue(this.detailTask.description);
    this.templateTaskForm.get('material').setValue(this.detailTask.material === 'yes' ? true : false);
    this.templateTaskForm.get('material_description').setValue(this.detailTask['material_description'] ? this.detailTask['material_description'] : 'Jenis Material');
    this.templateTaskForm.get('image').setValue(this.detailTask.image ? this.detailTask.image_url : '');
    this.templateTaskForm.get('video').setValue(this.detailTask.video ? this.detailTask.video_url : '');
    this.frmIsBranching.setValue(this.detailTask.is_branching === 1 ? true : false);
    this.shareable.setValue(this.detailTask.is_shareable == 1 ? true : false);
    this.isIRTemplate.setValue(this.detailTask.is_ir_template == 1 ? true : false);
    this.detailTask['image_description'].map(item => {
        image_description.push(this.formBuilder.group({
          content_type: item.content_type,
          landing_page: item.landing_page,
          body: item.body,
          title: item.title,
          url_iframe: item.url_iframe,
          imageDetailBanner: item.content_image
        }));
    });

    this.detailTask['questions'].map((item, index) => {
      if (item.type === 'stock_check') {
        this.listProductSelected[index] = {
          product: new FormControl(item.stock_check_data.name)
        }

        // this.listProductSelected[index] = this.formBuilder.group({
        //   product: item.stock_check_data.name
        // });

        // this.listProductSelected[index].product.updateValueAndValidity();

      }
      if (this.isIRTemplate.value) this.listChoose = [...this.listChooseWithIr]
      else this.listChoose = [...this.listChooseOriginal]

      var modificationType = item.type === 'planogram' ? item.type + "_ir" : item.type;
      var ir_id = null;
      if (modificationType.includes("_ir")) {
        let typeService = modificationType.includes("planogram") ? "getPlanogramIRTemplates" : "getStockCheckIRTemplates";
        this.taskTemplateService[typeService]().subscribe(results => {
          this.templateList[index] = results.data.data;
          if (this.templateListImageIR[index]['ir_name'] && modificationType === 'stock_check_ir') {
            let dataTemplate = this.templateList[index].find(tl => tl.code === this.templateListImageIR[index]['ir_code']);
            if (dataTemplate) {
              ir_id = dataTemplate['id'];
              questions.at(index).get('planogram_id').setValue(dataTemplate['id']);
              this.templateListImageIR[index]['id'] = dataTemplate['id'];
            }
          }
        });
        if (modificationType === 'planogram_ir') {
          this.templateListImageIR.push({
            item_id: index + 1,
            id: Number(item.planogram_id),
            image: item.planogram_image,
            ir_id: Number(item.planogram_id),
            ir_name: item.planogram_name,
          });
        } else {
          this.templateListImageIR.push({
            item_id: index + 1,
            id: item.stock_check_ir_id,
            ir_id: item.stock_check_ir_id,
            ir_code: item.stock_check_ir_id,
            ir_name: item.stock_check_ir_name,
            check_list: item.stock_check_ir_list
          });
        }

      } else {
        this.templateList.push([]);
        this.templateListImageIR.push({ item_id: index + 1 });
      }
      questions.push(this.formBuilder.group({
        id: item.id,
        question: item.question,
        question_image: item['question_image'] ? item['question_image'] : '',
        question_video: item['question_video'] ? item['question_video'] : '',
        type: item.type === 'planogram' ? item.type + "_ir" : item.type,
        typeSelection: this.listChoose.filter(val => val.value === (item.type === 'planogram' ? item.type + "_ir" : item.type))[0],
        planogram_id: Number(item.planogram_id),
        planogram_image: item.planogram_image,
        planogram_name: item.planogram_name,
        stock_check_ir_id: item.stock_check_ir_id,
        stock_check_ir_code: item.stock_check_ir_code,
        stock_check_ir_name: item.stock_check_ir_name,
        stock_check_ir_list: item.stock_check_ir_list,
        question_image_description: this.formBuilder.array( item.question_image_description.map (item  => {
          return this.formBuilder.group({
            content_type: item.content_type,
            title: item.title,
            body: item.body,
            landing_page: item.landing_page,
            url_iframe: item.url_iframe,
            question_image_detail_photo: item.content_image
          });
        })),
        required: item.required,
        additional: this.formBuilder.array(
          item.additional.map((itm, idx) => {
            return this.formBuilder.group({ option: itm, next_question: item.possibilities && item.possibilities.length > 0 ? item.possibilities[idx].next : '' })
          })
        )
      }));
      console.log('questions', questions, this.listChoose);
      this.allQuestionList.push({
        id: item.id,
        question: item.question,
        is_next_question: item.is_next_question === 1 ? true : false,
        question_image_description: this.formBuilder.array( item.question_image_description.map (item  => {
          return this.formBuilder.group({
            content_type: item.content_type,
            title: item.title,
            body: item.body,
            landing_page: item.landing_page,
            url_iframe: item.url_iframe,
            question_image_detail_photo: item.content_image
          });
        })),
        possibilities: item.possibilities && item.possibilities.map(pb => ({
          ...pb,
          isBranching: pb.next !== null ? true : false
        }))
      });
      console.log('aall Questions', this.templateTaskForm.get('questions').value);
      this.listDirectBelanja[index] = item.type === 'stock_check' ? item.stock_check_data.directly : false;
      this.isDetailBannerPertanyaan = item.image_detail;
      if (item.question_image_description[0].content_image !== null || item.question_image_description[0].content_image !== undefined) {
        this.filesQuestionChild = item.question_image_description[0].content_image;
        this.imageContentTypeBase64QuestionChild = item.question_image_description[0].content_image;
      }
      this.isDetailBannerPertanyaan = item.question_image_detail;
    });
    console.log('asdakdj', this.listProductSelected, this.allQuestionList);
    this.detailTask['rejected_reason_choices'].map(item => {
      return rejected.push(this.formBuilder.group({ reason: item }));
    });

    if (this.isDetail) this.templateTaskForm.disable();
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
        this.questionHasNext[referenceQIdx.next] = referenceHasNext.length > 0 ? true : false;
      }
      this.questionHasNext[this.allQuestionList[qIdx].id] = hasNext.length > 0 ? true : false;

      this.findQuestionsHasNext();

      console.log(this.allQuestionList[qIdx]['possibilities'][addIdx])
    }
  }

  addAdditional(idx) {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let additional = questions.at(idx).get('additional') as FormArray;

    this.allQuestionList[idx]['possibilities'].push({ key: `Opsi ${additional.length + 1}`, next: '', isBranching: false });
    additional.push(this.formBuilder.group({ option: `Opsi ${additional.length + 1}`, next_question: '' }));
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

  selectedImageIR(selectedIR, template, idx) {
    console.log('selectedIR IR', selectedIR, template, idx);
    // let indexExist = this.templateListImageIR.findIndex(tlir => tlir.item_id === selectedIR.value);
    let indexTemplate = this.templateList[idx].findIndex(tl => tl.id === selectedIR.value);
    if (idx > -1 && indexTemplate > -1) {
      this.templateListImageIR[idx]['item_id'] = idx + 1;
      this.templateListImageIR[idx]['ir_code'] = this.templateList[idx][indexTemplate].code;
      this.templateListImageIR[idx]['ir_name'] = this.templateList[idx][indexTemplate].name;
      this.templateListImageIR[idx]['check_list'] = this.templateList[idx][indexTemplate].check_list ? JSON.parse(this.templateList[idx][indexTemplate].check_list) : [];

      this.templateListImageIR[idx]['ir_id'] = this.templateList[idx][indexTemplate].id;
      this.templateListImageIR[idx]['image'] = this.templateList[idx][indexTemplate].image;
    } else {
      this.templateListImageIR.push({ item_id: idx + 1, image: this.templateList[idx][indexTemplate].image, ir_id: this.templateList[idx][indexTemplate].id, ir_code: this.templateList[idx][indexTemplate].code, ir_name: this.templateList[idx][indexTemplate].name, check_list: this.templateList[idx][indexTemplate].check_list ? JSON.parse(selectedIR.value.check_list) : [] });
    }

    console.log('the ir', this.templateListImageIR[idx]);
  }

  onChangeTemplateIR(event) {
    console.log('the event dude!!!', event);
    if (event.checked) this.listChoose = [...this.listChooseWithIr]
    else this.listChoose = [...this.listChooseOriginal]
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

    if (additional.length === 0 && type == 'radio' || additional.length === 0 && type == 'checkbox') {
      additional.push(this.createAdditional());
    }

    if (additional.length > 0 && type !== 'radio' && type !== 'checkbox') {
      while (additional.length > 0) {
        additional.removeAt(additional.length - 1);
      }
    }

    questions.at(idx).get('typeSelection').setValue(typeSelection);
  }

  checkWording(selection) {
    return selection.includes("_ir");
  }

  addQuestion(): void {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let newId = _.max(questions.value, function (item) { return item.id });
    this.isDetailBannerPertanyaan = false;

    questions.push(this.formBuilder.group({
      id: newId.id + 1,
      question: `Pertanyaan`,
      type: 'radio',
      typeSelection: this.formBuilder.group({ name: "Pilihan Ganda", value: "radio", icon: "radio_button_checked" }),
      additional: this.formBuilder.array([this.createAdditional()]),
      question_image_description: this.formBuilder.array([this.formBuilder.group({
        content_type: '',
            title: '',
            body: '',
            landing_page: '',
            url_iframe: '',
            question_image_detail_photo: [''] })]),
      question_image: [''],
      question_video: [''],
      // others: false,
      // required: false
    }))

    this.allQuestionList.push({
      id: newId.id + 1,
      question: `Pertanyaan`,
      is_next_question: false,
      possibilities: [{ key: 'Opsi 1', next: '', isBranching: false }]
    })
    this.listDirectBelanja[questions.length - 1] = false;
    this.listProductSelected[questions.length - 1] = { product: new FormControl("") };

    this.templateList.push([]);
    this.templateListImageIR.push({ item_id: newId.id + 1 });
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

  findQuestionsHasNext() {
    // let questions = this.templateTaskForm.get('questions').value;
    let allNexts = [];
    this.allQuestionList.map(q => {
      let qData = q.possibilities.filter(qa => (!!qa.next && qa.next !== "" && qa.next != "-99"));
      allNexts = [
        ...allNexts,
        ...qData
      ];
    });
    this.filteredNext = [...allNexts];
    let filteredNexts = allNexts.map(nxt => nxt.next).filter((elem, index, self) => {
      return index === self.indexOf(elem);
    }).map(elem => {
      this.questionHasNext[elem] = true;
    });
  }

  addRejectedReason() {
    let rejected_reason = this.templateTaskForm.get('rejected_reason_choices') as FormArray;
    rejected_reason.push(this.formBuilder.group({ reason: `Alasan ${rejected_reason.length + 1}` }))
  }

  createAdditional(): FormGroup {
    return this.formBuilder.group({ option: 'Opsi 1', next_question: '' })
  }

  addOthers(idx): void {
    // this.dataTemplateTask.questions[idx].others = !this.dataTemplateTask.questions[idx].others;
  }

  deleteQuestion(idx): void {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let idQUestion = questions.at(idx).get('id').value;
    if (this.frmIsBranching.value && questions.at(idx).get('typeSelection').value['value'] === 'radio' && this.checkHasLinked(idx, idQUestion)) {
      // this.dialogService.openCustomDialog('Tidak Bisa Menghapus Pertanyaan', 'Pertanyaan ini terhubung sebagai Response Pertanyaan lain, Silahkan mengubah Next Question yang bersangkutan.');
      this.dialogService.openSnackBar({
        message: 'Pertanyaan ini terhubung sebagai Respon Pertanyaan lain, Silahkan mengubah Next Question yang bersangkutan.'
      })
      return;
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

  deleteAdditional(idx1?, idx2?): void {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let additional = questions.at(idx1).get('additional') as FormArray;

    this.allQuestionList[idx1]['possibilities'].splice(idx2, 1);
    additional.removeAt(idx2);
    this.findQuestionsHasNext();
  }

  async submit() {
    if (this.templateTaskForm.valid) {
      this.dataService.showLoading(true);
      this.saveData = !this.saveData;
      let questions: any[] = this.templateTaskForm.get('questions').value;
      let rejected_reason: any[] = this.templateTaskForm.get('rejected_reason_choices').value;
      let image_description: any[] = this.templateTaskForm.get('image_description').value;
      let questionsIsEmpty = [];
      let body = {
        _method: 'PUT',
        task_toolbox_id: this.templateTaskForm.get('kategori_toolbox').value,
        task_toolbox_type_id: this.templateTaskForm.get('tipe_misi').value,
        task_toolbox_internal_id: this.templateTaskForm.get('tingkat_internal_misi').value,
        task_toolbox_categories_id: this.templateTaskForm.get('kategori_misi').value,
        task_toolbox_project_id: this.templateTaskForm.get('project_misi').value,
        name: this.templateTaskForm.get('name').value,
        description: this.templateTaskForm.get('description').value,
        material: this.templateTaskForm.get('material').value ? 'yes' : 'no',
        material_description: this.templateTaskForm.get('material').value ? this.templateTaskForm.get('material_description').value : '',
        image: this.templateTaskForm.get('image').value ? this.templateTaskForm.get('image').value : '',
        video: this.detailTask.video ? this.detailTask.video : '',
        image_detail: this.isDetailBanner ? 1 : 0,
        is_branching: this.frmIsBranching.value ? 1 : 0,
        is_shareable: this.shareable.value ? 1 : 0,
        is_ir_template: this.isIRTemplate.value ? 1 : 0,
        image_description: image_description.map((item, index) => {
          if (item.content_type === 'image') {
            let tmp = {
              content_type: item.content_type,
              content_image: item.imageDetailBanner
            };
            return tmp;
          } else if (item.content_type === 'landing_page') {
            let tmp = {
              content_type: item.content_type,
              landing_page: item.landing_page,
            };
            return tmp;
          } else if (item.content_type === 'static_page') {
            let tmp = {
              content_type: item.content_type,
              title: item.title,
              body: item.body,
            };
            return tmp;
          } else if (item.content_type === 'iframe') {
            let tmp = {
              content_type: item.content_type,
              url_iframe: item.url_iframe,
            };
            return tmp;
          } else if (item.content_type === 'unlinked') {
            let tmp = {
              content_type: item.content_type,
            };
            return tmp;
          }
        }),
        questions: questions.map((item, index) => {
          // if (item.question_image) {
          console.log('item.type', item.type);
          if (item.type === 'stock_check' && (this.listProductSelected[index] && this.listProductSelected[index].sku_id == null || this.listProductSelected[index].sku_id == "")) {
            questionsIsEmpty.push({ qId: item.id });
          }
          let isNext = this.filteredNext.find(nxt => nxt.next == item.id);
          let mockup = {
            id: item.id,
            question: item.question,
            type: item.type,
            is_child: isNext ? 1 : 0,
            is_next_question: (this.questionHasNext[item.id] === true ? 1 : 0),
            possibilities: (this.frmIsBranching.value && item.type === 'radio') ? this.allQuestionList[index]['possibilities'].map((pos, idx) => ({
              key: item.additional[idx].option,
              next: pos.next === "" ? null : pos.next
            })) : [],
            required: item.type === 'stock_check' ? 1 : null,
            question_image_detail: this.isDetailBannerPertanyaan ? 1 : 0,
            // required: item.required,
            question_image: item.question_image || '',
            question_video: item.question_video || '',
            question_image_description: item.question_image_description.map((tmp, index) => {
              if (tmp.content_type === 'image') {
                let tmpung = {
                  content_type: tmp.content_type,
                  content_image: tmp.question_image_detail_photo
                };
                return tmpung;
              } else if (tmp.content_type === 'landing_page') {
                let tmpung = {
                  content_type: tmp.content_type,
                  landing_page: tmp.landing_page,
                };
                return tmpung;
              } else if (tmp.content_type === 'static_page') {
                let tmpung = {
                  content_type: tmp.content_type,
                  title: tmp.title,
                  body: tmp.body,
                };
                return tmpung;
              } else if (tmp.content_type === 'iframe') {
                let tmpung = {
                  content_type: tmp.content_type,
                  url_iframe: tmp.url_iframe,
                };
                return tmpung;
              } else if (tmp.content_type === 'unlinked') {
                let tmpung = {
                  content_type: tmp.content_type,
                };
                return tmpung;
              }
            }),
            additional: item.type !== 'stock_check' ? item.additional.map(item => item.option) : ["Ada", "Tidak Ada"],
            stock_check_data: item.type === 'stock_check' ? ({
              sku_id: this.listProductSelected[index].sku_id,
              name: this.listProductSelected[index].name,
              directly: this.listDirectBelanja[index]
            }) : null
          }

          if (item.type === 'stock_check_ir') {
            mockup['type'] = 'stock_check_ir';
            mockup['stock_check_ir_id'] = this.templateListImageIR[index] ? this.templateListImageIR[index]['ir_code'] : null;
            mockup['stock_check_ir_name'] = this.templateListImageIR[index] ? this.templateListImageIR[index]['ir_name'] : null;
            mockup['stock_check_ir_list'] = this.templateListImageIR[index] ? this.templateListImageIR[index]['check_list'] : null;
          }

          if (item.type === 'planogram_ir') {
            mockup['type'] = 'planogram';
            mockup['planogram_id'] = this.templateListImageIR[index] ? this.templateListImageIR[index]['ir_id'] : null;
            mockup['planogram_name'] = this.templateListImageIR[index] ? this.templateListImageIR[index]['ir_name'] : null;
            mockup['planogram_image'] = this.templateListImageIR[index] ? this.templateListImageIR[index]['image'] : null;
          }

          return mockup;
          // }
          // return {
          //   id: item.id,
          //   question: item.question,
          //   type: item.type,
          //   // required: item.required,
          //   question_image: item.question_image || null,
          //   additional: item.additional.map(item => item.option)
          // }
        }),
        rejected_reason_choices: rejected_reason.map(item => item.reason)
      }
      if (questionsIsEmpty.length > 0) {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: "Ada pertanyaan belum di isi, silahkan lengkapi pengisian" });
        return;
      }
      console.log('this body', body);
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
                  this.taskTemplateService.put(body, { template_id: this.detailTask.id }).subscribe(
                    res => {
                      this.dataService.showLoading(false);
                      this.dialogService.openSnackBar({ message: "Data Berhasil Diubah" });
                      this.router.navigate(['dte', 'template-task']);

                      window.localStorage.removeItem('detail_template_task');
                    },
                    err => {
                      console.log(err.error);
                      this.dataService.showLoading(false);
                    }
                  )
                });
              } else {
                this.taskTemplateService.put(body, { template_id: this.detailTask.id }).subscribe(
                  res => {
                    this.dataService.showLoading(false);
                    this.dialogService.openSnackBar({ message: "Data Berhasil Diubah" });
                    this.router.navigate(['dte', 'template-task']);

                    window.localStorage.removeItem('detail_template_task');
                  },
                  err => {
                    console.log(err.error);
                    this.dataService.showLoading(false);
                  }
                )
              }
            },
            err => {
              console.log(err.error);
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
              this.taskTemplateService.put(body, { template_id: this.detailTask.id }).subscribe(
                res => {
                  this.dataService.showLoading(false);
                  this.dialogService.openSnackBar({ message: "Data Berhasil Diubah" });
                  this.router.navigate(['dte', 'template-task']);

                  window.localStorage.removeItem('detail_template_task');
                },
                err => {
                  console.log(err.error);
                  this.dataService.showLoading(false);
                }
              )
            });
          } else {
            this.taskTemplateService.put(body, { template_id: this.detailTask.id }).subscribe(
              res => {
                this.dataService.showLoading(false);
                this.dialogService.openSnackBar({ message: "Data Berhasil Diubah" });
                this.router.navigate(['dte', 'template-task']);

                window.localStorage.removeItem('detail_template_task');
              },
              err => {
                console.log(err.error);
                this.dataService.showLoading(false);
              }
            )
          }
        }
      } else {
        this.taskTemplateService.put(body, { template_id: this.detailTask.id }).subscribe(
          res => {
            this.dataService.showLoading(false);
            this.dialogService.openSnackBar({ message: "Data Berhasil Diubah" });
            this.router.navigate(['dte', 'template-task']);

            window.localStorage.removeItem('detail_template_task');
          },
          err => {
            console.log(err.error);
            this.dataService.showLoading(false);
          }
        )
      }

    } else {
      commonFormValidator.validateAllFields(this.templateTaskForm);
      if (this.templateTaskForm.controls['name'].invalid || this.templateTaskForm.controls['description'].invalid || this.templateTaskForm.controls['material_description'].invalid)
        return this.dialogService.openSnackBar({ message: 'Silakan lengkapi data terlebih dahulu!' });

      if (this.templateTaskForm.get('image').invalid)
        return this.dialogService.openSnackBar({ message: 'Gambar untuk template tugas belum dipilih!' });

      if (this.templateTaskForm.get('questions').invalid)
        return this.dialogService.openSnackBar({ message: 'Pertanyaan belum dibuat, minimal ada satu pertanyaan!' })
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

}
