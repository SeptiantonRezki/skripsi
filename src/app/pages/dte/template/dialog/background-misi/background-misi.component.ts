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
    if (this.judulMisi.length > 120){
      this.judulMisi = this.judulMisi.slice(0, 120) + "...";
    }
  }

  ngOnChanges(changes: SimpleChanges){
    if (changes.judulMisi.currentValue.length > 120){
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
    // console.log('value => ', value);
    const file = value;

    if (file) {
      if (file.type.indexOf('image') > -1){
        this.fileType = 'image';
        this.submit();
      }
    }
  }
}
