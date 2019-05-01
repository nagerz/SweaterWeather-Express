var express = require("express");
var router = express.Router();
var User = require('../../../models').User;

router.get("/", function(req, res, next) {
  if (req.body.api_key){
    User.findOne({
      where: {
        api_key: req.body.api_key
      }
    }).then(function(user){
      if(!user){
        res.setHeader("Content-Type", "application/json");
        res.status(401).send({ error: "unauthorized" });
      }else{

      }
    });
  }else{
    res.setHeader("Content-Type", "application/json");
    res.status(401).send({ error: "unauthorized" });
  };
});

module.exports = router;
