const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

//캠핑장 스키마 생성 이름,가격,설명,위치
const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
});

// 캠핑장을 삭제한 값을 가져와서 등록된 리뷰가 있다면 삭제 
// findOneAndDelete = 문서를 전달하는 쿼리 미들웨어 문서를 찾은 후 삭제하는 함수로 넘어감
// 
CampgroundSchema.post('findOneAndDelete', async function (doc) {
  // 가지고 있는 리뷰 중 리뷰 배열에서 삭제된 캠핑장 id를찾아 가진 모든 리뷰를 삭제
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
})

//데이터를 내본내기 위함
module.exports = mongoose.model('Campground', CampgroundSchema);