import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { commonFormValidator } from "app/classes/commonFormValidator";
import { B2BVoucherInjectService } from "app/services/b2b-voucher-inject.service";
import { DataService } from "app/services/data.service";
import { DialogService } from "app/services/dialog.service";
import { SpinTheWheelService } from "app/services/dte/spin-the-wheel.service";
import { LanguagesService } from "app/services/languages/languages.service";
import { ProductService } from "app/services/sku-management/product.service";
import { DialogProcessSaveComponentSPW } from "../../dialog/dialog-process-save/dialog-process-save.component";
import { debounceTime, filter, switchMap, tap } from "rxjs/operators";

@Component({
  selector: "app-spin-the-wheel-mechanism",
  templateUrl: "./spin-the-wheel-mechanism.component.html",
  styleUrls: ["./spin-the-wheel-mechanism.component.scss"],
})
export class SpinTheWheelMechanismComponent implements OnInit {
  @Input() taskSpinId: any = null;
  @Input() settings: any = null;
  isDetail: boolean = false;
  isEditableRewards: boolean = true;
  form: FormGroup;
  point_valuation: number;
  defaultTier: any = {
    minimum_transaction: 0,
    maximum_transaction: 0,
    limit_spin: 0,
    average_coin_spin: 0,
    coin_variation: 0,
  };
  defaultRewards: any = {
    value: 0,
    slice: 0,
    probability: 0,
    limit_attempt: 0,
    total_budget: 0,
    actual_spin: 0,
    actual_budget: 0,
    spin_left: 0,
    budget_left: 0,
  };
  filteredProduct: any;
  productList: any[] = [];
  categoryList: any[] = [];
  limitProduct: any = {};
  limitCategory: any = {};
  dialogRef: any;

