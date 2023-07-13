const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.escapeHTML': '{{#label}} must not include HTML!'
  },
  rules: {
    excapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value) return helpers.error('string.escapeHTML', { value })
        return clean;
      }
    }
  }
});

const Joi = BaseJoi.extend(extension)


//유효성 검사
module.exports.campgroundSchema = Joi.object({
  //스키마 정의
  campground: Joi.object({
    title: Joi.string().required().excapeHTML(),
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    location: Joi.string().required().excapeHTML(),
    description: Joi.string().required().excapeHTML(),
  }).required(),
  deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().excapeHTML()
  }).required()
})
