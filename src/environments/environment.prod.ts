export const environment = {
  production: true,
  server: "https://api.src.id",
  server_service: "https://api.src.id",
  label: "PRODUCTION",
  show_label: false,
  image: "assets/images/ayo/AYO_SRC_(Master).png",
  image_2x: "assets/images/ayo/AYO_SRC_(Master)@2x.png 2x",
  backgroundImage: "assets/images/ayo/header/Header-Color-Red@2x.jpg",
  qiscus_appIdMC: 'ofle-qm9wadiam8zza5sn', //payment required
  qiscus_appId: 'ayosrc-tzvpgcnxyliz1g',
  cognito_login_url: 'https://ayo-principal-prd.auth.ap-southeast-1.amazoncognito.com/oauth2/authorize?identity_provider=ayo-principal-prd&redirect_uri=https://hms.src.id/login&response_type=CODE&client_id=3uvfgpi61hk7a739rtjpjddv70&scope=aws.cognito.signin.user.admin email openid phone profile',
  show_gtm: true,
  SRC_KATALOG_KOIN_BASE_IFRAME_URL: 'https://hms-react.src.id',
  STREAMLIT: 'https://dynamicpricing.api.src.id',
  REACT_BASE_URL: 'https://hms-react.src.id'
};

export const serviceServer = (server) => {
  return `https://${server}.api.src.id`;
}

// export const serviceServer = (server, paths = ['api'], env=null) => {
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
  orderCashier: 'cashier-order',
  productCashier: "cashier-product",
  export: 'export',
}
