from flask import Blueprint, render_template, redirect, url_for, request, json, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from .models import User
from . import db

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

    user = User.query.filter_by(email=email).first()

    # check if the user actually exists
    # take the user-supplied password, hash it, and compare it to the hashed password in the database
    if not user or not check_password_hash(user.password, password):
        return redirect(url_for('auth.login')) # if the user doesn't exist or password is wrong, reload the page

    response = {
        'error': False,
        'code': 202,
        'message': 'Mot de passe correct !',
        'url': '/',
    }
    # if the above check passes, then we know the user has the right credentials
    return jsonify(response), 202

#     if data['password'] == "1234":
#         response = {
#             'error': False,
#             'code': 202,
#             'message': 'Mot de passe correct !',
#             'url': '/',
#         }
#         code = 202
#     else:
#         response = {
#             'error': True,
#             'code': 400,
#             'message': 'Mot de passe incorrect',
#             'url': '/login'
#         }
#         code = 500
#     return jsonify(response), code



@auth.route('/signup', methods=['POST'])
def signup_post():
    data = json.loads(request.data)
    email = data['email']
    name = data['name']
    password = data['password']

    user = User.query.filter_by(email=email).first() # if this returns a user, then the email already exists in database

    if user: # if a user is found, we want to redirect back to signup page so user can try again
        return redirect(url_for('auth.signup'))

    # create a new user with the form data. Hash the password so the plaintext version isn't saved.
    new_user = User(email=email, name=name, password=generate_password_hash(password, method='pbkdf2:sha256'))

    # add the new user to the database
    db.session.add(new_user)
    db.session.commit()

    return redirect(url_for('auth.login'))