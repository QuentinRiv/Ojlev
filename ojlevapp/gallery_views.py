from flask import render_template, request
from flask import Blueprint, current_app, jsonify
import os
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
    fullname = img_path.split("/")[-1]
    image_name, _ = split_filename(fullname)
    
    original = Image.open('./ojlevapp/static/img/gallery/' + parent_folder + '/' + fullname )
    box = ()
    for position in ["left", "top", "right", "bottom"]:
        box += (round(float(data[position])),)

    cropped_img = original.crop(box)

    Path('./ojlevapp/static/img/thumb/' + parent_folder).mkdir(parents=True, exist_ok=True)
    cropped_img.save('./ojlevapp/static/img/thumb/' + parent_folder + '/' + fullname)

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
    imageName, _ = split_filename(image_name)
    image = Gallery.query.filter_by(image_name=imageName, parent_folder=image_parent).first()

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
    
    # The image, its name, its directory
    file = request.files['image']
    filename = request.form['filename']
    parent_folder = request.form['path']
    extension = request.form['extension']
    
    answer = gallery_upload(file, filename, parent_folder, extension)

    return answer





@gallery_bp.route('/gallery/rename', methods=['UPDATE'])
def rename():
    data = request.form.to_dict()
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
        db.session.delete(image)

    db.session.commit()

    return "Okay", 202


@gallery_bp.route('/gallery/move', methods=['UPDATE'])
def move():
    data = request.form.to_dict()
    image_id = data['image_id']
    new_folder = data['new_folder']
    image = Gallery.query.get(image_id)

    if image:
        # Modifier les attributs de l'instance
        image.update_details(new_parent_folder=new_folder)

    else:
        print("\nX\n")


    return "Okay", 202