  @ViewChild("productInput")
  productInput: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private ls: LanguagesService,
    private spinTheWheelService: SpinTheWheelService,
    private b2bVoucherInjectService: B2BVoucherInjectService,
    private productService: ProductService
  ) {
    this.point_valuation = this.dataService.getFromStorage("point_valuation");
  }

  ngOnInit() {
    this.createForm();
    this.toggleCondition();
    this.toggleLimit();
    this.toggleExclude();
    this.searchProduct();
    this.getCategoryList();
    this.getDetails();
  }

  createForm() {
    this.form = this.fb.group({
      condition: [""],
      limit_by: [{ value: "", disabled: true }],
      limit_purchase: this.fb.array([]),
      limit_option: ["AND"],
      exclude_by: [{ value: "", disabled: true }],
      product: [""],
      category: [""],
      shop_freq: ["", Validators.required],
      reward_freq: ["", Validators.required],
      tier: this.fb.array([]),
    });
  }

  toggleCondition() {
    this.form.controls.condition.valueChanges.subscribe((value) => {
      if (value === "include") {
        this.form.controls.limit_by.enable();
        this.form.controls.exclude_by.disable();
        this.form.controls.exclude_by.setValue("");
      } else {
        this.form.controls.limit_by.disable();
        this.form.controls.limit_by.setValue("");
        this.form.controls.exclude_by.enable();
      }
    });
  }

  toggleLimit() {
    this.form.controls.limit_by.valueChanges.subscribe((value) => {
      this.resetLimitPurchase();
      this.validateCondition(value);
    });
  }

  toggleExclude() {
    this.form.controls.exclude_by.valueChanges.subscribe((value) => {
      this.validateCondition(value);
    });
  }

  validateCondition(value: string) {
    this.productList = [];
    this.filteredProduct = [];
    if (value === "product") {
      this.form.controls.product.enable();
      this.form.controls.category.disable();
      this.form.controls.category.setValue("");
    } else if (value === "category") {
      this.form.controls.product.disable();
      this.form.controls.product.setValue("");
      this.form.controls.category.enable();
    } else {
      this.form.controls.product.disable();
      this.form.controls.product.setValue("");
      this.form.controls.category.disable();
      this.form.controls.category.setValue("");
    }
  }

  getCategoryList() {
    this.productService.getListCategory(null).subscribe((res) => {
      this.categoryList = res.data ? res.data.data : [];
      this.limitCategory = this.categoryList.reduce((sum, item) => {
        sum[item.id] = item.name;
        return sum;
      }, {});
    });
  }

  getDetails() {
    if (!this.settings) return;

    this.form.controls.shop_freq.setValue(this.settings.frekuensi_belanja);
    this.form.controls.reward_freq.setValue(this.settings.frekuensi_reward);

    if (this.settings.limit_by) {
      this.form.controls.condition.setValue("include");
      this.form.controls.limit_by.setValue(this.settings.limit_by);
      if (this.settings.limit_by === "product") {
        this.productList = this.settings.limit_only.map((data: any) => {
          const obj = { sku_id: data.id, name: data.name, value: data.value };
          this.addLimitPurchase(obj);
          return obj;
        });
        this.limitProduct = this.productList.reduce((sum, data) => {
          sum[data.sku_id] = data.name;
          return sum;
        }, {});
      }
      if (this.settings.limit_by === "category") {
        const cat = this.settings.limit_only.map((data: any) => {
          const obj = { id: data.id, value: data.value };
          this.addLimitPurchase(obj);
          return parseInt(obj.id);
        });
        this.form.controls.category.setValue(cat);
      }
    }

    if (this.settings.exclude_by) {
      this.form.controls.condition.setValue("exclude");
      this.form.controls.exclude_by.setValue(this.settings.exclude_by);
    }

    const spins = this.settings.setting_details;
    let tierId = 0;
    if (spins.length) {
      for (let spin of spins) {
        const { rewards, ...spinData } = spin;
        this.addTier({ ...spinData });
        if (rewards.coin)
          for (let reward of rewards.coin)
            this.addRewards("rewards_coin", tierId, {
              ...reward,
              value: reward.coin,
              limit_attempt: reward.limit_atempt,
            });
        if (rewards.non_coin)
          for (let reward of rewards.non_coin)
            this.addRewards("rewards_non_coin", tierId, {
              ...reward,
              value: reward.item_name,
              limit_attempt: reward.limit_atempt,
            });
        if (rewards.xp)
          for (let reward of rewards.xp)
            this.addRewards("rewards_xp", tierId, {
              ...reward,
              value: reward.xp,
              limit_attempt: reward.limit_atempt,
            });
        this.setProbability(tierId);
        tierId += 1;
      }
      this.isEditableRewards = false;
      this.disableRewards();
    } else {
      this.addTier();
    }
  }

  disableRewards() {
    let tierId = 0;
    const tiers = this.getTier();
    for (let tier of tiers.controls) {
      tier.controls.limit_spin.disable();
      tier.controls.coin_variation.disable();
      const coin = this.getRewards("rewards_coin", tierId);
      for (let reward of coin.controls) {
        reward.controls.value.disable();
        reward.controls.slice.disable();
        reward.controls.probability.disable();
      }
      const non_coin = this.getRewards("rewards_non_coin", tierId);
      for (let reward of non_coin.controls) {
        reward.controls.value.disable();
        reward.controls.slice.disable();
        reward.controls.probability.disable();
      }
      const xp = this.getRewards("rewards_xp", tierId);
      for (let reward of xp.controls) {
        reward.controls.value.disable();
        reward.controls.slice.disable();
        reward.controls.probability.disable();
      }
      tierId += 1;
    }
  }

  searchProduct() {
    this.form.controls.product.valueChanges
      .pipe(
        filter((value) => value && value.length > 2),
        debounceTime(500),
        tap(() => {
          this.filteredProduct = [];
        }),
        switchMap((value) =>
          this.b2bVoucherInjectService.getProductList({
            page: "all",
            search: value,
          })
        )
      )
      .subscribe((res) => {
        this.filteredProduct = res.data;
      });
  }

  selectedProduct(event: any, isInclude: boolean = true) {
    const item = event.option.value;
    const index = this.productList.findIndex(
      (product) => product.sku_id === item.sku_id
    );
    if (index < 0) {
      this.limitProduct[item.sku_id] = item.name;
      if (isInclude) this.addLimitPurchase(item);
      this.productList.push(item);
    }
    this.filteredProduct = [];
    this.productInput.nativeElement.value = "";
    setTimeout(() => {
      this.productInput.nativeElement.blur();
      this.productInput.nativeElement.focus();
    }, 500);
  }

  removeProduct(item: any) {
    const index = this.productList.findIndex(
      (product) => product.sku_id === item.sku_id
    );
    if (index >= 0) {
      this.productList.splice(index, 1);
      this.removeLimitPurchase(item.sku_id);
    }
  }

  categoryChange(event: any) {
    if (!event.isUserInput) return;
    const id = event.source.value;
    if (event.source.selected) {
      this.addLimitPurchase({ id });
    } else {
      this.removeLimitPurchase(id);
    }
  }

  addLimitPurchase(data: any) {
    const limitPurchase = this.form.controls.limit_purchase as FormArray;
    const formControl = this.fb.group({
      id: [data.sku_id || data.id],
      value: [data.value || 0, [Validators.required, Validators.min(1)]],
    });
    limitPurchase.push(formControl);
  }

  removeLimitPurchase(id: any) {
    const limitPurchase = this.form.controls.limit_purchase as FormArray;
    const index = Object.values(limitPurchase.controls).findIndex(
      (i) => i.value.id.toString() === id.toString()
    );
    limitPurchase.removeAt(index);
  }

  resetLimitPurchase() {
    const limitPurchase = this.form.controls.limit_purchase as FormArray;
    if (!limitPurchase.length) return;
    while (limitPurchase.length > 0) limitPurchase.removeAt(0);
  }

  limitCategoryChange(event: any) {
    if (!event.isUserInput) return;
    const id = event.source.value;
    if (event.source.selected) {
      this.addLimitPurchase({ id });
    } else {
      this.removeLimitPurchase(id);
    }
  }

  addTier(data: any = {}) {
    const tier = this.form.controls.tier as FormArray;
    const values = { ...this.defaultTier, ...data };
    const formControl = this.fb.group({
      minimum_transaction: [values.minimum_transaction],
      maximum_transaction: [values.maximum_transaction],
      limit_spin: [values.limit_spin, [Validators.required, Validators.min(1)]],
      average_coin_spin: [values.average_coin_spin],
      coin_variation: [values.coin_variation, [Validators.required]],
      rewards_coin: this.fb.array([]),
      rewards_non_coin: this.fb.array([]),
      rewards_xp: this.fb.array([]),
      probability_left: [0, [Validators.min(100), Validators.max(100)]],
    });
    tier.push(formControl);
    this.validateTier(null, "add");
  }

  getTier(tierId?: number): any {
    const tiers = this.form.controls.tier as FormArray;
    if (isNaN(tierId)) return tiers;
    return tiers.at(tierId) as FormGroup;
  }

  removeTier(tierId: number) {
    const dialog = {
      titleDialog: "Hapus Tier",
      captionDialog: `Apa Anda yakin menghapus Tier ${tierId + 1}`,
      confirmCallback: () => {
        const tiers = this.getTier();
        tiers.removeAt(tierId);
        this.validateTier(tierId, "remove");
        this.dialogService.brodcastCloseConfirmation();
      },
      buttonText: ["Hapus", "Batal"],
    };
    this.dialogService.openCustomConfirmationDialog(dialog);
  }

  validateEqual(isEqual: boolean): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null =>
      isEqual ? null : { validateEqual: true };
  }

  validateTier(tierId?: number, action?: string) {
    const tiers = this.getTier();
    if (tierId > 0 && action === "min") {
      const ct = tiers.at(tierId);
      const pt = tiers.at(tierId - 1);
      const ctmin = ct.controls.minimum_transaction;
      const ptmax = pt.controls.maximum_transaction;
      ptmax.setValue(ctmin.value - 1);
    }
    if (
      tiers.controls.length > 1 &&
      tierId < tiers.controls.length - 1 &&
      action === "max"
    ) {
      const ct = tiers.at(tierId);
      const nt = tiers.at(tierId + 1);
      const ctmax = ct.controls.maximum_transaction;
      const ntmin = nt.controls.minimum_transaction;
      ntmin.setValue(ctmax.value + 1);
    }
    if (tierId > 0 && tierId < tiers.controls.length && action === "remove") {
      const pt = tiers.at(tierId - 1);
      const ct = tiers.at(tierId);
      pt.controls.maximum_transaction.setValue(
        ct.controls.minimum_transaction.value - 1
      );
    }
    if (action === "add" && tiers.controls.length > 1) {
      const pt = tiers.at(tiers.controls.length - 2);
      const nt = tiers.at(tiers.controls.length - 1);
      if (pt.controls.maximum_transaction.value) {
        nt.controls.minimum_transaction.setValue(
          pt.controls.maximum_transaction.value + 1
        );
      }
    }
    for (let i = 0; i < tiers.controls.length; i++) {
      const ct = tiers.at(i);
      const ctmin = ct.controls.minimum_transaction;
      const ctmax = ct.controls.maximum_transaction;
      if (i === 0 && tiers.controls.length > 1) {
        ctmax.setValidators([Validators.min(ctmin.value)]);
      } else {
        ctmax.clearValidators();
      }
      if (i > 0) {
        const pt = tiers.at(i - 1);
        const ptmin = pt.controls.minimum_transaction;
        const ptmax = pt.controls.maximum_transaction;
        ctmin.setValidators([
          Validators.min(ptmin.value + 1),
          this.validateEqual(ptmax.value - ctmin.value === -1),
        ]);
        ctmax.setValidators([Validators.min(ctmin.value)]);
      }
      ctmin.updateValueAndValidity();
      ctmax.updateValueAndValidity();
    }
  }

  getRewards(type: string, tierId: number): any {
    const tier = this.getTier(tierId);
    const rewards = tier.controls[type] as FormArray;
    return rewards;
  }

  addRewards(type: string, tierId: number, data: any = {}) {
    const rewards = this.getRewards(type, tierId);
    const values = { ...this.defaultRewards, ...data };
    const formControl = this.fb.group({
      value: [values.value, [Validators.required]],
      slice: [values.slice, [Validators.required, Validators.min(1)]],
      probability: [values.probability, [Validators.required]],
      limit_attempt: [values.limit_attempt],
      total_budget: [values.total_budget],
      actual_spin: [values.actual_spin],
      actual_budget: [values.actual_budget],
      spin_left: [values.spin_left],
      budget_left: [values.budget_left],
    });
    rewards.push(formControl);
  }

  removeReward(type: string, tierId: number, rewardId: number) {
    const rewards = this.getRewards(type, tierId);
    rewards.removeAt(rewardId);
    this.setProbability(tierId);
  }

  resetRewards(type: string, tierId: number) {
    const rewards = this.getRewards(type, tierId);
    while (rewards.length > 0) rewards.removeAt(0);
  }

  coinVariationChange(event: any, tierId: number) {
    const len = event.target.value;
    this.resetRewards("rewards_coin", tierId);
    if (len)
      for (let i = 0; i < event.target.value; i++)
        this.addRewards("rewards_coin", tierId);
  }

  setLimitAttempt(tierId: any, reward: any) {
    const tier = this.getTier(tierId);
    const limit_attempt = Math.ceil(
      (tier.controls.limit_spin.value * reward.controls.probability.value) / 100
    );
    reward.controls.limit_attempt.setValue(limit_attempt);
  }

  setTotalBudget(reward: any) {
    const total_budget =
      reward.controls.value.value *
      reward.controls.limit_attempt.value *
      this.point_valuation;
    const budget_left = total_budget - reward.controls.actual_budget.value;
    reward.controls.total_budget.setValue(total_budget);
    reward.controls.budget_left.setValue(budget_left);
  }

  setAverageCoin(tierId: number) {
    const tier = this.getTier(tierId);
    const total_budget = this.updateTierSum(
      tierId,
      "rewards_coin",
      "total_budget"
    );
    const average_coin_spin =
      Math.ceil(
        total_budget / this.point_valuation / tier.controls.limit_spin.value
      ) || 0;
    tier.controls.average_coin_spin.setValue(average_coin_spin);
  }

  setProbability(tierId: number) {
    const tier = this.getTier(tierId);
    const probability =
      this.updateTierSum(tierId, "rewards_coin", "probability") +
      this.updateTierSum(tierId, "rewards_non_coin", "probability") +
      this.updateTierSum(tierId, "rewards_xp", "probability");
    tier.controls.probability_left.setValue(probability);
  }

  setTierData(tierId: number, reward: any, isCoin: boolean) {
    this.setLimitAttempt(tierId, reward);
    if (isCoin) {
      this.setTotalBudget(reward);
      this.setAverageCoin(tierId);
    }
    this.setProbability(tierId);
  }

  updateTierData(
    tierId: number,
    isCoin: boolean,
    rewardType: string,
    rewardId?: number
  ) {
    const rewards = this.getRewards(rewardType, tierId);
    if (isNaN(rewardId)) {
      for (let reward of rewards.controls)
        this.setTierData(tierId, reward, isCoin);
      return;
    }
    const reward = rewards.at(rewardId) as FormGroup;
    this.setTierData(tierId, reward, isCoin);
  }

  updateTierSum(tierId: number, type: string, name: string) {
    const rewards = this.getRewards(type, tierId);
    let sum = 0;
    for (let reward of rewards.controls) {
      sum += reward.controls[name].value;
    }
    return sum;
  }

  submit() {
    if (!this.form.valid) {
      this.dialogService.openSnackBar({
        message: "Silakan lengkapi data terlebih dahulu!",
      });
      commonFormValidator.validateAllFields(this.form);
      return;
    }
    const tiers = this.form.controls.tier as FormArray;
    let body = {
      task_spin_id: this.taskSpinId,
      frekuensi_belanja: this.form.controls.shop_freq.value,
      frekuensi_reward: this.form.controls.reward_freq.value,
      setting_details: [],
      setting_varians: tiers.controls.length,
    };
    const condition = this.form.controls.condition.value;
    const limit_by = this.form.controls.limit_by.value;
    const exclude_by = this.form.controls.exclude_by.value;
    if (condition === "include" && limit_by) {
      let limit_purchase_data = [];
      const limit_purchase = this.form.controls.limit_purchase as FormArray;
      for (let data of limit_purchase.controls)
        limit_purchase_data.push({
          id: data.get("id").value,
          value: data.get("value").value,
        });
      body["limit_by"] = limit_by;
      body["limit_only"] = limit_purchase_data;
      if (limit_purchase_data.length > 1)
        body["limit_option"] = this.form.controls.limit_option.value;
    }
    if (condition === "exclude" && exclude_by) {
      body["exclude_by"] = exclude_by;
      body["exclude_only"] =
        exclude_by === "category"
          ? this.form.controls.category.value
          : this.productList.map((i) => i.sku_id);
    }
    for (let tier of tiers.controls) {
      const rewards_coin = tier.get("rewards_coin") as FormArray;
      let coin = [];
      for (let reward of rewards_coin.controls) {
        let data = {
          coin: reward.get("value").value,
          slice: reward.get("slice").value,
          probability: reward.get("probability").value,
          limit_atempt: reward.get("limit_attempt").value,
          total_budget: reward.get("total_budget").value,
          actual_spin: reward.get("actual_spin").value,
          actual_budget: reward.get("actual_budget").value,
          spin_left: reward.get("spin_left").value,
          budget_left: reward.get("budget_left").value,
        };
        coin.push(data);
      }
      const rewards_non_coin = tier.get("rewards_non_coin") as FormArray;
      let non_coin = [];
      for (let reward of rewards_non_coin.controls) {
        let data = {
          item_name: reward.get("value").value,
          slice: reward.get("slice").value,
          probability: reward.get("probability").value,
          limit_atempt: reward.get("limit_attempt").value,
          actual_spin: reward.get("actual_spin").value,
          spin_left: reward.get("spin_left").value,
        };
        non_coin.push(data);
      }
      const rewards_xp = tier.get("rewards_xp") as FormArray;
      let xp = [];
      for (let reward of rewards_xp.controls) {
        let data = {
          xp: reward.get("value").value,
          slice: reward.get("slice").value,
          probability: reward.get("probability").value,
          limit_atempt: reward.get("limit_attempt").value,
          actual_spin: reward.get("actual_spin").value,
          spin_left: reward.get("spin_left").value,
        };
        xp.push(data);
      }
      let details = {
        limit_spin: tier.get("limit_spin").value,
        coin_variation: tier.get("coin_variation").value,
        average_coin_spin: tier.get("average_coin_spin").value,
        minimum_transaction: tier.get("minimum_transaction").value,
        maximum_transaction: tier.get("maximum_transaction").value,
        rewards: [
          {
            coin,
            non_coin,
            xp,
          },
        ],
      };
      body["setting_details"].push(details);
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = "scrumboard-card-dialog";
    dialogConfig.data = { password: "P@ssw0rd" };

    this.dialogRef = this.dialog.open(DialogProcessSaveComponentSPW, {
      ...dialogConfig,
      width: "400px",
    });

    const processCheck = this.spinTheWheelService.saveSettings(body).subscribe(
      (res) => {
        this.isEditableRewards = false;
        this.disableRewards();
        this.dialogRef.close();
        this.dialogService.openSnackBar({
          message: this.ls.locale.notification.popup_notifikasi.text22,
        });
      },
      (err) => {
        this.dialogRef.close();
      }
    );

    this.dialogRef.afterClosed().subscribe(() => {
      processCheck.unsubscribe();
    });
  }
}
