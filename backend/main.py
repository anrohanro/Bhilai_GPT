from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')
 
@socketio.on('message')
def handle_message(message):
    print('Received message:', message)
    # Here you can process the message and generate a response
    response = {'message': 'This is the response to your query: ' + message}
    socketio.emit('response', response)

if __name__ == '__main__':
    socketio.run(app)
