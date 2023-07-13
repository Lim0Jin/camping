if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
//메서드 재정의를위함
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const campgrounds = require('./routes/campgrounds');
const review = require('./routes/review');
const MongoDBStore = require('connect-mongo');
const MongoStore = require('connect-mongo');

// const dbUrl = process.env.DB_URL
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

//db 생성 이름은 yelp-camp
// 'mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect(dbUrl);


//오류를 확인하고 오류없이 제대로 열렸다면 연결되었다는 문구를 출력
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("데이터베이스 연결됨")
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
//POST라우트로 put, Delete, Patch라우트를 등록할수있음
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
  replaceWith: '_',
}),)

const secret = prcoess.env.SECRET || 'thisshouldbeabettersecret!';

//mongodb에 세션 저장
const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

store.on('error', function (e) {
  console.log("SESSION STORE ERROR", e)
})

//세션 미들웨어를 쓰면서 쿠키를 자동으로 보냄
const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    //http를 통해서만 엑세스 할수있다
    httpOnly: true,
    //https를 통해서 변경 및 구성되도록 함
    // secure: true,
    //쿠키 만료 기한 설정
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig))
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.titles.mapbox.com/",
  "https://events.mapbox.com/"
];
const fontSrcUrls = [];

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
      allowOrigins: ['*']
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
          "'self'",
          "blob:",
          "data:",
          "https://res.cloudinary.com/drhgtjsdj/",
          "https://images.unsplash.com/",
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
      },
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());
//passport야! 다운로드하고 요청한 LocalStrategy를 사용해주겠니?
//LocalStrategy에 대해 인증 메서드는 사용자 모델에 위치하게 되는데
//이를 authenticate 이라고함
passport.use(new LocalStrategy(User.authenticate()));

// 사용자를 어떻게 직렬화,역직렬화 할지 세션에서 저장할지 저장하지 않을지 지정하는것
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//success 가 무엇이든 간에 템플릿에서 자동으로 접근
//키가 success인 플래시를 가져오고 로컬변수에 접근
//모든 템플릿에 접근 가능
app.use((req, res, next) => {
  console.log(req.query);
  //로그인 상태 확인 방법 req.user
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  //심각한 오류가 생겼거나 오류에 응답하는 플래시 메시지를 띄울 때
  res.locals.error = req.flash('error');
  next();
})

// 사용자 객체와 암호를 제공하면 알아서 다해줌 
// 암호는 솔트를사용 솔트와 해시를 사용자에 저장
// 회원가입메서드 = User.register
app.get('/fakeUser', async (req, res) => {
  const user = new User({ email: 'coltttt@gmail.com', username: 'colttt' })
  const newUser = await User.register(user, 'chicken');
  res.send(newUser);
})

//user 라우트
app.use('/', userRoutes);
//campground 라우트
app.use('/campgrounds', campgrounds);
//review 라우트
app.use('/campgrounds/:id/reviews', review);

//home 으로 감
app.get('/', (req, res) => {
  res.render('home')
})

//상단의 모든 코드에 요청이 닿지않는 경우에 실행
app.all('*', (req, res, next) => {
  //응답할 메시지, 코드 입력
  next(new ExpressError('Page Not Found', 404))
})

//new ExpressError를 next로 전달하니
//오류 핸들러가 실행되면 ExpressError가 그 오류가 됨
app.use((err, req, res, next) => {
  // statusCode,message를 구조분해
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!"
  res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 5000;
//서버 5000포트 사용
app.listen(port, () => {
  console.log('Serving on port 5000')
})

