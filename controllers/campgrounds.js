const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

//campground/index 페이지
module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}

//새 캠핑장 추가 페이지
module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new');
}

// 새 캠핑장 만드는 코드
module.exports.createCampground = async (req, res, next) => {
  //경도 위도 얻기
  const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send()
  //req.body.campground가 없는경우 비동기 함수니까 express오류를 발생시키면 catchAsync가
  //해당 오류를 처리하고 next로 보냄
  // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
  //제출된 값을 save해서 데이터베이스에 넣고 /campgrounds/:id로 페이지 이동
  const campground = new Campground(req.body.campground);
  //지오코딩 api에서 보내준 geometry를 추가
  campground.geometry = geoData.body.features[0].geometry;
  // url과 filename의 간단한 객체를 포함한 배열을 만듬
  campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash('success', 'Successfully made a new campground!')
  res.redirect(`/campgrounds/${campground._id}`)
}

// index페이지에서 캠핑장을 클릭하면 나오는 페이지, id를 가지고 데이터베이스에서 알맞은 캠핑장을 찾음
module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id).populate({
    //중첩 populate 우리가 찾는 캠핑장에 리뷰배열의 모든 리뷰를 채워 넣으라는 명령 show 페이지만
    path: `reviews`,
    populate: {
      path: 'author'
    }
  }).populate('author');
  if (!campground) {
    req.flash('error', 'Cannot find that campground!')
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/show', { campground });
}

//id로 캠핑장을 찾아서 수정하는 페이지
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  //id로 캠핑장이 있는지 확인
  if (!campground) {
    req.flash('error', 'Cannot find that campground!')
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/edit', { campground });
}

// edit.ejs에서 편집한 폼을 여기로 제출해서 캠핑장 수정
module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  // id 전달후 findByIdAndUpdate로 검색 하고 그룹화된 값을 가져와서 업데이트함
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);
  await campground.save();
  //편집화면에서 이미지 삭제
  if (req.body.deleteImages) {
    //삭제할 이미지가 있으면 cloudinary에 있는 사진도 같이 삭제
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    //req.body.deleteImages에 있는 파일명과 일치하는 이미지를 배열에서 꺼내면서 삭제함
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    console.log(campground)
  }
  req.flash('success', 'Successfully updated campground!');
  res.redirect(`/campgrounds/${campground._id}`);
}

//캠핑장 삭제
module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted campground!')
  res.redirect(`/campgrounds`);
}