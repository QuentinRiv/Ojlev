import os

# Clé secrète pour Flask
SECRET_KEY = os.getenv('SECRET_KEY', 'production_secret123')

# Définir la base de données (différente pour le développement, production, etc.)
basedir = os.path.abspath(os.path.dirname(__file__))

# Utiliser une variable d'environnement pour définir la base de données en production
SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f"sqlite:///{os.path.join(basedir, '../data', 'app.db')}")

# Autres configurations éventuelles
SQLALCHEMY_TRACK_MODIFICATIONS = False  # Désactive le suivi des modifications, recommandé pour les performances
