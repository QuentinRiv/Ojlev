#! /usr/bin/env python
import logging
from dotenv import load_dotenv
load_dotenv()  # Cela charge les variables d'environnement depuis le fichier .env
# from flask_compress import Compress

from ojlevapp import create_app

app = create_app()
# app.debug = True

# compress = Compress()
# compress.init_app(app)
app.config['COMPRESS_LEVEL'] = 6  # Niveau de compression de 1 (faible) à 9 (élevé)
app.config['COMPRESS_MIN_SIZE'] = 500  # Ne pas compresser les fichiers de moins de 500 octets


logging.basicConfig(filename='app.log', level=logging.INFO,
                    format='%(asctime)s %(levelname)s: %(message)s [in %(filename)s:%(lineno)d]')

logging.info("Application has been restarted")
# Plus besoin de app.run ici, Gunicorn s'en occupera

if __name__ == "__main__":
    app.run(debug=True)
