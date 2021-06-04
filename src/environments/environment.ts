export const environment = {
  production: true,
  server: "https://api.dev.src.id",
  server_service: "https://api.dev.src.id",
  label: "DEVELOPMENT",
  show_label: true,
  image: "assets/images/ayo/icon/dev.png",
  image_2x: "assets/images/ayo/icon/dev@2x.png 2x",
  backgroundImage: "assets/images/ayo/header/Header-Color-Blue@2x.jpg",
  qiscus_appIdMC: 'zova-efc1mal9p9cjurph', //Staging
  qiscus_appId: 'ayosrc-8lv9mbp2ce6iwr',
  cognito_login_url: 'https://ayo-principal-dev.auth.ap-southeast-1.amazoncognito.com/oauth2/authorize?identity_provider=ayo-principal-dev&redirect_uri=https://hms.dev.src.id/login&response_type=CODE&client_id=1oe00f63c64c3lpseof1bgcuah&scope=aws.cognito.signin.user.admin email openid phone profile'
};

export const serviceServer = (server) => {
  return `https://${server}.api.dev.src.id`;
}

export const server = {
  user: "users",
  business: "businesses",
  area: "areas",
  auth: "auth",
  newsfeed: "newsfeed",
  banner: "banner",
  content: "contentstatic",
  product: "product",
  task: "task-management",
  submission: "task-submission",
  coin: "coin-management",
  community: "community",
  order: "order",
  bora: "bora",
  orderCashier: 'cashier-order',
  productCashier: "cashier-product",
};


/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

