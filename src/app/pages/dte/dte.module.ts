import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { DteRoutingModule } from "./dte-routing.module";
import { TemplateIndexComponent } from "./template/index/template-index.component";
import { TemplateCreateComponent } from "./template/create/template-create.component";
import { TemplateEditComponent } from "./template/edit/template-edit.component";
import { TradeIndexComponent } from "./trade/index/trade-index.component";
import { TradeCreateComponent } from "./trade/create/trade-create.component";
import { TradeEditComponent } from "./trade/edit/trade-edit.component";
import { ScheduleProgramIndexComponent } from "./schedule-program/index/schedule-program-index.component";
import { ScheduleProgramCreateComponent } from "./schedule-program/create/schedule-program-create.component";
import { ScheduleProgramDetailComponent } from "./schedule-program/detail/schedule-program-detail.component";
import { AudienceIndexComponent } from "./audience/index/audience-index.component";
import { AudienceCreateComponent } from "./audience/create/audience-create.component";
import { AudienceEditComponent } from "./audience/edit/audience-edit.component";
import {
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatOptionModule,
  MatCheckboxModule,
  MatSelectModule,
  MatTabsModule,
  MatTooltipModule,
  MatButtonModule,
  MatSlideToggleModule,
  MatMenuModule,
  MatToolbarModule,
  MatDialogModule,
  MatDatepickerModule,
  MatAutocompleteModule,
  MatRadioModule,
  MatProgressBarModule,
  MatDividerModule,
  MatProgressSpinnerModule,
  MatChipsModule,
  MatBadgeModule,
  MatTableModule,
  MatCardModule,
  MatGridListModule
} from "@angular/material";
import { FuseSharedModule } from "@fuse/shared.module";
import { SharedModule } from "app/shared/shared.module";
import { UploadImageComponent } from "./template/dialog/upload-image/upload-image.component";
import { ngfModule } from "angular-file";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";

import { MomentDateAdapter } from "@angular/material-moment-adapter";
import {
  ListTradeProgramResolver,
  ListTemplateResolver,
  ListSchedulerResolver,
  ListRetailerResolver,
} from "../../resolver/dte.resolver";
import { PageGuard } from "app/classes/auth.guard";

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";

import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";

