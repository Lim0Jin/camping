const mongoose = require('mongoose');
//cities 불러오기
const cities = require('./cities')
//seedHelpers에 있는 places,descriptors 불러오기
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground')

//db 생성 이름은 yelp-camp
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');


//오류를 확인하고 오류없이 제대로 열렸다면 연결되었다는 문구를 출력
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("데이터베이스 연결됨")
})

const sample = (array) => array[Math.floor(Math.random() * array.length)];


//데이터베이스의 데이터 삭제
const seedDB = async () => {
  // 데이터베이스를 전부 삭제
  await Campground.deleteMany({});
  // 새캠핑장 생성을 50번씩 함
  for (let i = 0; i < 300; i++) {
    //위치 결정
    const random1000 = Math.floor(Math.random() * 1000)
    //가격
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      // YOUR USER ID
      author: '649981c7d6980abe66585430',
      //도시와 주 데이터가 출력
      location: `${cities[random1000].city},${cities[random1000].state}`,
      //이름 출력
      title: `${sample(descriptors)} ${sample(places)}`,
      //지도 위도,경도
      geometry: {
        type: 'Point',
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ]
      },
      //이미지 출력
      images: [
        {
          url: 'https://res.cloudinary.com/drhgtjsdj/image/upload/v1688614503/YelpCamp/bvg9nxobfat6shlv2gok.jpg',
          filename: 'YelpCamp/zjnt9q2iiihxlp9mzbyx',
        },
        {
          url: 'https://res.cloudinary.com/drhgtjsdj/image/upload/v1688614505/YelpCamp/jylyyfetbl2sdjgeolig.jpg',
          filename: 'YelpCamp/xaopclzzqtqy9du2bisy',
        },
      ],
      //이미지 설명
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure illo vel dolores quasi officia? Fugiat, esse? Mollitia temporibus magni asperiores. Dolor, fugiat? Consequatur autem alias a tenetur doloremque! Distinctio, reiciendis.',
      price,
    })
    // db 저장
    await camp.save();
  }
}

//db 생성이 끝났다면 연결 끊기 
seedDB().then(() => {
  mongoose.connection.close();
});