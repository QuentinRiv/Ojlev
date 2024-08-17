#! /usr/bin/env python
import logging
from dotenv import load_dotenv
load_dotenv()  # Cela charge les variables d'environnement depuis le fichier .env

from ojlevapp import create_app

app = create_app()
app.debug = True

logging.basicConfig(filename='app.log', level=logging.INFO,
                    format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')

# Plus besoin de app.run ici, Gunicorn s'en occupera
