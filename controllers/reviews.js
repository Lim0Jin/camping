const Campground = require('../models/campground');
const Review = require('../models/review.js');

//리뷰 등록
module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  //campground안에 reviews에 review를 넣음
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash('success', 'Created new review!')
  res.redirect(`/campgrounds/${campground._id}`);
}

//리뷰 삭제
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully deleted reivew!')
  res.redirect(`/campgrounds/${id}`);
}