const User = require('../models/user');

//회원가입 폼
module.exports.renderRegister = (req, res) => {
  res.render('users/register');
}

//회원가입 등록 코드
module.exports.register = async (req, res, next) => {
  //잘 진행되면 try할것이고 하지만 어딘가에 오류 발생하면 error로 표시후 현재있는폼으로 감
  try {
    // 사용자가 입력한 email,username,password를 가져와 User 모델에 넣음
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    //새로운 사용자에 대해 암호를 해시하고 솔트를 저장하고 결과를 해시함
    const registeredUser = await User.register(user, password);
    //회원가입 후 바로 로그인 됨! 
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash('success', ' Welcome to Yelp Camp!');
      res.redirect('/campgrounds');
    })
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('register');
  }
}

//로그인 폼
module.exports.renderLogin = (req, res) => {
  res.render('users/login');
}

//로그인 하기 
module.exports.login = (req, res) => {
  req.flash('success', 'welcome back!')
  const redirectUrl = res.locals.returnTo || '/campgrounds';
  res.redirect(redirectUrl);
}

//로그아웃
module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
  });
}