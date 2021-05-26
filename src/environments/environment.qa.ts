export const environment = {
  production: true,
  server: "https://api.qa.src.id",
  server_service: "https://api.qa.src.id",
  label: "MICROSERVICES QA",
  show_label: false,
  image: "assets/images/ayo/AYO_SRC_(Master).png",
  image_2x: "assets/images/ayo/AYO_SRC_(Master)@2x.png 2x",
  backgroundImage: "assets/images/ayo/header/Header-Color-Red@2x.jpg",
  qiscus_appIdMC: 'zova-efc1mal9p9cjurph', //Staging
  qiscus_appId: 'ayosrc-8lv9mbp2ce6iwr',
  cognito_login_url: 'https://ayo-principal-qa.auth.ap-southeast-1.amazoncognito.com/oauth2/authorize?identity_provider=ayo-principal-qa&redirect_uri=https://hms.qa.src.id/login&response_type=CODE&client_id=3h4042k701id4jimgf4or1jd14&scope=aws.cognito.signin.user.admin email openid phone profile'
};

export const serviceServer = (server) => {
  return `https://${server}.api.qa.src.id`;
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
  orderCashier: 'cashier-order',
  productCashier: "cashier-product",
}