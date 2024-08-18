from flask_login import UserMixin
from . import db
from sqlalchemy.orm import validates
from sqlalchemy import event
from flask import current_app
from . import db
import os, re, shutil
import logging
from datetime import datetime, timedelta

img_server = 'ojlevapp/static/img'
gallery_path = img_server + '/gallery'
thumb_path = img_server + '/thumb'
class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True) # primary keys are required by SQLAlchemy
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    name = db.Column(db.String(1000))

class Couple(db.Model):
    __tablename__ = 'couple'
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
        self.first_name = names[0]  # 1er élément : first_name
        if len(names) > 1:
            self.last_name = names[1]  # 2nd élément : last_name
        else:
            self.last_name = ''  # Aucun last_name si full_name n'a qu'un mot
        return value
    
    def image_path(self):
        return f'/couple/{self.image_name}'


class Story(db.Model):
    __tablename__ = 'stories'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(100))
    date = db.Column(db.String(100))
    description = db.Column(db.String(1000))
    image_name = db.Column(db.String(100))
    
    def image_path(self):
        return f'/story/{self.image_name}'

class Program(db.Model):
    __tablename__ = 'programs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100))
    date = db.Column(db.String(100))
    time = db.Column(db.String(100))
    description = db.Column(db.String(100))


class Witness(db.Model):
    __tablename__ = 'witnesses'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    side = db.Column(db.String(100))
    full_name = db.Column(db.String(100))
    description = db.Column(db.String(1000))
    image_name = db.Column(db.String(100))
    
    def image_path(self):
        return f'/witness/{self.side.lower()}/{self.image_name}'

class Gallery(db.Model):
    __tablename__ = 'galleries'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    image_name = db.Column(db.String(100), nullable=False)
    extension = db.Column(db.String(10), nullable=False)
    size = db.Column(db.String(100))
    weight = db.Column(db.String(100))
    parent_folder = db.Column(db.String(100))
    date = db.Column(db.String(100))
    thumb_top = db.Column(db.Float, default=0)
    thumb_left = db.Column(db.Float, default=0)
    thumb_right = db.Column(db.Float, default=500)
    thumb_bottom = db.Column(db.Float, default=368)

    
    @validates('image_name')
    def validate_image_name(self, key, image_name):
        # Validate and ensure the extension is set correctly
        if not self.extension:
            print("Image = {0}".format(image_name))
            name, ext = self.split_filename(image_name)
            self.extension = self.validate_extension('extension', ext)
        elif "." in image_name:
            name, ext = self.split_filename(image_name)
        else:
            name = image_name

        return name
    
    @validates('extension')
    def validate_extension(self, key, extension):
        if extension not in current_app.config['ALLOWED_EXTENSIONS']:
                raise ValueError(f"Not a valid extension or no extension was provided.")

        return extension
    
    @validates('size')
    def validate_size(self, key, size):
        width, height = size.split(" x ")
        self.thumb_left = int(width)/2 - 500/2
        self.thumb_right = int(width)/2 + 500/2
        self.thumb_top = int(height)/2 - 368/2
        self.thumb_bottom = int(height)/2 + 368/2

        return size

    @staticmethod
    def split_filename(filename):
        name, extension = os.path.splitext(filename)
        extension = extension.lstrip('.')
        if not extension:
            raise Exception("Missing extension in 'split_filename'")
        return name, extension
    

    @property
    def full_image_name(self):
        return f"{self.image_name}.{self.image_extension}"
    
    def gallery_path(self):
        return f'/gallery/{self.parent_folder.lower()}/{self.image_name}.{self.extension}'
    
    def thumb_path(self):
        return f'/thumb/{self.parent_folder.lower()}/{self.image_name}.{self.extension}'
     
    def parent_path(self):
        return f'/gallery/{self.parent_folder.lower()}/'

    def __str__(self):
        return f'Image {self.image_name}'
    
    def __repr__(self):
        return f'Image {self.image_name}'
    

    
    def update_details(self, new_parent_folder=None, new_image_name=None):
        if new_parent_folder:
            self._rename_and_update_parent_folder(new_parent_folder)
        if new_image_name:
            self._rename_and_update_image_name(new_image_name)
        db.session.commit()

    def _rename_and_update_parent_folder(self, new_parent_folder):
        old_gallery_path = img_server + self.gallery_path()
        new_gallery_path = old_gallery_path.replace(self.parent_folder, new_parent_folder, 1)
        self._rename_file(old_gallery_path, new_gallery_path)
        self.parent_folder = new_parent_folder

    def _rename_and_update_image_name(self, new_image_name):
        # Regex pour trouver l'extension
        match = re.search(r'\.([a-zA-Z0-9]+)$', new_image_name)
        current_extension = self.extension
        
        if match:
            new_extension = match.group(1)
            if new_extension in current_app.config['ALLOWED_EXTENSIONS']:
                new_full_name = new_image_name
            else:
                raise ValueError("Wrong extension prefix")
        else:
            new_full_name = f"{new_image_name}.{current_extension}"

        self._rename_file(img_server + self.gallery_path(), img_server + self.parent_path() + new_full_name)
        self._rename_file(img_server + self.thumb_path(), img_server + "/thumb/" + self.parent_folder + "/" + new_full_name)
        self.image_name = new_full_name

    def _rename_file(self, old_name, new_name):
        if os.path.exists(new_name):
            raise Exception("Careful: image with that name already existing")
        try:
            shutil.move(old_name, new_name)
            print("Old image existe ? : ", os.path.exists(old_name))
        except FileNotFoundError:
            raise Exception(f'The file {old_name} does not exist')
        except PermissionError:
            raise Exception(f'Permission denied to rename {old_name}')
        except Exception as e:
            raise Exception(f'An error occurred: {e}')
        logging.info(f"File renamed, from '{old_name}' to '{new_name}'")

def delete_image(mapper, connection, target):
    image_path = target.gallery_path()
    absolute_path = img_server + image_path
    try:
        os.remove(absolute_path)
    except Exception as e:
        exit("Error to delete the image :", e)

def rename_file(old_name, new_name):
    if os.path.exists(new_name):
        raise Exception("Careful : image already existing")
    
    try:
        os.rename(old_name, new_name)
        return f'File renamed from {old_name} to {new_name}'
    except FileNotFoundError:
        raise Exception(f'The file {old_name} does not exist')
    except PermissionError:
        raise Exception(f'Permission denied to rename {old_name}')
    except Exception as e:
        raise Exception(f'An error occurred: {e}')

# Attacher l'écouteur à l'événement 'after_delete' pour le modèle User
event.listen(Couple, 'before_delete', delete_image)
event.listen(Program, 'before_delete', delete_image)
event.listen(Story, 'before_delete', delete_image)
event.listen(Witness, 'before_delete', delete_image)
event.listen(Gallery, 'before_delete', delete_image)

def update_date(mapper, connection, target):
    new_time = datetime.utcnow() + timedelta(hours=2)
    target.date = new_time.strftime("%d %b %Y %H:%M")
# Attacher la fonction à l'événement before_update
event.listen(Gallery, 'before_update', update_date)