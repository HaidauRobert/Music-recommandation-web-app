from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import ForeignKey
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:parola123@localhost:5555/Licenta'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app, resources={r"/*": {"origins": "*"}})
db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    spotify_user_id = db.Column(db.String, nullable=False, unique=True)
    liked_songs = db.relationship('LikedSong', backref='user', lazy=True)


class LikedSong(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    song_id = db.Column(db.String, nullable=False)
    song_title = db.Column(db.String, nullable=False)
    song_artist = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)


@app.route('/login', methods=['POST'])
def login():
    print('a reusit')
    spotify_user_id = request.json['spotifyUserId']
    user = User.query.filter_by(spotify_user_id=spotify_user_id).first()

    if user is None:
        user = User(spotify_user_id=spotify_user_id)
        db.session.add(user)
        db.session.commit()
        message = 'User created'
    else:
        message = 'User already exists'

    return jsonify({"userId": user.id, "message": message})


@app.route('/liked_songs', methods=['POST'])
def create_liked_song():
    data = request.get_json()
    new_song = LikedSong(song_id=data['songId'], song_title=data['songTitle'], song_artist=data['songArtist'],
                         user_id=data['userId'])
    db.session.add(new_song)
    db.session.commit()
    return jsonify({'message': 'Liked song added'}), 201


if __name__ == '__main__':
    app.run(debug=True)
