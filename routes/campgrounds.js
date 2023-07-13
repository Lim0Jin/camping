const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

router.route('/')
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
// ↑ new.ejs에서 작성한 폼을 여기로 제출해서 새 캠핑장 만듬
// isLoggedIn로 로그인 확인, 이미지 넣기 
// validateCampground로 제목 가격등 있는지 확인(유효성검사)
// catchAsync를 써서 try catch를 안써도 됨 Mongoose에서
//여기로 발생된 오류가 있다면 캐스트오류를 통해 확인함
//오류가 발생하면 catchAsync가 검출하고 다음으로 전달


router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;