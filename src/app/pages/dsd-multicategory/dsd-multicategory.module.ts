import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { ngfModule } from 'angular-file';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PageGuard } from 'app/classes/auth.guard';
import { NgxMaskModule } from "ngx-mask";
import { TranslateModule } from '@ngx-translate/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';

import { MatButtonModule, 
  MatCheckboxModule, 
  MatIconModule, 
  MatFormFieldModule, 
  MatInputModule, 
  MatSelectModule, 
  MatStepperModule, 
  MatProgressBarModule, 
  MatProgressSpinnerModule, 
  MatTabsModule, 
  MatRadioModule,
  MatTooltipModule, 
  MatDatepickerModule,
  MatToolbarModule, 
  MatDialogModule, 
  MatSlideToggleModule,
  MatExpansionPanel, 
  MatExpansionModule, 
  MatMenuModule } from '@angular/material';

import { DSDMulticategoryRoutingModule } from './dsd-multicategory-routing.module';
import { PengaturanDsdComponent } from './pengaturan-dsd/index/pengaturan-dsd.component';
import { PengaturanDsdCreateComponent } from './pengaturan-dsd/create/pengaturan-dsd-create.component';
import { PengaturanDsdEditComponent } from './pengaturan-dsd/edit/pengaturan-dsd-edit.component';
import { PengaturanDsdDetailComponent } from './pengaturan-dsd/detail/pengaturan-dsd-detail.component';
import { TrsSystemVariableComponent } from './dsd-system-variable/trs-system-variable.component';
import { PengaturanDsdExecutorComponent } from './pengaturan-dsd/component/pengaturan-dsd-executor.component';
import { PengaturanDsdKecamatanComponent } from './pengaturan-dsd/component/pengaturan-dsd-kecamatan.component';
import { PengaturanDsdProductComponent } from './pengaturan-dsd/component/pengaturan-dsd-product.component';
import { TrsCancelReasonComponent } from './pengaturan-dsd/component/trs-cancel-reason.component';
import { ConfirmationDialogComponent } from './dsd-system-variable/confirmation-dialog/confirmation-dialog.component';
import { TrsReportComponent } from './dsd-report/trs-report.component';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  imports: [
    CommonModule,
    FuseSharedModule,
    SharedModule,
    DSDMulticategoryRoutingModule,
    NgxDatatableModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    MatToolbarModule,
    MatDialogModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatRadioModule,
    ngfModule,
    NgxMatSelectSearchModule,
    NgxMaskModule.forRoot(),
    MatExpansionModule,
    MatMenuModule,
    TranslateModule.forChild(),
  ],
  declarations: [PengaturanDsdComponent, PengaturanDsdCreateComponent, PengaturanDsdEditComponent, PengaturanDsdDetailComponent, TrsSystemVariableComponent, PengaturanDsdExecutorComponent, PengaturanDsdKecamatanComponent, PengaturanDsdProductComponent, TrsCancelReasonComponent, ConfirmationDialogComponent, TrsReportComponent],
  providers: [
    PengaturanDsdExecutorComponent,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    PageGuard
  ],
  entryComponents: [
    PengaturanDsdExecutorComponent,
    PengaturanDsdKecamatanComponent,
    PengaturanDsdProductComponent,
    TrsCancelReasonComponent,
    ConfirmationDialogComponent
  ],
})

export class DSDMulticategoryModule { }
