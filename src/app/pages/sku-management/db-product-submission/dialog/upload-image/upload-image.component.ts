import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material";
import { DialogService } from "app/services/dialog.service";

@Component({
  selector: "submission-upload-image",
  templateUrl: "./upload-image.component.html",
  styleUrls: ["./upload-image.component.scss"],
})
export class UploadImageComponent implements OnInit {
  imageSize: number = 2000; // 2000kb, 2mb
  imageWidth: number = 800; // 800px
  imageHeight: number = 800; // 800px
  invalid: boolean = false;
  files: File;
  validComboDrag: boolean;
  upload: FormGroup;
  fileCopied: any;
  fileUrl: any;

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<UploadImageComponent>
  ) {}

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.upload = this.formBuilder.group({
      image: [""],
    });
  }

  removeImage() {
    this.files = undefined;
  }

  selectFile(file: any) {
    if (!file) return;
    this.invalid = false;
    if (this.files.size <= this.imageSize * 1024) {
      this.fileCopied = file;
      let reader = new FileReader();
      reader.onload = (event) => {
        this.fileUrl = (<FileReader>event.target).result;
        let preview = new Image();
        preview.onload = () => {
          if (preview.width > this.imageWidth || preview.height > this.imageHeight) {
            this.invalid = true;
            this.dialogService.openSnackBar({
              message: "Ukuran gambar melebihi 800x800 piksel",
            });
          }
        }
        preview.src = this.fileUrl;
      };
      reader.readAsDataURL(file);
    } else {
      this.invalid = true;
      this.dialogService.openSnackBar({
        message: "Ukuran gambar melebihi 2MB",
      });
    }
  }

  submit() {
    let reader = new FileReader();
    let file = this.files;
    reader.onload = () => {
      this.dialogRef.close({ src: reader.result, file: this.fileCopied });
    };
    reader.readAsDataURL(file);
  }
}
