const express = require('express');
const router = express.Router();

const childController = require('../controllers/childController');

// Express 是通过 next(error) 来表达出错的，无法识别 async 函数抛出的错误
// wrap 函数的作用在于将 async 函数抛出的错误转换为 next(error)
function wrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

// 组装路由
router.get('/', wrap(childController.listAll));
router.patch('/:id', wrap(childController.update));
router.delete('/:id', wrap(childController.delete));

module.exports = router;
