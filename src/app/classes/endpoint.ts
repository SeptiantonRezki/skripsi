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
// const AYO_API = "http://192.168.2.228/"; // ip internal
const AYO_API = "https://ayo-api.dxtr.asia";
// const AYO_API = "http://43.243.140.58:3232"; // ip public
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
        verify_isms: `${AYO_API}/api/source/customer/${context.business_code}/${context.phone}`,
        store_user: `${AYO_API}/api/${type_api}/user`,
        //login: `${AYO_API}/oauth/token` ,
        login: `${AYO_API}/api/${type_api}/token`,
        verify_code: `${AYO_API}/api/general/otp/verify-account`,
        me: `${AYO_API}/oauth/user`,
        resend_otp: `${AYO_API}/api/general/otp/send`,
        reset_password: `${AYO_API}/oauth/password/reset`,
        change_password: `${AYO_API}/oauth/password/forgot`,
        logout: `${AYO_API}/oauth/token/revoke`,
        check_token: `${AYO_API}/oauth/check/token`,
      },
      admin_principal: {
        get: `${AYO_API}/api/${type_api}/user/principal`,
        create: `${AYO_API}/api/${type_api}/user/principal`,
        put: `${AYO_API}/api/${type_api}/user/principal/${context.principal_id}`,
        delete: `${AYO_API}/api/${type_api}/user/principal/${context.principal_id}`,
        list_role: `${AYO_API}/api/${type_api}/user/role`,
        list_role_nolimit: `${AYO_API}/api/${type_api}/user/role/list`,
      },
      field_force: {
        get: `${AYO_API}/api/${type_api}/user/field-force`,
        create: `${AYO_API}/api/${type_api}/user/field-force`,
        put: `${AYO_API}/api/${type_api}/user/field-force/${context.fieldforce_id}`,
        delete: `${AYO_API}/api/${type_api}/user/field-force/${context.fieldforce_id}`,
        parent: `${AYO_API}/api/general/area/get_parent/${context.parent}`,
        list_level: `${AYO_API}/api/general/area/get_level`,
        list_children: `${AYO_API}/api/general/area/get_children/${context.level_desc}`,
        list_other_children: `${AYO_API}/api/general/area/get_children_id/${context.parent_id}`
      },
      wholesaler: {
        get: `${AYO_API}/api/${type_api}/user/wholesaler`,
        create: `${AYO_API}/api/${type_api}/user/wholesaler`,
        put: `${AYO_API}/api/${type_api}/user/wholesaler/${context.wholesaler_id}`,
        delete: `${AYO_API}/api/${type_api}/user/wholesaler/${context.wholesaler_id}`,
        parent: `${AYO_API}/api/general/area/get_parent/${context.parent}`,
        list_level: `${AYO_API}/api/general/area/get_level`,
        list_children: `${AYO_API}/api/general/area/get_children/${context.level_desc}`,
        list_other_children: `${AYO_API}/api/general/area/get_children_id/${context.parent_id}`
      },
      retailer: {
        get: `${AYO_API}/api/${type_api}/user/retailer`,
        create: `${AYO_API}/api/${type_api}/user/retailer`,
        put: `${AYO_API}/api/${type_api}/user/retailer/${context.retailer_id}`,
        delete: `${AYO_API}/api/${type_api}/user/retailer/${context.retailer_id}`,
        parent: `${AYO_API}/api/general/area/get_parent/${context.parent}`,
        list_level: `${AYO_API}/api/general/area/get_level`,
        list_children: `${AYO_API}/api/general/area/get_children/${context.level_desc}`,
        list_other_children: `${AYO_API}/api/general/area/get_children_id/${context.parent_id}`
      },
      banner: {
        get: `${AYO_API}/api/${type_api}/content/banner`,
        create: `${AYO_API}/api/${type_api}/content/banner`,
        put: `${AYO_API}/api/${type_api}/content/banner/${context.banner_id}`,
        delete: `${AYO_API}/api/${type_api}/content/banner/${context.banner_id}`,
        list_level: `${AYO_API}/api/general/area/get_level`,
        list_children: `${AYO_API}/api/general/area/get_children/${context.level_desc}`,
        list_other_children: `${AYO_API}/api/general/area/get_children_id/${context.parent_id}`
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
        list_brand: `${AYO_API}/api/${type_api}/product/brand?page=all`,
        list_category: `${AYO_API}/api/${type_api}/product/category?parent_id=${context.parent_id}`,
        list_packaging: `${AYO_API}/api/${type_api}/product/packaging?page=all`
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
        delete: `${AYO_API}/api/${type_api}/creator/${context.trade_program_id}`,
      },
      schedule_trade_program: {
        get: `${AYO_API}/api/${type_api}/scheduler`,
        detail: `${AYO_API}/api/${type_api}/scheduler/${context.schedule_tp_id}`,
        create: `${AYO_API}/api/${type_api}/scheduler`,
        put: `${AYO_API}/api/${type_api}/scheduler/${context.schedule_tp_id}`,
        delete: `${AYO_API}/api/${type_api}/scheduler/${context.schedule_tp_id}`,
        reject_audience: `${AYO_API}/api/${type_api}/scheduler/reject/audience`,
        list_tp: `${AYO_API}/api/${type_api}/creator?page=all&search=${context.param}`,
        list_template: `${AYO_API}/api/${type_api}/template?page=all&search=${context.param}`,
        list_audience: `${AYO_API}/api/${type_api}/audience/${context.audience_id}`,
      },
      audience: {
        get: `${AYO_API}/api/${type_api}/audience`,
        detail: `${AYO_API}/api/${type_api}/audience/${context.audience_id}?page=all`,
        create: `${AYO_API}/api/${type_api}/audience`,
        put: `${AYO_API}/api/${type_api}/audience/${context.audience_id}`,
        delete: `${AYO_API}/api/${type_api}/audience/${context.audience_id}`,
        list_scheduler: `${AYO_API}/api/${type_api}/scheduler?page=all`,
        list_retailer: `${AYO_API}/api/${type_api}/audience/all/retailer`,
        validate_budget: `${AYO_API}/api/${type_api}/audience/count/budget`,
      },
      news: {
        get: `${AYO_API}/api/${type_api}/newsfeed`,
        put: `${AYO_API}/api/${type_api}/newsfeed/${context.news_id}`,
        delete: `${AYO_API}/api/${type_api}/newsfeed/${context.news_id}`,
        list_category: `${AYO_API}/api/${type_api}/rssfeed/category?page=all`
      },
      role: {
        get: `${AYO_API}/api/${type_api}/user/role`,
        detail: `${AYO_API}/api/${type_api}/user/role/${context.role_id}`,
        create: `${AYO_API}/api/${type_api}/user/role`,
        put: `${AYO_API}/api/${type_api}/user/role/${context.role_id}`,
        delete: `${AYO_API}/api/${type_api}/user/role/${context.role_id}`,
        list_menu: `${AYO_API}/api/${type_api}/user/role/available_permissions`,
        list_level: `${AYO_API}/api/general/area/get_level`,
        list_children: `${AYO_API}/api/general/area/get_children/${context.level_desc}`,
        list_other_children: `${AYO_API}/api/general/area/get_children_id/${context.parent_id}`
      }
    };
    return ENDPOINT[namespace] && ENDPOINT[namespace][key];
  }

  getEndPoint() {
    return AYO_API;
  }
}
