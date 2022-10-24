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
import { ProjectListComponent } from "./pengaturan-attribute-misi/index/project/project-list.component";
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
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';

import { MomentDateAdapter } from "@angular/material-moment-adapter";
import {
  ListTradeProgramResolver,
  ListTemplateResolver,
  ListSchedulerResolver,
  ListRetailerResolver,
} from "../../resolver/dte.resolver";
import { PageGuard } from "app/classes/auth.guard";
import { PipesModule } from "app/pipe/pipes.module";

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
import { TaskVerificationIndexTsmComponent } from "./task-verification/index-tsm/task-verification-index-tsm.component";
import { TaskVerificationDetailTsmComponent } from "./task-verification/detail-tsm/task-verification-detail-tsm.component";
import { ConfirmDialogComponent } from "./task-verification/dialog/confirm-dialog/confirm-dialog.component";
import { ConfirmDialogTsmComponent } from "./task-verification/dialog/confirm-dialog-tsm/confirm-dialog-tsm.component";
import { PengaturanAttributeMisiIndexComponent } from "./pengaturan-attribute-misi/index/pengaturan-attribute-misi-index.component";
import { TaskSequencingIndexComponent } from './task-sequencing/index/task-sequencing-index.component';
import { TaskSequencingCreateComponent } from './task-sequencing/create/task-sequencing-create.component';
import { TaskSequencingDuplicateComponent } from './task-sequencing/duplicate/task-sequencing-duplicate.component';
import { DialogToolboxComponent } from "./pengaturan-attribute-misi/index/dialog-toolbox/dialog-toolbox.component";
import { DialogTipeMisiComponent } from "./pengaturan-attribute-misi/index/dialog-tipe-misi/dialog-tipe-misi.component";
import { DialogCreateComponent } from "./pengaturan-attribute-misi/index/dialog-create/dialog-create.component";
import { DialogKategoriMisiComponent } from "./pengaturan-attribute-misi/index/dialog-kategori-misi/dialog-kategori-misi.component";
import { TaskSequencingEditComponent } from "./task-sequencing/edit/task-sequencing-edit.component"
import { DialogToolboxEditComponent } from "./pengaturan-attribute-misi/index/dialog-toolbox-edit/dialog-toolbox-edit.component";
import { ListKategoriToolboxComponent } from "./pengaturan-attribute-misi/index/list-kategori-toolbox/list-kategori-toolbox.component"
import { ListTipeMisiComponent } from "./pengaturan-attribute-misi/index/list-tipe-misi/list-tipe-misi.component"
import { ListInternalMisiComponent } from "./pengaturan-attribute-misi/index/list-internal-misi/list-internal-misi.component";
import { ListKategoriMisiComponent } from "./pengaturan-attribute-misi/index/list-kategori-misi/list-kategori-misi.component";
import { DialogKategoriMisiEditComponent } from "./pengaturan-attribute-misi/index/dialog-kategori-misi-edit/dialog-kategori-misi-edit.component";
import { DialogEditComponent } from "./pengaturan-attribute-misi/index/dialog-edit/dialog-edit.component";
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
import { IndextsmComponent } from './automation/indextsm/indextsm.component';
import { CreatetsmComponent } from './automation/createtsm/createtsm.component';
import { EOrdertsmComponent } from './automation/createtsm/e-ordertsm/e-ordertsm.component';
import { EdittsmComponent } from './automation/edittsm/edittsm.component';
import { EOrdertsmeditComponent } from "./automation/edittsm/e-ordertsm/e-ordertsm.component";
import { CoinAdjustmentApprovalComponent } from './coin-adjustment-approval/index/coin-adjustment-approval.component';
import { CoinAdjustmentApprovalTSMComponent } from './coin-adjustment-approval/index-tsm/coin-adjustment-approval-tsm.component';
import { CoinAdjustmentApprovalDetailComponent } from './coin-adjustment-approval/detail/coin-adjustment-approval-detail.component';
import { CoinDisburstmentComponent } from './coin-disburstment/index/coin-disburstment.component';
import { CoinDisburstmentCreateComponent } from './coin-disburstment/create/coin-disburstment-create.component';
import { CoinDisburstmentEditComponent } from './coin-disburstment/edit/coin-disburstment-edit.component';
import { CoinDisburstmentExchangeComponent } from './coin-disburstment/index/exchange/coin-disburstment-exchange.component';
import { ImportExchangeCoinComponent } from './coin-disburstment/index/import-exchange-coin/import-exchange-coin.component';
import { BackgroundMisiComponent } from './template/dialog/background-misi/background-misi.component';
import { NgxMaskModule } from "ngx-mask";
import { VerificationRemarkComponent } from './pengaturan-attribute-misi/index/verification-remark/verification-remark.component';
import { DynamicPricingComponent } from './dynamic-pricing/dynamic-pricing.component';
import { CopywritingComponent } from './pengaturan-attribute-misi/index/copywriting/copywriting.component';
import { TemplateCreatePersonalizeComponent } from './template/create/personalize/template-create-personalize.component';
import { TemplateIndexPersonalizeComponent } from './template/index/personalize/template-index-personalize.component';
import { TemplateEditPersonalizeComponent } from './template/edit/personalize/template-edit-personalize.component';
import { AudienceIndexPersonalizeComponent } from './audience/index/personalize/audience-index-personalize.component';
import { AudienceCreatePersonalizeComponent } from './audience/create/personalize/audience-create-personalize.component';
import { TaskSequencingIndexPersonalizeComponent } from './task-sequencing/index/personalize/task-sequencing-index-personalize.component';
import { PublishMisiComponent } from './publish-misi/publish-misi.component';
import { DialogPanelBlastComponent } from './audience/dialog/dialog-panel-blast/dialog-panel-blast.component';
import { DialogProcessComponent } from './audience/dialog/dialog-process/dialog-process.component';
import { DialogProcessComponentLottery } from './lottery/dialog/dialog-process/dialog-process.component';
import { DialogProcessSaveComponent } from './audience/dialog/dialog-process-save/dialog-process-save.component';
import { DialogProcessSaveComponentLottery } from './lottery/dialog/dialog-process-save/dialog-process-save.component';
import { AudienceEditPersonalizeComponent } from './audience/edit/personalize/audience-edit-personalize.component';
import { ImportAudiencePersonalizeComponent } from './audience/import/personalize/import-audience-personalize.component';
import { ImportAudiencePersonalizeComponentLottery } from './lottery/import/personalize/import-audience-personalize.component';
import { ApprovalHistoryComponent } from './coin-adjustment-approval/detail/approval-history/approval-history.component';
import { GroupSkuComponent } from './image-recognition/group-sku/group-sku.component';
import { SkuComponent } from './image-recognition/sku/sku.component';
import { TemplateStockCheckComponent } from './image-recognition/template-stock-check/template-stock-check.component';
import { TaskVerificationComponent } from './task-verification-2/task-verification/task-verification.component';
import { AssignmentCartComponent } from './task-verification-2/assignment-cart/assignment-cart.component';
import { TaskVerificationAssignmentComponent } from './task-verification-2/task-verification-assignment/task-verification-assignment.component';
import { TranslateModule } from "@ngx-translate/core";
import { SubGroupTradeComponent } from './sub-group-trade/sub-group-trade.component';
import { DataLogComponent } from './coin-disburstment/index/data-log/data-log.component';
import { CoinRedemptionApprovalComponent } from './coin-redemption-approval/coin-redemption-approval.component';
import { EmployeeMappingComponent } from './employee-mapping/employee-mapping.component';
import { TemplatePlanogramComponent } from './image-recognition/template-planogram/template-planogram.component';
import { JobsRequestComponent } from './jobs-request/jobs-request.component';
import { CheckImageComponent } from './image-recognition/check-image/check-image.component';
import { LotteryComponent } from './lottery/index/lottery.component';
import { LotteryCreateComponent } from './lottery/create/lottery-create.component';
import { LotteryEditComponent } from './lottery/edit/lottery-edit.component';
import { XpComponent } from './xp/xp.component';
import { LoyaltyMitraComponent } from './loyalty-mitra/loyalty-mitra.component';
import { VerificationApprovalComponent } from './task-verification-2/verification-approval/verification-approval.component';
import { SpinTheWheelComponent } from './spin-the-wheel/index/spin-the-wheel.component';
import { SpinTheWheelCreateComponent } from './spin-the-wheel/create/spin-the-wheel-create.component';
import { SpinTheWheelEditComponent } from './spin-the-wheel/edit/spin-the-wheel-edit.component';
import { InfoBoardComponent } from './info-board/index/info-board.component';
import { InfoBoardCreateComponent } from './info-board/create/info-board-create.component';
import { InfoBoardEditComponent } from './info-board/edit/info-board-edit.component';
import { DialogProcessComponentSPW } from './spin-the-wheel/dialog/dialog-process/dialog-process.component';
import { DialogProcessSaveComponentSPW } from './spin-the-wheel/dialog/dialog-process-save/dialog-process-save.component';
import { ImportAudiencePersonalizeComponentSPW } from './spin-the-wheel/import/personalize/import-audience-personalize.component';

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
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
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
    PipesModule,
    NgxMaskModule.forRoot(),
    TranslateModule.forChild(),
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
    ProjectListComponent,
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
    TaskVerificationIndexTsmComponent,
    TaskVerificationDetailTsmComponent,
    ConfirmDialogComponent,
    ConfirmDialogTsmComponent,
    PengaturanAttributeMisiIndexComponent,
    PengaturanAttributeMisiCreateComponent,
    TaskSequencingIndexComponent,
    TaskSequencingCreateComponent,
    TaskSequencingDuplicateComponent,
    DialogToolboxComponent,
    DialogTipeMisiComponent,
    DialogCreateComponent,
    DialogKategoriMisiComponent,
    TaskSequencingEditComponent,
    DialogToolboxEditComponent,
    ListKategoriToolboxComponent,
    ListTipeMisiComponent,
    ListInternalMisiComponent,
    ListKategoriMisiComponent,
    DialogKategoriMisiEditComponent,
    DialogEditComponent,
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
    DialogPushNotifDuplicateComponent,
    IndextsmComponent,
    CreatetsmComponent,
    EOrdertsmComponent,
    EOrdertsmeditComponent,
    EdittsmComponent,
    DialogPopUpNotifDuplicateComponent,
    DialogWaktuTungguDuplicateComponent,
    DialogPushNotifDuplicateComponent,
    IndextsmComponent,
    CreatetsmComponent,
    EOrdertsmComponent,
    EOrdertsmeditComponent,
    EdittsmComponent,
    CoinAdjustmentApprovalComponent,
    CoinAdjustmentApprovalTSMComponent,
    CoinAdjustmentApprovalDetailComponent,
    CoinDisburstmentComponent,
    CoinDisburstmentCreateComponent,
    CoinDisburstmentEditComponent,
    CoinDisburstmentExchangeComponent,
    ImportExchangeCoinComponent,
    BackgroundMisiComponent,
    VerificationRemarkComponent,
    DynamicPricingComponent,
    CopywritingComponent,
    TemplateCreatePersonalizeComponent,
    TemplateIndexPersonalizeComponent,
    TemplateEditPersonalizeComponent,
    AudienceIndexPersonalizeComponent,
    AudienceCreatePersonalizeComponent,
    TaskSequencingIndexPersonalizeComponent,
    PublishMisiComponent,
    DialogPanelBlastComponent,
    DialogProcessComponent,
    DialogProcessComponentLottery,
    DialogProcessSaveComponent,
    DialogProcessSaveComponentLottery,
    AudienceEditPersonalizeComponent,
    ImportAudiencePersonalizeComponent,
    ImportAudiencePersonalizeComponentLottery,
    DialogProcessComponentSPW,
    DialogProcessSaveComponentSPW,
    ImportAudiencePersonalizeComponentSPW,
    ApprovalHistoryComponent,
    GroupSkuComponent,
    SkuComponent,
    TemplateStockCheckComponent,
    TaskVerificationComponent,
    AssignmentCartComponent,
    TaskVerificationAssignmentComponent,
    SubGroupTradeComponent,
    DataLogComponent,
    CoinRedemptionApprovalComponent,
    EmployeeMappingComponent,
    TemplatePlanogramComponent,
    JobsRequestComponent,
    CheckImageComponent,
    LotteryComponent,
    LotteryCreateComponent,
    LotteryEditComponent,
    XpComponent,
    LoyaltyMitraComponent,
    VerificationApprovalComponent,
    SpinTheWheelComponent,
    SpinTheWheelCreateComponent,
    SpinTheWheelEditComponent,
    InfoBoardComponent,
    InfoBoardCreateComponent,
    InfoBoardEditComponent
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
    ProjectListComponent,
    TaskVerificationIndexComponent,
    TaskVerificationDetailComponent,
    TaskVerificationIndexTsmComponent,
    TaskVerificationDetailTsmComponent,
    PengaturanAttributeMisiIndexComponent,
    PengaturanAttributeMisiCreateComponent,
    TaskSequencingIndexComponent,
    TaskSequencingCreateComponent,
    TaskSequencingDuplicateComponent,
    TaskSequencingEditComponent,
    ListKategoriToolboxComponent,
    ListTipeMisiComponent,
    ListInternalMisiComponent,
    ListKategoriMisiComponent,
    DialogKategoriMisiEditComponent,
    DialogEditComponent,
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
    DialogPushNotifDuplicateComponent,
    ImportExchangeCoinComponent
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
    ConfirmDialogTsmComponent,
    DialogToolboxComponent,
    DialogTipeMisiComponent,
    DialogEditComponent,
    DialogKategoriMisiComponent,
    DialogToolboxEditComponent,
    DialogKategoriMisiEditComponent,
    DialogCreateComponent,
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
    DialogPushNotifDuplicateComponent,
    ImportExchangeCoinComponent,
    DialogPanelBlastComponent,
    DialogProcessComponent,
    DialogProcessComponentLottery,
    DialogProcessSaveComponent,
    DialogProcessSaveComponentLottery,
    ImportAudiencePersonalizeComponent,
    ImportAudiencePersonalizeComponentLottery,
    ImportAudiencePersonalizeComponent,
    DialogProcessComponentSPW,
    DialogProcessSaveComponentSPW,
    ImportAudiencePersonalizeComponentSPW,
  ],
})
export class DteModule { }
