from flask_login import UserMixin
from . import db
from sqlalchemy.orm import validates
from sqlalchemy import event
from sqlalchemy.orm import sessionmaker
import os

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True) # primary keys are required by SQLAlchemy
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    name = db.Column(db.String(1000))

class Couple(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    full_name = db.Column(db.String(100))
    description = db.Column(db.String(1000))
    image_name = db.Column(db.String(100))

    @validates('full_name')
    def update_first_last_name(self, key, value):
        # Cette fonction se déclenche lorsque full_name est modifié
        names = value.split(' ', 1)  # Sépare sur le premier espace
        self.first_name = names[0]  # Le premier élément est first_name
        if len(names) > 1:
            self.last_name = names[1]  # Le second élément est last_name
        else:
            self.last_name = ''  # Aucun last_name si full_name n'a qu'un mot
        return value
    
    def image_path(self):
        return f'/couple/{self.image_name}'


class Story(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(100))
    date = db.Column(db.String(100))
    description = db.Column(db.String(1000))
    image_name = db.Column(db.String(100))
    
    def image_path(self):
        return f'/story/{self.image_name}'

class Program(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100))
    date = db.Column(db.String(100))
    time = db.Column(db.String(100))
    description = db.Column(db.String(100))


class Witness(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    side = db.Column(db.String(100))
    full_name = db.Column(db.String(100))
    description = db.Column(db.String(1000))
    image_name = db.Column(db.String(100))
    
    def image_path(self):
        return f'/witness/{self.side.lower()}/{self.image_name}'

class Gallery(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    image_name = db.Column(db.String(100))
    size = db.Column(db.String(100))
    weight = db.Column(db.String(100))
    parent_folder = db.Column(db.String(100))
    date = db.Column(db.String(100))
    thumb_top = db.Column(db.Float)
    thumb_left = db.Column(db.Float)
    thumb_right = db.Column(db.Float)
    thumb_bottom = db.Column(db.Float)
    
    def image_path(self):
        return f'/gallery/{self.parent_folder.lower()}/{self.image_name}'
    
    def __str__(self):
        return f'Image {self.image_name}'
    
    def __repr__(self):
        return f'Image {self.image_name}'

    

def delete_image(mapper, connection, target):
    image_server = './ojlevapp/static/img'
    image_path = target.image_path()
    absolute_path = image_server + image_path
    try:
        os.remove(absolute_path)
    except Exception as e:
        exit("Error to delete the image :", e)

# Attacher l'écouteur à l'événement 'after_delete' pour le modèle User
event.listen(Couple, 'before_delete', delete_image)
event.listen(Program, 'before_delete', delete_image)
event.listen(Story, 'before_delete', delete_image)
event.listen(Witness, 'before_delete', delete_image)