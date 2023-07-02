const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review');

//로그인여부 확인
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //위치저장
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'you must be signed in')
    return res.redirect('/login')
  }
  next();
}

//원래있던 위치 저장
module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
}

//campground 유효성검사
module.exports.validateCampground = (req, res, next) => {
  // 유효성검사 req.body로 title,pricec등등 required와 min 부분이 존재하는지 검사하고 next호출
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

// 캠핑장을 작성한 사람이 자신의캠핑장에 접근할수있음
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash('error', 'you do not have permission to do that!')
    return res.redirect(`/campgrounds/${id}`)
  }
  next();
}

// 리뷰를 작성한 사람이 자신의리뷰에 접근할수있음
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'you do not have permission to do that!')
    return res.redirect(`/campgrounds/${id}`)
  }
  next();
}

//reivew 유효성검사
module.exports.validateReview = (req, res, next) => {
  // 유효성검사 req.body로 값이 존재하는지 검사하고 next호출
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}