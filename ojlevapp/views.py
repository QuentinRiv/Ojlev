from flask import Flask, render_template, request, json,jsonify, redirect
from flask import Blueprint, current_app
import os
from werkzeug.utils import secure_filename
# from config import UPLOAD_FOLDER

bp = Blueprint('main', __name__)

# bp.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Config options - Make sure you created a 'config.py' file.
# bp.config.from_object('ojlevapp.config')
# To get one variable, tape app.config['MY_VARIABLE']

@bp.route('/login')
def login_get():
    return render_template('login.html')

@bp.route('/login', methods=['POST'])
def login_post():
    data = json.loads(request.data)
    
    if data['password'] == "1234":
        response = {
            'error': False,
            'code': 202,
            'message': 'Mot de passe correct !',
            'url': '/',
        }
        code = 202
    else:
        response = {
            'error': True,
            'code': 400,
            'message': 'Mot de passe incorrect',
            'url': '/login'
        }
        code = 500
    return jsonify(response), code

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/upload')
def upload():
    return render_template('upload.html') 

@bp.route('/upload', methods=['POST'])
def upload_file():
    if 'image' not in request.files:
        return redirect(request.url)
    file = request.files['image']
    if file.filename == '':
        return redirect(request.url)
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
        return 'Image uploadée avec succès'
    else:
        return 'Type de fichier non autorisé'

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']