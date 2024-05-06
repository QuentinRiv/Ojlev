from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# init SQLAlchemy so we can use it later in our models
db = SQLAlchemy()


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object('ojlevapp.config')  # Charge la configuration par défaut
    app.config.from_pyfile('config.py')  # Charge la config spécifique à l'instance

    db.init_app(app)

    from .views import bp
    app.register_blueprint(bp)

    # blueprint for auth routes in our app
    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)

    with app.app_context():
        db.create_all()

    return app
