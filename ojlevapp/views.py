from flask import Flask, render_template, request, redirect
from flask import Blueprint, current_app, url_for
import os
from werkzeug.utils import secure_filename
from flask_login import login_required, current_user
from .models import Partner, Lovestory, Program, Witness
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
    groomsmen = Witness.query.filter_by(side="Groomsman").all()
    bridesmaids = Witness.query.filter_by(side="Bridesmaid").all()
    print("=> ", groomsmen)
    if(current_user.is_authenticated):
        print("\nYou are authenticated\n")
    else:
        print("\nYou are not authenticated\n")
    return render_template('index.html', connected=current_user.is_authenticated, groom=groom, bride=bride, stories=stories, programs=programs, groomsmen=groomsmen, bridesmaids=bridesmaids)

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

@bp.route('/update', methods=['POST'])
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

    setattr(element, attribute_name, new_value)
    try: 
        db.session.commit()
    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        print(error)
        return error

    return "Success", 202


def generate_partners():
    Partner.query.delete()
    db.session.commit()
    partner1 = Partner(id=1, 
                       full_name="Jean Bonbeurre" ,
                       description="A very nice lad")
    partner2 = Partner(id=2, 
                       full_name="Jeanne Haitte", 
                       description="A very nice girl")

    # add the new user to the database
    db.session.add(partner1)
    db.session.add(partner2)
    db.session.commit()
    return "ok", 202


def generate_story():
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

def generate_witness():
    Witness.query.delete()
    db.session.commit()

    side = ["Groomsman", "Groomsman", "Groomsman", "Bridesmaid", "Bridesmaid", "Bridesmaid", ]
    full_name = ["Albert Einstein", "Thierry Lermit", "Igor Meideleyeiv", "Marie Curie", "Frida Khalo", "Mahitée"]
    for i in range(len(full_name)):
        witness = Witness(  id=i,
                            side=side[i], 
                            full_name=full_name[i],
                            description="Best Friend")
        db.session.add(witness)
        db.session.commit()
        
    return "ok", 202

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
