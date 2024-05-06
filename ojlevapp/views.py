from flask import Flask, render_template, request, json,jsonify
from flask import Blueprint

bp = Blueprint('main', __name__)
app = Flask(__name__)

# Config options - Make sure you created a 'config.py' file.
app.config.from_object('ojlevapp.config')
# To get one variable, tape app.config['MY_VARIABLE']

@app.route('/login')
def login_get():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login_post():
    data = json.loads(request.data)
    
    if data['password'] == "1234":
        response = {
            'error': False,
            'code': 202,
            'message': 'Mot de passe correct !',
            'url': '/',
        }
        code = 202
    else:
        response = {
            'error': True,
            'code': 400,
            'message': 'Mot de passe incorrect',
            'url': '/login'
        }
        code = 500
    return jsonify(response), code

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(FLASK_DEBUG=1)