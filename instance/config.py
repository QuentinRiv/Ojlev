import os 

print("*****")
print(os.path.join(os.path.dirname(os.path.abspath(__file__))))

SECRET_KEY = 'production_secret'
SQLALCHEMY_DATABASE_URI = 'sqlite:///{}'.format(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../data', 'app.db'))
