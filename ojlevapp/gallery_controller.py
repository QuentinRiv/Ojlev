from .models import Gallery
from datetime import datetime
from flask import Blueprint, current_app, jsonify
import os 

def get_last_modified(file):
    return datetime.strptime(file.date, "%d %b %Y %H:%M")

def check_duplicate(parent_folder, image_name):
    duplicate = Gallery.query.filter_by(parent_folder=parent_folder, image_name=image_name).first()
    return duplicate is not None

def get_directories():
    # Dir in the DB
    images = Gallery.query.all()
    DB_directories = set()
    for image in images:
        DB_directories.add(image.parent_folder)

    # Dir in the gallery folder
    gallery_directories = []
    for (_, dirnames, _) in os.walk(current_app.config['UPLOAD_FOLDER'] + '/gallery'):
        gallery_directories.extend(dirnames)

    # Dir in the thumb folder
    thumb_directories = []
    for (_, dirnames, _) in os.walk(current_app.config['UPLOAD_FOLDER'] + '/thumb'):
        thumb_directories.extend(dirnames)

    # Get sure we are on the same page
    if (gallery_directories == list(DB_directories)) and (gallery_directories == gallery_directories):
        return list(DB_directories)
    else:
        raise Exception("Not the same directories between the DB, gallery and thumb folders")
    

def allowed_file(extension):
    print("\n\n=>" + extension)
    return extension in current_app.config['ALLOWED_EXTENSIONS']


def split_filename(filename):
    # Utilise os.path.splitext pour séparer le nom de fichier et l'extension
    name, extension = os.path.splitext(filename)
    
    # Supprime le point de l'extension
    extension = extension.lstrip('.')
    
    return name, extension