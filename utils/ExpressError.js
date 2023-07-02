// 전달되는 메시지와 상태코드를 동등하게 만듬
class ExpressError extends Error {
  constructor(massage, statusCode) {
    super();
    this.message = massage;
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;