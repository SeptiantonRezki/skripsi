import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { Router } from '@angular/router';
import { GroupTradeProgramService } from 'app/services/dte/group-trade-program.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-group-trade-program-create',
  templateUrl: './group-trade-program-create.component.html',
  styleUrls: ['./group-trade-program-create.component.scss']
})
export class GroupTradeProgramCreateComponent implements OnInit {
  formGroupTradeProgram: FormGroup;
  formGroupTradeProgramError: any;

  listUserGroup: any[] = [{ name: "HMS", value: "HMS" }, { name: "NON HMS", value: "NON-HMS" }];
  files: File;
  validComboDrag: boolean;

  imageSku: any;
  imageSkuConverted: any;
  @ViewChild('screen') screen: ElementRef;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private groupTradeProgramService: GroupTradeProgramService
  ) {
    this.formGroupTradeProgramError = {
      name: {}
    };
  }

  ngOnInit() {
    this.formGroupTradeProgram = this.formBuilder.group({
      name: ["", Validators.required],
      user_group: [false],
      principal: [""]
    });
  }

  submit() {
    if (this.formGroupTradeProgram.valid) {
      if (this.files && this.files.size < 2000000) {
        this.dialogService.openSnackBar({ message: "Ukuran Gambar Max 2mb" });
        return;
      }

      this.dataService.showLoading(true);
      // let body = {
      //   name: this.formGroupTradeProgram.get('name').value,
      //   status: 'active'
      // }

      let fd = new FormData();
      fd.append('name', this.formGroupTradeProgram.get('name').value);
      fd.append('status', 'active');
      fd.append('type', this.formGroupTradeProgram.get('user_group').value ? 'NON-HMS' : 'HMS');
      if (this.files) fd.append('image', this.files);
      fd.append('principal', this.formGroupTradeProgram.get('user_group').value ? this.formGroupTradeProgram.get('principal').value : '');

      this.groupTradeProgramService.create(fd).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({
          message: "Data berhasil disimpan!"
        });
        this.router.navigate(['dte', 'group-trade-program']);
      }, err => {
        console.log('err', err);
        this.dataService.showLoading(false);
      })
    } else {
      commonFormValidator.validateAllFields(this.formGroupTradeProgram);

      this.dialogService.openSnackBar({ message: "Silahkan lengkapi data terlebih dahulu!" });
    }
  }

  removeImage(): void {
    this.files = undefined;
  }

  changeImage(evt) {
    this.readThis(evt);
  }

  readThis(inputValue: any): void {
    var file: File = inputValue;
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.imageSku = myReader.result;
    }

    myReader.readAsDataURL(file);
  }

  convertCanvasToImage(canvas) {
    let image = new Image();
    image.src = canvas.toDataURL("image/jpeg");

    return image.src;
  }

}
