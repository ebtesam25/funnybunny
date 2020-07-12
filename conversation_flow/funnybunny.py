import requests
from opencage.geocoder import OpenCageGeocode
# import flask dependencies
from flask import Flask, request, make_response, jsonify
#open cage variables
openCageKey = '4ca0d1a54f004774861e022a9b7207de'
geocoder = OpenCageGeocode(openCageKey)
# initialize the flask app
app = Flask(__name__)

# default route
@app.route('/', methods=['GET','POST'])
def index():
    return "funnybunny here"
# function for responses

def getparamvalue(param, req):
    return req.get('queryResult').get('parameters').get(param)

def gettalkback(req):
    query = req.get('queryResult').get('queryText')
    url= 'http://3cdd4b10abe4.ngrok.io/talkback'
    p = {'text':query}
    res = requests.post(url,json=p).json()
    return res['response']

def results():
    # build a request object
    req = request.get_json(force=True)

    # fetch action from json
    intent = req.get('queryResult').get('intent').get('displayName')
    action = req.get('queryResult').get('action')
    speak_output = ""
    if action == "jokes.get":
        speak_output= GetJokeIntentHandler(req)
    elif intent == "GetWeatherIntent":
        speak_output = GetWeatherIntentHandler(req)
    #elif intent == "ActivateSarcasmIntent":
    #    speak_output = ActivateSarcasmIntentHandler(req)
    #elif intent == "DeactivateSarcasmIntent":
    #    speak_output = DeactivateSarcasmIntentHandler(req)
    else:
        speak_output = gettalkback(req)
    # return a fulfillment response
    return {'fulfillmentText': '{fulfillmentText}'.format(fulfillmentText=speak_output)}

def GetWeatherIntentHandler(handler_input):
    city = getparamvalue('city', handler_input)
    longitude = 0
    latitude = 0
    if city != "":
        result = geocoder.geocode(city, no_annotations='1')

        if result and len(result):
            longitude = result[0]['geometry']['lng']
            latitude  = result[0]['geometry']['lat']
        else:
            city = "Eastvale"
    else:
        city = "Eastvale"
    if longitude == 0 and latitude == 0:
        longitude = -117.58
        latitude = 33.95
    params = {'lat': latitude, 'lon':longitude, 'units':'imperial','exclude': 'minutely,daily,hourly,guid','appid': '1f4f2ef2146f3fb37180e51479079695'}
    url = 'https://api.openweathermap.org/data/2.5/onecall'
    r = requests.get(url, params=params)
    weather_res = r.json()
    description = weather_res['current']['weather'][0]['description']
    temp = weather_res['current']['temp']
    return "The current forecast for {city} is {description} with a temperature of {temp} degrees farenheit.".format(city=city,description=description,temp=temp)

def ActivateSarcasmIntentHandler(req):
    return "I'll be more sarcastic in the future. Let me know if you want me to tone down the sarcasm."

def DeactivateSarcasmIntentHandler(req):
    return "Awhh. Someone's afraid of a little sarcasm? I promise that's my last one. No more sarcasm from me. Let me know if you want me to be sarcastic again."
    
def GetJokeIntentHandler(handler_input):
    topic = getparamvalue('topic', handler_input)
    if topic !=  "":
        topic = getparamvalue('topic', handler_input)
        url = 'https://us-central1-aiot-fit-xlab.cloudfunctions.net/getlamejoke'
        if topic.lower() == "chuck norris":
            params={"topic":"chuck"}
        else:
            params={"topic":topic}
    else:
        params={'none':'none'}    
    r = requests.post(url, json=params)
    return r.json()['joke']
    
def GetMiscHandler(handler_input):
    param= getparamvalue('misc',handler_input)
    if param == "pep talk":
        return "There's no time like the present."
    elif param == "gordon ramsay":
        return "This is fucking horrible."
    else:
        return gettalkback(handler_input)
    
def GetSongLyricsIntentHandler(handler_input):
    song= getparamvalue('song', handler_input)
    artist= getparamvalue('artist', handler_input)
    lyric = ""
    if artist != "":
        speak_output = "A lyric from {song} by {artist} {lyric}".format(song=song, artist=artist, lyric=lyric)
    else:
        speak_output = "A lyric from {song} {lyric}".format(song=song, lyric=lyric)
    return speak_output
# create a route for webhook
@app.route('/webhook', methods=['GET', 'POST'])
def webhook():
    # return response
    return make_response(jsonify(results()))

# run the app
if __name__ == '__main__':
   app.run(debug=True, port=8080)
