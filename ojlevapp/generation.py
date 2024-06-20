
import shutil
import requests
from .models import Couple, Story, Program, Witness, Gallery
from . import db
import os
from pathlib import Path
from datetime import datetime
from PIL import Image
from .gallery_controller import get_last_modified_time

def generate_user():
    url = 'http://127.0.0.1:5000/signup'  # Assurez-vous que l'URL est correcte et accessible
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

    directory = ".\\ojlevapp\\static\\img\\gallery"
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)  # Supprimer les fichiers et les liens symboliques
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)  # Supprimer les sous-dossiers
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')

    files_with_parent = []

    shutil.copytree(".\ojlevapp\static\img\other\\large", ".\\ojlevapp\\static\\img\\gallery\\large")
    # shutil.copytree(".\ojlevapp\static\img\other\\thumb", ".\\ojlevapp\\static\\img\\gallery\\thumb")

    for dirpath, _, filenames in os.walk(".\\ojlevapp\\static\\img\\gallery\\"):
        for filename in filenames:
            image_name = filename.split(".")[0]
            extension = filename.split(".")[-1]
            full_path = os.path.join(dirpath, filename)
            parent = dirpath.split("\\")[-1]
            file_weight = round(os.path.getsize(full_path) / 1024)
            mod_time = os.path.getmtime(full_path)
            last_modification_date = datetime.fromtimestamp(mod_time).strftime("%d %b %Y %H:%M")
            with Image.open(full_path) as img:
                width, height = img.size
            files_with_parent.append({"parent_folder" : parent, 
                                      "image_name" : image_name,
                                      "extension" : extension,
                                      "date" : get_last_modified_time(full_path),
                                      "weight" : file_weight, 
                                      'dimensions': f'{width} x {height}',
                                      "last_modification_date" : last_modification_date})
            
    Gallery.query.delete()
    db.session.commit()

    for image in files_with_parent:
        img_gallery = Gallery(extension=image["extension"],
                              image_name=image["image_name"],
                              size=image["dimensions"],
                              weight=image["weight"],
                              parent_folder=image["parent_folder"],
                              date=image["date"],
                              thumb_top=0,
                              thumb_left=0,
                              thumb_right=500,
                              thumb_bottom=368)
        
        db.session.add(img_gallery)

    db.session.commit()

    return files_with_parent