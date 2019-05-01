var express = require("express");
var router = express.Router();
var User = require('../../../models').User;
var Query = require('../../../models').Query;
var City = require('../../../models').City;
var pry = require('pryjs')
//eval(pry.it)

router.get("/", function(req, res, next) {
  let queryLocation = req.query.location;
  if (req.body.api_key){
    User.findOne({
      where: {
        api_key: req.body.api_key
      }
    }).then(function(user){
      if(!user){
        res.setHeader("Content-Type", "application/json");
        res.status(401).send({ error: "unauthorized" });
      }else if(!queryLocation){
        res.setHeader("Content-Type", "application/json");
        res.status(400).send({ error: "invalid search location" });
      }else{
        makeCity(queryLocation)
        .then(city => {
          makeQuery(queryLocation, city)
          .then(query => {
            eval(pry.it)
          })
        })
        .then(query => {
          eval(pry.it)
          if(query){
          }else{
            console.log("query not created")
          }
        });
      }
    });
  }else{
    res.setHeader("Content-Type", "application/json");
    res.status(401).send({ error: "unauthorized" });
  };
});

function makeCity(query){
  //var lat = geodata()
  // var long = geodata().geo_long
  // var city = geodata().geo_city
  // var state = geodata().geo_city
  // return new Promise((resolve, reject) {
    return City.create({
      city: query,
      state: "test",
      lat: 1,
      long: 1
    })
    .then(function(city){
      return (city);
    })
    .catch(error => {
      eval(pry.it)
      return (error);
    })
};

function makeQuery(queryLocation, city){
  Query.findOrCreate({
    where: {query: queryLocation, CityId: city.id}
    })
  .then(query => {
    return (query);
  })
  .catch(error => {
    eval(pry.it)
    return (error);
  })
};

function geodata(){
  eval(pry.it)

  var data = {};
  // data[:geo_lat] = geolocation()[:results][0][:geometry][:location][:lat]
  // data[:geo_long] = geolocation()[:results][0][:geometry][:location][:lng]
  // data[:geo_city] = geolocation()[:results][0][:address_components][0][:long_name]
  // data[:geo_state] = geolocation()[:results][0][:address_components][2][:short_name]
  return data;
}

function geolocation(){
  eval(pry.it)

  //geocode_service.geocode(@search_location)
}

module.exports = router;
