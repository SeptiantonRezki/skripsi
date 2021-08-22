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
    this.fileCopied = file;
    let reader = new FileReader();
    reader.onload = (event) => {
      this.fileUrl = (<FileReader>event.target).result;
    };
    reader.readAsDataURL(file);
  }

  submit() {
    if (this.files && this.files.size <= 2000000) {
      let reader = new FileReader();
      let file = this.files;
      reader.onload = () => {
        this.dialogRef.close({ src: reader.result, file: this.fileCopied });
      };
      reader.readAsDataURL(file);
    } else {
      this.dialogService.openSnackBar({
        message: "Ukuran gambar melebihi 2MB",
      });
    }
  }
}
