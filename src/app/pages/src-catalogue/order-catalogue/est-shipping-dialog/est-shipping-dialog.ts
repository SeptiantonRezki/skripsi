import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material";
import { FormControl, Validators } from "@angular/forms";
import { DialogService } from "app/services/dialog.service";
import { OrderCatalogueService } from 'app/services/src-catalogue/order-catalogue.service';
import { DataService } from 'app/services/data.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
	selector: 'app-est-shipping-dialog',
	templateUrl: './est-shipping-dialog.html',
	styleUrls: ['./est-shipping-dialog.scss'],
	encapsulation: ViewEncapsulation.None
})
export class EstShippingDialogComponent implements OnInit {
	est_shipping: FormControl = new FormControl('', [Validators.required, Validators.min(0), Validators.max(31)]);
	constructor(
		public dialogRef: MatDialogRef<EstShippingDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private dialogService: DialogService,
		private orderCatalogueService: OrderCatalogueService,
		private dataService: DataService,
		private ls: LanguagesService
	) { }

	ngOnInit() {
		if (this.data.shipping_duration) this.est_shipping.setValue(this.data.shipping_duration);
	}

	submit() {
		if (this.est_shipping.valid) {
			if (!this.data.shipping_cost || this.data.shipping_cost == 0) {
				let data = {
					titleDialog: "Biaya Pengiriman Belum Ditambahkan",
					captionDialog: "Anda belum menambahkan Biaya Pengiriman pada Pesanan ini, apakah melanjutkan transaksi tanpa biaya kirim",
					confirmCallback: this.onConfirm.bind(this),
					buttonText: ["Ya, Lanjutkan", "Tidak, Perbarui Dulu"]
				};
				this.dialogService.openCustomConfirmationDialog(data);
			} else {

				this.dataService.showLoading(true);
				let body = {
					"_method": "PUT",
					"status": this.data.status,
					"shipping_duration": this.est_shipping.value,
					"shipping_price": this.data.shipping_cost
				}

				this.orderCatalogueService.updateStatus({ order_id: this.data.order_id }, body).subscribe(res => {
					this.dialogService.openSnackBar({
						message: this.ls.locale.notification.popup_notifikasi.text22
					});
					this.dialogRef.close(res);
				})
			}
		}
	}

	onConfirm() {
		if (this.est_shipping.valid) {
			this.dataService.showLoading(true);
			let body = {
				"_method": "PUT",
				"status": this.data.status,
				"shipping_duration": this.est_shipping.value
			}

			this.orderCatalogueService.updateStatus({ order_id: this.data.order_id }, body).subscribe(res => {
				this.dialogService.openSnackBar({
					message: this.ls.locale.notification.popup_notifikasi.text22
				});
				this.dialogRef.close(res);
			})
		}
	}

}
