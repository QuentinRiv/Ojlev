from flask import Flask, render_template, request, json,jsonify, redirect
from flask import Blueprint, current_app
import os
from werkzeug.utils import secure_filename

bp = Blueprint('main', __name__)
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