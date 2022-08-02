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
  vendors: {
    index: [
      {
        type: "current",
        url: "/src-catalogue/vendors",
        name: "Daftar Vendor"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/src-catalogue/vendors",
        name: "Daftar Vendor"
      },
      {
        type: "current",
        url: "",
        name: "Buat Vendor"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/src-catalogue/vendors",
        name: "Daftar Vendor"
      },
      {
        type: "current",
        url: "",
        name: "Ubah Vendor"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/src-catalogue/vendors",
        name: "Daftar Vendor"
      },
      {
        type: "current",
        url: "",
        name: "Detail Vendor"
      }
    ]
  },
  store_layout_template: {
    index: [
      {
        type: "current",
        url: "/src-catalogue/store-layout-template",
        name: "Daftar Template Layout Toko"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/src-catalogue/store-layout-template",
        name: "Daftar Template Layout Toko"
      },
      {
        type: "current",
        url: "",
        name: "Buat Template Layout Toko"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/src-catalogue/store-layout-template",
        name: "Daftar Template Layout Toko"
      },
      {
        type: "current",
        url: "",
        name: "Ubah Template Layout Toko"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/src-catalogue/store-layout-template",
        name: "Daftar Template Layout Toko"
      },
      {
        type: "current",
        url: "",
        name: "Detail Template Layout Toko"
      }
    ]
  },
  user_catalogue: {
    index: [
      {
        type: "current",
        url: "/src-catalogue/users",
        name: "Daftar Pengguna"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/src-catalogue/users",
        name: "Daftar Pengguna"
      },
      {
        type: "current",
        url: "",
        name: "Buat Pengguna"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/src-catalogue/users",
        name: "Daftar Pengguna"
      },
      {
        type: "current",
        url: "",
        name: "Ubah Pengguna"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/src-catalogue/users",
        name: "Daftar Pengguna"
      },
      {
        type: "current",
        url: "",
        name: "Detail Pengguna"
      }
    ]
  },
  product_catalogue: {
    index: [
      {
        type: "current",
        url: "/src-catalogue/products",
        name: "Daftar Product SRC Catalogue"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/src-catalogue/products",
        name: "Daftar Product SRC Catalogue"
      },
      {
        type: "current",
        url: "",
        name: "Buat Product SRC Catalogue"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/src-catalogue/products",
        name: "Daftar Product SRC Catalogue"
      },
      {
        type: "current",
        url: "",
        name: "Ubah Product SRC Catalogue"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/src-catalogue/products",
        name: "Daftar Product SRC Catalogue"
      },
      {
        type: "current",
        url: "",
        name: "Detail Product SRC Catalogue"
      }
    ]
  },
  order_catalogue: {
    index: [
      {
        type: "current",
        url: "/src-catalogue/products",
        name: "Daftar Pesanan SRC Catalogue"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/src-catalogue/products",
        name: "Daftar Pesanan SRC Catalogue"
      },
      {
        type: "current",
        url: "",
        name: "Detail Pesanan SRC Catalogue"
      }
    ]
  },
  adminprincipal: {
    index: [
      {
        type: "current",
        url: "/user-management/admin-principal",
        name: "breadcrumbs.adminprincipal.index"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/user-management/admin-principal",
        name: "breadcrumbs.adminprincipal.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.adminprincipal.create"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/user-management/admin-principal",
        name: "breadcrumbs.adminprincipal.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.adminprincipal.edit"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/user-management/admin-principal",
        name: "breadcrumbs.adminprincipal.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.adminprincipal.detail"
      }
    ]
  },
  fieldforce: {
    index: [
      {
        type: "current",
        url: "/user-management/field-force",
        name: "breadcrumbs.fieldforce.index"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/user-management/field-force",
        name: "breadcrumbs.fieldforce.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.fieldforce.create"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/user-management/field-force",
        name: "breadcrumbs.fieldforce.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.fieldforce.edit"
      }
    ]
    ,
    detail: [
      {
        type: "parent",
        url: "/user-management/field-force",
        name: "breadcrumbs.fieldforce.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.fieldforce.detail"
      }
    ]
  },
  rca_agent: {
    index: [
      {
        type: "current",
        url: "/rca/agent-pengguna",
        name: "Daftar RCA Agent"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/rca/agent-pengguna",
        name: "RCA Agent"
      },
      {
        type: "current",
        url: "",
        name: "Buat RCA Agent"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/rca/agent-pengguna",
        name: "RCA Agent"
      },
      {
        type: "current",
        url: "",
        name: "Edit RCA Agent"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/rca/agent-pengguna",
        name: "RCA Agent"
      },
      {
        type: "current",
        url: "",
        name: "Detail RCA Agent"
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
        name: "breadcrumbs.wholesaler.index"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/user-management/wholesaler",
        name: "breadcrumbs.wholesaler.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.wholesaler.create"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/user-management/wholesaler",
        name: "breadcrumbs.wholesaler.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.wholesaler.edit"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/user-management/wholesaler",
        name: "breadcrumbs.wholesaler.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.wholesaler.detail"
      }
    ]
  },
  retailer: {
    index: [
      {
        type: "current",
        url: "",
        name: "breadcrumbs.retailer.index"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/user-management/retailer",
        name: "breadcrumbs.retailer.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.retailer.create"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/user-management/retailer",
        name: "breadcrumbs.retailer.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.retailer.edit"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/user-management/retailer",
        name: "breadcrumbs.retailer.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.retailer.detail"
      }
    ],
    medalBadge: [
      {
        type: "current",
        url: "",
        name: "breadcrumbs.medal_badge.index"
      }
    ],
  },
  customer: {
    index: [
      {
        type: "current",
        url: "",
        name: "breadcrumbs.customer.index"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/user-management/customer",
        name: "breadcrumbs.customer.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.customer.detail"
      }
    ]
  },
  pengajuanSRC: {
    index: [
      {
        type: "current",
        url: "",
        name: "breadcrumbs.pengajuan_src.index"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/user-management/pengajuan-src",
        name: "breadcrumbs.pengajuan_src.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.pengajuan_src.create"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/user-management/pengajuan-src",
        name: "breadcrumbs.pengajuan_src.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.pengajuan_src.detail"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/user-management/pengajuan-src",
        name: "breadcrumbs.pengajuan_src.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.pengajuan_src.edit"
      }
    ]
  },
  partnership: {
    index: [
      {
        type: "current",
        url: "",
        name: "breadcrumbs.partnership.index"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/user-management/principal-partnership",
        name: "breadcrumbs.partnership.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.partnership.create"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/user-management/principal-partnership",
        name: "breadcrumbs.partnership.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.partnership.edit"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/user-management/principal-partnership",
        name: "breadcrumbs.partnership.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.partnership.detail"
      }
    ]
  },
  privatelabel: {
    panelpartnership: {
      index: [
        {
          type: "parent",
          url: "/user-management/panel-partnership",
          name: "breadcrumbs.panelpartnership.strategic_partnership"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.panelpartnership.index"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/user-management/panel-partnership",
          name: "breadcrumbs.panelpartnership.strategic_partnership"
        },
        {
          type: "parent",
          url: "/user-management/panel-partnership",
          name: "breadcrumbs.panelpartnership.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.panelpartnership.create"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/user-management/panel-partnership",
          name: "breadcrumbs.panelpartnership.strategic_partnership"
        },
        {
          type: "parent",
          url: "/user-management/panel-partnership",
          name: "breadcrumbs.panelpartnership.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.panelpartnership.edit"
        }
      ],
    },
    suppliercompany: {
      index: [
        {
          type: "parent",
          url: "/user-management/private-label",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.suppliercompany.index"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/user-management/private-label",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "parent",
          url: "/user-management/private-label",
          name: "breadcrumbs.privatelabel.suppliercompany.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.suppliercompany.create"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/user-management/private-label",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "parent",
          url: "/user-management/private-label",
          name: "breadcrumbs.privatelabel.suppliercompany.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.suppliercompany.edit"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/user-management/private-label",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "parent",
          url: "/user-management/private-label",
          name: "breadcrumbs.privatelabel.suppliercompany.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.suppliercompany.detail"
        }
      ]
    },
    usersupplier: {
      index: [
        {
          type: "parent",
          url: "/user-management/supplier-user",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.usersupplier.index"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/user-management/supplier-user",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "parent",
          url: "/user-management/supplier-user",
          name: "breadcrumbs.privatelabel.usersupplier.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.usersupplier.create"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/user-management/supplier-user",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "parent",
          url: "/user-management/supplier-user",
          name: "breadcrumbs.privatelabel.usersupplier.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.usersupplier.edit"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/user-management/supplier-user",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "parent",
          url: "/user-management/supplier-user",
          name: "breadcrumbs.privatelabel.usersupplier.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.usersupplier.detail"
        }
      ]
    },
    panelmitra: {
      index: [
        {
          type: "parent",
          url: "/user-management/supplier-panel-mitra",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.panelmitra.index"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/user-management/supplier-panel-mitra",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "parent",
          url: "/user-management/supplier-panel-mitra",
          name: "breadcrumbs.privatelabel.panelmitra.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.panelmitra.create"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/user-management/supplier-panel-mitra",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "parent",
          url: "/user-management/supplier-panel-mitra",
          name: "breadcrumbs.privatelabel.panelmitra.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.panelmitra.edit"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/user-management/supplier-panel-mitra",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "parent",
          url: "/user-management/supplier-panel-mitra",
          name: "breadcrumbs.privatelabel.panelmitra.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.panelmitra.detail"
        }
      ]
    },
    ordertosupplier: {
      index: [
        {
          type: "parent",
          url: "/user-management/supplier-order",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.ordertosupplier.index"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/user-management/supplier-order",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "parent",
          url: "/user-management/supplier-order",
          name: "breadcrumbs.privatelabel.ordertosupplier.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.ordertosupplier.edit"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/user-management/supplier-order",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "parent",
          url: "/user-management/supplier-order",
          name: "breadcrumbs.privatelabel.ordertosupplier.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.ordertosupplier.detail"
        }
      ]
    },
    supplierSettings: {
      index: [
        {
          type: "parent",
          url: "/user-management/supplier-settings",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.suppliersettings.index"
        }
      ],
      stockEdit: [
        {
          type: "parent",
          url: "/user-management/supplier-settings",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "parent",
          url: "/user-management/supplier-settings",
          name: "breadcrumbs.privatelabel.suppliersettings.stock"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.suppliersettings.stock_edit"
        }
      ],
      paymentMethodEdit: [
        {
          type: "parent",
          url: "/user-management/supplier-settings",
          name: "breadcrumbs.privatelabel.index"
        },
        {
          type: "parent",
          url: "/user-management/supplier-settings",
          name: "breadcrumbs.privatelabel.suppliersettings.payment_method"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.privatelabel.suppliersettings.payment_method_edit"
        }
      ],
    },
    supplierVouchers: {
      index: [
        {
          type: "current",
          url: "/user-management/supplier-vouchers",
          name: "breadcrumbs.privatelabel.suppliervouchers.index"
        }
      ],
    }
  },
  inappMarketing: {
    banner: {
      index: [
        {
          type: "current",
          url: "",
          name: "breadcrumbs.banner.index"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/advertisement/banner",
          name: "breadcrumbs.banner.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.banner.create"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/advertisement/banner",
          name: "breadcrumbs.banner.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.banner.edit"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/advertisement/banner",
          name: "breadcrumbs.banner.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.banner.detail"
        }
      ],
      sorting: [
        {
          type: "parent",
          url: "/advertisement/banner",
          name: "breadcrumbs.banner.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.banner.sorting"
        }
      ]
    },
    landingPage: {
      index: [
        {
          type: "current",
          url: "",
          name: "breadcrumbs.landingpage.index"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/advertisement/landing-page",
          name: "breadcrumbs.landingpage.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.landingpage.create"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/advertisement/landing-page",
          name: "breadcrumbs.landingpage.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.landingpage.edit"
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
          name: "breadcrumbs.product.index"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/sku-management/product",
          name: "breadcrumbs.product.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.product.create"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/sku-management/product",
          name: "breadcrumbs.product.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.product.edit"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/sku-management/product",
          name: "breadcrumbs.product.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.product.detail"
        }
      ]
    },
    productCashier: {
      index: [
        {
          type: "current",
          url: "",
          name: "breadcrumbs.productcashier.index",
        }
      ],
      create: [
        {
          type: "parent",
          url: "/sku-management/product-cashier",
          name: "breadcrumbs.productcashier.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.productcashier.create"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/sku-management/product-cashier",
          name: "breadcrumbs.productcashier.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.productcashier.edit"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/sku-management/product-cashier",
          name: "breadcrumbs.productcashier.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.productcashier.detail"
        }
      ],
      submission: [
        {
          type: "parent",
          url: "/sku-management/product-cashier",
          name: "breadcrumbs.productcashier.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.productcashier.submission"
        }
      ],
      submissionDetail: [
        {
          type: "parent",
          url: "/sku-management/product-cashier/submission",
          name: "breadcrumbs.productcashier.submission"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.productcashier.submission_detail"
        }
      ],
    },
    dbSubmission: {
      index: [
        {
          type: "current",
          url: "",
          name: "breadcrumbs.dbsubmission.index",
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/sku-management/db-product-submission",
          name: "breadcrumbs.dbsubmission.indexB"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.dbsubmission.detail"
        }
      ],
      approval: [
        {
          type: "parent",
          url: "/sku-management/db-product-submission",
          name: "breadcrumbs.dbsubmission.indexB"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.dbsubmission.approval"
        }
      ],
    },
    reward: {
      index: [
        {
          type: "current",
          url: "",
          name: "breadcrumbs.reward.index"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/sku-management/reward",
          name: "breadcrumbs.reward.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.reward.create"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/sku-management/reward",
          name: "breadcrumbs.reward.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.reward.edit"
        }
      ]
    },
    rewardHistory: {
      index: [
        {
          type: "current",
          url: "",
          name: "breadcrumbs.rewardhistory.index"
        }
      ]
    },
    coin: {
      index: [
        {
          type: "current",
          url: "",
          name: "breadcrumbs.coin.index"
        }
      ],
      trade: [
        {
          type: "parent",
          url: "/sku-management/coin",
          name: "breadcrumbs.coin.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.coin.trade"
        }
      ],
      retailer: [
        {
          type: "parent",
          url: "/sku-management/coin",
          name: "breadcrumbs.coin.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.coin.retailer"
        }
      ]
    }
  },
  deliveryManagement: {
    courier_management: {
      index: [
        {
          type: "current",
          url: "",
          name: "breadcrumbs.courier_management.index"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/delivery/courier",
          name: "breadcrumbs.courier_management.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.courier_management.create"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/delivery/courier",
          name: "breadcrumbs.courier_management.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.courier_management.edit"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/delivery/courier",
          name: "breadcrumbs.courier_management.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.courier_management.detail"
        }
      ]
    },
    panel_mitra: {
      index: [
        {
          type: "current",
          url: "",
          name: "Panel Mitra"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/delivery/panel-mitra",
          name: "Panel Mitra"
        },
        {
          type: "current",
          url: "",
          name: "Atur Panel Mitra"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/delivery/panel-mitra",
          name: "Panel Mitra"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Panel Mitra"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/delivery/panel-mitra",
          name: "Panel Mitra"
        },
        {
          type: "current",
          url: "",
          name: "Detail Panel Mitra"
        }
      ]
    }
  },
  dte: {
    pengaturanAttributeMisi: {
      index: [
        {
          type: "current",
          url: "",
          name: "Pengaturan Attribute Misi"
        }
      ]
    },
    missionBuilder: {
      create: [
        {
          type: "current",
          url: "",
          name: "Buat Mission Builder"
        }
      ],
      edit: [
        {
          type: "current",
          url: "",
          name: "Ubah Mission Builder"
        }
      ],
      duplicate: [
        {
          type: "current",
          url: "",
          name: "Duplicate Mission Builder"
        }
      ],
      detail: [
        {
          type: "current",
          url: "",
          name: "Detil Mission Builder"
        }
      ],
    },
    taskSequencing: {
      index: [
        {
          type: "current",
          url: "",
          name: "Daftar Task Sequencing"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/dte/task-sequencing",
          name: "Daftar Task Sequencing"
        },
        {
          type: "current",
          url: "",
          name: "Buat Task Sequencing"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/dte/task-sequencing",
          name: "Daftar Task Sequencing"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Task Sequencing"
        }
      ],
      duplicate: [
        {
          type: "parent",
          url: "/dte/task-sequencing",
          name: "Daftar Task Sequencing"
        },
        {
          type: "current",
          url: "",
          name: "Duplicate Task Sequencing"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/dte/task-sequencing",
          name: "Daftar Task Sequencing"
        },
        {
          type: "current",
          url: "",
          name: "Detil Task Sequencing"
        }
      ],
    },
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
      ],
      createPersonalize: [
        {
          type: "parent",
          url: "/dte/template-task",
          name: "Daftar Tugas"
        },
        {
          type: "current",
          url: "",
          name: "Buat Tugas Personalize"
        }
      ],
      editPersonalize: [
        {
          type: "parent",
          url: "/dte/template-task",
          name: "Daftar Tugas"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Tugas Personalize"
        }
      ],
      detailPersonalize: [
        {
          type: "parent",
          url: "/dte/template-task",
          name: "Daftar Tugas"
        },
        {
          type: "current",
          url: "",
          name: "Detail Tugas Personalize"
        }
      ]
    },
    trade: {
      index: [
        {
          type: "current",
          url: "",
          name: "breadcrumbs.trade_program.index"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/dte/trade-program",
          name: "breadcrumbs.trade_program.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.trade_program.create"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/dte/trade-program",
          name: "breadcrumbs.trade_program.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.trade_program.edit"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/dte/trade-program",
          name: "breadcrumbs.trade_program.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.trade_program.detail"
        }
      ]
    },
    lottery: {
      index: [
        {
          type: "current",
          url: "",
          name: "Daftar Undian"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/dte/lottery",
          name: "Daftar Undian"
        },
        {
          type: "current",
          url: "",
          name: "Buat Undian"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/dte/lottery",
          name: "Daftar Undian"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Undian"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/dte/lottery",
          name: "Daftar Undian"
        },
        {
          type: "current",
          url: "",
          name: "Detail Undian"
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
      ],
      create_personalize: [
        {
          type: "parent",
          url: "/dte/audience",
          name: "Audience"
        },
        {
          type: "current",
          url: "",
          name: "Buat Audience Personalize"
        }
      ],
      edit_personalize: [
        {
          type: "parent",
          url: "/dte/audience",
          name: "Audience"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Audience Personalize"
        }
      ],
      detail_personalize: [
        {
          type: "parent",
          url: "/dte/audience",
          name: "Audience"
        },
        {
          type: "current",
          url: "",
          name: "Detail Audience Personalize"
        }
      ],
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
      create_tsm: [
        {
          type: "parent",
          url: "/dte/automation",
          name: "DTE Automation"
        },
        {
          type: "current",
          url: "",
          name: "Buat DTE Automation TSM"
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
      edit_tsm: [
        {
          type: "parent",
          url: "/dte/automation",
          name: "DTE Automation"
        },
        {
          type: "current",
          url: "",
          name: "Ubah DTE Automation TSM"
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
    },
    coin_adjustment: {
      index: [
        {
          type: "current",
          url: "",
          name: "Approval Coin Adjustment"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/dte/approval-coin-adjusment",
          name: "Approval Coin Adjustment"
        },
        {
          type: "current",
          url: "",
          name: "Detail Approval Coin Adjustment"
        }
      ]
    },
    group_trade_program: {
      index: [
        {
          type: "current",
          url: "",
          name: "breadcrumbs.group_trade_program.index"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/dte/group-trade-program",
          name: "breadcrumbs.group_trade_program.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.group_trade_program.create"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/dte/group-trade-program",
          name: "breadcrumbs.group_trade_program.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.group_trade_program.edit"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/dte/group-trade-program",
          name: "breadcrumbs.group_trade_program.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.group_trade_program.detail"
        }
      ]
    },
    coin_disburstment: {
      index: [
        {
          type: "current",
          url: "",
          name: "Coin Disburstment"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/dte/coin-disbursement",
          name: "Coin Disburstment"
        },
        {
          type: "current",
          url: "",
          name: "Buat Coin Disburstment"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/dte/coin-disbursement",
          name: "Coin Disburstment"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Coin Disburstment"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/dte/coin-disbursement",
          name: "Coin Disburstment"
        },
        {
          type: "current",
          url: "",
          name: "Detail Coin Disburstment"
        }
      ]
    },
    taskVerification: {
      index: [
        {
          type: "current",
          url: "",
          name: "Verifikasi Misi"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/dte/taskverification",
          name: "Verifikasi Misi"
        },
        {
          type: "current",
          url: "",
          name: "Detail Verifikasi Misi"
        }
      ],
      detailtsm: [
        {
          type: "parent",
          url: "/dte/taskverification",
          name: "Verifikasi Misi"
        },
        {
          type: "current",
          url: "",
          name: "Detail Verifikasi Misi TSM"
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
    detail: [
      {
        type: "parent",
        url: "/notifications",
        name: "Notifikasi"
      },
      {
        type: "current",
        url: "",
        name: "Detail Notifikasi"
      }
    ],
    popup: {
      index: [
        {
          type: "current",
          url: "",
          name: "breadcrumbs.popup_notifikasi.index"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/notifications/popup-notification",
          name: "breadcrumbs.popup_notifikasi.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.popup_notifikasi.create"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/notifications/popup-notification",
          name: "breadcrumbs.popup_notifikasi.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.popup_notifikasi.edit"
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
          name: "breadcrumbs.help.index"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/content-management/help",
          name: "breadcrumbs.help.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.help.create"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/content-management/help",
          name: "breadcrumbs.help.index"
        },
        {
          type: "current",
          url: "",
          name: "breadcrumbs.help.edit"
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
    new_sign: {
      index: [
        {
          type: "current",
          url: "",
          name: "Buat Tanda"
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
    ],
    otp: [
      {
        type: "current",
        url: "",
        name: "Ubah Pengaturan OTP"
      }
    ],
    tingkat_fitur: {
      index: [
        {
          type: "current",
          url: "",
          name: "Tingkat Fitur"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/settings/feature-level",
          name: "Tingkat Fitur"
        },
        {
          type: "current",
          url: "",
          name: "Buat Tingkat Fitur"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/settings/feature-level",
          name: "Tingkat Fitur"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Tingkat Fitur"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/settings/feature-level",
          name: "Tingkat Fitur"
        },
        {
          type: "current",
          url: "",
          name: "Detail Tingkat Fitur"
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
  paylater: {
    company: {
      index: [
        {
          type: "current",
          url: "",
          name: "Daftar Perusahaan"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/paylater/companies",
          name: "Daftar Perusahaan"
        },
        {
          type: "current",
          url: "",
          name: "Buat Perusahaan"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/paylater/companies",
          name: "Daftar Perusahaan"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Perusahaan"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/paylater/companies",
          name: "Daftar Perusahaan"
        },
        {
          type: "current",
          url: "",
          name: "Detil Perusahaan"
        }
      ],
    },
    panel: {
      index: [
        {
          type: "current",
          url: "",
          name: "Panel Pojok Modal"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/paylater/panel",
          name: "Panel Pojok Modal"
        },
        {
          type: "current",
          url: "",
          name: "Buat Panel Pojok Modal"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/paylater/panel",
          name: "Panel Pojok Modal"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Panel Pojok Modal"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/paylater/panel",
          name: "Panel Pojok Modal"
        },
        {
          type: "current",
          url: "",
          name: "Detil Panel Pojok Modal"
        }
      ],
    },
    deactivate: {
      index: [
        {
          type: "current",
          url: "",
          name: "Daftar Pengajuan Deaktivasi"
        }
      ],
    },
    distributionlist: {
      index: [
        {
          type: "current",
          url: "",
          name: "Distribution List"
        }
      ]
    }
  },
  virtualaccount: {
    company: {
      index: [
        {
          type: "current",
          url: "",
          name: "Daftar Perusahaan"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/virtual-account/companies",
          name: "Daftar Perusahaan"
        },
        {
          type: "current",
          url: "",
          name: "Buat Perusahaan"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/virtual-account/companies",
          name: "Daftar Perusahaan"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Perusahaan"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/virtual-account/companies",
          name: "Daftar Perusahaan"
        },
        {
          type: "current",
          url: "",
          name: "Detil Perusahaan"
        }
      ],
    },
    bin: {
      create: [
        {
          type: "parent",
          url: "/virtual-account/companies",
          name: "Daftar Perusahaan"
        },
        {
          type: "current",
          url: "",
          name: "Buat BIN"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/virtual-account/companies",
          name: "Daftar Perusahaan"
        },
        {
          type: "current",
          url: "",
          name: "Ubah BIN"
        }
      ]
    },
    panel: {
      index: [
        {
          type: "current",
          url: "",
          name: "Panel Virtual Account"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/virtual-account/panel",
          name: "Panel Virtual Account"
        },
        {
          type: "current",
          url: "",
          name: "Buat Panel Virtual Account"
        }
      ],
      edit: [
        {
          type: "parent",
          url: "/virtual-account/panel",
          name: "Panel Virtual Account"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Panel Virtual Account"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/virtual-account/panel",
          name: "Panel Virtual Account"
        },
        {
          type: "current",
          url: "",
          name: "Detil Panel Virtual Account"
        }
      ],
    },
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
          url: "/virtual-account/terms-and-condition",
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
          url: "/virtual-account/terms-and-condition",
          name: "Syarat & Ketentuan"
        },
        {
          type: "current",
          url: "",
          name: "Ubah Syarat & Ketentuan"
        }
      ],
      detail: [
        {
          type: "parent",
          url: "/virtual-account/terms-and-condition",
          name: "Syarat & Ketentuan"
        },
        {
          type: "current",
          url: "",
          name: "Detil Syarat & Ketentuan"
        }
      ],
    },
  },
  taskSequencingManagement: {
    taskSequencing: {
      index: [
        {
          type: "current",
          url: "",
          name: " Manajemen Task Sequencing"
        }
      ],
      create: [
        {
          type: "parent",
          url: "/task-sequencing/task-sequencing",
          name: "Manajemen Task Sequencing"
        },
        {
          type: "current",
          url: "",
          name: "Buat Task Sequence"
        }
      ],
    }
  },
  b2b_voucher: {
    index: [
      {
        type: "current",
        url: "/b2b-voucher",
        name: "B2B Voucher"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/b2b-voucher",
        name: "B2B Voucher"
      },
      {
        type: "current",
        url: "",
        name: "Buat Voucher"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/b2b-voucher",
        name: "B2B Voucher"
      },
      {
        type: "current",
        url: "",
        name: "Detil B2B Voucher"
      }
    ]
  },
  discount_coins_order: {
    index: [
      {
        type: "current",
        url: "/shoping-discount-coins",
        name: "breadcrumbs.discount_coins_order.index"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/shoping-discount-coins",
        name: "breadcrumbs.discount_coins_order.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.discount_coins_order.create"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/shoping-discount-coins",
        name: "breadcrumbs.discount_coins_order.index"
      },
      {
        type: "current",
        url: "",
        name: "breadcrumbs.discount_coins_order.detail"
      }
    ]
  },
  b2c_voucher: {
    index: [
      {
        type: "current",
        url: "/b2c-voucher",
        name: "B2C Voucher"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/b2c-voucher",
        name: "B2C Voucher"
      },
      {
        type: "current",
        url: "",
        name: "Buat B2C Voucher"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/b2c-voucher",
        name: "B2C Voucher"
      },
      {
        type: "current",
        url: "",
        name: "Edit B2C Voucher"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/b2c-voucher",
        name: "B2C Voucher"
      },
      {
        type: "current",
        url: "",
        name: "Detil B2C Voucher"
      }
    ],
  },
  b2b_voucher_inject: {
    index: [
      {
        type: "current",
        url: "/inject-b2b-voucher",
        name: "Inject B2B Voucher"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/inject-b2b-voucher",
        name: "Inject B2B Voucher"
      },
      {
        type: "current",
        url: "",
        name: "Buat B2C Voucher"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/inject-b2b-voucher",
        name: "Inject B2B Voucher"
      },
      {
        type: "current",
        url: "",
        name: "Edit Voucher"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/inject-b2b-voucher",
        name: "Inject B2B Voucher"
      },
      {
        type: "current",
        url: "",
        name: "Detail Voucher"
      }
    ]
  },
  customer_care: {
    index: [
      {
        type: "parent",
        url: "/customer-care",
        name: "Customer Care"
      },
      {
        type: "current",
        url: "/customer-care/pertanyaan-verifikasi-agent",
        name: "Pertanyaan Verifikasi Agent"
      }
    ],
    detail: [
      {
        type: "parent",
        url: "/customer-care",
        name: "Customer Care"
      },
      {
        type: "parent",
        url: "/customer-care/pertanyaan-verifikasi-agent",
        name: "Pertanyaan Verifikasi Agent"
      },
      {
        type: "current",
        url: "/customer-care/pertanyaan-verifikasi-agent/detail",
        name: "Detail Pertanyaan Verifikasi Agent"
      },

    ],
  },
  device_management: {
    index: [
      {
        type: "current",
        url: "/device-management/recovery",
        name: "breadcrumbs.device_management.index"
      }
    ],
  },
  kpi: {
    list: [
      {
        type: "current",
        url: "",
        name: "Daftar KPI Group"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/kpisetting/kpi-groups-list",
        name: "Daftar KPI Group"
      },
      {
        type: "current",
        url: "",
        name: "Create KPI Setting"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/kpisetting/kpi-groups-list",
        name: "Daftar KPI Group"
      },
      {
        type: "current",
        url: "",
        name: "Edit KPI Setting"
      }
    ]
  },
  notes_retailer: {
    list: [
      {
        type: "current",
        url: "",
        name: "Notes Retailer"
      }
    ],
    create: [
      {
        type: "parent",
        url: "/notesretailer/notes-retailer-list",
        name: "Notes Retailer"
      },
      {
        type: "current",
        url: "",
        name: "Create Notes"
      }
    ],
    edit: [
      {
        type: "parent",
        url: "/notesretailer/notes-retailer-list",
        name: "Notes Retailer"
      },
      {
        type: "current",
        url: "",
        name: "Edit Notes"
      }
    ]
  },
  remote_call_activation: {
    grouping_pelanggan: [
      {
        type: "current",
        url: "/rca/grouping-pelanggan",
        name: "Grouping Pelanggan"
      }
    ],
    route_plan: [
      {
        type: "current",
        url: "/rca/rute-kunjungan",
        name: "Rute Kunjungan"
      }
    ],
  },
  country_setup: {
    index: [
      {
        type: "current",
        url: "/user-management/country-setup",
        name: "Country Setup"
      }
    ]
  },
  language_setup: {
    index: [
      {
        type: "current",
        url: "/user-management/language-setup",
        name: "Language Setup"
      }
    ]
  },
};
