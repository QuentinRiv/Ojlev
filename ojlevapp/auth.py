from flask import Blueprint, render_template, redirect, url_for, request, json, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from .models import User
from . import db
from flask_login import login_user, logout_user, login_required, current_user
import requests

auth = Blueprint('auth', __name__)

from flask import Blueprint, render_template

@auth.route('/connect')
def login():
    return render_template('login.html')

...
@auth.route('/login', methods=['POST'])
def login_post():
    data = json.loads(request.data)
    email = data['email']
    password = data['password']
    remember = True

    user = User.query.filter_by(email=email).first()

    # check if the user actually exists
    # take the user-supplied password, hash it, and compare it to the hashed password in the database
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': True,
                        'message': "Wrong username or Wrong password"}), 500 # if the user doesn't exist or password is wrong, reload the page

    login_user(user, remember=remember)

    response = {
        'error': False,
        'code': 202,
        'message': 'Mot de passe correct !',
        'url': '/',
    }
    # if the above check passes, then we know the user has the right credentials
    return jsonify(response), 202


@auth.route('/signup', methods=['POST'])
def signup_post():
    data = json.loads(request.data)
    email = data['email']
    name = data['name']
    password = data['password']

    user = User.query.filter_by(email=email).first() # if this returns a user, then the email already exists in database

    if user: # if a user is found, we want to redirect back to signup page so user can try again
        return redirect(url_for('auth.signup_post'))
    
    allusers = User.query.all()
    if len(allusers) == 2:
        print("Nombre d'admin maximal atteint")
        return redirect(url_for('auth.login'))

    # create a new user with the form data. Hash the password so the plaintext version isn't saved.
    new_user = User(email=email, name=name, password=generate_password_hash(password, method='pbkdf2:sha256'))

    # add the new user to the database
    try:
        db.session.add(new_user)
        db.session.commit()
    except(Exception) as e:
        print(e)

    return redirect(url_for('auth.login'))


@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index'))

@auth.route('/root')
@login_required
def root():
    if current_user.email != 'admin@email.com':
        return redirect(url_for('auth.login'))
    return render_template('reset.html')

@auth.route('/update_password', methods=['POST'])
@login_required
def update_password():
    if current_user.email != 'admin@email.com':
        return redirect(url_for('auth.login'))
    
    data = json.loads(request.data)

    email = data['email']
    password = data['password']

    user = User.query.filter_by(email=email).first() # if this returns a user, then the email already exists in database

    if not user: # if a user is found, we want to redirect back to signup page so user can try again
        return jsonify({'status': 400, 'message': 'Email non valide.'}), 400
    
    try:
        user.password = generate_password_hash(password, method='pbkdf2:sha256')
        db.session.commit()
    except Exception:
        return jsonify({'status': 400, 'message': 'Impossible to reset the password'}), 400


    return jsonify({'status': 200, 'message': 'Password correctly reset'}), 200
