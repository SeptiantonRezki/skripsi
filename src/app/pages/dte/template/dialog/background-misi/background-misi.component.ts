import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { DialogService } from 'app/services/dialog.service';

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
  
  constructor(
    private dialogService: DialogService,
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
        this.dialogService.openSnackBar({ message: 'Ukuran gambar melebihi 2MB'});
      }
    }
  }

  onSelectFile(value: any) {
    console.log('value => ', value);
    console.log('files => ', this.files);
    const file = value;

    if (file) {
      if (file.type.indexOf('image') > -1){
        this.fileType = 'image';
        this.submit();
      }
    }
  }

  onSelectFileMultiple() {
    let isOverSize = false;
    let newFile = [];

    if (this.currentFiles.length === Number(this.isMultiple)) {
      this.dialogService.openSnackBar({ message: `Maksimal ${this.isMultiple} gambar`});
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
    if (isOverSize) this.dialogService.openSnackBar({ message: 'Ukuran gambar maksimal 2MB'});

    const restImage = Number(this.isMultiple) - this.currentFiles.length;
    if (restImage < newFile.length) {
      newFile = newFile.slice(0, restImage);
      this.dialogService.openSnackBar({ message: `Maksimal ${this.isMultiple} gambar`});
    }

    this.currentFiles = [...this.currentFiles, ...newFile];
    this.submitMultiple();
  }

  submitMultiple(){
    this.selectedFiles = [];
    
    const newFile = [...this.currentFiles];
    newFile.forEach((file) => {
      if (file instanceof File){
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          file['image_url'] = reader.result;
        };
      }
    });

    this.currentFiles = [...newFile];
    this.upload.emit(this.currentFiles);
  }

  removeImageGuideline(index){
    const newFile = [...this.currentFiles];
    newFile.splice(index, 1);
    this.currentFiles = [...newFile];
    this.upload.emit(this.currentFiles);
  }
}
