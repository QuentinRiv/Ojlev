from flask_login import UserMixin
from . import db
from sqlalchemy.orm import validates

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    name = db.Column(db.String(1000))

class Partner(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    full_name = db.Column(db.String(100))
    description = db.Column(db.String(1000))

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


class Lovestory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    date = db.Column(db.String(100))
    description = db.Column(db.String(1000))
    image_name = db.Column(db.String(100))

class Program(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    date = db.Column(db.String(100))
    time = db.Column(db.String(100))
    description = db.Column(db.String(100))