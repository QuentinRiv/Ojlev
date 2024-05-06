from flask import Flask
# from config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object('ojlevapp.config')  # Charge la configuration par défaut
    app.config.from_pyfile('config.py')  # Charge la config spécifique à l'instance

    from .views import bp
    app.register_blueprint(bp)

    return app
