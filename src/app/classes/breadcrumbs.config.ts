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
    ]
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
          url: "/content-management/term-and-condition",
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
          url: "/content-management/term-and-condition",
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
    }
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
  }
};
