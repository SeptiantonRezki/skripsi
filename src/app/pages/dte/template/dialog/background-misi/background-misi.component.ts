import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'app/services/dialog.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";

@Component({
  selector: 'app-background-misi',
  templateUrl: './background-misi.component.html',
  styleUrls: ['./background-misi.component.scss']
})
export class BackgroundMisiComponent implements OnInit {

  files: File;
  isSize: boolean = false;
  fileType: string;
  file_copied: any;
  @Output() upload = new EventEmitter();
  @Input() colorFont: any;
  @Input() judulMisi: string;
  @Input() bgMisi: any;
  @Input() isDetail: any;

  @Input() isMultiple: any;
  selectedFiles: any;
  @Input() currentFiles: any = [];
  guidelineForm: FormGroup;
  
  constructor(
    private dialogService: DialogService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    if (this.bgMisi) {
      this.isSize = true;
    }
    if (!this.colorFont) {
      this.colorFont = "#ffffff"
    }
    if (this.judulMisi && this.judulMisi.length > 120){
      this.judulMisi = this.judulMisi.slice(0, 120) + "...";
    }

    setTimeout(() => {
      document.getElementById("bg-misi").getElementsByTagName("input")[0].id = "upload-file-misi";
    }, 500);

    this.guidelineForm = this.formBuilder.group({
      guideline: this.formBuilder.array([], Validators.required),
    });

    this.guidelineForm.valueChanges.debounceTime(500).subscribe(res => {
      this.upload.emit({images: this.currentFiles, forms: this.guidelineForm.get('guideline').value});
    });

    if (this.currentFiles) {
      this.setValueGuideline(); 
    }
  }

  ngOnChanges(changes: SimpleChanges){
    if (changes.judulMisi && changes.judulMisi.currentValue.length > 120){
      this.judulMisi = this.judulMisi.slice(0, 120) + "...";
    }
  }

  removeImage(): void {
    this.files = undefined;
    this.bgMisi = undefined;
    this.isSize = false;
    this.colorFont = "#ffffff";
    this.upload.emit({image: '', color: ''});
  }

  submit() {
    if (this.files && this.files.size <= 2000000 && this.fileType == 'image') {
      this.isSize = true;
      let reader = new FileReader();
      let file = this.files;
      reader.readAsDataURL(file);      

      reader.onload = () => {
        this.bgMisi = reader.result;
        this.upload.emit({image: reader.result, color: this.colorFont});
      };
      
    } else {
      if (this.bgMisi) {
        this.upload.emit({image: this.bgMisi, color: this.colorFont});
      }
      else{
        this.isSize = false;
        this.upload.emit({image: '', color: ''});
        this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.image_size_limit', {size: '2MB'}) });
      }
    }
  }

  onSelectFile(value: any) {
    const file = value;

    if (file) {
      if (file.type.indexOf('image') > -1){
        this.fileType = 'image';
        this.submit();
      }
    }
  }

  onSelectFileMultiple() {
    let guideline = this.guidelineForm.get('guideline') as FormArray;
    let isOverSize = false;
    let newFile = [];

    if (this.currentFiles.length === Number(this.isMultiple)) {
      this.dialogService.openSnackBar({ message: this.translate.instant('global.label.max_count_image', {count: this.isMultiple}) });
      this.selectedFiles = [];
      return;
    }

    this.selectedFiles.forEach(item => {
      if (item.size > 2000000) {
        isOverSize = true;
      } else {
        newFile.push(item);
      }
    });
    if (isOverSize) this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.image_size_limit', {size: '2MB'}) });

    const restImage = Number(this.isMultiple) - this.currentFiles.length;
    if (restImage < newFile.length) {
      newFile = newFile.slice(0, restImage);
      this.dialogService.openSnackBar({ message: this.translate.instant('global.label.max_count_image', {count: this.isMultiple}) });
    }

    newFile.forEach(item => {
      guideline.push(this.formBuilder.group({
        file: [''],
        description: [''],
      }));
    });

    this.currentFiles = [...this.currentFiles, ...newFile];
    this.submitMultiple();
  }

  submitMultiple(){
    let guideline = this.guidelineForm.get('guideline') as FormArray;
    this.selectedFiles = [];
    
    const newFile = [...this.currentFiles];
    newFile.forEach((file, idx) => {
      if (file instanceof File){
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          file['image_url'] = reader.result;
          guideline.at(idx).get('file').setValue(reader.result);
        };
      }
    });

    this.currentFiles = [...newFile];
    this.upload.emit({images: this.currentFiles, forms: this.guidelineForm.get('guideline').value});
  }

  removeImageGuideline(index){
    let guideline = this.guidelineForm.get('guideline') as FormArray;
    guideline.removeAt(index);

    const newFile = [...this.currentFiles];
    newFile.splice(index, 1);
    this.currentFiles = [...newFile];

    this.upload.emit({images: this.currentFiles, forms: this.guidelineForm.get('guideline').value});
  }

  setValueGuideline(){
    let guideline = this.guidelineForm.get('guideline') as FormArray;

    this.currentFiles.forEach((item, idx) => {
      guideline.push(this.formBuilder.group({
        file: [item.image_url],
        description: [item.description],
      }));
    });
  };
}
