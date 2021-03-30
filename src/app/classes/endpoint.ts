/**
 * AYO Sampoerna Base Endpoint class
 * DXTR ASIA
 *
 */

// Define API URL and API Version Here
/**
 * AYO Sampoerna Staging
 *
 */
import { environment, serviceServer, server } from '../../environments/environment';
import { Config } from './config';

// const SERVER = Config.server;
const SERVER = server;
const AYO_API = environment.server;
// const AYO_API_SERVICE = environment.server_service;
const AYO_API_SERVICE = serviceServer;
const type_api = "principal";

export class Endpoint {
  getUrl(namespace, key, context) {
    /**
     * Endpoint Object you can create object based on endpoint namespace
     * example the namespace of endpoint is user you can create user object on endpoint base object
     * You can create key inside endpoint namespace, key is defined as endpoint namespace key
     * example url is user/profile
     * you can create object like this
     * user : {
     *   profile:`${AYO_API}/api/${API_VERSION}/user/profile`
     * }
     * @type {Object}
     */

    const ENDPOINT = {
      // page: {
      //   pages: `${AYO_API}/api/${API_VERSION}/pages`,
      //   subpages: `${AYO_API}/api/${API_VERSION}/pages/${context.slug_name}/subpages`,
      //   detail: `${AYO_API}/api/${API_VERSION}/pages/${context.page_id}`
      // }
      authentication: {
        verify_isms: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/source/customer/${context.business_code}/${context.phone}`,
        store_user: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user`,
        //login: `${AYO_API}/oauth/token` ,
        login: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/token`,
        verify_code: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/general/otp/verify-account`,
        me: `${AYO_API_SERVICE(SERVER.user)}/oauth/user`,
        resend_otp: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/general/otp/send`,
        reset_password: `${AYO_API_SERVICE(SERVER.user)}/oauth/password/reset`,
        change_password: `${AYO_API_SERVICE(SERVER.user)}/oauth/password/forgot`,
        change_password_edit_profile: `${AYO_API_SERVICE(SERVER.user)}/oauth/password/change`,
        logout: `${AYO_API_SERVICE(SERVER.auth)}/api/v1/auth/remove-token`,
        check_token: `${AYO_API_SERVICE(SERVER.user)}/oauth/check/token`,
        fcm_token: `${AYO_API}/api/general/user_notif`,
        get_syarat_ketentuan: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/general/content?type=terms-conditions&user=principal`,
        check_user_status: `${AYO_API_SERVICE(SERVER.user)}/oauth/check/user-status`,
        get_user_cognito_ad: `${AYO_API_SERVICE(SERVER.user)}/oauth/cognito/get-user`
      },
      area: {
        child_filter: `${AYO_API_SERVICE(SERVER.area)}/api/v1/area/childrens-filter`
      },
      callObjective: {
        get: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/call-objective`,
        delete: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/call-objective/${context.objective_id}`,
        create: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/call-objective`,
        put: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/call-objective/${context}`,
        get_by_id: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/call-objective/${context}`
      },
      admin_principal: {
        get: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/principal`,
        detail: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/principal/${context.principal_id}`,
        create: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/principal`,
        put: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/principal/${context.principal_id}`,
        delete: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/principal/${context.principal_id}`,
        delete_multiple: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/principal/inactive/multiple`,
        parent: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/parent-by-id/${context.parent ? context.parent : 1}`, //ke service area
        list_role: `${AYO_API}/api/${type_api}/user/role?page=all`,
        list_role_nolimit: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/role/list`
      },
      field_force: {
        get: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/field-force`,
        create: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/field-force`,
        put: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/field-force/${context.fieldforce_id}`,
        delete: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/field-force/${context.fieldforce_id}`,
      },
      wholesaler: {
        get: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/wholesaler`,
        create: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/wholesaler`,
        show: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/wholesaler/${context.wholesaler_id}`,
        put: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/wholesaler/${context.wholesaler_id}`,
        // put: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/user/wholesaler/${context.wholesaler_id}`,
        delete: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/user/wholesaler/${context.wholesaler_id}`,
        export: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/wholesaler/export/data?area=${context.area_id}`
      },
      retailer: {
        get: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/retailer`,
        show: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/retailer/${context.retailer_id}`,
        create: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/retailer`,
        put: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/retailer/${context.retailer_id}`,
        delete: `${AYO_API_SERVICE(SERVER.business)}/api/v1/user/${type_api}/user/retailer/${context.retailer_id}`,
        consumer_list: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/general/by-referral-code/${context.referral_code}`,
        parent: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/parent-by-code/${context.parent}`,
        list_level: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/level`,
        list_children: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/by-level/${context.level_desc}`,
        list_other_children: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/children/${context.parent_id}`,
        export_access_cashier: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/retailer/export`,
        import_access_cashier: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/retailer/preview`,
        store_access_cashier: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/retailer/flag-cashier`
      },
      paguyuban: {
        get: `${AYO_API_SERVICE(SERVER.community)}/api/v1/community/principal/paguyuban`,
        create: `${AYO_API_SERVICE(SERVER.community)}/api/v1/community/${type_api}/paguyuban`,
        put: `${AYO_API_SERVICE(SERVER.community)}/api/v1/community/${type_api}/paguyuban/${context.paguyuban_id}`,
        delete: `${AYO_API_SERVICE(SERVER.community)}/api/v1/community/${type_api}/paguyuban/${context.paguyuban_id}`,
        delete_multiple: `${AYO_API_SERVICE(SERVER.community)}/api/v1/community/${type_api}/paguyuban/delete/multiple`,
      },
      customer: {
        get: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/customer`,
        detail: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/customer/${context.customer_id}`
      },
      pengajuan_src: {
        get: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/pengajuan-src`,
        show: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/pengajuan-src/${context.pengajuan_id}`,
        create: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/pengajuan-src`,
        put: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/pengajuan-src/${context.pengajuan_id}`,
        delete: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/pengajuan-src/${context.pengajuan_id}`,
        update_status: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/pengajuan-src/update-status/${context.pengajuan_id}`,
        list_product: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/pengajuan-src/list/product`,
        list_source: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/pengajuan-src/list/source`,
        list_channel: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/pengajuan-src/list/channel`,
        export: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/pengajuan-src/export/data`,
        list_province: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/province?page=1&sort=name&page=all`,
        list_city: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/city?page=all&sort=name&province_id=${context.province_id}`,
        list_district: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/district?page=all&sort=name&city_id=${context.city_id}`,
        list_territory: `${AYO_API_SERVICE(SERVER.area)}/api/v1/area/district/district-city-province`
      },
      banner: {
        get: `${AYO_API_SERVICE(SERVER.banner)}/api/v1/banner/${type_api}/banner`,
        create: `${AYO_API_SERVICE(SERVER.banner)}/api/v1/banner/${type_api}/banner`,
        put: `${AYO_API_SERVICE(SERVER.banner)}/api/v1/banner/${type_api}/banner/${context.banner_id}`,
        delete: `${AYO_API_SERVICE(SERVER.banner)}/api/v1/banner/${type_api}/banner/${context.banner_id}`,
        parent: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/parent-by-code/${context.parent}`,
        list_level: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/level`,
        list_children: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/by-level/${context.level_desc}`,
        list_other_children: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/children/${context.parent_id}`,
        list_wallet: `${AYO_API}/api/v2/general/wallet`,
        // get_audience: `${AYO_API_SERVICE(SERVER.banner)}/api/v1/banner/${type_api}/banner/audience`,
        get_audience: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/general/business/list-audiences`,
        export_audience: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/general/business/list-audiences/export`,
        import_audience: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/general/business/list-audiences/import`,
        get_c_audience: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/general/list-audience`,
        export_c_audience: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/general/list-audience/export`,
        import_c_audience: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/general/list-audience/import`,
        update_sorting: `${AYO_API_SERVICE(SERVER.banner)}/api/v1/banner/principal/banner/urutan`,
        list_sorting: `${AYO_API_SERVICE(SERVER.banner)}/api/v1/banner/principal/banner/urutan`,
        list_banner_customer: `${AYO_API_SERVICE(SERVER.banner)}/api/v1/banner/principal/banner/customer-last-three-month?page=all`,
      },
      landingPage: {
        get: `${AYO_API_SERVICE(SERVER.content)}/api/${type_api}/content/static-page`,
        create: `${AYO_API_SERVICE(SERVER.content)}/api/${type_api}/content/static-page`,
        put: `${AYO_API_SERVICE(SERVER.content)}/api/${type_api}/content/static-page/${context.page_id}`,
        delete: `${AYO_API_SERVICE(SERVER.content)}/api/${type_api}/content/static-page/${context.page_id}`
      },
      product: {
        get: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/${type_api}/product`,
        detail: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/${type_api}/product/${context.product_id}`,
        create: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/${type_api}/product`,
        put: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/${type_api}/product/${context.product_id}`,
        delete: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/${type_api}/product/${context.product_id}`,
        list_brand: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/general/product/brand?page=all`,
        list_category: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/${type_api}/category?parent_id=${context.parent_id}`,
        list_packaging: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/${type_api}/packaging?page=all`,
        // parent: `${AYO_API}/api/general/area/get_parent_id/${context.parent}`,
        parent: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/parent-by-id/${context.parent}`,
        export: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/principal/product/export/csv`,
        import: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/principal/product/import/csv`,
        products_sku_bank: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/general/product?search=${context.param
          }&status=active`,
        generate_link: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/principal/product/generate-link`
      },
      template_task: {
        get: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/template`,
        create: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/template`,
        put: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/template/${context.template_id}`,
        delete: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/template/${context.template_id}`,
        upload_video: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/template/upload-video`,
        planogram_ir: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/template/ir/planogram`,
        stock_check_ir: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/template/ir/stock_check`,
      },
      trade_program: {
        get: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/creator`,
        create: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/creator`,
        put: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/creator/${context.trade_program_id}`,
        delete: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/creator/${context.trade_program_id}`,
        list_level: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/level`,
        list_children: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/by-level/${context.level_desc}`,
        list_other_children: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/children/${context.parent_id}`
      },
      schedule_trade_program: {
        get: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/scheduler`,
        detail: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/scheduler/${context.schedule_tp_id}`,
        create: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/scheduler`,
        put: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/scheduler/${context.schedule_tp_id}`,
        delete: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/scheduler/${context.schedule_tp_id}`,
        reject_audience: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/scheduler/reject/audience`,
        list_tp: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/scheduler/creator/list/all`,
        list_template: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/scheduler/template/list/all`,
        list_audience: `${AYO_API}/api/${type_api}/audience/show/${context.audience_id}`,
        export: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/scheduler/export`,
        update_tanggal: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/scheduler/${context.schedule_tp_id}/update-date`,
        csv_preview: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/adjustment/coin/preview`,
        csv_store: `${AYO_API_SERVICE(SERVER.coin)}/api/v1/coin/${type_api}/adjustment/coin/import`,
        csv_download: `${AYO_API_SERVICE(SERVER.coin)}/api/v1/coin/${type_api}/adjustment/coin/download`
      },
      audience: {
        get: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/audience`,
        detail: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/audience/${context.audience_id}`,
        create: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/audience`,
        put: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/audience/${context.audience_id}`,
        delete: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/audience/${context.audience_id}`,
        // list_scheduler: `${AYO_API}/api/${type_api}/scheduler?page=all`,
        list_scheduler: `${AYO_API}/api/principal/scheduler/list/all`,
        list_trade_program: `${AYO_API}/api/principal/creator/list/all`,
        // list_retailer: `${AYO_API}/api/${type_api}/audience/all/retailer`,
        list_retailer: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/dte/get-all-audience`,
        list_retailer_selected: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/audience/group/${context.audience_id}`,
        validate_budget: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/audience/count/budget`,
        list_level: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/level`,
        list_children: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/by-level/${context.level_desc}`,
        list_other_children: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/children/${context.parent_id}`,
        import: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/dte/import-audience`,
        show_import: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/dte/show-import-audience`,
        export: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/dte/export-audience`
      },
      dte_automation: {
        get: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/automation`,
        list_audience_groups: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/automation/list-audience`,
        list_trade_program: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/automation/list-trade-program`,
        list_sku: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/general/product/list-sku`,
        create: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/automation`,
        delete: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/automation/${context.automation_id}`,
        update: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/automation/${context.automation_id}`,
        export: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/automation/export`,
        export_tsm: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/automation/tsm/export`
      },
      news: {
        get: `${AYO_API_SERVICE(SERVER.newsfeed)}/api/v1/newsfeed/${type_api}/newsfeed`,
        put: `${AYO_API_SERVICE(SERVER.newsfeed)}/api/v1/newsfeed/${type_api}/newsfeed/${context.news_id}`,
        delete: `${AYO_API_SERVICE(SERVER.newsfeed)}/api/v1/newsfeed/${type_api}/newsfeed/${context.news_id}`,
        list_category: `${AYO_API_SERVICE(SERVER.newsfeed)}/api/v1/newsfeed/${type_api}/rssfeed/category?page=all`
      },
      news_category: {
        get: `${AYO_API_SERVICE(SERVER.newsfeed)}/api/v1/newsfeed/${type_api}/rssfeed/category`,
        create: `${AYO_API_SERVICE(SERVER.newsfeed)}/api/v1/newsfeed/${type_api}/rssfeed/category`,
        put: `${AYO_API_SERVICE(SERVER.newsfeed)}/api/v1/newsfeed/${type_api}/rssfeed/category/${context.category_id}`,
        delete: `${AYO_API_SERVICE(SERVER.newsfeed)}/api/v1/newsfeed/${type_api}/rssfeed/category/${context.category_id}`
      },
      role: {
        get: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/role`,
        detail: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/role/${context.role_id}`,
        create: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/role`,
        put: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/role/${context.role_id}`,
        delete: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/role/${context.role_id}`,
        list_menu: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/role/available_permissions`,
        force_update: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/force-update`,
        force_update_user: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/force-update-user`,
        list_version: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/force-update`,
        revert_version: `${AYO_API}/api/${type_api}/force-update/${context.version_id}`
      },
      tnc: {
        get: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/content?type=terms-conditions`,
        create: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/content`,
        put: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/content/${context.content_id}`,
        delete: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/content/${context.content_id}`,
      },
      privacy: {
        get: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/content?type=privacy-policy`,
        create: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/content`,
        put: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/content/${context.content_id}`,
        delete: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/content/${context.content_id}`,
      },
      help: {
        get: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/content`,
        create: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/content`,
        put: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/content/${context.content_id}`,
        delete: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/content/${context.content_id}`,
        getListCategory: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/content/list-categories`,
        getListUser: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/content/list-user`,
        getShow: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/${type_api}/content/${context.content_id}`,
      },
      coin: {
        // retailer: `${AYO_API_SERVICE(SERVER.coin)}/api/v1/coin/${type_api}/coin?type=retailer`,
        retailer: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/dte/get-business-coin`,
        program: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/creator/coin`,
        detail_retailer: `${AYO_API_SERVICE(SERVER.coin)}/api/v1/coin/${type_api}/coin/retailer/${context.retailer_id}`,
        detail_program: `${AYO_API_SERVICE(SERVER.coin)}/api/v1/coin/${type_api}/coin/program/${context.trade_program_id}`,
        flush: `${AYO_API_SERVICE(SERVER.coin)}/api/v1/coin/principal/coin`,
        parent: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/parent-by-id/${context.parent ? context.parent : 1}`,
        export: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/dte/export-coin`,
        import: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/adjustment/coin-retailer/preview`,
        adjust_coin: `${AYO_API_SERVICE(SERVER.coin)}/api/v1/coin/principal/adjustment/coin/retailer`
      },
      menu: {
        get: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/menu`
      },
      notification: {
        get: `${AYO_API}/api/${type_api}/notification`,
        create: `${AYO_API}/api/${type_api}/notification`,
        delete: `${AYO_API}/api/${type_api}/notification/${context.notification_id}`,
        show: `${AYO_API}/api/${type_api}/notification/${context.notification_id}`,
        get_popup: `${AYO_API}/api/${type_api}/pop-up-notification`,
        show_popup: `${AYO_API}/api/${type_api}/pop-up-notification/${context.popup_notif_id}`,
        create_popup: `${AYO_API}/api/${type_api}/pop-up-notification`,
        update_popup: `${AYO_API}/api/${type_api}/pop-up-notification/${context.popup_notif_id}`,
        delete_popup: `${AYO_API}/api/${type_api}/pop-up-notification/${context.popup_notif_id}`,
        get_audience: `${AYO_API}/api/${type_api}/pop-up-notification/audience`,
        export_audience: `${AYO_API}/api/principal/pop-up-notification/audience/export`,
        import_audience: `${AYO_API}/api/principal/pop-up-notification/audience/import`,
        get_pn_audience: `${AYO_API}/api/${type_api}/notification/audience`,
        export_pn_audience: `${AYO_API}/api/principal/notification/audience/export`,
        import_pn_audience: `${AYO_API}/api/principal/notification/audience/import`
      },
      notif: {
        list_notif: `${AYO_API}/api/general/user_notif`,
        update: `${AYO_API}/api/general/user_notif/${context.id_notif}`,
        popup: `${AYO_API}/api/wholesaler/pop-up-notification`,
        update_notif: `${AYO_API}/api/wholesaler/pop-up-notification`,
        content: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/general/page/${context.slug}`,
      },
      general: {
        support: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/general/content?type=${context.type}&user=${context.user_id}`,
        permissions: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/permission`,
        parent: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/parent-by-id/${context.parent ? context.parent : 1}`,
        parent_by_code: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/parent-by-code/${context.parent}`,
        get_business: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/general/business/get/${context.business_id}`,
        list_level: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/level`,
        list_children: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/by-level/${context.level_desc}`,
        list_other_children: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/children/${context.parent_id}`,
        list_principal: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/general/user/principal?page=all`,
        // support: `${AYO_API}/api/general/content?type=help&user=principal&page=all`,
        area: `${AYO_API}/api/general/area?page=all&level_desc=area&sort=id`,
        trade_program: `${AYO_API}/api/general/analytic/trade-program`,
        scheduler: `${AYO_API}/api/general/analytic/scheduler`,
        task: `${AYO_API}/api/general/analytic/task-template`,
        wholesaler: `${AYO_API}/api/general/analytic/wholesaler`,
        sku: `${AYO_API}/api/`,
        category_product: `${AYO_API}/api/general/analytic/category-product`,
        unlocked: `${AYO_API}/api/${type_api}/user/${context.type}/unlocked`,
        banks: `${AYO_API}/api/v2/general/bank`,
        app_versions: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/user/version`,
        // cities: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/user/cities`
        cities: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/city/get-city`
      },
      user_onboarding: {
        register_user: `${AYO_API}/api/${type_api}/analytics/register-user`,
        register_user_detail: `${AYO_API}/api/${type_api}/analytics/register-user-detail`,
        register_user_chart: `${AYO_API}/api/${type_api}/analytics/register-user-chart`,
        register_user_vs: `${AYO_API}/api/${type_api}/analytics/register-user-vs`,
        register_src: `${AYO_API}/api/${type_api}/analytics/register-src`,
        register_src_trend: `${AYO_API}/api/${type_api}/analytics/register-src-trend`,
        refferal_code_usage: `${AYO_API}/api/${type_api}/analytics/refferal-code-usage`
      },
      consumer_demographic: {
        gender: `${AYO_API}/api/${type_api}/analytics/b2c/demographic-gender`,
        gender_percentage: `${AYO_API}/api/${type_api}/analytics/b2c/demographic-smoking`,
        age: `${AYO_API}/api/${type_api}/analytics/b2c/demographic-age`
      },
      referral_code: {
        refferal_code_inputted: `${AYO_API}/api/${type_api}/analytics/b2c/refferal-code-inputted`,
        refferal_code_top5: `${AYO_API}/api/${type_api}/analytics/b2c/refferal-code-top5`,
        refferal_code_top5_detail: `${AYO_API}/api/${type_api}/analytics/b2c/refferal-code-top5-detail`
      },
      dte_performance: {
        performance: `${AYO_API}/api/${type_api}/analytics/dte/performance`,
        performance_vs: `${AYO_API}/api/${type_api}/analytics/dte/performance-vs`,
        submission_time: `${AYO_API}/api/${type_api}/analytics/dte/submission-time`,
        submission_completion: `${AYO_API}/api/${type_api}/analytics/dte/submission-completion`
      },
      transaction_report: {
        transaction_overview: `${AYO_API}/api/${type_api}/analytics/b2b/transaction-overview`,
        transaction_top10: `${AYO_API}/api/${type_api}/analytics/b2b/transaction-top10-category`,
        transaction_top10_detail: `${AYO_API}/api/${type_api}/analytics/b2b/transaction-top10-category-detail`,
        transaction_5_ws: `${AYO_API}/api/${type_api}/analytics/b2b/transaction-top-bottom-5ws`,
        transaction_5_ws_detail: `${AYO_API}/api/${type_api}/analytics/b2b/transaction-top-bottom-5ws-detail`,
        transaction_trend: `${AYO_API}/api/${type_api}/analytics/b2b/transaction-trend`,
        transaction_trend_detail: `${AYO_API}/api/${type_api}/analytics/b2b/transaction-trend-detail`,
        transaction_register_src: `${AYO_API}/api/${type_api}/analytics/b2b/transaction-register-src`,
        transaction_peak_hour: `${AYO_API}/api/${type_api}/analytics/b2b/transaction-peak-hour`
      },
      brand_performance: {
        industry_size_chart: `${AYO_API}/api/${type_api}/analytics/b2b/brand-industry`,
        share_of_market: `${AYO_API}/api/${type_api}/analytics/b2b/brand-company`,
        sku_penetration: `${AYO_API}/api/${type_api}/analytics/b2b/brand-sku`,
        industry_size_trend: `${AYO_API}/api/${type_api}/analytics/b2b/brand-trend-industry`,
        share_of_market_trend: `${AYO_API}/api/${type_api}/analytics/b2b/brand-trend-company`,
        sku_penetration_trend: `${AYO_API}/api/${type_api}/analytics/b2b/brand-trend-sku`,
        industry_size_detail: `${AYO_API}/api/${type_api}/analytics/b2b/brand-industry-detail`,
        share_of_market_detail: `${AYO_API}/api/${type_api}/analytics/b2b/brand-company-detail`,
        sku_penetration_detail: `${AYO_API}/api/${type_api}/analytics/b2b/brand-sku-detail`
      },
      principal_partnership: {
        get: `${AYO_API_SERVICE(SERVER.community)}/api/v1/community/principal/principal-partnership`,
        create: `${AYO_API_SERVICE(SERVER.community)}/api/v1/community/principal/principal-partnership`,
        put: `${AYO_API_SERVICE(SERVER.community)}/api/v1/community/principal/principal-partnership/${context.principal_partnership_id}`,
        delete: `${AYO_API_SERVICE(SERVER.community)}/api/v1/community/principal/principal-partnership/${context.principal_partnership_id}`
      },
      report_list: {
        get_report: `${AYO_API_SERVICE(server.banner)}/api/v1/banner/principal/report`,
        get_history: `${AYO_API_SERVICE(server.banner)}/api/v1/banner/principal/report/history/list`,
        update: `${AYO_API_SERVICE(server.banner)}/api/v1/banner/principal/report/${context.report_id}`,
        show: `${AYO_API_SERVICE(server.banner)}/api/v1/banner/principal/report/${context.report_id}`,
        detail: `${AYO_API_SERVICE(server.banner)}/api/v1/banner/principal/report/detail/${context.report_id}`
      },
      support: {
        get: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/general/content?type=${context.type}&user=${context.user}`,
        getBantuanListCategory: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/general/content/list-categories?user=${context.user}`,
        getBantuanListCategoryDetails: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/general/content/list-help?content_category_id=${context.id}&user=${context.user}`,
        getBantuanShowDetail: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/general/content/${context.id}`,
        like: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/general/content/like?content_id=${context.id}`,
        unlike: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/general/content/unlike?content_id=${context.id}`,
        search: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/general/content/search?keyword=${context.keyword}&user=${context.user}`,
      },
      template_message: {
        get: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/principal/chat-template`,
        create: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/principal/chat-template`,
        put: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/principal/chat-template-update`,
        delete: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/principal/chat-template-delete`,
      },
      otp_settings: {
        get: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/settings/otp`,
        update: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/settings/otp`
      },
      qiscus: {
        updateRoomIdTransaksi: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/wholesaler/order/update/${context.orderId}`,
        createUpdateRoomOrderId: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/order/vendor/${context.order_id}/create-qiscus-room`,
        getMessageTemplates: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/principal/vendor/chat-template`,
        loginMultichannel: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/general/qiscus/get-multi-channel`,
        createRoomMultichannel: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/general/qiscus/initiate-chat`,
      },
      group_trade_program: {
        get: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/creator/group`,
        show: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/creator/group/${context.group_id}`,
        create: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/creator/group`,
        put: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/creator/group/${context.group_id}`,
        delete: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/creator/group/${context.group_id}`
      },
      PLSupplierCompany: {
        getList: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-company`,
        getListByProductId: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-company-list?product_id=${context.productId}&search=${context.value}`,
        detail: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-company/${context.supplierId}`,
        create: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-company`,
        update: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-company/${context.supplierId}`,
        updateStatus: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-company/${context.supplierId}?type=status`,
        delete: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-company/${context.supplierId}`,
        search: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/general/product/list-sku-private-label?search=${context.param}${context.isAll ? '&all=true' : ''}`
      },
      PLSupplierUser: {
        getList: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/user/supplier`,
        detail: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/user/supplier/${context.userSupplierId}`,
        create: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/user/supplier`,
        update: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/user/supplier/${context.userSupplierId}`,
        updateStatus: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/user/supplier/${context.userSupplierId}?type=status`,
        delete: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/user/supplier/${context.userSupplierId}`,
      },
      PLSupplierPanelMitra: {
        getList: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-panel-mitra`,
        getListMitra: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-list-mitra`,
        detail: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-panel-mitra/${context.panelMitraId}`,
        create: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-panel-mitra`,
        update: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-panel-mitra/${context.panelMitraId}`,
        delete: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-panel-mitra/${context.panelMitraId}`,
        listCategory: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/general/product/category/list-all-category`,
        filterProduct: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/general/product/list-sku-private-label?search=${context.param}&category_id=${context.categoryId}${context.isAll ? '&all=true' : ''}`,
        list_other_children: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/children/${context.parent_id}`,
        filterSupplier: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/general/private-label/supplier-company-by-product-id/${context.productId}`,
        importMitra: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-import-mitra`,
        exportMitra: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-export-mitra`,
        previewImportMitra: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-preview-mitra`,
        checkPanelMitra: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/check-panel-mitra`,
        export_supplier_panel_mitra: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-panel-mitra/${context.id}/export`
      },
      PLOrdertoSupplier: {
        getList: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/order/private-label/list-pesanan`,
        showListPesanan: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/order/private-label/show-pesanan/${context.orderId}`,
        statusPesanan: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/order/private-label/status-pesanan/${context.orderId}`,
        exportPO: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/order/private-label/export`,
        updateQty: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/order/private-label/update/${context.orderId}`,
        dokumen_list: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/wholesaler/supplier/document`
      },
      courier: {
        get: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/delivery/courier`,
        show: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/delivery/courier/${context.courier_id}`,
        create: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/delivery/courier`,
        update: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/delivery/courier/${context.courier_id}`,
        delete: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/delivery/courier/${context.courier_id}`,
        update_status: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/delivery/courier/update-status/${context.courier_id}`
      },
      mitra_panel: {
        get: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/delivery/panel-mitra`,
        show: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/delivery/panel-mitra/${context.panel_id}`,
        create: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/delivery/panel-mitra`,
        update: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/delivery/panel-mitra`,
        delete: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/delivery/panel-mitra/${context.panel_id}`,
        mitra_list: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/delivery/panel-mitra/mitra/list?area=${context.area_id ? context.area_id : 1}`,
        courier_service: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/delivery/panel-mitra/courier-service/${context.courier_id}`,
        courier_list: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/delivery/panel-mitra/courier/list`,
        import: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/delivery/panel-mitra/mitra/import`,
        preview_import: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/delivery/panel-mitra/mitra/preview-import`,
        export: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/delivery/panel-mitra/mitra/export`,
        check_mitra: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/delivery/panel-mitra/mitra/check`
      },
      store_template_layout: {
        get: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/vendor/layout-template`,
        create: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/vendor/layout-template`,
        show: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/vendor/layout-template/${context.layout_id}`,
        update: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/vendor/layout-template/${context.layout_id}`,
        delete: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/vendor/layout-template/${context.layout_id}`
      },
      user_catalogue: {
        get: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/user/vendor`,
        show: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/user/vendor/${context.user_catalogue_id}`,
        create: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/user/vendor`,
        update: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/user/vendor/${context.user_catalogue_id}`,
        delete: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/user/vendor/${context.user_catalogue_id}`,
      },
      vendors: {
        get: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/vendor/company`,
        create: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/vendor/company`,
        show: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/vendor/company/${context.vendor_id}`,
        update: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/vendor/company/${context.vendor_id}`,
        delete: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/vendor/company/${context.vendor_id}`,
        address_map: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/vendor/company/${context.vendor_id}/address-map`,
        operational_time: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/vendor/operational-time`,
        chat_template: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/principal/vendor/chat-template`,
        chat_template_operational: `${AYO_API_SERVICE(SERVER.content)}/api/v1/content/principal/vendor/chat-template-operational`,
        list_province: `${AYO_API_SERVICE(SERVER.area)}/api/v1/area/master/province?sort=name`,
        list_city: `${AYO_API_SERVICE(SERVER.area)}/api/v1/area/master/city/by-province/${context.province_id}?sort=name`,
        list_district: `${AYO_API_SERVICE(SERVER.area)}/api/v1/area/master/district/by-city/${context.city_id}?sort=name`,
        list_subdistrict: `${AYO_API_SERVICE(SERVER.area)}/api/v1/area/master/sub-district/by-district/${context.district_id}?sort=name`
      },
      product_catalogue: {
        get: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/principal/vendor/product`,
        create: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/principal/vendor/product`,
        show: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/principal/vendor/product/${context.product_id}`,
        update: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/principal/vendor/product/${context.product_id}`,
        delete: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/principal/vendor/product/${context.product_id}`,
        delete_all: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/principal/vendor/product/delete-all`,
        categories: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/principal/vendor/product/categories`,
        export: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/principal/vendor/product/export`,
        preview_import: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/principal/vendor/product/preview?company_id=${context.company_id}`,
        import: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/principal/vendor/product/import?company_id=${context.company_id}`
      },
      orders_catalogue: {
        get: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/order/vendor`,
        show: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/order/vendor/${context.order_id}`,
        update: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/order/vendor/${context.order_id}`,
        update_status: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/order/vendor/${context.order_id}/status`,
        export: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/order/vendor/export`
      },
      PLPayMethod: {
        getList: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/principal/private-label/metode-pembayaran`,
        update: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/principal/private-label/metode-pembayaran/${context.payMethodId}`,
      },
      TaskVerification: {
        get: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/task-verification/list`,
        detail: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/task-verification/detail/${context.id}/${context.template_id}`,
        listAudience: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/task-verification/audience/
          ${context.audience_id}/${context.template_id}`,
        listReason: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/task-verification/rejectedreason/${context.template_id}`,
        totalSRC: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/task-verification/view-coin/${context.template_id}`,
        verificationAll: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/task-verification/verifikasi/all`,
        verification: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/task-verification/verifikasi`,
        releaseCoinAll: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/task-verification/release-coin/all`,
        releaseCoin: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/task-verification/release-coin`,
        submission: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/task-verification/submission`,
        export: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/task-verification/export`,
        getTsm: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/tsm-task-verification/list`,
        detailTsm: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/tsm-task-verification/detail/${context.id}/${context.template_id}`,
        listAudienceTsm: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/tsm-task-verification/audience/
          ${context.audience_id}/${context.template_id}`,
        listReasonTsm: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/tsm-task-verification/rejectedreason/${context.template_id}`,
        // totalSRCTsm: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/task-verification/view-coin/${context.template_id}`,
        verificationAllTsm: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/tsm-task-verification/verifikasi/all`,
        verificationTsm: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/tsm-task-verification/verifikasi`,
        releaseCoinAllTsm: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/tsm-task-verification/release-coin/all`,
        releaseCoinTsm: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/tsm-task-verification/release-coin`,
        submissionTsm: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/tsm-task-verification/submission`,
        exportTsm: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/task-verification/export`,
        exportTrueTsm: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/tsm-task-verification/export`
      },
      paylater_company: {
        get: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/company`,
        show: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/company/${context.company_id}`,
        create: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/company`,
        put: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/company/${context.company_id}`,
        delete: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/company/${context.company_id}`,
        update_status: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/company/update-status/${context.company_id}`
      },
      paylater_panel: {
        get: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/panel`,
        get_mitra: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/panel/mitra/list`,
        get_src: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/panel/src/list`,
        check_panel: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/panel/check`,
        panel_companies: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/panel/company/list`,
        export_panel: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/panel/export`,
        export_all_panel: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/panel/list/export`,
        store: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/panel`,
        show: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/panel/${context.panel_id}`,
        delete: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/panel/${context.panel_id}`,
        import: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/panel/import`,
        preview: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/panel/preview-import`
      },
      paylater_deactivate: {
        get: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/deactivation`,
        history: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/deactivation/history`,
        approval: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/deactivation/${context.deactivation_id}`,
      },
      sequencing: {
        get: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/sequencing`,
        show: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/sequencing/${context.sequencing_id}`,
        create: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/sequencing`,
        put: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/sequencing/${context.sequencing_id}`,
        delete: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/sequencing/${context.sequencing_id}`,
        list_trade_program: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/sequencing/list/trade-program`,
        list_trade_audience__group: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/sequencing/list/trade-audience-tsm`,
        check_budget: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/sequencing/check/budget`,
        export: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/sequencing-data/export`,
        get_popup: `${AYO_API}/api/principal/sequencing/list/pop-up-notification`,
        get_push: `${AYO_API}/api/principal/sequencing/list/notification`,
        update_status: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/sequencing/update-status/${context.sequencing_id}`,
        download_adjustment: `${AYO_API_SERVICE(SERVER.coin)}/api/v1/coin/principal/tsm_adjustment/coin/download`,
        preview_adjustment: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/principal/tsm_adjustment/coin/preview`,
        import_adjustment: `${AYO_API_SERVICE(SERVER.coin)}/api/v1/coin/principal/tsm_adjustment/coin/import`,
        adjust_retailer: `${AYO_API_SERVICE(SERVER.coin)}/api/v1/coin/principal/adjustment/coin/retailer` //ini yang di coin mangement
      },
      pengaturan_attribute_misi: {
        get_toolbox: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox${context.status ? '?status=active' : ''}`,
        create_toolbox: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox`,
        put_toolbox: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox/${context.kategori_toolbox_id}`,
        delete_toolbox: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox/${context.kategori_toolbox_id}`,
        get_tipe_misi: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox_tipe_misi${context.status ? '?status=active' : ''}`,
        get_project: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox_project_misi${context.status ? '?status=active' : ''}`,
        create_tipe_misi: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox_tipe_misi`,
        put_tipe_misi: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox_tipe_misi/${context.tipe_misi_id}`,
        delete_tipe_misi: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox_tipe_misi/${context.tipe_misi_id}`,
        delete_project_misi: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox_project_misi/${context.tipe_project_id}`,
        get_internal_misi: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox_internal_misi${context.status ? '?status=active' : ''}`,
        create_internal_misi: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox_internal_misi`,
        create_project_misi: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox_project_misi`,
        put_internal_misi: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox_internal_misi/${context.internal_misi_id}`,
        put_project_misi: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox_project_misi/${context.project_misi_id}`,
        delete_internal_misi: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox_internal_misi/${context.internal_misi_id}`,
        get_kategori_misi: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox_kategori_misi${context.status ? '?status=active' : ''}`,
        create_kategori_misi: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox_kategori_misi`,
        put_kategori_misi: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox_kategori_misi/${context.kategori_misi_id}`,
        delete_kategori_misi: `${AYO_API_SERVICE(SERVER.task)}/api/v1/task/${type_api}/kategori_toolbox_kategori_misi/${context.kategori_misi_id}`
      },
      paylater_activate: {
        activate_mitra: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/activation/mitra`,
        activate_src: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/paylater/activation/src`
      },
      new_sign_menu: {
        icon_list: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/sign-menu/list/icon`,
        menu_list: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/sign-menu/list/menu`,
        get: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/sign-menu`,
        create: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/sign-menu`,
        show: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/sign-menu/${context.sign_id}`,
        update: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/sign-menu/${context.sign_id}`,
        delete: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/sign-menu/${context.sign_id}`,
        general_new_sign: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/general/sign-menu`
      },
      b2b_voucher: {
        get: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/voucher`,
        create: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/voucher`,
        update: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/voucher/${context.voucher_id}`,
        show: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/voucher/${context.voucher_id}`,
        redeem: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/voucher/${context.voucher_id}/redeem`,
        export_excel: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/voucher/${context.voucher_id}/export-excel`,
        export_invoice: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/voucher/${context.voucher_id}/export-invoice`,
        list_retailer: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/voucher/panel/retailer`,
        list_mitra: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/voucher/panel/mitra`,
        selected_retailer: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/voucher/panel/${context.voucher_id}/retailer`,
        selected_mitra: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/voucher/panel/${context.voucher_id}/mitra`,
        update_panel: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/voucher/panel/${context.voucher_id}`,
        export_panel: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/voucher/panel/export`,
        import_panel: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/voucher/panel/import`,
        preview_import: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/voucher/panel/preview`,
        product_list: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/general/product/list-sku`,
        redeem_export: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/voucher/${context.voucher_id}/redeem/export`,
        redeem_import_preview: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/voucher/${context.voucher_id}/redeem/import`,
        redeem_import_submit: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/voucher/${context.voucher_id}/redeem/submit-import`,
        listVoucherB2C: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/b2c/voucher/list/data`,
        change_status: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/voucher/${context.voucher_id}/status`
      },
      medalBadge: {
        medal: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/medal`,
        putMedal: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/medal/${context.id}`,
        retailerList: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/medal/list/retailer`,
        medalCategory: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/medal/list/category`,
        exportRetailer: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/medal/list/retailer/export`,
        importRetailer: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/medal/list/retailer/import`,
        previewImportRetailer: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/medal/list/retailer/preview-import`,
      },
      panel_partnership: {
        get: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/panel-partnership/partnership`,
        create: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/panel-partnership/partnership`,
        update: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/panel-partnership/partnership/${context.partnership_id}`,
        delete: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/panel-partnership/partnership/${context.partnership_id}`,
        list_suppliers: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/private-label/supplier-company`,
        list_retailer_selected: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/panel-partnership/partnership/audience/${context.partnership_id}`,
        updateStatus: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/panel-partnership/partnership/status/${context.partnership_id}`,
        import: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/panel-partnership/partnership/audience/import-audience`,
        show_import: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/panel-partnership/partnership/audience/import/show-import-audience`,
        export: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/panel-partnership/partnership/audience/export-audience`
      },
      b2c_voucher: {
        //Detail
        getListVoucher: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/b2c/voucher`,
        getDetailVoucher: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/b2c/voucher/${context.voucher_id}`,
        createVoucher: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/b2c/voucher`,
        updateVoucher: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/b2c/voucher/${context.voucher_id}`,
        deleteVoucher: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/b2c/voucher/${context.voucher_id}`,
        getListReimbursement: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/b2c/voucher/reimburse/list`,
        exportListReimbursement: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/b2c/voucher/reimburse/list/export`,

        //Panel
        getSelectedRetailerPanel: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/b2c/voucher/panel/${context.voucher_id}/retailer`,
        getSelectedCustomerPanel: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/b2c/voucher/panel/${context.voucher_id}/customer`,
        updatePanel: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/b2c/voucher/panel/${context.voucher_id}`,

        //Pertukaran Voucher
        getNominal: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/b2c/voucher/reimburse/nominal`,
        updatePenukaranVoucher: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/b2c/voucher/reimburse/${context.voucher_id}`,

        //Design Voucher
        updateDesign: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/b2c/voucher/design/${context.voucher_id}`,

        //Preview VOucher
        updateStatus: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/b2c/voucher/${context.voucher_id}/update-status`,

        //List Detail Voucher
        getListDetailVoucher: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/b2c/voucher/${context.voucher_id}/list`,
        exportListDetailVoucher: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/b2c/voucher/${context.voucher_id}/list/export`,
        getDetailOrder: `${AYO_API_SERVICE(SERVER.orderCashier)}/api/v1/${SERVER.orderCashier}/${type_api}/voucher/order/${context.detail_order_id}`,

        //partial
        product_list: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/general/product/list-sku`,
        getAudienceRetailer: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/general/business/list-audiences?is_voucher=1`,
        exportAudienceRetailer: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/general/business/list-audiences/export`,
        importAudienceRetailer: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/general/business/list-audiences/import`,
        getAudienceCustomer: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/general/list-audience`,
        exportAudienceCustomer: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/general/list-audience/export`,
        importAudienceCustomer: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/general/list-audience/import`,
      },

      b2b_voucher_inject: {
        get: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/inject-voucher`,
        create: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/inject-voucher`,
        update: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/inject-voucher/${context.voucher_id}`,
        show: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/inject-voucher/${context.voucher_id}`,
        delete: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/inject-voucher/${context.voucher_id}`,
        exportInvoice: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/inject-voucher/${context.voucher_id}/export-invoice`,
        exportExcel: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/inject-voucher/${context.voucher_id}/export-excel`,

        panelRetailerList: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/voucher/inject/panel/retailer`,
        panelMitraList: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/voucher/inject/panel/mitra`,
        panelPreviewImport: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/voucher/inject/panel/preview`,
        panelImport: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/voucher/inject/panel/import`,
        panelExport: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/voucher/inject/panel/export`,
        selectedRetailer: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/voucher/panel/${context.voucher_id}/retailer`,
        selectedMitra: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/voucher/panel/${context.voucher_id}/mitra`,
        updatePanel: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/inject-voucher/panel/${context.voucher_id}`,

        getRedeem: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/inject-voucher/${context.voucher_id}/redeem`,
        redeemImport: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/inject-voucher/${context.voucher_id}/redeem/import`,
        redeemSubmitImport: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/inject-voucher/${context.voucher_id}/redeem/submit-import`,
        redeemExport: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/inject-voucher/${context.voucher_id}/redeem/export`,

        product_list: `${AYO_API_SERVICE(SERVER.product)}/api/v1/product/general/product/list-sku`,
        change_status: `${AYO_API_SERVICE(SERVER.order)}/api/v1/order/principal/inject-voucher/${context.voucher_id}/status`
      },

      notifications_list: {
        get_update: `${AYO_API}/api/general/user_notif/update`,
        update_badge: `${AYO_API}/api/general/user_notif/status-batch`,
        unread_badge: `${AYO_API}/api/general/user_notif/status-unread-batch`,
        delete_notif: `${AYO_API}/api/general/user_notif/delete-batch`,
        get_detail: `${AYO_API}/api/general/user_notif/detail/${context.id}`,
      },
    };
    return ENDPOINT[namespace] && ENDPOINT[namespace][key];
  }

  getEndPoint() {
    return AYO_API;
  }
}
