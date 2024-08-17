#! /usr/bin/env python
from dotenv import load_dotenv
load_dotenv()  # Cela charge les variables d'environnement depuis le fichier .env

from ojlevapp import create_app

app = create_app()
app.debug = True
# Plus besoin de app.run ici, Gunicorn s'en occupera
