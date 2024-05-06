from flask import Flask, render_template

app = Flask(__name__)

# Config options - Make sure you created a 'config.py' file.
app.config.from_object('config')
# To get one variable, tape app.config['MY_VARIABLE']

@app.route('/login')
def login_get():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login_post():
    print("***")
    return 'Hello'

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(FLASK_DEBUG=1)