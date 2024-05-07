import os

DEBUG = True
SQLALCHEMY_DATABASE_URI = 'sqlite:///default.db'
SECRET_KEY = 'dev'
FLASK_DEBUG=1
UPLOAD_FOLDER = 'ojlevapp/static/img'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}