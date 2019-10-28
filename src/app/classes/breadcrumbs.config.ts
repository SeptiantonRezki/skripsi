export const brConfig = {
  products: {
    index: [
      {
        type: "current",
        url: "/products",
        name: "Product List"
      }
    ]
  },
  profile: {
    myProfile: {
      index: [
        {
          type: "current",
          url: "",
          name: "Profil Saya"
        }
      ]
    }
  },
  adminprincipal: {
    index: [
      {
        type: "current",
        url: "/user-management/admin-principal",
        name: "Daftar Admin Principal"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/user-management/admin-principal",
        name: "Daftar Admin Principal"
      },
      {
        type: "current",
        url: "",
        name: "Buat Admin Principal"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/user-management/admin-principal",
        name: "Daftar Admin Principal"
      },
      {
        type: "current",
        url: "",
        name: "Ubah Admin Principal"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/user-management/admin-principal",
        name: "Daftar Admin Principal"
      },
      {
        type: "current",
        url: "",
        name: "Detail Admin Principal"
      }
    ]
  },
  fieldforce: {
    index: [
      {
        type: "current",
        url: "/user-management/field-force",
        name: "Daftar Field Force"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/user-management/field-force",
        name: "Daftar Field Force"
      },
      {
        type: "current",
        url: "",
        name: "Buat Field Force"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/user-management/field-force",
        name: "Daftar Field Force"
      },
      {
        type: "current",
        url: "",
        name: "Ubah Field Force"
      }
    ]
    ,
    detail: [
      {
        type: "parent",
        url: "/user-management/field-force",
        name: "Daftar Field Force"
      },
      {
        type: "current",
        url: "",
        name: "Detail Field Force"
      }
    ]
  },
  paguyuban: {
    index: [
      {
        type: "current",
        url: "",
        name: "Daftar Paguyuban"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/user-management/paguyuban",
        name: "Daftar Paguyuban"
      },
      {
        type: "current",
        url: "",
        name: "Buat Paguyuban"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/user-management/paguyuban",
        name: "Daftar Paguyuban"
      },
      {
        type: "current",
        url: "",
        name: "Ubah Paguyuban"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/user-management/paguyuban",
        name: "Daftar Paguyuban"
      },
      {
        type: "current",
        url: "",
        name: "Detail Paguyuban"
      }
    ]
  },
  wholesaler: {
    index: [
      {
        type: "current",
        url: "",
        name: "Daftar Wholesaler"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/user-management/wholesaler",
        name: "Daftar Wholesaler"
      },
      {
        type: "current",
        url: "",
        name: "Buat Wholesaler"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/user-management/wholesaler",
        name: "Daftar Wholesaler"
      },
      {
        type: "current",
        url: "",
        name: "Ubah Wholesaler"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/user-management/wholesaler",
        name: "Daftar Wholesaler"
      },
      {
        type: "current",
        url: "",
        name: "Detail Wholesaler"
      }
    ]
  },
  retailer: {
    index: [
      {
        type: "current",
        url: "",
        name: "Daftar Retailer"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/user-management/retailer",
        name: "Daftar Retailer"
      },
      {
        type: "current",
        url: "",
        name: "Buat Retailer"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/user-management/retailer",
        name: "Daftar Retailer"
      },
      {
        type: "current",
        url: "",
        name: "Ubah Retailer"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/user-management/retailer",
        name: "Daftar Retailer"
      },
      {
        type: "current",
        url: "",
        name: "Detail Retailer"
      }
    ]
  },
  customer: {
    index: [
      {
        type: "current",
        url: "",
        name: "Daftar Consumer"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/user-management/customer",
        name: "Daftar Consumer"
      },
      {
        type: "current",
        url: "",
        name: "Detail Consumer"
      }
    ]
  },
  partnership: {
    index: [
      {
        type: "current",
        url: "",
        name: "Daftar Principal Partnership"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/user-management/principal-partnership",
        name: "Daftar Principal Partnership"
      },
      {
        type: "current",
        url: "",
        name: "Buat Principal Partnership"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/user-management/principal-partnership",
        name: "Daftar Principal Partnership"
      },
      {
        type: "current",
        url: "",
        name: "Ubah Principal Partnership"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/user-management/principal-partnership",
        name: "Daftar Principal Partnership"
      },
      {
        type: "current",
        url: "",
        name: "Detail Principal Partnership"
      }
    ]
  },
  inappMarketing: {
    banner: {
      index: [
        {
          type: "current",
          url: "",
          name: "Spanduk Online"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/advertisement/banner",
          name: "Spanduk Online"
        },
        {
          type: "current",
          url: "",
          name: "Buat Spanduk Online"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/advertisement/banner",
          name: "Spanduk Online"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Spanduk Online"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/advertisement/banner",
          name: "Spanduk Online"
        },
        {
          type: "current",
          url: "",
          name: "Detail Spanduk Online"
        }
      ]
    },
    landingPage: {
      index: [
        {
          type: "current",
          url: "",
          name: "Halaman Tujuan"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/advertisement/landing-page",
          name: "Halaman Tujuan"
        },
        {
          type: "current",
          url: "",
          name: "Buat Halaman Tujuan"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/advertisement/landing-page",
          name: "Halaman Tujuan"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Halaman Tujuan"
        }
      ]
    }
  },
  skuManagement: {
    product: {
      index: [
        {
          type: "current",
          url: "",
          name: "Daftar Produk"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/sku-management/product",
          name: "Daftar Produk"
        },
        {
          type: "current",
          url: "",
          name: "Tambah Produk"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/sku-management/product",
          name: "Daftar Produk"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Produk"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/sku-management/product",
          name: "Daftar Produk"
        },
        {
          type: "current",
          url: "",
          name: "Detail Produk"
        }
      ]
    },
    reward: {
      index: [
        {
          type: "current",
          url: "",
          name: "Katalog Hadiah"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/sku-management/reward",
          name: "Katalog Hadiah"
        },
        {
          type: "current",
          url: "",
          name: "Buat Katalog Hadiah"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/sku-management/reward",
          name: "Katalog Hadiah"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Katalog Hadiah"
        }
      ]
    },
    rewardHistory: {
      index: [
        {
          type: "current",
          url: "",
          name: "Riwayat Penukaaran"
        }
      ]
    },
    coin: {
      index: [
        {
          type: "current",
          url: "",
          name: "Manajemen Koin"
        }
      ],
      trade: [
        {
          type: "parent",
          url: "/sku-management/coin",
          name: "Manajemen Koin"
        },
        {
          type: "current",
          url: "",
          name: "Detail Trade Program"
        }
      ],
      retailer: [
        {
          type: "parent",
          url: "/sku-management/coin",
          name: "Manajemen Koin"
        },
        {
          type: "current",
          url: "",
          name: "Detail Retailer"
        }
      ]
    }
  },
  dte: {
    template: {
      index: [
        {
          type: "current",
          url: "",
          name: "Daftar Tugas"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/dte/template-task",
          name: "Daftar Tugas"
        },
        {
          type: "current",
          url: "",
          name: "Buat Tugas"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/dte/template-task",
          name: "Daftar Tugas"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Tugas"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/dte/template-task",
          name: "Daftar Tugas"
        },
        {
          type: "current",
          url: "",
          name: "Detail Tugas"
        }
      ]
    },
    trade: {
      index: [
        {
          type: "current",
          url: "",
          name: "Trade Program"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/dte/trade-program",
          name: "Trade Program"
        },
        {
          type: "current",
          url: "",
          name: "Buat Trade Program"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/dte/trade-program",
          name: "Trade Program"
        },
        {
          type: "current",
          url: "",
          name: "Detail Trade Program"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/dte/trade-program",
          name: "Trade Program"
        },
        {
          type: "current",
          url: "",
          name: "Detail Trade Program"
        }
      ]
    },
    scheduleProgram: {
      index: [
        {
          type: "current",
          url: "",
          name: "Pengaturan Jadwal Trade Program"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/dte/schedule-trade-program",
          name: "Pengaturan Jadwal Trade Program"
        },
        {
          type: "current",
          url: "",
          name: "Buat Jadwal Trade Program"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/dte/schedule-trade-program",
          name: "Pengaturan Jadwal Trade Program"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Jadwal Trade Program"
        }
      ]
    },
    audience: {
      index: [
        {
          type: "current",
          url: "",
          name: "Audience"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/dte/audience",
          name: "Audience"
        },
        {
          type: "current",
          url: "",
          name: "Buat Audience"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/dte/audience",
          name: "Audience"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Audience"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/dte/audience",
          name: "Audience"
        },
        {
          type: "current",
          url: "",
          name: "Detail Audience"
        }
      ]
    },
    automation: {
      index: [
        {
          type: "current",
          url: "",
          name: "DTE Automation"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/dte/automation",
          name: "DTE Automation"
        },
        {
          type: "current",
          url: "",
          name: "Buat DTE Automation"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/dte/automation",
          name: "DTE Automation"
        },
        {
          type: "current",
          url: "",
          name: "Ubah DTE Automation"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/dte/automation",
          name: "DTE Automation"
        },
        {
          type: "current",
          url: "",
          name: "Detail DTE Automation"
        }
      ]
    }
  },
  notification: {
    index: [
      {
        type: "current",
        url: "",
        name: "Notifikasi"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/notifications",
        name: "Notifikasi"
      },
      {
        type: "current",
        url: "",
        name: "Buat Notifikasi"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/notifications",
        name: "Notifikasi"
      },
      {
        type: "current",
        url: "",
        name: "Ubah Notifikasi"
      }
    ],
    popup: {
      index: [
        {
          type: "current",
          url: "",
          name: "Pop-up Notifikasi"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/notifications/popup-notification",
          name: "Pop-up Notifikasi"
        },
        {
          type: "current",
          url: "",
          name: "Buat Pop-up Notifikasi"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/notifications/popup-notification",
          name: "Pop-up Notifikasi"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Pop-up Notifikasi"
        }
      ],
    }
  },
  contentManagement: {
    tnc: {
      index: [
        {
          type: "current",
          url: "",
          name: "Syarat & Ketentuan"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/content-management/terms-and-condition",
          name: "Syarat & Ketentuan"
        },
        {
          type: "current",
          url: "",
          name: "Buat Syarat & Ketentuan"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/content-management/terms-and-condition",
          name: "Syarat & Ketentuan"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Syarat & Ketentuan"
        }
      ]
    },
    privacy: {
      index: [
        {
          type: "current",
          url: "",
          name: "Kebijakan Privasi"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/content-management/privacy",
          name: "Kebijakan Privasi"
        },
        {
          type: "current",
          url: "",
          name: "Buat Kebijakan Privasi"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/content-management/privacy",
          name: "Kebijakan Privasi"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Kebijakan Privasi"
        }
      ]
    },
    help: {
      index: [
        {
          type: "current",
          url: "",
          name: "Bantuan"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/content-management/help",
          name: "Bantuan"
        },
        {
          type: "current",
          url: "",
          name: "Buat Bantuan"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/content-management/help",
          name: "Bantuan"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Bantuan"
        }
      ]
    },
    report_list: {
      index: [
        {
          type: "current",
          url: "",
          name: "Daftar Laporan"
        }
      ],
      detail_promo: [
        {
          type: "parent",
          url: "/content-management/report-list",
          name: "Daftar Laporan"
        },
        {
          type: "current",
          url: "",
          name: "Detail Promo"
        }
      ],
      detail_history: [
        {
          type: "parent",
          url: "/content-management/report-list",
          name: "Daftar Laporan"
        },
        {
          type: "current",
          url: "",
          name: "Detail Promo"
        }
      ]
    }
  },
  newsfeedManagement: {
    category: {
      index: [
        {
          type: "current",
          url: "",
          name: "Kategori Newsfeed"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/newsfeed-management/category",
          name: "Kategori Newsfeed"
        },
        {
          type: "current",
          url: "",
          name: "Buat Kategori"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/newsfeed-management/category",
          name: "Kategori Newsfeed"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Kategori"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/newsfeed-management/category",
          name: "Kategori Newsfeed"
        },
        {
          type: "current",
          url: "",
          name: "Detail Kategori"
        }
      ]
    },
    news: {
      index: [
        {
          type: "parent",
          url: "/newsfeed-management/category",
          name: "Kategori Newsfeed"
        },
        {
          type: "current",
          url: "",
          name: "Daftar Berita"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/newsfeed-management/category",
          name: "Kategori Newsfeed"
        },
        {
          type: "parent",
          url: "/newsfeed-management/news",
          name: "Daftar Berita"
        },
        {
          type: "current",
          url: "/newsfeed-management/news",
          name: "Detail Berita"
        }
      ]
    }
  },
  settings: {
    access: {
      index: [
        {
          type: "current",
          url: "",
          name: "Akses Karyawan"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/settings/access",
          name: "Akses Karyawan"
        },
        {
          type: "current",
          url: "",
          name: "Buat Tingkatan Akses"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/settings/access",
          name: "Akses Karyawan"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Tingkatan Akses"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/settings/access",
          name: "Akses Karyawan"
        },
        {
          type: "current",
          url: "",
          name: "Detail Tingkatan Akses"
        }
      ]
    },
    account: {
      index: [
        {
          type: "current",
          url: "",
          name: "Ubah Kata Sandi"
        }
      ]
    },
    force_update: [
      {
        type: "current",
        url: "",
        name: "Pemberitahuan Aplikasi"
      }
    ],
    support: [
      {
        type: "current",
        url: "",
        name: "Bantuan"
      }
    ]
  },
  admin: {
    user: {
      index: [
        {
          type: "parent",
          url: "/admin",
          name: "Admin"
        },
        {
          type: "current",
          url: "",
          name: "User"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/admin",
          name: "Admin"
        },
        {
          type: "parent",
          url: "/admin/user",
          name: "User"
        },
        {
          type: "current",
          url: "",
          name: "Create"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/admin",
          name: "Admin"
        },
        {
          type: "parent",
          url: "/admin/user",
          name: "User"
        },
        {
          type: "current",
          url: "",
          name: "Edit"
        }
      ]
    },

    role: {
      index: [
        {
          type: "parent",
          url: "/admin",
          name: "Admin"
        },
        {
          type: "current",
          url: "",
          name: "Role"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/admin",
          name: "Admin"
        },
        {
          type: "parent",
          url: "/admin/role",
          name: "Role"
        },
        {
          type: "current",
          url: "",
          name: "Create"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/admin",
          name: "Admin"
        },
        {
          type: "parent",
          url: "/admin/role",
          name: "Role"
        },
        {
          type: "current",
          url: "",
          name: "Edit"
        }
      ]
    }
  },
  analytics: {
    user_database: {
      user_onboarding: [
        {
          type: "parent",
          url: "/dashboard",
          name: "AYO SRC User Database"
        },
        {
          type: "current",
          url: "",
          name: "User Onboarding"
        }
      ],
      user_onboarding_register_src: [
        {
          type: "parent",
          url: "/dashboard",
          name: "AYO SRC User Database"
        },
        {
          type: "parent",
          url: "/dashboard/user-onboarding",
          name: "User Onboarding"
        },
        {
          type: "current",
          url: "",
          name: "Register SRC"
        }
      ],
      user_onboarding_register_user: [
        {
          type: "parent",
          url: "/dashboard",
          name: "AYO SRC User Database"
        },
        {
          type: "parent",
          url: "/dashboard/user-onboarding",
          name: "User Onboarding"
        },
        {
          type: "current",
          url: "",
          name: "Register User"
        }
      ]
    },
    b2b_platform: {
      transaction_report: [
        {
          type: "parent",
          url: "/dashboard/transaction-report",
          name: "B2B Platform"
        },
        {
          type: "current",
          url: "",
          name: "Transaction Report"
        }
      ],
      brand_performance: [
        {
          type: "parent",
          url: "/dashboard/transaction-report",
          name: "B2B Platform"
        },
        {
          type: "current",
          url: "",
          name: "Brand Performance"
        }
      ],
      brand_performance_detail: [
        {
          type: "parent",
          url: "/dashboard/transaction-report",
          name: "B2B Platform"
        },
        {
          type: "parent",
          url: "/dashboard/brand-performance",
          name: "Brand Performance"
        },
        {
          type: "current",
          url: "",
          name: "Detail"
        }
      ],
      loyalty_management: [
        {
          type: "parent",
          url: "/dashboard/transaction-report",
          name: "B2B Platform"
        },
        {
          type: "current",
          url: "",
          name: "Loyalty Management"
        }
      ],
      register_src_trend: [
        {
          type: "parent",
          url: "/dashboard/transaction-report",
          name: "B2B Platform"
        },
        {
          type: "parent",
          url: "/dashboard/transaction-report",
          name: "Transaction Report"
        },
        {
          type: "current",
          url: "",
          name: "Register SRC in AYO SRC (Trend)"
        }
      ],
      top10_category: [
        {
          type: "parent",
          url: "/dashboard/transaction-report",
          name: "B2B Platform"
        },
        {
          type: "parent",
          url: "/dashboard/transaction-report",
          name: "Transaction Report"
        },
        {
          type: "current",
          url: "",
          name: "Top 10 Category (Revenue)"
        }
      ],
      top5_ws: [
        {
          type: "parent",
          url: "/dashboard/transaction-report",
          name: "B2B Platform"
        },
        {
          type: "parent",
          url: "/dashboard/transaction-report",
          name: "Transaction Report"
        },
        {
          type: "current",
          url: "",
          name: "Top 5 Wholesaler"
        }
      ],
      bottom5_ws: [
        {
          type: "parent",
          url: "/dashboard/transaction-report",
          name: "B2B Platform"
        },
        {
          type: "parent",
          url: "/dashboard/transaction-report",
          name: "Transaction Report"
        },
        {
          type: "current",
          url: "",
          name: "Bottom 5 Wholesaler"
        }
      ]
    },
    b2c_platform: {
      consumer: [
        {
          type: "parent",
          url: "/dashboard/consumer-demographic",
          name: "B2C Platform"
        },
        {
          type: "current",
          url: "",
          name: "Consumer Demographic"
        }
      ],
      refferal: [
        {
          type: "parent",
          url: "/dashboard/consumer-demographic",
          name: "B2C Platform"
        },
        {
          type: "current",
          url: "",
          name: "Referral Code"
        }
      ],
      top5_referral: [
        {
          type: "parent",
          url: "/dashboard/consumer-demographic",
          name: "B2C Platform"
        },
        {
          type: "parent",
          url: "/dashboard/refferal-code",
          name: "Referral Code"
        },
        {
          type: "current",
          url: "",
          name: "Top 5 Referral Code"
        }
      ]
    },
    dte_platform: {
      dte_performance: [
        {
          type: "parent",
          url: "/dashboard/dte-performance",
          name: "DTE Platform"
        },
        {
          type: "current",
          url: "",
          name: "DTE Performance"
        }
      ]
    }
  },
  templateMessageManagement: {
    templateMessage: {
      index: [
        {
          type: "current",
          url: "",
          name: " Manajemen Template Pesan"
        }
      ],
    }
  },
};