import { ListAudienceDialogComponent } from "./schedule-program/dialog/list-audience-dialog.component";
import { PendingChangesGuard } from "app/pages/dte/dte.guard";
import { NgxMatSelectSearchModule } from "../../../../node_modules/ngx-mat-select-search";
import { NgxCurrencyModule } from "ngx-currency";
import { RupiahFormaterPipe } from "@fuse/pipes/rupiah-formater";
import { ScheduleProgramEditComponent } from "./schedule-program/edit/schedule-program-edit.component";
import { ImportAudienceDialogComponent } from "./audience/import/import-audience-dialog.component";
import { ImportCoinComponent } from "./schedule-program/import-coin/import-coin.component";
import { AudienceTradeProgramComponent } from "./automation/create/audience-trade-program.component";
import { EOrderComponent } from "./automation/create/e-order/e-order.component";
import { AudienceTradeProgramIndexComponent } from "./automation/index/audience-trade-program-index.component";
import { AudienceTradeProgramEditComponent } from "./automation/edit/audience-trade-program-edit.component";
import { EOrderEditComponent } from "./automation/edit/eorder-edit/eorder-edit.component";
import { GroupTradeProgramComponent } from "./group-trade-program/index/group-trade-program.component";
import { GroupTradeProgramCreateComponent } from "./group-trade-program/create/group-trade-program-create.component";
import { GroupTradeProgramEditComponent } from "./group-trade-program/edit/group-trade-program-edit.component";
import { TaskVerificationIndexComponent } from "./task-verification/index/task-verification-index.component";
import { TaskVerificationDetailComponent } from "./task-verification/detail/task-verification-detail.component";
import { ConfirmDialogComponent } from "./task-verification/dialog/confirm-dialog/confirm-dialog.component";
import { PengaturanAttributeMisiIndexComponent } from "./pengaturan-attribute-misi/index/pengaturan-attribute-misi-index.component";
import { TaskSequencingIndexComponent } from './task-sequencing/index/task-sequencing-index.component';
import { TaskSequencingCreateComponent } from './task-sequencing/create/task-sequencing-create.component';
import { TaskSequencingDuplicateComponent } from './task-sequencing/duplicate/task-sequencing-duplicate.component';
import { DialogToolboxComponent } from "./pengaturan-attribute-misi/index/dialog-toolbox/dialog-toolbox.component";
import { DialogTipeMisiComponent } from "./pengaturan-attribute-misi/index/dialog-tipe-misi/dialog-tipe-misi.component";
import { DialogKesulitanMisiComponent } from "./pengaturan-attribute-misi/index/dialog-kesulitan-misi/dialog-kesulitan-misi.component";
import { DialogKategoriMisiComponent } from "./pengaturan-attribute-misi/index/dialog-kategori-misi/dialog-kategori-misi.component";
import { TaskSequencingEditComponent } from "./task-sequencing/edit/task-sequencing-edit.component"
import { DialogToolboxEditComponent } from "./pengaturan-attribute-misi/index/dialog-toolbox-edit/dialog-toolbox-edit.component";
import { ListKategoriToolboxComponent } from "./pengaturan-attribute-misi/index/list-kategori-toolbox/list-kategori-toolbox.component"
import { ListTipeMisiComponent } from "./pengaturan-attribute-misi/index/list-tipe-misi/list-tipe-misi.component"
import { ListKesulitanMisiComponent } from "./pengaturan-attribute-misi/index/list-kesulitan-misi/list-kesulitan-misi.component";
import { ListKategoriMisiComponent } from "./pengaturan-attribute-misi/index/list-kategori-misi/list-kategori-misi.component";
import { DialogKategoriMisiEditComponent } from "./pengaturan-attribute-misi/index/dialog-kategori-misi-edit/dialog-kategori-misi-edit.component";
import { DialogKesulitanMisiEditComponent } from "./pengaturan-attribute-misi/index/dialog-kesulitan-misi-edit/dialog-kesulitan-misi-edit.component";
import { DialogTipeMisiEditComponent } from "./pengaturan-attribute-misi/index/dialog-tipe-misi-edit/dialog-tipe-misi-edit.component";
import { PengaturanAttributeMisiCreateComponent } from "./pengaturan-attribute-misi/create/pengaturan-attribute-misi-create.component";
import { LightboxModule } from 'ngx-lightbox';
import { MissionBuilderCreateComponent } from "./mission-builder/create/mission-builder-create.component";
import { MissionBuilderEditComponent } from "./mission-builder/edit/mission-builder-edit.component";
import { MissionBuilderDuplicateComponent } from "./mission-builder/duplicate/mission-builder-duplicate.component";
import { DiaglogMisiComponent } from "./mission-builder/create/diaglog-misi/diaglog-misi.component";
import { DiaglogPopUpNotifComponent } from "./mission-builder/create/diaglog-pop-up-notif/diaglog-pop-up-notif.component";
import { DiaglogPushNotifComponent } from "./mission-builder/create/diaglog-push-notif/diaglog-push-notif.component";
import { DiaglogWaktuTungguComponent } from "./mission-builder/create/diaglog-waktu-tunggu/diaglog-waktu-tunggu.component";
import { DialogYesNoComponent } from "./mission-builder/create/dialog-yes-no/dialog-yes-no.component"
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { DialogMisiEditComponent } from "./mission-builder/edit/dialog-misi-edit/dialog-misi-edit.component";
import { DialogPopUpNotifEditComponent } from "./mission-builder/edit/dialog-pop-up-notif-edit/dialog-pop-up-notif-edit.component";
import { DialogPushNotifEditComponent } from "./mission-builder/edit/dialog-push-notif-edit/dialog-push-notif-edit.component";
import { DialogWaktuTungguEditComponent } from "./mission-builder/edit/dialog-waktu-tunggu-edit/dialog-waktu-tunggu-edit.component";
import { DialogYesNoEditComponent } from "./mission-builder/edit/dialog-yes-no-edit/dialog-yes-no-edit.component";
import { DialogCoinComponent } from "./mission-builder/create/dialog-coin/dialog-coin.component";
import { DialogCoinEditComponent } from "./mission-builder/edit/dialog-coin-edit/dialog-coin-edit.component";
import { ImportTsmCoinComponent } from "./task-sequencing/import-coin/import-tsm-coin.component";
import { DialogCoinDuplicateComponent } from "./mission-builder/duplicate/dialog-coin-duplicate/dialog-coin-duplicate.component";
import { DialogMisiDuplicateComponent } from "./mission-builder/duplicate/dialog-misi-duplicate/dialog-misi-duplicate.component";
import { DialogPopUpNotifDuplicateComponent } from "./mission-builder/duplicate/dialog-pop-up-notif-duplicate/dialog-pop-up-notif-duplicate.component";
import { DialogWaktuTungguDuplicateComponent } from "./mission-builder/duplicate/dialog-waktu-tunggu-duplicate/dialog-waktu-tunggu-duplicate.component";
import { DialogPushNotifDuplicateComponent } from "./mission-builder/duplicate/dialog-push-notif-duplicate/dialog-push-notif-duplicate.component";



