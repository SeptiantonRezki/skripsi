import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupTradeProgramService } from 'app/services/dte/group-trade-program.service';
import { commonFormValidator } from 'app/classes/commonFormValidator';

@Component({
  selector: 'app-group-trade-program-edit',
  templateUrl: './group-trade-program-edit.component.html',
  styleUrls: ['./group-trade-program-edit.component.scss']
})
export class GroupTradeProgramEditComponent implements OnInit {
  formGroupTradeProgram: FormGroup;
  formGroupTradeProgramError: any;
  isDetail: Boolean;
  detailGroupTradeProgram: any;
  listStatus: any[] = [{ name: 'Aktif', value: 'active' }, { name: 'Tidak Aktif', value: 'inactive' }]
  formStatus: FormControl = new FormControl('');
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
    private groupTradeProgramService: GroupTradeProgramService,
    private activatedRoute: ActivatedRoute
  ) {
    this.formGroupTradeProgramError = {
      name: {}
    };
    this.activatedRoute.url.subscribe(params => {
      this.isDetail = params[1].path === 'detail' ? true : false;
    });

    this.detailGroupTradeProgram = this.dataService.getFromStorage("detail_group_trade_program");
  }

  ngOnInit() {
    this.formGroupTradeProgram = this.formBuilder.group({
      name: ["", Validators.required],
      user_group: [false],
      principal: [""]
    });

    this.formGroupTradeProgram.setValue({
      name: this.detailGroupTradeProgram.name,
      user_group: this.detailGroupTradeProgram.type == 'HMS' ? false : true,
      principal: this.detailGroupTradeProgram.principal
    });
    this.formStatus.setValue(this.detailGroupTradeProgram.status);

    if (this.isDetail) {
      this.formGroupTradeProgram.disable();
      this.formStatus.disable();
    }
  }

  submit() {
    if (this.formGroupTradeProgram.valid) {
      this.dataService.showLoading(true);
      // let body = {
      //   name: this.formGroupTradeProgram.get('name').value,
      //   status: this.formStatus.value
      // }

      let fd = new FormData();
      // fd.append('_method', 'POST');
      fd.append('name', this.formGroupTradeProgram.get('name').value);
      fd.append('status', this.formStatus.value);
      fd.append('type', this.formGroupTradeProgram.get('user_group').value ? 'NON-HMS' : 'HMS');
      fd.append('image', this.files ? this.files : '');
      fd.append('principal', this.formGroupTradeProgram.get('user_group').value ? this.formGroupTradeProgram.get('principal').value : '');

      this.groupTradeProgramService.put(fd, { group_id: this.detailGroupTradeProgram.id }).subscribe(res => {
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
