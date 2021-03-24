export const navigation = [
  {
    id: "home",
    title: "Home",
    translate: "Home",
    type: "group",
    children: [
      {
        id: "dashboard",
        title: "Dashboard",
        translate: "Dashboard",
        type: "item",
        icon: "home",
        url: "/dashboard"
      }
    ]
  },
  /*
    {
        'id'    : 'admin-management',
        'title' : 'admin-management',
        'translate':'admin Management',
        'type' :'group',
        'children' : [
            {
                'id':'user',
                'title':'user',
                'translate':'User',
                'type':'item',
                'icon':'people',
                'url':'/admin/user'
            },
            {
                'id':'role',
                'title':'role',
                'translate':'Role',
                'type':'item',
                'icon':'people',
                'url':'/admin/role'
            }
        ]
    },
    */
  {
    id: "user-management",
    title: "User Management",
    translate: "Management Pengguna",
    type: "group",
    children: [
      {
        id: "admin-principal",
        title: "Admin Principal",
        translate: "Admin Principal",
        type: "item",
        icon: "assignment",
        url: "/user-management/admin-principal"
      },
      {
        id: "field-force",
        title: "Field Force",
        translate: "Field force",
        type: "item",
        icon: "picture_in_picture",
        url: "/user-management/field-force"
      },
      // {
      //   id: "paguyuban",
      //   title: "Paguyuban",
      //   translate: "Paguyuban",
      //   type: "item",
      //   icon: "account_balance",
      //   url: "/user-management/paguyuban"
      // },
      {
        id: "wholesaler",
        title: "Wholesaler",
        translate: "Wholesaler",
        type: "item",
        icon: "domain",
        url: "/user-management/wholesaler"
      },
      {
        id: "retailer",
        title: "Retailer",
        translate: "Retailer",
        type: "item",
        icon: "store",
        url: "/user-management/retailer"
      },
      {
        id: "paguyuban",
        title: "Paguyuban",
        translate: "Paguyuban",
        type: "item",
        icon: "account_balance",
        url: "/user-management/paguyuban"
      },
      {
        id: "consumer",
        title: "Consumer",
        translate: "Consumer",
        type: "item",
        icon: "person",
        url: "/user-management/customer"
      },
      {
        id: "principal-partnership",
        title: "Principal Partnership",
        translate: "Principal Partnership",
        type: "item",
        icon: "domain",
        url: "/user-management/principal-partnership"
      }
      //   {
      //     id: "consumer",
      //     title: "Consumer",
      //     translate: "Consumer",
      //     type: "item",
      //     icon: "person",
      //     url: "/user-management/consumer"
      //   }
    ]
  },
  {
    id: "ads",
    title: "Application Ads",
    translate: "Iklan dalam Aplikasi",
    type: "group",
    children: [
      {
        id: "online-banner",
        title: "Online Banner",
        translate: "Spanduk Online",
        type: "item",
        icon: "image",
        url: "/advertisement/banner"
      },
      {
        id: "landing-page",
        title: "Landing Page",
        translate: "Halaman Tujuan",
        type: "item",
        icon: "language",
        url: "/advertisement/landing-page"
      }
    ]
  },
  {
    id: "customer-care",
    title: "Customer Care",
    translate: "Customer Care",
    type: "group",
    children: [
      {
        id: "pertanyaan-verifikasi-agent",
        title: "Questions Verification Agent",
        translate: "Pertanyaan Verifikasi Agent",
        type: "item",
        icon: "collections",
        url: "/customer-care/questions-verification-agent"
      },
    ]
  },
  {
    id: "product-management",
    title: "Product Management",
    translate: "Management Barang (SKU)",
    type: "group",
    children: [
      {
        id: "product",
        title: "Product",
        translate: "Produk",
        type: "item",
        icon: "collections",
        url: "/sku-management/product"
      },
      {
        id: "reward-catalog",
        title: "Reward Catalog",
        translate: "Katalog Hadiah",
        type: "item",
        icon: "image",
        url: "/sku-management/reward"
      },
      {
        id: "reward-history",
        title: "Reward History",
        translate: "Riwayat Hadiah",
        type: "item",
        icon: "timer",
        url: "/sku-management/reward-history"
      },
      {
        id: "coin-management",
        title: "Coin Management",
        translate: "Manajemen Koin",
        type: "item",
        icon: "stars",
        url: "/sku-management/coin"
      }
    ]
  },
  {
    id: "dte",
    title: "DTE",
    translate: "DTE",
    type: "group",
    children: [
      {
        id: "template-task",
        title: "Template Task",
        translate: "Template Tugas",
        type: "item",
        icon: "assignment",
        url: "/dte/template-task"
      },
      {
        id: "trade-program",
        title: "Trade Program",
        translate: "Trade Program",
        type: "item",
        icon: "assignment",
        url: "/dte/trade-program"
      },
      {
        id: "schedule-program",
        title: "Schedule Program",
        translate: "Pengatur Jadwal Trade Program",
        type: "item",
        icon: "date_range",
        url: "/dte/schedule-trade-program"
      },
      {
        id: "audience",
        title: "Audience",
        translate: "Audience",
        type: "item",
        icon: "person",
        url: "/dte/audience"
      }
    ]
  },
  {
    id: "notification",
    title: "Notification",
    translate: "Notifikasi",
    type: "group",
    children: [
      {
        id: "create-notification",
        title: "Create Notification",
        translate: "Buat Notifikasi",
        type: "item",
        icon: "notifications",
        url: "/notifications"
      }
    ]
  },
  {
    id: "content-management",
    title: "Content Management",
    translate: "Manajemen Konten",
    type: "group",
    children: [
      {
        id: "tnc",
        title: "Terms & Condition",
        translate: "Syarat & Ketentuan",
        type: "item",
        icon: "list_alt",
        url: "/content-management/terms-and-condition"
      },
      {
        id: "privacy-policy",
        title: "Privacy Policy",
        translate: "Kebijakan Privasi",
        type: "item",
        icon: "lock",
        url: "/content-management/privacy"
      },
      {
        id: "help",
        title: "Help",
        translate: "Bantuan",
        type: "item",
        icon: "description",
        url: "/content-management/help"
      }
    ]
  },
  {
    id: "newsfeed-management",
    title: "Newsfeed Management",
    translate: "Manajemen Newsfeed",
    type: "group",
    children: [
      {
        id: "newsfeed-category",
        title: "Newsfeed Category",
        translate: "Daftar Kategori",
        type: "item",
        icon: "view_agenda",
        url: "/newsfeed-management/category"
      },
      {
        id: "newsfeed-news",
        title: "Newsfeed News",
        translate: "Daftar Berita",
        type: "item",
        icon: "view_agenda",
        url: "/newsfeed-management/news"
      }
    ]
  },
  {
    id: "setting",
    title: "Setting",
    translate: "Pengaturan",
    type: "group",
    children: [
      {
        id: "user-access",
        title: "User Access",
        translate: "Akses Karyawan",
        type: "item",
        icon: "group_add",
        url: "/settings/access"
      },
      {
        id: "change-password",
        title: "Change Password",
        translate: "Ubah Kata Sandi",
        type: "item",
        icon: "vpn_key",
        url: "/settings/account"
      }
    ]
  }
  //   {
  //     id: "testing",
  //     title: "Testing",
  //     translate: "Example",
  //     type: "group",
  //     children: [
  //       {
  //         id: "module-1",
  //         title: "Module-1",
  //         translate: "Module Datatable example",
  //         type: "item",
  //         icon: "menu",
  //         url: "module-1"
  //       },
  //       {
  //         id: "module-2",
  //         title: "Module-2",
  //         translate: "Module form and validation example",
  //         type: "item",
  //         icon: "menu",
  //         url: "module-2"
  //       }
  //     ]
  //   }
];
