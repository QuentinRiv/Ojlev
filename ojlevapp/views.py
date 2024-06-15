from flask import Flask, render_template, request, redirect
from flask import Blueprint, current_app, url_for, jsonify
import os
from werkzeug.utils import secure_filename
from flask_login import login_required, current_user
from .models import Couple, Story, Program, Witness, Gallery
from . import db
from .generation import *
from .controller import *

bp = Blueprint('main', __name__)


@bp.route('/')
def index():
    groom = Couple.query.filter_by(id=1).first()
    bride = Couple.query.filter_by(id=2).first()
    stories = Story.query.all()
    programs = Program.query.all()
    groomsmen = Witness.query.filter_by(side="Groomsman").all()
    bridesmaids = Witness.query.filter_by(side="Bridesmaid").all()
    diapo = os.listdir('./ojlevapp/static/img/slides')
    galleries = Gallery.query.all()

    # User connecté ?
    if(current_user.is_authenticated):
        print("\nYou are authenticated\n")
    else:
        print("\nYou are not authenticated\n")
    return render_template('index.html', connected=current_user.is_authenticated, groom=groom, bride=bride, stories=stories, programs=programs, groomsmen=groomsmen, bridesmaids=bridesmaids, diapo=diapo, galleries=galleries)


@bp.route('/upload', methods=['POST'])
@login_required 
def upload_file():
    if 'image' not in request.files:
        return redirect(request.url)
    
    file = request.files['image']
    filename = request.form['filename']
    path = ".\\ojlevapp\\static\\img" + request.form['path']

    if file.filename == '':
        return redirect(request.url)
    if file and allowed_file(filename):
        filename = secure_filename(filename)
        file.save(os.path.join(path, filename))
        print("Path = %s - Filename = %s".format(path, filename))
        return 'Image uploadée avec succès', 202
    else:
        return 'Type de fichier non autorisé'

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@bp.route('/update', methods=['POST'])
@login_required 
def update_db():
    data = request.form.to_dict()
    update_database(data)

    return "Success", 202





@bp.route('/generate', methods=['GET'])
def generate():
    generate_user()
    generate_program()
    generate_partners()
    generate_story()
    generate_witness()
    generate_gallery()

    return "ok", 200


@bp.route('/story/new', methods=['GET'])
def new_story():
    high_id = len(Story.query.all())
    lovepart = Story(id=high_id,
                    title="New love step", 
                    date="01 Jan 2050", 
                    description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam officiis doloribus nulla placeat voluptatibus eum quidem fugit eius impedit, asperiores molestiae natus saepe doloremque, exercitationem quo error iure optio debitis.",
                    image_name="story-"+str(high_id)+".jpg")

    db.session.add(lovepart)
    db.session.commit()

    return redirect(url_for("main.index"))


@bp.route('/story/remove', methods=['GET'])
def remove_story():
    highest_id = len(Story.query.all()) - 1

    Story.query.filter_by(id=highest_id).delete()

    db.session.commit()

    return redirect(url_for("main.index"))


@bp.route('/slide/new', methods=['GET'])
def slide():
    upcloud_img("/slides")

    return redirect(url_for("main.index"))

@bp.route('/slide/remove', methods=['GET'])
def slide_remove():

    diapo = os.listdir('./ojlevapp/static/img/slides')
    os.remove('./ojlevapp/static/img/slides/' + diapo[-1])

    return redirect(url_for("main.index"))




@bp.route('/witness/new', methods=['GET'])
def new_witness():
    side = request.args.get("side")
    high_id = len(Witness.query.filter_by().all())
    witness = Witness(id=high_id,
                            side=side, 
                            full_name="John Doe", 
                            description="Best Friend")

    db.session.add(witness)
    db.session.commit()

    return redirect(url_for("main.index"))


@bp.route('/witness/remove', methods=['GET'])
def remove_witness():
    side = request.args.get("side")

    highest_id_item = db.session.query(Witness).filter(Witness.side == side).order_by(Witness.id.desc()).first()

    if highest_id_item:
        db.session.delete(highest_id_item)
        db.session.commit()
    else:
        print("Aucun élément trouvé avec le critère spécifié.")

    return redirect(url_for("main.index"))

# Supprime la dernière image d'un dossier
@bp.route('/remove_lastimage', methods=['POST'])
def remove_lastimage():
    data = request.form.to_dict()

    try:
        diapo = os.listdir("./ojlevapp/static/img" + data["folder_path"])
        os.remove("./ojlevapp/static/img" + data["folder_path"] + "/" + diapo[-1])
    except Exception as e:
        print("Problème pour supprimer l'image dans " + data["folder_path"])
        return "ERROR for the image deletion", 500

    return "OK", 202

@bp.route('/file_manager')
def file_manager():
    return render_template('souvenirs.html')


@bp.route('/directory')
def directory():
    data = dirfiles(".", "dirnames")
    return jsonify(data)

@bp.route('/files')
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
            'thumb_width': image.thumb_width,
            'thumb_height': image.thumb_height,
        }
        image_list.append(image_data)
    return jsonify(image_list)


@bp.route('/image_thumb', methods=['POST'])
def image_thumb():
    data = request.form.to_dict()
    print("Data: {0}".format(data))
    img_path = data["img_path"]
    parent_folder = img_path.split("/")[-2]
    image_name = img_path.split("/")[-1]
    image = Gallery.query.filter_by(image_name=image_name, parent_folder=parent_folder).first()
    image.thumb_top = int(data ["top"][:-2])
    image.thumb_left = int(data ["left"][:-2])
    image.thumb_width = int(data ["width"][:-2])
    image.thumb_height = int(data ["height"][:-2])

    db.session.commit()
    print("Gallery : ", image)
    return "Bingo", 202


@bp.route('/gallery/image_info')
def image_info():
    image_name = request.args.get("image_name")
    image_parent = request.args.get("image_parent")
    image = Gallery.query.filter_by(image_name=image_name, parent_folder=image_parent).first()

    image_data = {
            'thumb_top': image.thumb_top,
            'thumb_left': image.thumb_left,
            'thumb_width': image.thumb_width,
            'thumb_height': image.thumb_height,
        }

    return jsonify(image_data)