export const customCurrencyMaskConfig = {
  align: "left",
  allowNegative: false,
  allowZero: true,
  decimal: ",",
  precision: 0,
  prefix: "",
  suffix: "",
  thousands: ".",
  nullable: false,
};

export const MY_FORMATS = {
  parse: {
    dateInput: "LL",
  },
  display: {
    dateInput: "LL",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DteRoutingModule,
    FuseSharedModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule,
    MatTooltipModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatToolbarModule,
    MatDialogModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatRadioModule,
    ngfModule,
    NgxDatatableModule,
    MatDatepickerModule,
    MatProgressBarModule,
    NgxMatSelectSearchModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule,
    MatTableModule,
    MatCardModule,
    MatGridListModule,
    NgxMaterialTimepickerModule,
    NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
    LightboxModule,
    NgxGraphModule,
  ],
  declarations: [
    TemplateIndexComponent,
    TemplateCreateComponent,
    TemplateEditComponent,
    TradeIndexComponent,
    TradeCreateComponent,
    TradeEditComponent,
    ScheduleProgramIndexComponent,
    ScheduleProgramCreateComponent,
    ScheduleProgramEditComponent,
    ScheduleProgramDetailComponent,
    AudienceIndexComponent,
    AudienceCreateComponent,
    AudienceEditComponent,
    UploadImageComponent,
    ListAudienceDialogComponent,
    ImportAudienceDialogComponent,
    ImportCoinComponent,
    ImportTsmCoinComponent,
    AudienceTradeProgramComponent,
    EOrderComponent,
    AudienceTradeProgramIndexComponent,
    AudienceTradeProgramEditComponent,
    EOrderEditComponent,
    GroupTradeProgramComponent,
    GroupTradeProgramCreateComponent,
    GroupTradeProgramEditComponent,
    TaskVerificationIndexComponent,
    TaskVerificationDetailComponent,
    ConfirmDialogComponent,
    PengaturanAttributeMisiIndexComponent,
    PengaturanAttributeMisiCreateComponent,
    TaskSequencingIndexComponent,
    TaskSequencingCreateComponent,
    TaskSequencingDuplicateComponent,
    DialogToolboxComponent,
    DialogTipeMisiComponent,
    DialogKesulitanMisiComponent,
    DialogKategoriMisiComponent,
    TaskSequencingEditComponent,
    DialogToolboxEditComponent,
    ListKategoriToolboxComponent,
    ListTipeMisiComponent,
    ListKesulitanMisiComponent,
    ListKategoriMisiComponent,
    DialogKategoriMisiEditComponent,
    DialogKesulitanMisiEditComponent,
    DialogTipeMisiEditComponent,
    MissionBuilderCreateComponent,
    MissionBuilderEditComponent,
    MissionBuilderDuplicateComponent,
    DiaglogMisiComponent,
    DiaglogPopUpNotifComponent,
    DiaglogPushNotifComponent,
    DiaglogWaktuTungguComponent,
    DialogYesNoComponent,
    DialogMisiEditComponent,
    DialogPopUpNotifEditComponent,
    DialogPushNotifEditComponent,
    DialogWaktuTungguEditComponent,
    DialogYesNoEditComponent,
    DialogCoinComponent,
    DialogCoinEditComponent,
    DialogCoinDuplicateComponent,
    DialogMisiDuplicateComponent,
    DialogPopUpNotifDuplicateComponent,
    DialogWaktuTungguDuplicateComponent,
    DialogPushNotifDuplicateComponent
  ],
  exports: [
    TemplateIndexComponent,
    TemplateCreateComponent,
    TemplateEditComponent,
    TradeIndexComponent,
    TradeCreateComponent,
    TradeEditComponent,
    ScheduleProgramIndexComponent,
    ScheduleProgramCreateComponent,
    ScheduleProgramEditComponent,
    ScheduleProgramDetailComponent,
    AudienceIndexComponent,
    AudienceCreateComponent,
    AudienceEditComponent,
    TaskVerificationIndexComponent,
    TaskVerificationDetailComponent,
    PengaturanAttributeMisiIndexComponent,
    PengaturanAttributeMisiCreateComponent,
    TaskSequencingIndexComponent,
    TaskSequencingCreateComponent,
    TaskSequencingDuplicateComponent,
    TaskSequencingEditComponent,
    ListKategoriToolboxComponent,
    ListTipeMisiComponent,
    ListKesulitanMisiComponent,
    ListKategoriMisiComponent,
    DialogKategoriMisiEditComponent,
    DialogKesulitanMisiEditComponent,
    DialogTipeMisiEditComponent,
    MissionBuilderCreateComponent,
    MissionBuilderEditComponent,
    MissionBuilderDuplicateComponent,
    DiaglogMisiComponent,
    DiaglogPopUpNotifComponent,
    DiaglogPushNotifComponent,
    DiaglogWaktuTungguComponent,
    DialogMisiEditComponent,
    DialogPopUpNotifEditComponent,
    DialogPushNotifEditComponent,
    DialogWaktuTungguEditComponent,
    DialogYesNoEditComponent,
    DialogCoinComponent,
    DialogCoinEditComponent,
    DialogCoinDuplicateComponent,
    DialogMisiDuplicateComponent,
    DialogPopUpNotifDuplicateComponent,
    DialogWaktuTungguDuplicateComponent,
    DialogPushNotifDuplicateComponent
  ],
  providers: [
    RupiahFormaterPipe,
    PendingChangesGuard,
    ListTradeProgramResolver,
    ListTemplateResolver,
    ListSchedulerResolver,
    ListRetailerResolver,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    PageGuard,
  ],
  entryComponents: [
    UploadImageComponent,
    ListAudienceDialogComponent,
    ImportAudienceDialogComponent,
    ImportCoinComponent,
    ImportTsmCoinComponent,
    ConfirmDialogComponent,
    DialogToolboxComponent,
    DialogTipeMisiComponent,
    DialogKesulitanMisiComponent,
    DialogKategoriMisiComponent,
    DialogToolboxEditComponent,
    DialogKategoriMisiEditComponent,
    DialogKesulitanMisiEditComponent,
    DialogTipeMisiEditComponent,
    DiaglogMisiComponent,
    DiaglogPopUpNotifComponent,
    DiaglogPushNotifComponent,
    DiaglogWaktuTungguComponent,
    DialogYesNoComponent,
    DialogMisiEditComponent,
    DialogPopUpNotifEditComponent,
    DialogPushNotifEditComponent,
    DialogWaktuTungguEditComponent,
    DialogYesNoEditComponent,
    DialogCoinComponent,
    DialogCoinEditComponent,
    DialogCoinDuplicateComponent,
    DialogMisiDuplicateComponent,
    DialogPopUpNotifDuplicateComponent,
    DialogWaktuTungguDuplicateComponent,
    DialogPushNotifDuplicateComponent
  ],
})
export class DteModule {}
