import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { RcaAgentService } from 'app/services/rca-agent.service';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-position-code-dialog',
  templateUrl: './position-code-dialog.component.html',
  styleUrls: ['./position-code-dialog.component.scss']
})
export class PositionCodeDialogComponent implements OnInit {
  positionCode: FormControl = new FormControl('', Validators.required);
  listPositionCodes: any[] = [];
  public filterPosition: FormControl = new FormControl('');
  public filteredPosition: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  private _onDestroy = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PositionCodeDialogComponent>,
    private rcaAgentService: RcaAgentService,
    private dataService: DataService,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    this.rcaAgentService.getRPPositionCode({ perPage: 30, area_code: this.data.area_code }).subscribe(
      (res) => {
        console.log("res missions", res.data);
        this.listPositionCodes = res.data;
        this.filteredPosition.next(this.listPositionCodes.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    );

    this.filterPosition.valueChanges
      .debounceTime(500)
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringPosition();
      });
  }

  filteringPosition() {
    if (!this.listPositionCodes) {
      return;
    }
    // get the search keyword
    let search = this.filterPosition.value;
    let pagination = {}
    pagination['per_page'] = 30;
    pagination['search'] = search;
    pagination['area_code'] = this.data.area_code

    this.rcaAgentService.getRPPositionCode(pagination).subscribe(
      (res) => {
        console.log("res missions", res.data);
        this.listPositionCodes = res.data;
        this.filteredPosition.next(this.listPositionCodes.slice());
      },
      (err) => {
        console.log("err ", err);
      }
    );
    // filter the banks
    this.filteredPosition.next(
      this.listPositionCodes.filter(item => item.code ? item.code.toLowerCase().indexOf(search) > -1 : item.code.indexOf(search))
    );
  }

  submit() {
    if (this.positionCode.valid) {
      this.dataService.showLoading(true);
      this.rcaAgentService.setMappingPosition({ business_id: this.data.id, position_id: this.positionCode.value }).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: "Data Berhasil Disimpan!" });
        this.dialogRef.close(true);
      }, err => {
        this.dataService.showLoading(false);
      })
    } else {
      this.dialogService.openSnackBar({ message: "Lengkapi Pengisian terlebih dahulu!" });
    }
  }

  close() {
    this.dialogRef.close()
  }

}
