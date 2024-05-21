from flask import Flask, render_template, request, redirect
from flask import Blueprint, current_app, url_for
import os
from werkzeug.utils import secure_filename
from flask_login import login_required, current_user
from .models import Partner, Lovestory, Program, Witness
from . import db
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func
from .generation import *

bp = Blueprint('main', __name__)


@bp.route('/')
def index():
    groom = Partner.query.filter_by(id=1).first()
    bride = Partner.query.filter_by(id=2).first()
    stories = Lovestory.query.all()
    programs = Program.query.all()
    groomsmen = Witness.query.filter_by(side="Groomsman").all()
    bridesmaids = Witness.query.filter_by(side="Bridesmaid").all()
    diapo = os.listdir('./ojlevapp/static/img/slides')

    # User connecté ?
    if(current_user.is_authenticated):
        print("\nYou are authenticated\n")
    else:
        print("\nYou are not authenticated\n")
    return render_template('index.html', connected=current_user.is_authenticated, groom=groom, bride=bride, stories=stories, programs=programs, groomsmen=groomsmen, bridesmaids=bridesmaids, diapo=diapo)


@bp.route('/upload', methods=['POST'])
@login_required 
def upload_file():
    if 'image' not in request.files:
        return redirect(request.url)
    
    file = request.files['image']
    filename = request.form['filename']
    path = ".\ojlevapp\static\img" + request.form['path']

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
    table = data['table']
    id = data['id']
    attribute_name = data['attribute_name']
    new_value = data['new_value']
    # Need : Table, id, key, value
    if (table == "Program"): tablequery = db.session.query(Program)
    if (table == "Lovestory"): tablequery = db.session.query(Lovestory)
    if (table == "Partner"): tablequery = db.session.query(Partner)
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

    return "Success", 202





@bp.route('/generate', methods=['GET'])
def generate():
    generate_program()
    generate_partners()
    generate_story()
    generate_witness()

    return "ok", 200


@bp.route('/story/new', methods=['GET'])
def new_story():
    high_id = len(Lovestory.query.all())
    lovepart = Lovestory(id=high_id,
                            title="New love step", 
                            date="01 Jan 2050", 
                            description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam officiis doloribus nulla placeat voluptatibus eum quidem fugit eius impedit, asperiores molestiae natus saepe doloremque, exercitationem quo error iure optio debitis.",
                            image_name="story-"+str(high_id)+".jpg")

    db.session.add(lovepart)
    db.session.commit()

    return redirect(url_for("main.index"))


@bp.route('/story/remove', methods=['GET'])
def remove_story():
    highest_id = len(Lovestory.query.all()) - 1

    last_story = Lovestory.query.filter_by(id=highest_id).delete()

    db.session.commit()

    return redirect(url_for("main.index"))

import shutil
import re
@bp.route('/slide/new', methods=['GET'])
def slide():
    upcloud_img("/slides")

    return redirect(url_for("main.index"))

def upcloud_img(path):
    filenames = os.listdir('./ojlevapp/static/img' + path)[-1]
    paths = re.split(r'[0-9]+', filenames)
    next_index = int(re.search(r'[0-9]+', filenames)[0]) + 1
    next_image = paths[0] + str(next_index) + paths[1]

    print("==>", "./ojlevapp/static/img/" + path + "/" + next_image)
    result = shutil.copyfile('./ojlevapp/static/img/upcloud.png', "./ojlevapp/static/img/" + path + "/" + next_image)
    return

@bp.route('/slide/remove', methods=['GET'])
def slide_remove():

    diapo = os.listdir('./ojlevapp/static/img/slides')
    os.remove('./ojlevapp/static/img/slides/' + diapo[-1])

    return redirect(url_for("main.index"))




@bp.route('/witness/new', methods=['GET'])
def new_witness():
    side = request.args.get("side")
    high_id = len(Witness.query.filter_by().all())
    lovepart = Witness(id=high_id,
                            side=side, 
                            full_name="John Doe", 
                            description="Best Friend")

    db.session.add(lovepart)
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