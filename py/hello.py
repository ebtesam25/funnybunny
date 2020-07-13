from flask import Flask,request,url_for, redirect, render_template
from flask_cors import CORS
import json
import os
import sys
import requests
import time
import pymongo
# If you are using a Jupyter notebook, uncomment the following line.
# %matplotlib inline
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
from PIL import Image
from io import BytesIO
myapp = Flask(__name__)
CORS(myapp)

@myapp.route("/")
def hello():
    return "Hello Flask, on Azure App Service for Linux"

@myapp.route("/teacup", methods=["POST"])
def cup():
    posted_data = request.get_json()
    print(posted_data["img"])

    missing_env = False
    # Add your Computer Vision subscription key and endpoint to your environment variables.
    if 'COMPUTER_VISION_ENDPOINT' in os.environ:
        endpoint = os.environ['COMPUTER_VISION_ENDPOINT']
    else:
        print("From Azure Cogntivie Service, retrieve your endpoint and subscription key.")
        print("\nSet the COMPUTER_VISION_ENDPOINT environment variable, such as \"https://westus2.api.cognitive.microsoft.com\".\n")
        missing_env = True

    if 'COMPUTER_VISION_SUBSCRIPTION_KEY' in os.environ:
        subscription_key = os.environ['COMPUTER_VISION_SUBSCRIPTION_KEY']
    else:
        print("From Azure Cogntivie Service, retrieve your endpoint and subscription key.")
        print("\nSet the COMPUTER_VISION_SUBSCRIPTION_KEY environment variable, such as \"1234567890abcdef1234567890abcdef\".\n")
        missing_env = True

    if missing_env:
        print("**Restart your shell or IDE for changes to take effect.**")
        sys.exit()

    text_recognition_url = endpoint + "vision/v3.0/read/analyze"

    # Set image_url to the URL of an image that you want to recognize.
    image_url = posted_data["img"]
    print(image_url)
    headers = {'Ocp-Apim-Subscription-Key': subscription_key}
    data = {"url": image_url}
    response = requests.post(
        text_recognition_url, headers=headers, json=data)
    response.raise_for_status()

    # Extracting text requires two API calls: One call to submit the
    # image for processing, the other to retrieve the text found in the image.

    # Holds the URI used to retrieve the recognized text.
    operation_url = response.headers["Operation-Location"]

    # The recognized text isn't immediately available, so poll to wait for completion.
    analysis = {}
    poll = True
    while (poll):
        response_final = requests.get(
            response.headers["Operation-Location"], headers=headers)
        analysis = response_final.json()
        
        print(json.dumps(analysis, indent=4))

        time.sleep(1)
        if ("analyzeResult" in analysis):
            poll = False
        if ("status" in analysis and analysis['status'] == 'failed'):
            poll = False

    polygons = []
    text = []
    if ("analyzeResult" in analysis):
        # Extract the recognized text, with bounding boxes.
        polygons = [(line["boundingBox"], line["text"])
                    for line in analysis["analyzeResult"]["readResults"][0]["lines"]]
        text = [(line["text"])
                    for line in analysis["analyzeResult"]["readResults"][0]["lines"]]
        print(text)
        client = pymongo.MongoClient("localhost", 27017)
        db = client["savemynotes"]
        print(db.name)
        
        print(db.note.insert_one({"x": text,"y":polygons,"index":"test"}).inserted_id)
    
    return {"res": text}, 201

@myapp.route("/teapot", methods=["GET"])
def notes():
    client = pymongo.MongoClient("localhost", 27017)
    db = client["savemynotes"]
    mongores = db.note.find_one({"index":"test"})
    text = mongores["x"]
    polygons = mongores["y"]
    print(mongores)
    return render_template("home.html", list=zip(text,polygons))

if __name__ == '__main__':
    myapp.run(port=443)