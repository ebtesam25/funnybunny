var request = require("request");

var options = { method: 'GET',
  url: 'https://api.openweathermap.org/data/2.5/onecall',
  qs: 
   { lat: '34.51',
     lon: '-117.41',
     exclude: 'minutely,daily,hourly,guid}}l',
     appid: '1f4f2ef2146f3fb37180e51479079695' },
  headers: 
   { 'Postman-Token': '02b3e05e-6b70-4f63-aa9d-0134a5948c57',
     'cache-control': 'no-cache' } };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});