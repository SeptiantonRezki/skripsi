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
import { Observable, Subject } from "rxjs";
import { ProductService } from "app/services/sku-management/product.service";
import { startWith, map } from "rxjs/operators";

@Component({
  selector: "app-template-create",
  templateUrl: "./template-create.component.html",
  styleUrls: ["./template-create.component.scss"]
})
export class TemplateCreateComponent {
  templateTaskForm: FormGroup;
  templateTaskFormError: any;
  dialogRef: any;

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

  @ViewChild("autosize")
  autosize: CdkTextareaAutosize;

  saveData: Boolean;
  valueChange: Boolean;
  duplicateTask: any;
  product: FormControl = new FormControl("");
  listProductSkuBank: Array<any>;
  filteredSkuOptions: Observable<string[]>;
  keyUp = new Subject<string>();
  stockOptionCtrl: FormControl = new FormControl();
  stockOptions = ["Ada", "Tidak Ada"];

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
    private taskTemplateService: TemplateTaskService,
    private dataService: DataService,
    private productService: ProductService
  ) {
    this.duplicateTask = this.dataService.getFromStorage('duplicate_template_task');

    this.saveData = false;
    this.templateTaskFormError = {
      name: {},
      description: {},
      image: {}
    }
  }

  ngOnInit() {
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
      description: ["", Validators.required],
      image: [""],
      material: false,
      material_description: ["", Validators.required],
      questions: this.formBuilder.array([], Validators.required),
      rejected_reason_choices: this.formBuilder.array([this.createRejectedReson()], Validators.required)
    })

    this.templateTaskForm.valueChanges.subscribe(res => {
      commonFormValidator.parseFormChanged(this.templateTaskForm, this.templateTaskFormError);
    })

    this.templateTaskForm.get('material_description').disable();

    if (this.duplicateTask) this.setValue();

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

    // if (filteredItem.length == 0) {
    //   this.product = undefined;
    // }
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

  displayProductName(param?): any {
    return param ? param.name : param;
  }

  setValue() {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let rejected = this.templateTaskForm.get('rejected_reason_choices') as FormArray;

    this.templateTaskForm.get('name').setValue(this.duplicateTask.name);
    this.templateTaskForm.get('description').setValue(this.duplicateTask.description);
    this.templateTaskForm.get('material').setValue(this.duplicateTask.material === 'yes' ? true : false);
    this.templateTaskForm.get('material_description').setValue(this.duplicateTask['material_description'] ? this.duplicateTask['material_description'] : 'Jenis Material');
    this.templateTaskForm.get('image').setValue(this.duplicateTask.image_url);
    this.duplicateTask['questions'].map(item => {
      questions.push(this.formBuilder.group({
        id: item.id,
        question: item.question,
        question_image: item['question_image'] ? item['question_image'] : '',
        type: item.type,
        typeSelection: this.listChoose.filter(val => val.value === item.type)[0],
        // required: item.required,
        additional: this.formBuilder.array(
          item.additional.map(item => {
            return this.formBuilder.group({ option: item })
          })
        )
      }))
    })

    if (this.duplicateTask.material === 'no')
      this.templateTaskForm.get('material_description').disable();
    else
      this.templateTaskForm.get('material_description').enable();

    this.duplicateTask['rejected_reason_choices'].map(item => {
      return rejected.push(this.formBuilder.group({ reason: item }))
    })
  }

  addAdditional(idx) {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let additional = questions.at(idx).get('additional') as FormArray;

    additional.push(this.formBuilder.group({ option: `Opsi ${additional.length + 1}` }));
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
      return additional.at(additionalIdx).get('option').setValue(text + (additionalIdx + 1));
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

  defineQuestion(): FormGroup {
    return this.formBuilder.group({
      id: 1,
      question: `Pertanyaan`,
      type: 'radio',
      typeSelection: this.formBuilder.group({ name: "Pilihan Ganda", value: "radio", icon: "radio_button_checked" }),
      additional: this.formBuilder.array([this.createAdditional()]),
      question_image: ['']
    })
  }

  addQuestion(): void {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let newId = _.max(questions.value, function (item) { return item.id })
    if (newId === -Infinity) newId = { id: 0 }

    questions.push(this.formBuilder.group({
      id: newId.id + 1,
      question: `Pertanyaan`,
      type: 'radio',
      typeSelection: this.formBuilder.group({ name: "Pilihan Ganda", value: "radio", icon: "radio_button_checked" }),
      additional: this.formBuilder.array([this.createAdditional()]),
      question_image: [''],
      // others: false,
      // required: false
    }))
  }

  addRejectedReason() {
    let rejected_reason = this.templateTaskForm.get('rejected_reason_choices') as FormArray;
    rejected_reason.push(this.formBuilder.group({ reason: `Alasan ${rejected_reason.length + 1}` }))
  }

  createAdditional(): FormGroup {
    return this.formBuilder.group({ option: 'Opsi 1' })
  }

  createRejectedReson(): FormGroup {
    return this.formBuilder.group({ reason: 'Alasan 1' })
  }

  addOthers(idx): void {
    // this.dataTemplateTask.questions[idx].others = !this.dataTemplateTask.questions[idx].others;
  }

  deleteQuestion(idx): void {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    questions.removeAt(idx);
  }

  deleteReason(idx): void {
    let rejected_reason_choices = this.templateTaskForm.get('rejected_reason_choices') as FormArray;
    rejected_reason_choices.removeAt(idx);
  }

  deleteAdditional(idx1?, idx2?): void {
    let questions = this.templateTaskForm.get('questions') as FormArray;
    let additional = questions.at(idx1).get('additional') as FormArray;

    additional.removeAt(idx2);
  }

  submit(): void {
    console.log(this.templateTaskForm);
    if (this.templateTaskForm.valid) {
      // this.saveData = !this.saveData;
      this.saveData = true;
      let questions: any[] = this.templateTaskForm.get('questions').value;
      let rejected_reason: any[] = this.templateTaskForm.get('rejected_reason_choices').value;

      let body = {
        name: this.templateTaskForm.get('name').value,
        description: this.templateTaskForm.get('description').value,
        material: this.templateTaskForm.get('material').value ? 'yes' : 'no',
        material_description: this.templateTaskForm.get('material').value ? this.templateTaskForm.get('material_description').value : '',
        image: this.templateTaskForm.get('image').value,
        questions: questions.map((item, index) => {
          // if (item.question_image) {
          return {
            id: item.id,
            question: item.question,
            type: item.type,
            // required: item.required,
            question_image: item.question_image || '',
            additional: item.type === 'radio' || item.type === 'checkbox' ? item.additional.map(item => item.option) : []
          }
          // }
          // return {
          //   id: item.id,
          //   question: item.question,
          //   type: item.type,
          //   // required: item.required,
          //   additional: item.additional.map(item => item.option)
          // }
        }),
        rejected_reason_choices: rejected_reason.map(item => item.reason)
      }

      this.taskTemplateService.create(body).subscribe(
        res => {
          this.dialogService.openSnackBar({ message: "Data Berhasil Disimpan" });
          this.router.navigate(['dte', 'template-task']);
        },
        err => {
          console.log(err.error)
        }
      )

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
    dialogConfig.data = { password: 'P@ssw0rd' };

    this.dialogRef = this.dialog.open(UploadImageComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        switch (type) {
          case 'master':
            this.templateTaskForm.get('image').setValue(response);
            break;
          case 'question':
            let questions = this.templateTaskForm.get('questions') as FormArray;
            questions.at(idx).get('question_image').setValue(response);
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
        break;
      case 'question':
        let questions = this.templateTaskForm.get('questions') as FormArray;
        questions.at(idx).get('question_image').setValue('');
        break;
      default:
        break;
    }
  }
}
