import * as SJCL from "sjcl";

export class PagesName {
  getPages(name) {
    const PAGES = {
      "/user-management/admin-principal": "principal.adminprincipal.lihat",
      "/user-management/admin-principal/create": "principal.adminprincipal.buat",
      "/user-management/admin-principal/edit/": "principal.adminprincipal.ubah",
      "/user-management/admin-principal/detail/": "principal.adminprincipal.lihat",
      "/user-management/field-force": "principal.fieldforce.lihat",
      "/user-management/field-force/create": "principal.fieldforce.buat",
      "/user-management/field-force/edit": "principal.fieldforce.ubah",
      "/user-management/field-force/detail": "principal.fieldforce.lihat",
      "/user-management/wholesaler": "principal.wholesaler.lihat",
      "/user-management/wholesaler/create": "principal.wholesaler.buat",
      "/user-management/wholesaler/edit": "principal.wholesaler.ubah",
      "/user-management/wholesaler/detail": "principal.wholesaler.lihat",
      "/user-management/retailer": "principal.retailer.lihat",
      "/user-management/retailer/create": "principal.retailer.buat",
      "/user-management/retailer/edit": "principal.retailer.ubah",
      "/user-management/retailer/detail": "principal.retailer.lihat",
      "/user-management/paguyuban": "principal.paguyuban.lihat",
      "/user-management/paguyuban/create": "principal.paguyuban.buat",
      "/user-management/paguyuban/edit": "principal.paguyuban.ubah",
      "/user-management/paguyuban/detail": "principal.paguyuban.lihat",
      "/user-management/customer": "principal.paguyuban.lihat",
      "/user-management/customer/detail/": "principal.paguyuban.lihat",
      "/user-management/pengajuan-src": "principal.pengajuansrc.lihat",
      "/user-management/pengajuan-src/create": "principal.pengajuansrc.buat",
      "/user-management/pengajuan-src/edit/": "principal.pengajuansrc.ubah",
      "/user-management/pengajuan-src/detail/": "principal.pengajuansrc.lihat",
      "/user-management/private-label": "principal.privatelabel.lihat",
      "/user-management/private-label/create": "principal.privatelabel.buat",
      "/user-management/private-label/edit/": "principal.privatelabel.ubah",
      "/user-management/private-label/detail/": "principal.privatelabel.lihat",
      "/callobj/call-objective-list": "principal.callobjective.lihat",
      "/callobj/call-objective-create": "principal.callobjective.buat",
      "/callobj/call-objective-edit/": "principal.callobjective.ubah",
      "/user-management/panel-partnership": "principal.partnership.lihat",
      "/user-management/panel-partnership/create": "principal.partnership.buat",
      "/user-management/panel-partnership/edit/": "principal.partnership.ubah",
      "/user-management/panel-partnership/detail/": "principal.partnership.lihat",
      "/user-management/call-to-action": "principal.call-to-action.lihat",
      "/advertisement/banner": "principal.spanduk.lihat",
      "/advertisement/banner/create": "principal.spanduk.buat",
      "/advertisement/banner/edit": "principal.spanduk.ubah",
      "/advertisement/banner/detail": "principal.spanduk.lihat",
      "/advertisement/landing-page": "principal.halamantujuan.lihat",
      "/advertisement/landing-page/create": "principal.halamantujuan.buat",
      "/advertisement/landing-page/edit": "principal.halamantujuan.ubah",
      "/advertisement/landing-page/detail": "principal.halamantujuan.lihat",
      "/sku-management/product": "principal.produk.lihat",
      "/sku-management/product/create": "principal.produk.buat",
      "/sku-management/product/edit/": "principal.produk.ubah",
      "/sku-management/product/detail/": "principal.produk.lihat",
      "/sku-management/product-cashier": "principal.produk_kasir.lihat",
      "/sku-management/product-cashier/create": "principal.produk_kasir.buat",
      "/sku-management/product-cashier/edit/": "principal.produk_kasir.ubah",
      "/sku-management/product-cashier/detail/": "principal.produk_kasir.lihat",
      "/sku-management/product-cashier/submission": "principal.produk_kasir.pengajuan_produk",
      "/sku-management/product-cashier/submission/detail/": "principal.produk_kasir.pengajuan_produk",
      "/sku-management/db-product-submission": "principal.pengajuan_produk_db.pengajuan_produk",
      "/sku-management/db-product-submission/detail/": "principal.pengajuan_produk_db.pengajuan_produk",
      "/sku-management/db-product-submission/approval": "principal.pengajuan_produk_db.pengaturan_approval",
      "/sku-management/reward": "principal.hadiah.lihat",
      "/sku-management/reward/create": "principal.hadiah.buat",
      "/sku-management/reward/edit": "principal.hadiah.ubah",
      "/sku-management/reward/detail": "principal.hadiah.lihat",
      "/sku-management/reward-history": "principal.riyawathadiah.lihat",
      "/sku-management/coin": "principal.manajemenkoin.lihat",
      "/sku-management/coin/detail-retailer/": "principal.manajemenkoin.lihat",
      "/sku-management/coin/detail-trade-program/": "principal.manajemenkoin.lihat",
      "/loyalty-keping/catalogues": "principal.katalog_keping.lihat",
      "/loyalty-keping/redeems": "principal.riwayat_penukaran_keping.lihat",
      "/loyalty-keping/sources": "principal.riwayat_pendapatan_keping.lihat",
      "/loyalty-keping/settings/stars": "principal.pengaturan_keping_bintang_ke_keping.lihat",
      "/loyalty-keping/settings/coo": "principal.pengaturan_keping_pesan_antar.lihat",
      "/loyalty-keping/settings/cashier": "principal.pengaturan_keping_belanja_langsung.lihat",
      "/loyalty-keping/resets": "principal.reset_keping.lihat",
      "/notifications/push-notification": "principal.notifikasi.lihat",
      "/notifications/push-notification/create": "principal.notifikasi.buat",
      "/notifications/popup-notification": "principal.popupnotification.lihat",
      "/notifications/popup-notification/create": "principal.popupnotification.buat",
      "/notifications/popup-notification/edit/": "principal.popupnotification.ubah",
      "/notifications/popup-notification/detail/": "principal.popupnotification.lihat",
      "/notifications/push-notification/detail/": "principal.notifikasi.lihat",
      "/newsfeed-management/category": "principal.kategorinewsfeed.lihat",
      "/newsfeed-management/category/create": "principal.kategorinewsfeed.buat",
      "/newsfeed-management/category/edit": "principal.kategorinewsfeed.ubah",
      "/newsfeed-management/category/detail": "principal.kategorinewsfeed.lihat",
      "/newsfeed-management/news": "principal.daftarberita.lihat",
      "/newsfeed-management/news/detail": "principal.daftarberita.ubah",
      "/dte/pengaturan-attribute-misi": "principal.pengaturanattributemisi.lihat",
      "/dte/template-task": "principal.tugas.lihat",
      "/dte/template-task/create": "principal.tugas.buat",
      "/dte/template-task/edit": "principal.tugas.ubah",
      "/dte/template-task/detail": "principal.tugas.lihat",
      "/dte/template-task/create-personalize": "principal.tugas.buat",
      "/dte/template-task/edit-personalize": "principal.tugas.ubah",
      "/dte/template-task/detail-personalize": "principal.tugas.lihat",
      "/dte/group-trade-program": "principal.dtegrouptradeprogram.lihat",
      "/dte/group-trade-program/create": "principal.dtegrouptradeprogram.buat",
      "/dte/group-trade-program/edit": "principal.dtegrouptradeprogram.ubah",
      "/dte/group-trade-program/detail": "principal.dtegrouptradeprogram.lihat",
      "/dte/trade-program": "principal.tradeprogram.lihat",
      "/dte/trade-program/create": "principal.tradeprogram.buat",
      "/dte/trade-program/edit": "principal.tradeprogram.ubah",
      "/dte/trade-program/detail": "principal.tradeprogram.lihat",
      "/dte/schedule-trade-program": "principal.scheduleprogram.lihat",
      "/dte/schedule-trade-program/create": "principal.scheduleprogram.buat",
      "/dte/schedule-trade-program/edit/": "principal.scheduleprogram.ubah",
      "/dte/schedule-trade-program/detail/": "principal.scheduleprogram.lihat",
      "/dte/audience": "principal.audience.lihat",
      "/dte/audience/create": "principal.audience.buat",
      "/dte/audience/edit": "principal.audience.ubah",
      "/dte/audience/detail": "principal.audience.lihat",
      "/dte/audience/create-personalize": "principal.audience.buat",
      "/dte/audience/edit-personalize": "principal.audience.ubah",
      "/dte/audience/detail-personalize": "principal.audience.lihat",
      "/dte/automation": "principal.dteautomation.lihat",
      "/dte/automation/create": "principal.dteautomation.buat",
      "/dte/automation/edit": "principal.dteautomation.ubah",
      "/dte/automation/detail": "principal.dteautomation.lihat",
      "/dte/dynamic-pricing": "principal.dtedynamicpricing.lihat",
      "/dte/publish-mission": "principal.dtepublishmission.buat",
      "/dte/publish-mission/edit/": "principal.dtepublishmission.ubah",
      "/dte/publish-mission/detail/": "principal.dtepublishmission.lihat",

      "/dte/master-brand-group": "principal.dte_image_recognition_master_brand_group.lihat",
      "/dte/master-brand-group/create": "principal.dte_image_recognition_master_brand_group.buat",
      "/dte/master-brand-group/edit/": "principal.dte_image_recognition_master_brand_group.ubah",
      "/dte/master-brand-group/detail/": "principal.dte_image_recognition_master_brand_group.lihat",
      "/dte/master-brand": "principal.dte_image_recognition_master_brand.lihat",
      "/dte/master-brand/create": "principal.dte_image_recognition_master_brand.buat",
      "/dte/master-brand/edit/": "principal.dte_image_recognition_master_brand.ubah",
      "/dte/master-brand/detail/": "principal.dte_image_recognition_master_brand.lihat",

      "/settings/access": "principal.akses.lihat",
      "/settings/access/create": "principal.akses.buat",
      "/settings/access/edit/": "principal.akses.ubah",
      "/settings/access/detail/": "principal.akses.lihat",
      "/settings/account": "principal.ubahpassword.lihat",
      "/settings/force-update-apps": "principal.forceupdate.lihat",
      "/delivery/courier": "principal.delivery_courier.lihat",
      "/delivery/courier/create": "principal.delivery_courier.buat",
      "/delivery/courier/edit": "principal.delivery_courier.ubah",
      "/delivery/courier/detail": "principal.delivery_courier.lihat",
      // "/delivery/courier/create": "principal.courier.buat",
      // "/delivery/courier/edit": "principal.courier.ubah",
      // "/delivery/courier/detail": "principal.courier.lihat",
      "/task-sequencing/task-sequencing": "principal.task_sequencing.lihat",
      "/task-sequencing/task-sequencing/create": "principal.task_sequencing.buat",
      "/customer-care/pertanyaan-verifikasi-agent": "principal.customercareverificationagent.lihat",
      "/customer-care/pertanyaan-verifikasi-agent/detail": "principal.customercareverificationagent.lihat",
      "/settings/feature-level": "principal.feature_level.lihat",
      "/settings/feature-level/create": "principal.feature_level.buat",
      "/settings/feature-level/edit": "principal.feature_level.ubah",
      "/settings/feature-level/detail": "principal.feature_level.lihat",
      "/paylater/distribution": "principal.paylater_distribution.lihat",
      "/user-management/languages": "principal.languages.lihat",
      "/user-management/languages/create": "principal.languages.buat",
      "/user-management/languages/edit/": "principal.languages.ubah",
      "/user-management/languages/detail/": "principal.languages.lihat",
      "/user-management/countries": "principal.countries.lihat",
      "/user-management/countries/create": "principal.countries.buat",
      "/user-management/countries/edit/": "principal.countries.ubah",
      "/user-management/countries/detail/": "principal.countries.lihat",
      "/advertisement/promo-mandiri": "principal.promomandiri.lihat",
    }
    return PAGES[name];
  }

