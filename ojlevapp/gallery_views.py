from flask import render_template, request
from flask import Blueprint, jsonify
import os
from .models import Gallery
from . import db
from .generation import *
from .controller import *
from PIL import Image
from pathlib import Path
from .gallery_controller import *
from .generation import delete_files_in_directory

gallery_bp = Blueprint('gallery', __name__)




@gallery_bp.route('/gallery')
def gallery():
    return render_template('souvenirs.html')


@gallery_bp.route('/directory')
def directory():
    try: 
        directories = get_directories()
        return jsonify(directories), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@gallery_bp.route('/files')
def files():
    folder = request.args.get("folder")
    answer = get_files(folder)
    return answer




@gallery_bp.route('/gallery/image_thumb', methods=['POST'])
def image_thumb():
    try:
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

    except Exception:
        return jsonify({'error': "Problem to create the thumbnail of the image"}), 500


@gallery_bp.route('/gallery/image_info')
def image_info():
    image_name = request.args.get("image_name")
    image_parent = request.args.get("image_parent")
    imageName, _ = split_filename(image_name)

    if (image_name == "") or (image_parent == "") or (imageName == ""):
        return jsonify({'error': "Problem to get image info"}), 500
        
    image = Gallery.query.filter_by(image_name=imageName, parent_folder=image_parent).first()
    if not image:
        return jsonify({'error': "Problem to get image in DB"}), 500

    image_data = {
            'thumb_top': image.thumb_top,
            'thumb_left': image.thumb_left,
            'thumb_right': image.thumb_right,
            'thumb_bottom': image.thumb_bottom,
        }

    return jsonify(image_data), 202

@gallery_bp.route('/gallery/new_folder', methods=['POST'])
def new_folder():
    folder_name = request.args.get("name")
    try:
        Path('./ojlevapp/static/img/gallery/' + folder_name).mkdir(parents=True, exist_ok=True)
        Path('./ojlevapp/static/img/thumb/' + folder_name).mkdir(parents=True, exist_ok=True)
        return jsonify({'message': "Folder successfully created!"}), 202
    except Exception:
        return jsonify("Problem to create new folder"), 409




@gallery_bp.route('/gallery/upload', methods=['POST'])
def upload():
    
    try:
        files = request.files.getlist('files[]')
        parent_folder = request.form['path']

        for i, file in enumerate(files):
            name = request.form.get(f'names[{i}]')
            extension = request.form.get(f'extensions[{i}]')
            print("Extension = {0}".format(extension))
            print("Name = {0}".format(name))
        
            gallery_upload(file, name, parent_folder, extension)

        return jsonify({'message': "Image successfully uploaded!"}), 202
    
    except Exception as e :
        return jsonify({'error': str(e)}), 409




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


    return jsonify({'message': "Image successfully renamed!"}), 202


@gallery_bp.route('/gallery/delete', methods=['UPDATE'])
def delete():
    data = request.form.to_dict()
    image_id = data['image_id']
    image = Gallery.query.get(image_id)
    try:
        if image:
            db.session.delete(image)

        db.session.commit()
    except Exception as e :
            return jsonify({'error': str(e)}), 409

    return jsonify({'message': "Image successfully deleted!"}), 202


@gallery_bp.route('/gallery/move', methods=['UPDATE'])
def move():
    data = request.form.to_dict()
    image_id = data['image_id']
    new_folder = data['new_folder']
    image = Gallery.query.get(image_id)

    if image:
        # Modifier les attributs de l'instance
        image.update_details(new_parent_folder=new_folder)


    return jsonify({'message': "Sucessful move!"}), 202



@gallery_bp.route('/folder/rename', methods=['UPDATE'])
def folder_rename():
    data = request.form.to_dict()
    folder = data['folder']
    new_name = data['new_name']

    old_folder_name = 'ojlevapp/static/img/gallery/' + folder
    new_folder_name = 'ojlevapp/static/img/gallery/' + new_name

    if os.path.exists(new_folder_name):
        return jsonify({'error': "Folder name already existing !"}), 409

    os.rename(old_folder_name, new_folder_name)

    old_folder_name = 'ojlevapp/static/img/thumb/' + folder
    new_folder_name = 'ojlevapp/static/img/thumb/' + new_name
    os.rename(old_folder_name, new_folder_name)
    
    images = Gallery.query.filter_by(parent_folder=folder).all()

    if images:
        # Modifier les attributs de l'instance
        for image in images:
            image.parent_folder = new_name

        try:
            db.session.commit()
            print("Success !")
        except Exception as e :
            return jsonify({'error': str(e)}), 409
        
    else:
        print("\n=== Pas d'images trouvés ===\n")


    return jsonify({'message': "Folder successfully renamed!"}), 202


@gallery_bp.route('/folder/delete', methods=['UPDATE'])
def folder_delete():
    data = request.form.to_dict()
    folder = data['folder']
    # Toutes les images dans le dossier 'folder'
    images = Gallery.query.filter_by(parent_folder=folder).all()

    try:
        for image in images:
            db.session.delete(image)

        db.session.commit()

        directory_gall = "./ojlevapp/static/img/gallery/" + folder
        delete_files_in_directory(directory_gall)
        directory_thumb = "./ojlevapp/static/img/thumb/" + folder
        delete_files_in_directory(directory_thumb)
        os.rmdir(directory_gall)
        os.rmdir(directory_thumb)

    except Exception as e :
            return jsonify({'error': str(e)}), 409

    return jsonify({'message': "Folder successfully deleted!"}), 202
