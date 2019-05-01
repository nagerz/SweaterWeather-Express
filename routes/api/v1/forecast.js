var express = require("express");
var router = express.Router();
var User = require('../../../models').User;
var pry = require('pryjs')
//eval(pry.it)

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
      }else if(!req.query.location){
        res.setHeader("Content-Type", "application/json");
        res.status(400).send({ error: "invalid search location" });
      }else{
        eval(pry.it)


        Query.findOrCreate({query: req.query.location}).success(function(location, created){
          if(created){
            eval(pry.it)
          }else{
            console.log("query not created")
          };
        });
      }
    });
  }else{
    res.setHeader("Content-Type", "application/json");
    res.status(401).send({ error: "unauthorized" });
  };
});

module.exports = router;
