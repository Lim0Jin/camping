const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//리뷰 관련 스키마 생성
const reviewSchema = new Schema({
  body: String,
  rating: Number,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Review', reviewSchema);