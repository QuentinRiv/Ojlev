from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_babel import Babel

# init SQLAlchemy so we can use it later in our models
db = SQLAlchemy()


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object('ojlevapp.config')
    app.config.from_pyfile('config.py')

    db.init_app(app)

    # babel = Babel(app)

    # app.config['BABEL_DEFAULT_LOCALE'] = 'en'
    # app.config['BABEL_DEFAULT_TIMEZONE'] = 'UTC'

    # @babel.localeselector
    # def get_locale():
    #     # Ici, vous pouvez insérer la logique pour choisir la locale.
    #     # Cette fonction peut extraire la langue de la session, des cookies,
    #     # des paramètres de l'utilisateur, ou simplement utiliser la meilleure
    #     # correspondance avec ce que le navigateur du client demande.
    #     return request.accept_languages.best_match(['en', 'fr', 'de', 'es'])

    from .views import bp
    app.register_blueprint(bp)

    from .gallery_views import gallery_bp
    app.register_blueprint(gallery_bp)

    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)

    with app.app_context():
        db.create_all()

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    from .models import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    return app
