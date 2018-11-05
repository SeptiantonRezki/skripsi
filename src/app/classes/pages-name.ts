export class PagesName {
  getPages(name) {
    const PAGES = {
      "/user-management/admin-principal": "principal.adminprincipal.lihat",
      "/user-management/admin-principal/create": "principal.adminprincipal.buat",
      "/user-management/admin-principal/edit": "principal.adminprincipal.ubah",
      "/user-management/admin-principal/detail": "principal.adminprincipal.lihat",
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
      "/sku-management/reward": "principal.hadiah.lihat",
      "/sku-management/reward/create": "principal.hadiah.buat",
      "/sku-management/reward/edit": "principal.hadiah.ubah",
      "/sku-management/reward/detail": "principal.hadiah.lihat",
      "/sku-management/reward-history": "principal.riyawathadiah.lihat",
      "/sku-management/coin": "principal.manajemenkoin.lihat",
      "/sku-management/coin/detail-retailer/": "principal.manajemenkoin.lihat",
      "/sku-management/coin/detail-trade-program/": "principal.manajemenkoin.lihat",
      "/notifications": "principal.notifikasi.lihat",
      "/notifications/create": "principal.notifikasi.buat",
      "/newsfeed-management/category": "principal.kategorinewsfeed.lihat",
      "/newsfeed-management/category/create": "principal.kategorinewsfeed.buat",
      "/newsfeed-management/category/edit": "principal.kategorinewsfeed.ubah",
      "/newsfeed-management/category/detail": "principal.kategorinewsfeed.lihat",
      "/newsfeed-management/news": "principal.daftarberita.lihat",
      "/newsfeed-management/news/detail": "principal.daftarberita.ubah",
      "/dte/template-task": "principal.tugas.lihat",
      "/dte/template-task/create": "principal.tugas.buat",
      "/dte/template-task/edit": "principal.tugas.ubah",
      "/dte/template-task/detail": "principal.tugas.lihat",
      "/dte/trade-program": "principal.tradeprogram.lihat",
      "/dte/trade-program/create": "principal.tradeprogram.buat",
      "/dte/trade-program/edit": "principal.tradeprogram.ubah",
      "/dte/trade-program/detail": "principal.tradeprogram.lihat",
      "/dte/schedule-trade-program": "principal.scheduleprogram.lihat",
      "/dte/schedule-trade-program/create": "principal.scheduleprogram.buat",
      "/dte/schedule-trade-program/detail/": "principal.scheduleprogram.lihat",
      "/dte/audience": "principal.audience.lihat",
      "/dte/audience/create": "principal.audience.buat",
      "/dte/audience/edit": "principal.audience.ubah",
      "/dte/audience/detail": "principal.audience.lihat",
      "/settings/access": "principal.akses.lihat",
      "/settings/access/create": "principal.akses.buat",
      "/settings/access/edit/": "principal.akses.ubah",
      "/settings/access/detail/": "principal.akses.lihat",
      "/settings/account": "principal.ubahpassword.lihat",
    }
    return PAGES[name];
  }

  getRoles(name) {
    const permission = JSON.parse(localStorage.getItem('profile'))['roles'][0]['permissions'];
    if (!permission) return;

    let query = name.toLowerCase();
    let filterPermission = permission.filter(item => item.indexOf(query) >= 0);
    
    return {
      "lihat": filterPermission.filter(item => item.indexOf('lihat') >= 0)[0],
      "buat": filterPermission.filter(item => item.indexOf('buat') >= 0)[0],
      "ubah": filterPermission.filter(item => item.indexOf('ubah') >= 0)[0],
      "hapus": filterPermission.filter(item => item.indexOf('hapus') >= 0)[0],
    };
  }
}
