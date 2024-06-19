from flask import render_template, request
from flask import Blueprint, current_app, jsonify
import os
from werkzeug.utils import secure_filename
from .models import Gallery
from . import db
from .generation import *
from .controller import *
from PIL import Image
from pathlib import Path
from .gallery_controller import *

gallery_bp = Blueprint('gallery', __name__)




@gallery_bp.route('/gallery')
def gallery():
    return render_template('souvenirs.html')


@gallery_bp.route('/directory')
def directory():
    directories = get_directories()
    return jsonify(directories)

@gallery_bp.route('/files')
def files():
    folder = request.args.get("folder")
    images = Gallery.query.filter_by(parent_folder=folder).all()
    sorted_images = sorted(images, key=get_last_modified)[::-1]
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


@gallery_bp.route('/gallery/image_thumb', methods=['POST'])
def image_thumb():
    data = request.form.to_dict()
    print("Data = {}".format(data))
    img_path = data["img_path"]
    parent_folder = img_path.split("/")[-2]
    image_name = img_path.split("/")[-1]
    
    original = Image.open('./ojlevapp/static/img/gallery/' + parent_folder + '/' + image_name )
    box = ()
    for position in ["left", "top", "right", "bottom"]:
        box += (round(float(data[position])),)

    cropped_img = original.crop(box)

    Path('./ojlevapp/static/img/thumb/' + parent_folder).mkdir(parents=True, exist_ok=True)
    cropped_img.save('./ojlevapp/static/img/thumb/' + parent_folder + '/' + image_name)

    image = Gallery.query.filter_by(image_name=image_name, parent_folder=parent_folder).first()
    image.thumb_top = float(data["top"])
    image.thumb_left = float(data["left"])
    image.thumb_right = float(data["right"])
    image.thumb_bottom = float(data["bottom"])

    db.session.commit()

    return "Bingo", 202


@gallery_bp.route('/gallery/image_info')
def image_info():
    image_name = request.args.get("image_name")
    image_parent = request.args.get("image_parent")
    image = Gallery.query.filter_by(image_name=image_name, parent_folder=image_parent).first()

    image_data = {
            'thumb_top': image.thumb_top,
            'thumb_left': image.thumb_left,
            'thumb_right': image.thumb_right,
            'thumb_bottom': image.thumb_bottom,
        }

    return jsonify(image_data)

@gallery_bp.route('/gallery/new_folder', methods=['POST'])
def new_folder():
    folder_name = request.args.get("name")
    Path('./ojlevapp/static/img/gallery/' + folder_name).mkdir(parents=True, exist_ok=True)
    Path('./ojlevapp/static/img/thumb/' + folder_name).mkdir(parents=True, exist_ok=True)
    return "OK", 202



@gallery_bp.route('/gallery/upload', methods=['POST'])
def upload():
    
    file = request.files['image']
    filename = request.form['filename']
    extension = request.form['extension']
    parent_folder = request.form['path']
    gallery_path = current_app.config["UPLOAD_FOLDER"] + "/gallery/" + parent_folder


    if (check_duplicate(parent_folder, filename)):
            return jsonify({'error': 'Another image already exists with that name'}), 409  # Retourne une erreur 400 avec un message d'erreur
    if not file:
        return jsonify({'error': str(e)}), 422
    if not allowed_file(extension):
        return jsonify({'error': "Filetype not accepted"}), 422

    filename = secure_filename(filename)
    image_name, = split_filename(filename)
    file_path = os.path.join(gallery_path, filename)
    
    file.save(file_path)
    shutil.copy(file_path, file_path.replace("gallery", "thumb", 1))
            

    file_weight = round(os.path.getsize(file_path) / 1024)
    with Image.open(file_path) as img:
        width, height = img.size

    print("Extension = " + extension)

    img_gallery = Gallery(image_name = image_name,
                            extension = extension,
                            size = f'{width} x {height}',
                            weight = file_weight,
                            parent_folder = parent_folder,
                            date = get_last_modified_time(file_path),
                            thumb_top = width/2 - 368/2,
                            thumb_left = height/2 - 500/2,
                            thumb_right = height/2 + 500/2,
                            thumb_bottom = width/2 + 368/2)
    
    
    db.session.add(img_gallery)

    db.session.commit()

    return jsonify("Success"), 202





@gallery_bp.route('/gallery/rename', methods=['UPDATE'])
def rename():
    data = request.form.to_dict()
    print("Data = {}".format(data))
    image_id = data['image_id']
    new_name = data['new_name']
    image = Gallery.query.get(image_id)

    if image:
        # Modifier les attributs de l'instance
        try :
            image.update_details(new_image_name=new_name)
        except Exception as e :
            return jsonify({'error': str(e)}), 409

    else:
        print("\nX\n")


    return "Okay", 202


@gallery_bp.route('/gallery/delete', methods=['UPDATE'])
def delete():
    data = request.form.to_dict()
    image_id = data['image_id']
    image = Gallery.query.get(image_id)
    if image:
        # Modifier les attributs de l'instance
        db.session.delete(image)

    db.session.commit()

    return "Okay", 202


@gallery_bp.route('/gallery/move', methods=['UPDATE'])
def move():
    data = request.form.to_dict()
    print("Data = {}".format(data))
    image_id = data['image_id']
    new_folder = data['new_folder']
    image = Gallery.query.get(image_id)

    if image:
        # Modifier les attributs de l'instance
        image.update_details(new_parent_folder=new_folder)

    else:
        print("\nX\n")


    return "Okay", 202