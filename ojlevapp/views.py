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
import logging
import sqlite3
from flask import render_template, request, flash, redirect, url_for
from flask_login import login_required

bp = Blueprint('main', __name__)


@bp.route('/')
def index():
    groom = Couple.query.filter_by(id=1).first()
    bride = Couple.query.filter_by(id=2).first()
    stories = Story.query.all()
    programs = Program.query.all()
    groomsmen = Witness.query.filter_by(side="Groomsman").all()
    bridesmaids = Witness.query.filter_by(side="Bridesmaid").all()
    diapo = sorted(os.listdir('./ojlevapp/static/img/slides'))
    galleries = Gallery.query.all()
    folders = list(set([gallery.parent_folder for gallery in galleries]))

    # User connecté ?
    if(current_user.is_authenticated):
        logging.info("You are authenticated")
    else:
        logging.warning("You are not authenticated")
    return render_template('index.html', connected=current_user.is_authenticated, groom=groom, bride=bride, stories=stories, programs=programs, groomsmen=groomsmen, bridesmaids=bridesmaids, diapo=diapo, galleries=galleries, folders=folders)


@bp.route('/upload', methods=['POST'])
@login_required 
def upload_file():
    if 'image' not in request.files:
        return redirect(request.url)
    
    file = request.files['image']
    filename = request.form['filename']
    path = "./ojlevapp/static/img/" + request.form['path']
    logging.info(f"Path de data : {request.form['path']}")
    logging.info(f"Path total : {path}")

    if file.filename == '':
        return redirect(request.url)
    if file and allowed_file(filename):
        filename = secure_filename(filename)
        file.save(os.path.join(path, filename))
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
@login_required 
def generate():
    logging.info("Generate page")
    # generate_user()
    generate_program()
    generate_partners()
    generate_story()
    generate_witness()
    generate_gallery()
    logging.info("Finish generate page")
    return "ok", 200


@bp.route('/generate_admin', methods=['GET'])
def generate_administrator():
    generate_admin()
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
    print("Diapo :", diapo)
    os.remove('./ojlevapp/static/img/slides' + diapo[-1])

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

@bp.route('/show_db', methods=['GET'])
@login_required
def show_db():
    table_name = request.args.get('table')
    print("Table :", table_name)
    if not table_name:
        flash('Le paramètre "table" est requis', 'danger')
        return redirect(url_for('main.index'))

    try:
        # Connexion à la base de données SQLite (à adapter selon votre cas)
        conn = sqlite3.connect('./data/app.db')
        cursor = conn.cursor()

        # Récupérer les données de la table spécifiée
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()

        # Récupérer les noms des colonnes
        column_names = [description[0] for description in cursor.description]

    except sqlite3.Error as e:
        flash(f'Erreur lors de la récupération des données: {e}', 'danger')
        return redirect(url_for('main.index'))
    finally:
        conn.close()

    # Rendre la page HTML avec les données récupérées
    return render_template('show_db.html', table_name=table_name, rows=rows, column_names=column_names)

# Supprime la dernière image d'un dossier
@bp.route('/remove_lastimage', methods=['POST'])
def remove_lastimage():
    data = request.form.to_dict()
    logging.info(f"{data}")
    logging.info("./ojlevapp/static/img/" + data["folder_path"])

    try:
        diapo = os.listdir("./ojlevapp/static/img/" + data["folder_path"])
        logging.info("./ojlevapp/static/img/" + data["folder_path"] + "/" + diapo[-1])
        logging.info(diapo)
        
        os.remove("./ojlevapp/static/img/" + data["folder_path"] + "/" + diapo[-1])
    except Exception as e:
        print("Problème pour supprimer l'image dans " + data["folder_path"])
        return "ERROR for the image deletion", 500

    return "OK", 202

@bp.route('/gallery')
def gallery():
    return render_template('souvenirs.html')

@bp.route('/empty_db', methods=['GET'])
@login_required
def empty_db():
    table_name = request.args.get('table')
    print("Table :", table_name)
    if not table_name:
        flash('Le paramètre "table" est requis', 'danger')
        return redirect(url_for('main.index'))

    try:
        # Connexion à la base de données SQLite (à adapter selon votre cas)
        conn = sqlite3.connect('./data/app.db')
        cursor = conn.cursor()

        # Vider le contenu de la table spécifiée
        cursor.execute(f"DELETE FROM {table_name}")

        # Commit pour valider les changements
        conn.commit()

    except sqlite3.Error as e:
        flash(f'Erreur lors de la récupération des données: {e}', 'danger')
        return redirect(url_for('main.index'))
    finally:
        conn.close()

    # Rendre la page HTML avec les données récupérées
    return "Table emptied", 202
