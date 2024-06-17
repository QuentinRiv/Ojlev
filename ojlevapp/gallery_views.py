from flask import Flask, render_template, request, redirect
from flask import Blueprint, current_app, url_for, jsonify
import os
from werkzeug.utils import secure_filename
from flask_login import login_required, current_user
from .models import Couple, Story, Program, Witness, Gallery
from . import db
from .generation import *
from .controller import *
from PIL import Image
from pathlib import Path

gallery_bp = Blueprint('gallery', __name__)



@gallery_bp.route('/gallery')
def gallery():
    return render_template('souvenirs.html')


@gallery_bp.route('/directory')
def directory():
    data = dirfiles(".", "dirnames")
    return jsonify(data)

@gallery_bp.route('/files')
def files():
    folder = request.args.get("folder")
    images = dirfiles(folder, "filenames")
    image_list = []
    for image in images:
        image_data = {
            'id': image.id,
            'name': image.image_name,
            'size': image.size,
            'weight': image.weight,
            'parent_folder': image.parent_folder,
            'date': image.date,
            'thumb_top': image.thumb_top,
            'thumb_left': image.thumb_left,
            'thumb_right': image.thumb_right,
            'thumb_bottom': image.thumb_bottom,
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
    return "OK", 202

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@gallery_bp.route('/gallery/upload', methods=['POST'])
def upload():
    if 'image' not in request.files:
        return redirect(request.url)
    
    file = request.files['image']
    filename = request.form['filename']
    path = "./ojlevapp/static/img" + request.form['path']

    if file.filename == '':
        return redirect(request.url)
    if file and allowed_file(filename):
        filename = secure_filename(filename)
        file.save(os.path.join(path, filename))
        return 'Image uploadée avec succès', 202
    else:
        return 'Type de fichier non autorisé'