from flask import Flask, render_template, request
from flask_mail import Mail, Message
import smtplib
from dotenv import load_dotenv
import os
from flask_cors import CORS




# Load environment variables from .env file
load_dotenv()


email = os.getenv('EMAIL')
password = os.getenv('EMAIL_KEY')

GO1 = os.getenv('GO1')
GO2 =os.getenv('GO2')
# GO3 =os.getenv('GO3')
# GO4 =os.getenv('GO4')


app = Flask(__name__)


app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USE_TLS'] = False
print(email)
app.config['MAIL_USERNAME'] = email  # Replace with your email
app.config['MAIL_PASSWORD'] = password  # Replace with your password
print(email)
app.config['MAIL_DEFAULT_SENDER'] = email  # Replace with your email
print(email)
mail = Mail(app)

CORS(app)
print("lol") 

@app.route('/')
def index():
    return render_template('public/work.html')

@app.route('/submit-form', methods=['GET','POST'])

def submit_form():
    # Get form data
    first_name = request.form.get('first-name')
    e_mail =request.form.get('email')
    last_name = request.form.get('last-name')
    phone = request.form.get('phone')
    subject = request.form.get('subject')
    description = request.form.get('description')
                                                                                                                                                                                                                                                                                                                                                      
    # usr_message = "Your request has being sent to Reynanda Inc."

    # Create email message
    msg = Message(subject='New message for Reynanda from website', recipients=[GO1, GO2])  # Replace with your email
    msg.body = f'Hey, you got a message from {first_name} {last_name} (Email: {e_mail}, Phone: {phone})\nSubject: {subject}\nDescription: {description}'
    print(first_name)
    # print(email)
    # print(e_mail)
    print(description)
    # Send email
    mail.send(msg)


    return 'Message sent!'

@app.route('/api/my-endpoint')
def my_flask_endpoint():
    # Handle your Flask app logic here
    return 'Hello from Flask!'

if __name__ == '__main__':
    app.run(debug=True) #turn false on production