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
    liked_songs = db.relationship('LikedSongs', backref='user', lazy=True)
    genre_preferences = db.relationship('UserGenrePreference', backref='user', uselist=False)


class LikedSongs(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    song_id = db.Column(db.String, nullable=False)
    song_title = db.Column(db.String, nullable=False)
    song_artist = db.Column(db.String, nullable=False)
    album_image_url = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)


class UserGenrePreference(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    pop = db.Column(db.Integer, default=0)
    rock = db.Column(db.Integer, default=0)
    hiphop = db.Column(db.Integer, default=0)
    jazz = db.Column(db.Integer, default=0)
    rnb = db.Column(db.Integer, default=0)


@app.route('/login', methods=['POST'])
def login():
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

    existing_song = LikedSongs.query.filter_by(user_id=data['userId'], song_id=data['songId']).first()
    if existing_song:
        return jsonify({'message': 'Song already exists for user'}), 409

    new_song = LikedSongs(song_id=data['songId'], song_title=data['songTitle'], song_artist=data['songArtist'],
                          album_image_url=data['albumImageUrl'], user_id=data['userId'])
    db.session.add(new_song)
    db.session.commit()
    return jsonify({'message': 'Liked song added'}), 201



@app.route('/update_genre_preference', methods=['POST'])
def update_genre_preference():
    data = request.get_json()
    user_id = data['userId']
    genre = data['genre']
    liked = data['isLiked']

    user_genre_preference = UserGenrePreference.query.filter_by(user_id=user_id).first()

    if user_genre_preference is None:
        user_genre_preference = UserGenrePreference(user_id=user_id)
        db.session.add(user_genre_preference)
        db.session.commit()
    print(genre)
    if genre in ['pop', 'rock', 'hiphop', 'jazz', 'rnb']:
        current_value = getattr(user_genre_preference, genre)
        new_value = current_value + 1 if liked else current_value - 1
        setattr(user_genre_preference, genre, new_value)

    db.session.commit()
    return jsonify({'message': 'User genre preferences updated'}), 200

@app.route('/liked_songs', methods=['GET'])
def get_liked_songs():
    user_id = request.args.get('userId')
    liked_songs = LikedSongs.query.filter_by(user_id=user_id).all()
    liked_songs_data = [{"song_id": song.song_id, "song_title": song.song_title, "song_artist": song.song_artist,
                         "album_image_url": song.album_image_url} for song in liked_songs] # add album image URL here
    return jsonify({"items": liked_songs_data})


if __name__ == '__main__':
    app.run(debug=True)
