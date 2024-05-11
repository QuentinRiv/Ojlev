from flask import Flask, render_template, request, json,jsonify, redirect
from flask import Blueprint, current_app, url_for
import os
from werkzeug.utils import secure_filename
from flask_login import login_required, current_user
from .models import Partner, Lovestory, Program
from . import db
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func 

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    groom = Partner.query.filter_by(id=1).first()
    bride = Partner.query.filter_by(id=2).first()
    stories = Lovestory.query.all()
    programs = Program.query.all()
    if(current_user.is_authenticated):
        print("\nYou are authenticated\n")
    else:
        print("\nYou are not authenticated\n")
    return render_template('index.html', connected=current_user.is_authenticated, groom=groom, bride=bride, stories=stories, programs=programs)

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
    path = request.form['path']

    if file.filename == '':
        return redirect(request.url)
    if file and allowed_file(filename):
        filename = secure_filename(filename)
        file.save(os.path.join(path, filename))
        return 'Image uploadée avec succès'
    else:
        return 'Type de fichier non autorisé'

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']




def update_db(data, table, id, attribute_name, new_value):
    # Need : Table, id, key, value
    if (table == "Program"): tablequery = db.session.query(Program)
    if (table == "Lovestory"): tablequery = db.session.query(Lovestory)
    if (table == "Partner"): tablequery = db.session.query(Partner)

    element = tablequery.filter_by(id=data['id']).first()

    setattr(element, attribute_name, new_value)

    return


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

@bp.route('/generate_story', methods=['GET'])
def generate_story():
    data = request.form.to_dict()
    Lovestory.query.delete()
    db.session.commit()

    titles = ["First Meet", "First Date", "Proposal", "Engagement"]
    dates = ["10 Jan 2020", "13 Mar 2021", "16 Jun 2022", "19 Sep 2023"]
    for i in range(4):
        lovepart = Lovestory(id=i,
                             title=titles[i], 
                             date=dates[i], 
                             description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam officiis doloribus nulla placeat voluptatibus eum quidem fugit eius impedit, asperiores molestiae natus saepe doloremque, exercitationem quo error iure optio debitis.",
                             image_name="story-"+str(i)+".jpg")
        db.session.add(lovepart)
        db.session.commit()
        
    return "ok", 202


@bp.route('/story', methods=['POST'])
def story():
    data = request.form.to_dict()
    
    update_story(data)
        
    return "ok", 202

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


@bp.route('/generate_program', methods=['GET'])
def generate_program():
    Program.query.delete()
    db.session.commit()

    names = ["Ceremony", "Engagement"]
    dates = ["16 Jun 2022", "19 Sep 2023"]
    hours = ["5:00 - 7:00 PM", "5:00 - 7:30 PM"]
    for i in range(2):
        program = Program(  id=i+1,
                            name=names[i], 
                            date=dates[i], 
                            time=hours[i],
                            description="Machin truc muche")
        db.session.add(program)
        db.session.commit()
        
    return "ok", 202



@bp.route('/test', methods=['GET'])
def test():
    program = db.session.query(Program)
    print(program.filter_by(id=1).first())

    return "OuiTest", 200