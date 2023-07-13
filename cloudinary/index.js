const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//env파일에있는 값을 가져와서 cloudinary에 넣음? 내생각..ㅎㅎ..
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// yelpCamp에 업로드하고 jpeg,png,jpg를 허용함
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'YelpCamp',
    allowedFormats: ['jpeg', 'png', 'jpg']
  }
});

module.exports = {
  cloudinary,
  storage
}