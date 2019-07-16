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
      },
      admin_principal: {
        get: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/principal`,
        detail: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/principal/${context.principal_id}`,
        create: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/principal`,
        put: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/principal/${context.principal_id}`,
        delete: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/principal/${context.principal_id}`,
        delete_multiple: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/principal/inactive/multiple`,
        parent: `${AYO_API}/api/general/area/get_parent_id/${context.parent}`,
        list_role: `${AYO_API}/api/${type_api}/user/role?page=all`,
        list_role_nolimit: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/role/list`
      },
      field_force: {
        get: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/field-force`,
        create: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/field-force`,
        put: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/field-force/${context.fieldforce_id}`,
        delete: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/field-force/${context.fieldforce_id}`
      },
      wholesaler: {
        get: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/wholesaler`,
        create: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/wholesaler/store`,
        put: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/wholesaler/update/${context.wholesaler_id}`,
        // put: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/user/wholesaler/${context.wholesaler_id}`,
        delete: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/${type_api}/user/wholesaler/${context.wholesaler_id}`
      },
      retailer: {
        get: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/retailer`,
        create: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/retailer/store`,
        put: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/principal/retailer/update/${context.retailer_id}`,
        delete: `${AYO_API_SERVICE(SERVER.business)}/api/v1/user/${type_api}/user/retailer/${context.retailer_id}`,
        consumer_list: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/service/by-referral-code/${context.referral_code}`
      },
      paguyuban: {
        get: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/paguyuban`,
        create: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/paguyuban`,
        put: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/paguyuban/${context.paguyuban_id}`,
        delete: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/paguyuban/${context.paguyuban_id}`,
        delete_multiple: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/paguyuban/delete/multiple`,
      },
      customer: {
        get: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/customer`,
        detail: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/user/customer/${context.customer_id}`
      },
      banner: {
        get: `${AYO_API}/api/${type_api}/content/banner`,
        create: `${AYO_API}/api/${type_api}/content/banner`,
        put: `${AYO_API}/api/${type_api}/content/banner/${context.banner_id}`,
        delete: `${AYO_API}/api/${type_api}/content/banner/${context.banner_id}`,
      },
      landingPage: {
        get: `${AYO_API}/api/${type_api}/content/static-page`,
        create: `${AYO_API}/api/${type_api}/content/static-page`,
        put: `${AYO_API}/api/${type_api}/content/static-page/${context.page_id}`,
        delete: `${AYO_API}/api/${type_api}/content/static-page/${context.page_id}`
      },
      product: {
        get: `${AYO_API}/api/${type_api}/product/product`,
        detail: `${AYO_API}/api/${type_api}/product/product/${context.product_id}`,
        create: `${AYO_API}/api/${type_api}/product/product`,
        put: `${AYO_API}/api/${type_api}/product/product/${context.product_id}`,
        delete: `${AYO_API}/api/${type_api}/product/product/${context.product_id}`,
        list_brand: `${AYO_API}/api/general/product/brand?page=all`,
        list_category: `${AYO_API}/api/${type_api}/product/category?parent_id=${context.parent_id}`,
        list_packaging: `${AYO_API}/api/${type_api}/product/packaging?page=all`,
        parent: `${AYO_API}/api/general/area/get_parent_id/${context.parent}`,
      },
      template_task: {
        get: `${AYO_API}/api/${type_api}/template`,
        create: `${AYO_API}/api/${type_api}/template`,
        put: `${AYO_API}/api/${type_api}/template/${context.template_id}`,
        delete: `${AYO_API}/api/${type_api}/template/${context.template_id}`
      },
      trade_program: {
        get: `${AYO_API}/api/${type_api}/creator`,
        create: `${AYO_API}/api/${type_api}/creator`,
        put: `${AYO_API}/api/${type_api}/creator/${context.trade_program_id}`,
        delete: `${AYO_API}/api/${type_api}/creator/${context.trade_program_id}`
      },
      schedule_trade_program: {
        get: `${AYO_API}/api/${type_api}/scheduler`,
        detail: `${AYO_API}/api/${type_api}/scheduler/${context.schedule_tp_id}`,
        create: `${AYO_API}/api/${type_api}/scheduler`,
        put: `${AYO_API}/api/${type_api}/scheduler/${context.schedule_tp_id}`,
        delete: `${AYO_API}/api/${type_api}/scheduler/${context.schedule_tp_id}`,
        reject_audience: `${AYO_API}/api/${type_api}/scheduler/reject/audience`,
        list_tp: `${AYO_API}/api/${type_api}/creator?page=all`,
        list_template: `${AYO_API}/api/${type_api}/template?page=all`,
        list_audience: `${AYO_API}/api/${type_api}/audience/show/${context.audience_id}`,
        export: `${AYO_API}/api/${type_api}/scheduler/export`,
        update_tanggal: `${AYO_API}/api/${type_api}/scheduler/${context.schedule_tp_id}/update-date`,
        csv_preview: `${AYO_API}/api/${type_api}/adjustment/coin/preview`,
        csv_store: `${AYO_API}/api/${type_api}/adjustment/coin/import`,
        csv_download: `${AYO_API}/api/${type_api}/adjustment/coin/download`
      },
      audience: {
        get: `${AYO_API}/api/${type_api}/audience`,
        detail: `${AYO_API}/api/${type_api}/audience/${context.audience_id}`,
        create: `${AYO_API}/api/${type_api}/audience`,
        put: `${AYO_API}/api/${type_api}/audience/${context.audience_id}`,
        delete: `${AYO_API}/api/${type_api}/audience/${context.audience_id}`,
        list_scheduler: `${AYO_API}/api/${type_api}/scheduler?page=all`,
        list_retailer: `${AYO_API}/api/${type_api}/audience/all/retailer`,
        list_retailer_selected: `${AYO_API}/api/${type_api}/audience/group/${context.audience_id}`,
        validate_budget: `${AYO_API}/api/${type_api}/audience/count/budget`,
        import: `${AYO_API}/api/${type_api}/audience/import`,
        export: `${AYO_API}/api/${type_api}/audience/export`
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
        force_update: `${AYO_API}/api/${type_api}/force-update`,
        list_version: `${AYO_API}/api/${type_api}/force-update`,
        revert_version: `${AYO_API}/api/${type_api}/force-update/${context.version_id}`
      },
      tnc: {
        get: `${AYO_API}/api/${type_api}/content/content?type=terms-conditions`,
        create: `${AYO_API}/api/${type_api}/content/content`,
        put: `${AYO_API}/api/${type_api}/content/content/${context.content_id}`,
        delete: `${AYO_API}/api/${type_api}/content/content/${context.content_id}`,
      },
      privacy: {
        get: `${AYO_API}/api/${type_api}/content/content?type=privacy-policy`,
        create: `${AYO_API}/api/${type_api}/content/content`,
        put: `${AYO_API}/api/${type_api}/content/content/${context.content_id}`,
        delete: `${AYO_API}/api/${type_api}/content/content/${context.content_id}`,
      },
      help: {
        get: `${AYO_API}/api/${type_api}/content/content?type=help`,
        create: `${AYO_API}/api/${type_api}/content/content`,
        put: `${AYO_API}/api/${type_api}/content/content/${context.content_id}`,
        delete: `${AYO_API}/api/${type_api}/content/content/${context.content_id}`,
      },
      coin: {
        retailer: `${AYO_API}/api/${type_api}/coin?type=retailer`,
        program: `${AYO_API}/api/${type_api}/coin?type=program`,
        detail_retailer: `${AYO_API}/api/${type_api}/coin/retailer/${context.retailer_id}`,
        detail_program: `${AYO_API}/api/${type_api}/coin/program/${context.trade_program_id}`,
        flush: `${AYO_API}/api/principal/coin`,
        parent: `${AYO_API}/api/general/area/get_parent_id/${context.parent}`,
      },
      menu: {
        get: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/${type_api}/menu`
      },
      notification: {
        get: `${AYO_API}/api/${type_api}/notification`,
        create: `${AYO_API}/api/${type_api}/notification`,
        delete: `${AYO_API}/api/${type_api}/notification/${context.notification_id}`,
        get_popup: `${AYO_API}/api/${type_api}/pop-up-notification`,
        show_popup: `${AYO_API}/api/${type_api}/pop-up-notification/${context.popup_notif_id}`,
        create_popup: `${AYO_API}/api/${type_api}/pop-up-notification`,
        update_popup: `${AYO_API}/api/${type_api}/pop-up-notification/${context.popup_notif_id}`,
        delete_popup: `${AYO_API}/api/${type_api}/pop-up-notification/${context.popup_notif_id}`,
      },
      general: {
        support: `${AYO_API}/api/general/content?type=help&user=principal&page=all`,
        permissions: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/principal/permission`,
        parent: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/parent-by-id/${context.parent}`,
        parent_by_code: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/parent-by-code/${context.parent}`,
        get_business: `${AYO_API_SERVICE(SERVER.business)}/api/v1/business/general/business/get/${context.business_id}`,
        list_level: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/level`,
        list_children: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/by-level/${context.level_desc}`,
        list_other_children: `${AYO_API_SERVICE(SERVER.area)}/api/v1/general/area/children/${context.parent_id}`,
        list_principal: `${AYO_API_SERVICE(SERVER.user)}/api/v1/user/general/user/principal?page=all`
      }
    };
    return ENDPOINT[namespace] && ENDPOINT[namespace][key];
  }

  getEndPoint() {
    return AYO_API;
  }
}
