import { Injectable } from '@angular/core';
import { GoogleAnalyticsService } from './google-analytics.service';

@Injectable()
export class GoogleTagManagerService {

  constructor(
    private gaService: GoogleAnalyticsService
  ) {}

  /**
   * `"generalEvent"` adalah event value dari data layer untuk keperluan analytics GTM(Google Tag Manager)
  */
  generalEvent(eventCategory: any, eventAction: any, data?: any) {
    const DATALAYER = {
      ModeSistem: {
        _name: 'Mode Sistem',
        ExportXLS: {
          /**
           * src/app/pages/dashboard/total-revenue/total-revenue.component.ts
          */
          'eventAction': 'Export XLS',
          'eventLabel': data.location
        },
        ImportXLS: {
          'eventAction': 'Import XLS - Kirim', // import in Manajemen Barang (SKU) product
          'eventLabel': data.location
        },
        SpandukIklan: {
          /**
           * src/app/pages/inapp-marketing/banner/create/banner-create.component.ts
           * src/app/pages/inapp-marketing/banner/edit/banner-edit.component.ts
           * src/app/pages/inapp-marketing/banner/index/banner-index.component.ts
           * src/app/pages/inapp-marketing/banner/setting-popup-spanduk-dialog/setting-popup-spanduk-dialog.component.ts
           */
          'eventAction': 'Spanduk Iklan',
          'eventLabel': data.editableStatus, // Tambah, Ubah or Hapus
          'namaSpanduk': data.spandukName,
          'popup': data.popup,
        },
        KodePromo: {
          'eventAction': 'Kode Promo',
          'eventLabel': data.editableStatus, // Tambah, Ubah or Hapus
          'namaPromo': data.promoName,
          'statusPromo': data.promoStatus,
        },
        ManajemenBarangProduk: {
          'eventAction': data.eventAction, // - Produk, - Paket Produk
          'eventLabel': data.editableStatus, // Tambah, Ubah or Hapus
          'namaProduk': data.productName,
          'statusProduk': data.productStatus,
        },
        AturPoin: {
          'eventAction': data.eventAction, // - Atur Poin
          'eventLabel': data.editableStatus, // Tambah or Ubah
        },
        KatalogHadiah: {
          'eventAction': 'Katalog Hadiah',
          'eventLabel': data.editableStatus, // Tambah, Ubah or Hapus
          'namaHadiah': data.namaHadiah,
          'statusHadiah': data.statusHadiah
        },
        Pelanggan: {
          'eventAction': 'Pelanggan',
          'eventLabel': data.editableStatus, // Tambah, Ubah or Hapus
          'namaToko': data.namaToko
        },
        DaftarKurir: {
          'eventAction': data.eventAction, // Daftar Kurir, Syarat & Ketentuan
          'evenLabel': data.editableStatus,
        },
        Pengguna: {
          'eventAction': data.eventAction, // Pengguna, Peran Pengguna
          'eventLabel': data.editableStatus, // Tambah, Ubah or Hapus
          'tingkatAksesPengguna': data.tingkatAksesPengguna
        },
        Tier: {
          'eventAction': data.eventAction, // Tier
          'eventLabel': data.editableStatus, // Tambah, Ubah or Hapus
        },
        ProfilToko: {
          'eventAction': data.eventAction, // Profil Toko
          'eventLabel': data.eventLabel, // Simpan
        },
        Bantuan: {
          'eventAction': data.eventAction, // Bantuan
          'eventLabel': data.eventLabel, // Akun Saya, Belanja, Misi, etc...
        },

        // DUAL MODE ModeKasir n ModeSistem
        MenuNavigationBar: {
          /**
           * src/@fuse/components/navigation/vertical/nav-item/nav-vertical-item.component.ts
          */
          'eventAction': 'Menu Navigation Bar',
          'eventLabel': data.navigationMenu
        },
        Filter: {
          'eventAction': 'Filter',
          'eventLabel': data.pageName + ' | ' + data.filterValue
        },
        LihatPesananDetail: {
          'eventAction': 'Lihat Pesanan - Detail',
          'eventLabel': data.orderCode //invoice_number
        },
        LihatPesananPerbaruiStatus: {
          'eventAction': 'Lihat Pesanan - Perbarui Status',
          'eventLabel': data.orderCode, //invoice_number
          'statusPemesanan': data.statusPemesanan
        },
        LihatPesananUbah: {
          'eventAction': 'Lihat Pesanan - Ubah',
          'eventLabel': data.orderCode //invoice_number
        },
        LihatPesananCetak: {
          'eventAction': 'Lihat Pesanan - Cetak',
          'eventLabel': data.orderCode //invoice_number
        },
        HomeIcon: {
          'eventAction': 'Home Icon',
          'eventLabel': data.location
        },
        tambahPesanan: {
          /**
           * src/app/pages/shopping/invoice/shopping-order-invoice.component.ts
           */
          'eventAction': 'Tambah Pesanan',
          'eventLabel': data.orderCode, //invoice_number
          'totalHarga': data.totalHarga,
          'totalProduk': data.totalProduk,
        },
        buatPesananCetak: {
          /**
           * src/app/pages/shopping/invoice/shopping-order-invoice.component.ts
           */
          'eventAction': 'Buat Pesanan - Cetak',
          'eventLabel': data.orderCode //invoice_number
        }
      },
      ModeKasir: {
        _name: 'Mode Kasir',

        // DUAL MODE ModeKasir n ModeSistem
        MenuNavigationBar: {
          /**
           * src/@fuse/components/navigation/vertical/nav-item/nav-vertical-item.component.ts
          */
          'eventAction': 'Menu Navigation Bar',
          'eventLabel': data.navigationMenu
        },
        Filter: {
          'eventAction': 'Filter',
          'eventLabel': data.pageName + ' | ' + data.filterValue
        },
        LihatPesananDetail: {
          'eventAction': 'Lihat Pesanan - Detail',
          'eventLabel': data.orderCode //invoice_number
        },
        LihatPesananPerbaruiStatus: {
          'eventAction': 'Lihat Pesanan - Perbarui Status',
          'eventLabel': data.orderCode,
          'statusPemesanan': data.statusPemesanan
        },
        LihatPesananUbah: {
          'eventAction': 'Lihat Pesanan - Ubah',
          'eventLabel': data.orderCode //invoice_number
        },
        LihatPesananCetak: {
          'eventAction': 'Lihat Pesanan - Cetak',
          'eventLabel': data.orderCode //invoice_number
        },
        HomeIcon: {
          'eventAction': 'Home Icon',
          'eventLabel': data.location
        },
        tambahPesanan: {
          /**
           * src/app/pages/shopping/invoice/shopping-order-invoice.component.ts
           */
          'eventAction': 'Tambah Pesanan',
          'eventLabel': data.orderCode, //invoice_number
          'totalHarga': data.totalHarga,
          'totalProduk': data.totalProduk,
        },
        buatPesananCetak: {
          /**
           * src/app/pages/shopping/invoice/shopping-order-invoice.component.ts
           */
          'eventAction': 'Buat Pesanan - Cetak',
          'eventLabel': data.orderCode //invoice_number
        }
      },
    };

    this.gaService.gtmDataLayer({
        'event': 'generalEvent',
        'eventCategory': DATALAYER[eventCategory]['_name'],
        ...DATALAYER[eventCategory][eventAction]
    });
  }

  userTracking(userId: any, tingkatanAkses: String) {
    this.gaService.gtmDataLayer({
      'event': 'userInfo',
      'eventCategory': 'User Info',
      'eventAction': 'User Info Collected',
      'eventLabel': userId,
      'userId': userId,
      'tingkatanAkses': tingkatanAkses
    });
  }

  userTiming(event: any) { // page load
    this.gaService.gtmDataLayer({
      'event': 'time',
      ...event
    });
  }

}
