import shutil
from .models import Gallery
from datetime import datetime
from flask import Blueprint, current_app, jsonify
from werkzeug.utils import secure_filename
from PIL import Image
from . import db
import os, logging
from sqlalchemy.exc import SQLAlchemyError

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

    if (not os.path.exists(current_app.config['UPLOAD_FOLDER'] + '/gallery')) or (not os.path.exists(current_app.config['UPLOAD_FOLDER'] + '/thumb')):
        raise Exception(f"Folder Gallery or Thumb not there...")

    # Dir in the gallery folder
    gallery_directories = []
    for (_, dirnames, _) in os.walk(current_app.config['UPLOAD_FOLDER'] + '/gallery'):
        gallery_directories.extend(dirnames)

    # Dir in the thumb folder
    thumb_directories = []
    for (_, dirnames, _) in os.walk(current_app.config['UPLOAD_FOLDER'] + '/thumb'):
        thumb_directories.extend(dirnames)

    # Get sure we are on the same page
    if (gallery_directories == thumb_directories):
        return thumb_directories
    else:
        missing = list(sorted(set(gallery_directories) - set(thumb_directories)))
        added = list(sorted(set(thumb_directories) - set(gallery_directories)))
        missing += added

        raise Exception(f"Not the same directories between the DB, gallery and thumb folders (folder(s) {" - ".join(missing)} mising)")
    

def allowed_file(extension):
    if "." in extension:
        extension = extension.split(".")[-1]
    return extension in current_app.config['ALLOWED_EXTENSIONS']


def split_filename(filename):
    # Utilise os.path.splitext pour séparer le nom de fichier et l'extension
    name, extension = os.path.splitext(filename)
    
    # Supprime le point de l'extension
    extension = extension.lstrip('.')
    
    return name, extension

def get_last_modified_time(file_path):
    # Obtenir le temps de la dernière modification en secondes depuis l'époque
    timestamp = os.path.getmtime(file_path)
    
    # Convertir le timestamp en un objet datetime
    last_modified_time = datetime.fromtimestamp(timestamp)
    
    # Formater la date et l'heure dans le format "01 Jan 2021 12:34"
    formatted_time = last_modified_time.strftime("%d %b %Y %H:%M")
    
    return formatted_time

def gallery_upload(file, filename, parent_folder, extension):
    gallery_path = current_app.config["UPLOAD_FOLDER"] + "/gallery/" + parent_folder

    # Safety check
    if (check_duplicate(parent_folder, filename)):
        return jsonify({'error': 'Another image already exists with that name'}), 409  # Retourne une erreur 400 avec un message d'erreur

    # Sanitize, save and put a copy in thumb
    filename = f'{secure_filename(filename)}.{extension}'
    file_path = os.path.join(gallery_path, filename)
    file.save(file_path)
    shutil.copy(file_path, file_path.replace("gallery", "thumb", 1))
            

    file_weight = round(os.path.getsize(file_path) / 1024)
    with Image.open(file_path) as img:
        width, height = img.size

    img_gallery = Gallery(image_name = filename,
                          size = f'{width} x {height}',
                          weight = file_weight,
                          parent_folder = parent_folder,
                          date = get_last_modified_time(file_path))
    
    
    db.session.add(img_gallery)

    db.session.commit()

    print(f"Image uploaded successfully to '{file_path}'")

    return jsonify("Success"), 202

# Récupère les images dans le dossier 'folder', avec toutes les infos liées
def get_files(folder):
    try: 
        images = Gallery.query.filter_by(parent_folder=folder).all()
        sorted_images = sorted(images, key=get_last_modified, reverse=True)
        image_list = []
        for image in sorted_images:
            image_data = {
                'id': image.id,
                'name': f'{image.image_name}.{image.extension}',
                'size': image.size,
                'weight': image.weight,
                'parent_folder': image.parent_folder,
                'date': image.date,
            }
            image_list.append(image_data)
        return jsonify(image_list)
    
    except SQLAlchemyError as e:
        logging.error(f"Database error: {e}")
        return jsonify({'error': "Problem to gather files"}), 500
    
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return jsonify({'error': "Problem to gather files"}), 500