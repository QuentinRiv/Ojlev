from datetime import datetime
import os, re, shutil
from PIL import Image 
from . import db
from .models import Program, Story, Couple, Witness, Gallery
from flask import request
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func

def upcloud_img(path):
    filenames = os.listdir('./ojlevapp/static/img' + path)[-1]
    paths = re.split(r'[0-9]+', filenames)
    next_index = int(re.search(r'[0-9]+', filenames)[0]) + 1
    next_image = paths[0] + str(next_index) + paths[1]

    print("==>", "./ojlevapp/static/img/" + path + "/" + next_image)
    result = shutil.copyfile('./ojlevapp/static/img/upcloud.png', "./ojlevapp/static/img/" + path + "/" + next_image)
    return

def dirfiles(path, category):
    directories = []
    files = []
    files_data = []
    for (dirpath, dirnames, filenames) in os.walk("./ojlevapp/static/img/gallery/" + path):
        directories.extend(dirnames)
        files.extend(filenames)
    
    if category == "filenames":
        for file_name in filenames:
            image_path = os.path.join(dirpath, file_name)

            # Obtenir la taille du fichier en octets
            file_size = round(os.path.getsize(image_path) / 1024)

            # Obtenir la date de dernière modification
            mod_time = os.path.getmtime(image_path)
            last_modification_date = datetime.fromtimestamp(mod_time).strftime("%d %b %Y %H:%M")

            # Obtenir dimensions de l'image (largeur x hauteur)
            with Image.open(image_path) as img:
                width, height = img.size

            files_data += [{
                'name': file_name,
                'size': f'{file_size} KB',
                'dimensions': f'{width} x {height}',
                'last_modified': last_modification_date
            }]

        def get_last_modified(file):
            return datetime.strptime(file['last_modified'], "%d %b %Y %H:%M")

        # Utilisation de sorted() pour obtenir une nouvelle liste triée
        sorted_files_data = sorted(files_data, key=get_last_modified)[::-1]

        def get_last_modified2(file):
            return datetime.strptime(file.date, "%d %b %Y %H:%M")
        images = Gallery.query.filter_by(parent_folder=path).all()
        sorted_files_data = sorted(images, key=get_last_modified2)[::-1]
        return sorted_files_data

    raise ValueError("Wrong type of category")
    
def update_database(data):
    table = data['table']
    id = data['id']
    attribute_name = data['attribute_name']
    new_value = data['new_value']
    # Need : Table, id, key, value
    if (table == "Program"): tablequery = db.session.query(Program)
    if (table == "Story"): tablequery = db.session.query(Story)
    if (table == "Couple"): tablequery = db.session.query(Couple)
    if (table == "Witness"): tablequery = db.session.query(Witness)

    element = tablequery.filter_by(id=id).first()

    setattr(element, attribute_name, new_value) # Builtin function
    
    # Check for error
    try: 
        db.session.commit()
    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        print(error)
        return error
    
    return
