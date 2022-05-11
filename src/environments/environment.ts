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
  cognito_login_url: 'https://ayo-principal-dev.auth.ap-southeast-1.amazoncognito.com/oauth2/authorize?identity_provider=ayo-principal-dev&redirect_uri=https://hms.dev.src.id/login&response_type=CODE&client_id=1oe00f63c64c3lpseof1bgcuah&scope=aws.cognito.signin.user.admin email openid phone profile',
  show_gtm: false,
  SRC_KATALOG_KOIN_BASE_IFRAME_URL: 'https://hms-react.dev.src.id',
  STREAMLIT: 'https://dynamicpricing.api.dev.src.id',
  REACT_BASE_URL: 'https://hms-react.dev.src.id',
};

export const serviceServer = (server) => {
  return `https://${server}.api.dev.src.id`;
}
// export const serviceServer = (server, paths = ['api'], env='dev') => {
//   let path = (paths.length) ? `${paths.join('.')}.` : '';
//   let _env = (env) ? `${env}.` : '';
//   return `https://${server}.${path}${_env}src.id`;
// }

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
  export: 'export',
}