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
import { Observable, Subject } from 'rxjs';
import { ProductService } from 'app/services/sku-management/product.service';
import { startWith, map } from 'rxjs/operators';

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

  listChoose: Array<any> = [
    { name: "Jawaban Singkat", value: "text", icon: "short_text" },
    { name: "Paragraf", value: "textarea", icon: "notes" },
    { name: "Pilihan Ganda", value: "radio", icon: "radio_button_checked" },
    { name: "Kotak Centang", value: "checkbox", icon: "check_box" },
    { name: "Unggah Gambar", value: "image", icon: "cloud_upload" },
    { name: "Angka", value: "numeric", icon: "dialpad" },
    { name: "Pilihan Tanggal", value: "date", icon: "date_range" },
    { name: "Stock Check", value: "stock_check", icon: "insert_chart" }
  ];
  shareable: FormControl = new FormControl(false);
  isIRTemplate: FormControl = new FormControl(false);

  @ViewChild("autosize")
  autosize: CdkTextareaAutosize;

  saveData: Boolean;
  valueChange: Boolean;
  isDetail: Boolean;

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
    private productService: ProductService
  ) {
    this.saveData = false;
    this.templateTaskFormError = {
      name: {},
      description: {},
      image: {}
    }

    activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    })

    this.detailTask = this.dataService.getFromStorage('detail_template_task');
  }

  ngOnInit() {
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
      image: [""],
      video: [""],
      material: false,
      material_description: ["", Validators.required],
      questions: this.formBuilder.array([], Validators.required),
      rejected_reason_choices: this.formBuilder.array([], Validators.required)
    })

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

    this.templateTaskForm.get('name').setValue(this.detailTask.name);
    this.templateTaskForm.get('description').setValue(this.detailTask.description);
    this.templateTaskForm.get('material').setValue(this.detailTask.material === 'yes' ? true : false);
    this.templateTaskForm.get('material_description').setValue(this.detailTask['material_description'] ? this.detailTask['material_description'] : 'Jenis Material');
    this.templateTaskForm.get('image').setValue(this.detailTask.image? this.detailTask.image_url : '');
    this.templateTaskForm.get('video').setValue(this.detailTask.video? this.detailTask.video_url : '');
    this.frmIsBranching.setValue(this.detailTask.is_branching === 1 ? true : false);
    this.shareable.setValue(this.detailTask.is_shareable == 1 ? true : false);
    this.isIRTemplate.setValue(this.detailTask.is_ir_template == 1 ? true : false);

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
      questions.push(this.formBuilder.group({
        id: item.id,
        question: item.question,
        question_image: item['question_image'] ? item['question_image'] : '',
        question_video: item['question_video'] ? item['question_video'] : '',
        type: item.type,
        typeSelection: this.listChoose.filter(val => val.value === item.type)[0],
        // required: item.required,
        additional: this.formBuilder.array(
          item.additional.map((itm, idx) => {
            return this.formBuilder.group({ option: itm, next_question: item.possibilities && item.possibilities.length > 0 ? item.possibilities[idx].next : '' })
          })
        )
      }));
      this.allQuestionList.push({
        id: item.id,
        question: item.question,
        is_next_question: item.is_next_question == 1 ? true : false,
        possibilities: item.possibilities && item.possibilities.map(pb => ({
          ...pb,
          isBranching: pb.next !== null ? true : false
        }))
      });
      console.log('aall Questions', this.templateTaskForm.get('questions').value);
      this.listDirectBelanja[index] = item.type === 'stock_check' ? item.stock_check_data.directly : false;
    });
    console.log('asdakdj', this.listProductSelected, this.allQuestionList);
    this.detailTask['rejected_reason_choices'].map(item => {
      return rejected.push(this.formBuilder.group({ reason: item }))
    })

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

  changeType(item, idx?) {
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

  addQuestion(): void {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let newId = _.max(questions.value, function (item) { return item.id });

    questions.push(this.formBuilder.group({
      id: newId.id + 1,
      question: `Pertanyaan`,
      type: 'radio',
      typeSelection: this.formBuilder.group({ name: "Pilihan Ganda", value: "radio", icon: "radio_button_checked" }),
      additional: this.formBuilder.array([this.createAdditional()]),
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
    this.findQuestionsHasNext();
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
      let questionsIsEmpty = [];
      let body = {
        _method: 'PUT',
        name: this.templateTaskForm.get('name').value,
        description: this.templateTaskForm.get('description').value,
        material: this.templateTaskForm.get('material').value ? 'yes' : 'no',
        material_description: this.templateTaskForm.get('material').value ? this.templateTaskForm.get('material_description').value : '',
        image: this.templateTaskForm.get('image').value? this.templateTaskForm.get('image').value : '',
        video: this.detailTask.video? this.detailTask.video : '',
        is_branching: this.frmIsBranching.value ? 1 : 0,
        is_shareable: this.shareable.value ? 1 : 0,
        is_ir_template: this.isIRTemplate.value ? 1 : 0,
        questions: questions.map((item, index) => {
          // if (item.question_image) {
          console.log('item.type', item.type);
          if (item.type === 'stock_check' && (this.listProductSelected[index] && this.listProductSelected[index].sku_id == null || this.listProductSelected[index].sku_id == "")) {
            questionsIsEmpty.push({ qId: item.id });
          }
          let isNext = this.filteredNext.find(nxt => nxt.next == item.id);
          return {
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
            // required: item.required,
            question_image: item.question_image || '',
            question_video: item.question_video || '',
            additional: item.type !== 'stock_check' ? item.additional.map(item => item.option) : ["Ada", "Tidak Ada"],
            stock_check_data: item.type === 'stock_check' ? ({
              sku_id: this.listProductSelected[index].sku_id,
              name: this.listProductSelected[index].name,
              directly: this.listDirectBelanja[index]
            }) : null
          }
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
      if (this.templateTaskForm.get('video').value && this.videoMaster || this.questionVideo.length > 0) {
        if (this.videoMaster) {
        let bodyMasterVideo = new FormData();
        bodyMasterVideo.append('file', this.videoMaster);
        this.taskTemplateService.uploadVideo(bodyMasterVideo).subscribe(
          async res => {
            body.video = res.data;
            if (this.questionVideo.length > 0) {
              const promise1 = await this.questionVideo.map(async(qv) => {
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
            const promise1 = await this.questionVideo.map(async(qv) => {
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
