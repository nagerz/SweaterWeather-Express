const fetch = require('node-fetch');
var pry = require('pryjs');

class Forecast {
  constructor () {
    this.data = {}
  }

  updateForecast(city){
    return new Promise((resolve, reject) => {
      getForecast(city)
      .then(forecastData => {

        var currently = {}

        currently["summary"] = forecastData["currently"]["summary"]
        currently["icon"] = forecastData["currently"]["icon"]
        currently["precipIntensity"] = forecastData["currently"]["icon"]
        currently["precipProbability"] = forecastData["currently"]["icon"]
        currently["temperature"] = forecastData["currently"]["temperature"]
        currently["humidity"] = forecastData["currently"]["humidity"]
        currently["pressure"] = forecastData["currently"]["pressure"]
        currently["windSpeed"] = forecastData["currently"]["windSpeed"]
        currently["windGust"] = forecastData["currently"]["windGust"]
        currently["windBearing"] = forecastData["currently"]["windBearing"]
        currently["cloudCover"] = forecastData["currently"]["cloudCover"]
        currently["visibility"] = forecastData["currently"]["visibility"]
        currently["day_high"] = forecastData["daily"]["data"][0]["temperatureHigh"]
        currently["day_low"] = forecastData["daily"]["data"][0]["temperatureLow"]

        if (city.state){
          this.data["location"] = city.city + ", " + city.state
        }else{
          this.data["location"] = city.city
        }
        this.data["currently"] = currently
        this.data["hourly"] = forecastData.hourly
        this.data["daily"] = forecastData.daily

        resolve(this)
      })
      .catch(error => {
        reject(error)
      })
    })
  }
};

function getForecast(city){
  let service = "https://api.darksky.net/forecast/"
  let key = process.env.DARKSKY_SECRET_KEY
  let lat = city.lat
  let long = city.long
  let url = service + key + "/" + lat + "," + long

  return new Promise((resolve, reject) => {
  fetch(url)
    .then(response => {
      if(response.status == 200){
        resolve(response.json())
      }else{
        reject("bad request")
      }
    })
  })
};

module.exports = Forecast;
