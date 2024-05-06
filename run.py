#! /usr/bin/env python
from dotenv import load_dotenv
load_dotenv()  # Cela charge les variables d'environnement depuis le fichier .env

from ojlevapp import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)