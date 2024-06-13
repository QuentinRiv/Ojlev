
import requests
from .models import Couple, Story, Program, Witness
from . import db
import os
from pathlib import Path
from datetime import datetime
from PIL import Image

def generate_user():
    url = 'signup'  # Assurez-vous que l'URL est correcte et accessible
    data = {
        'email': 'Jean@email.com',
        'name': 'Jean',
        'password': '1234'
    }

    response = requests.post(url, json=data)

    if response.status_code == 202:
        print('Request was successful with status 202')
    else:
        print(f'Request failed with status {response.status_code}')

    return

def generate_witness():
    Witness.query.delete()
    db.session.commit()

    side = ["Groomsman", "Groomsman", "Groomsman", "Bridesmaid", "Bridesmaid", "Bridesmaid", ]
    full_name = ["John Doe", "Tim Allan", "Bill Something", "Maria Carey", "Jane Dae", "Someone"]
    for i in range(len(full_name)):
        witness = Witness(  id=i,
                            side=side[i], 
                            full_name=full_name[i],
                            description="Best Friend")
        db.session.add(witness)
        db.session.commit()
        
    return "ok", 202



def generate_partners():
    Couple.query.delete()
    db.session.commit()
    partner1 = Couple(id=1, 
                       full_name="David Beckham" ,
                       description="A very nice footballer")
    partner2 = Couple(id=2, 
                       full_name="Victoria Beckham", 
                       description="A very nice singer")

    # add the new user to the database
    db.session.add(partner1)
    db.session.add(partner2)
    db.session.commit()
    return "ok", 202


def generate_story():
    Story.query.delete()
    db.session.commit()

    titles = ["First Meet", "First Date", "Proposal", "Engagement"]
    dates = ["10 Jan 2020", "13 Mar 2021", "16 Jun 2022", "19 Sep 2023"]
    for i in range(4):
        lovepart = Story(id=i,
                             title=titles[i], 
                             date=dates[i], 
                             description="Any description you want to put there...",
                             image_name="story-"+str(i)+".jpg")
        db.session.add(lovepart)
        db.session.commit()
        
    return "ok", 202


def generate_program():
    Program.query.delete()
    db.session.commit()

    names = ["Ceremony", "Engagement"]
    dates = ["16 Jun 2022", "19 Sep 2023"]
    hours = ["5:00 - 7:00 PM", "5:00 - 7:30 PM"]
    for i in range(2):
        program = Program(  id=i+1,
                            name=names[i], 
                            date=dates[i], 
                            time=hours[i],
                            description="Write what is going to happen")
        db.session.add(program)
        db.session.commit()
        
    return "ok", 202

def generate_gallery():

    files_with_parent = []

    for dirpath, _, filenames in os.walk(".\ojlevapp\static\img\gallery\\"):
        for filename in filenames:
            full_path = os.path.join(dirpath, filename)
            parent = dirpath.split("\\")[-1]
            file_weight = round(os.path.getsize(full_path) / 1024)
            mod_time = os.path.getmtime(full_path)
            last_modification_date = datetime.fromtimestamp(mod_time).strftime("%d %b %Y")
            with Image.open(full_path) as img:
                width, height = img.size
            files_with_parent.append({"parent_folder" : parent, 
                                      "image_name" : filename,
                                      "weight" : file_weight, 
                                      'dimensions': f'{width} x {height}',
                                      "last_modification_date" : last_modification_date})

    return files_with_parent