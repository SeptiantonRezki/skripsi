import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { RcaAgentService } from 'app/services/rca-agent.service';

@Component({
  selector: 'app-route-plan-days-dialog',
  templateUrl: './route-plan-days-dialog.component.html',
  styleUrls: ['./route-plan-days-dialog.component.scss']
})
export class RoutePlanDaysDialogComponent implements OnInit {
  planDay: FormControl = new FormControl('', Validators.required);
  listDays: any[] = [
    { id: 'senin', name: 'Senin' },
    { id: 'selasa', name: 'Selasa' },
    { id: 'rabu', name: 'Rabu' },
    { id: 'kamis', name: 'Kamis' },
    { id: 'jumat', name: `Jumat` },
    { id: 'sabtu', name: 'Sabtu' },
    { id: 'minggu', name: 'Minggu' },
  ];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<RoutePlanDaysDialogComponent>,
    private dataService: DataService,
    private dialogService: DialogService,
    private rcaAgentService: RcaAgentService
  ) { }

  ngOnInit() {
  }

  submit() {
    if (this.planDay.valid) {
      this.dataService.showLoading(true);
      this.rcaAgentService.setRPMappingPosition({ position_id: this.data.position_id, kunjungan: this.planDay.value }).subscribe(res => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: "Data berhasil Disimpan!" });
        this.dialogRef.close(true);
      })
    } else {
      this.dialogService.openSnackBar({ message: "Lengkapi Pengisian Data!" });
    }
  }

  close() {
    this.dialogRef.close();
  }

}
