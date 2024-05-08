from flask import Flask, render_template, request, json,jsonify, redirect
from flask import Blueprint, current_app
import os
from werkzeug.utils import secure_filename
from flask_login import login_required, current_user
from .models import User, Partner
from . import db
from sqlalchemy.exc import SQLAlchemyError

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    groom = Partner.query.filter_by(id=1).first()
    bride = Partner.query.filter_by(id=2).first()
    if(current_user.is_authenticated):
        print("\nYou are authenticated\n")
    else:
        print("\nYou are not authenticated\n")
    return render_template('index.html', connected=current_user.is_authenticated, groom=groom, bride=bride)

@bp.route('/upload')
@login_required
def upload():
    return render_template('upload.html', name=current_user.name) 

@bp.route('/upload', methods=['POST'])
def upload_file():
    if 'image' not in request.files:
        return redirect(request.url)
    
    file = request.files['image']
    filename = request.form['filename']

    if file.filename == '':
        return redirect(request.url)
    if file and allowed_file(filename):
        filename = secure_filename(filename)
        file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
        return 'Image uploadée avec succès'
    else:
        return 'Type de fichier non autorisé'

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@bp.route('/partners', methods=['POST'])
def partners():

    data = request.form.to_dict()
    id = data['id']
    partner = db.session.query(Partner).filter_by(id=id).first()


    if data["info"] == 'names':
        names = data['names'].split(' ')
        first_name = names[0]

        try: last_name = names[1]
        except: last_name = ""

        partner.first_name = first_name
        partner.last_name = last_name

    elif data['info'] == 'description':
        text = data['text']
        partner.description = text
    
    try: 
        db.session.commit()
    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        print(error)
        return error

    return "ok", 202

@bp.route('/generate_partners', methods=['GET'])
def generate_partners():
    Partner.query.delete()
    db.session.commit()
    partner1 = Partner(id=1, 
                       first_name="Jean", 
                       last_name="Bonbeurre", 
                       description="A very nice lad")
    partner2 = Partner(id=2, 
                       first_name="Jeanne", 
                       last_name="Haitte", 
                       description="A very nice girl")

    # add the new user to the database
    db.session.add(partner1)
    db.session.add(partner2)
    db.session.commit()
    return "ok", 202