  getRoles(name) {
    let localPerm = window.localStorage.getItem('_prmdxtrn');
    let perm = SJCL.decrypt("dxtr-asia.sampoerna", JSON.parse(localPerm)) || '{}';
    const permission = JSON.parse(perm);
    // console.log("all permission", permission.filter(prm => prm.indexOf("principal.popupnotification.new_product") > -1));
    if (!permission) return;

    let query = name.toLowerCase();
    let filterPermission = permission.filter(item => item !== null).filter(item => item.indexOf(query) >= 0);
    let roles = {
      "lihat": filterPermission.filter(item => item.indexOf('lihat') >= 0)[0],
      "buat": filterPermission.filter(item => item.indexOf('buat') >= 0)[0],
      "ubah": filterPermission.filter(item => item.indexOf('ubah') >= 0)[0],
      "hapus": filterPermission.filter(item => item.indexOf('hapus') >= 0)[0],
    };

    if (name.indexOf("produk_kasir") >= 0) {
      roles["pengajuan_produk"] = filterPermission.filter((item) => item.indexOf("pengajuan_produk") >= 0)[0];
    }

    if (name.indexOf("pengajuan_produk_db") >= 0) {
      roles["pengajuan_produk"] = filterPermission.filter((item) => item.indexOf("pengajuan_produk") >= 0)[0];
      roles["pengaturan_approval"] = filterPermission.filter((item) => item.indexOf("pengaturan_approval") >= 0)[0];
    }

    if (name.indexOf("b2b_voucher") > -1) {
      roles['b2b_approval'] = filterPermission.filter(item => item.indexOf('approval') >= 0)[0]
    }

    if (name.indexOf("popupnotification") > -1) {
      roles['new_product'] = filterPermission.filter(item => item.indexOf('popupnotification.new_product') >= 0)[0]
    }

    if (name.indexOf('supplierorder') > -1) {
      roles['chat'] = filterPermission.filter(item => item.indexOf('chat_transaksi') >= 0)[0];
      roles['document'] = filterPermission.filter(item => item.indexOf('document') >= 0)[0];
    }
    if (name.indexOf("src_katalog_coin") > -1) {
      roles['approval'] = filterPermission.filter(item => item.indexOf('approval') >= 0)[0]
    }
    const submenus = filterPermission.filter(item => item.indexOf('submenu') >= 0);
    if (Array.isArray(submenus)) {
      submenus.map((value) => {

        // split submenu , then take last index of array. ex: principal.retailer.submenu.status_business it will return status_business
        let submenuKey = value.split('.');
        submenuKey = submenuKey[submenuKey.length - 1];

        roles[submenuKey] = value.replace('.submenu.', '.');
      });
    }

    const exports = filterPermission.filter(item => item.indexOf('export') >= 0);
    if (exports) {
      exports.forEach(value => {
        let submenuKey = value.split('.');
        submenuKey = submenuKey[submenuKey.length - 1];
        roles[submenuKey] = value.replace('.export.', '.');
      });
    }

    return roles
  }

  getArrayRoles(name) {
    let localPerm = window.localStorage.getItem('_prmdxtrn');
    let perm = SJCL.decrypt("dxtr-asia.sampoerna", JSON.parse(localPerm)) || '{}';
    const permission = JSON.parse(perm);
    // console.log("all permission", permission.filter(prm => prm.indexOf("principal.popupnotification.new_product") > -1));
    if (!permission) return;

    let query = name.toLowerCase();
    let filterPermission = permission.filter(item => item !== null).filter(item => item.indexOf(query) >= 0);

    return filterPermission
  }
}
