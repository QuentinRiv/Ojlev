import os

SECRET_KEY = os.getenv('SECRET_KEY', 'production_secret123')
SQLALCHEMY_DATABASE_URI = 'sqlite:///{}'.format(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../data', 'app.db'))
