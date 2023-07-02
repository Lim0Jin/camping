//함수를 수용할 함수를 반환
module.exports = func => {
  //해당함수를 실행
  return (req, res, next) => {
    //오류를 검출하고 오류가 있으면 다음으로 전달
    func(req, res, next).catch(next);
  }
}