
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
    song_genre = db.Column(db.String, nullable=False)
    album_image_url = db.Column(db.String, nullable=False)
    isliked = db.Column(db.Integer, nullable=False)
    preview_url = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)


class UserGenrePreference(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    pop = db.Column(db.Integer, default=1)
    rock = db.Column(db.Integer, default=1)
    hiphop = db.Column(db.Integer, default=1)
    jazz = db.Column(db.Integer, default=1)
    rnb = db.Column(db.Integer, default=1)


@app.route('/get_genre_preference/<int:user_id>', methods=['GET'])
def get_genre_preference(user_id):
    user_genre_preference = UserGenrePreference.query.filter_by(user_id=user_id).first()
    if user_genre_preference is None:
        genre_preference_data = {
            "pop": 1,
            "rock": 1,
            "hiphop": 1,
            "jazz": 1,
            "rnb": 1,
        }
        return jsonify(genre_preference_data)

    genre_preference_data = {
        "pop": user_genre_preference.pop,
        "rock": user_genre_preference.rock,
        "hiphop": user_genre_preference.hiphop,
        "jazz": user_genre_preference.jazz,
        "rnb": user_genre_preference.rnb,
    }

    return jsonify(genre_preference_data)


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
                          song_genre=data['songGenre'], album_image_url=data['albumImageUrl'], user_id=data['userId'],
                          preview_url=data['previewUrl'])
    db.session.add(new_song)
    db.session.commit()
    return jsonify({'message': 'Liked song added'}), 201

@app.route('/unliked_songs/<int:user_id>', methods=['GET'])
def get_unliked_songs(user_id):
    unliked_songs = LikedSongs.query.filter_by(user_id=user_id).all()
    unliked_songs_data = [
        {
            "song_id": song.song_id,
            "song_title": song.song_title,
            "song_artist": song.song_artist,
            "song_genre": song.song_genre,
            "album_image_url": song.album_image_url,
            "preview_url": song.preview_url
        } for song in unliked_songs]
    return jsonify({"items": unliked_songs_data})

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
        if liked:
            new_value = current_value + 1
        else:
            if (current_value > 1): new_value = current_value - 1
            else: new_value = 1
        setattr(user_genre_preference, genre, new_value)

    db.session.commit()
    return jsonify({'message': 'User genre preferences updated'}), 200


@app.route('/liked_songs', methods=['GET'])
def get_liked_songs():
    user_id = request.args.get('userId')
    liked_songs = LikedSongs.query.filter_by(user_id=user_id).all()
    liked_songs_data = [{"song_id": song.song_id, "song_title": song.song_title, "song_artist": song.song_artist,
                         "song_genre": song.song_genre,
                         "album_image_url": song.album_image_url} for song in liked_songs]  # add album image URL here
    return jsonify({"items": liked_songs_data})


@app.route('/liked_songs', methods=['DELETE'])
def delete_liked_song():
    data = request.get_json()
    user_id = data['userId']
    song_id = data['songId']

    liked_song = LikedSongs.query.filter_by(user_id=user_id, song_id=song_id).first()
    if liked_song:
        db.session.delete(liked_song)
        db.session.commit()
        return jsonify({'message': 'Song deleted'}), 200
    else:
        return jsonify({'message': 'Song not found'}), 404

@app.route('/liked_artists/<int:user_id>', methods=['GET'])
def get_liked_artists(user_id):
    liked_songs = LikedSongs.query.filter_by(user_id=user_id).all()
    liked_artists = list(set([song.song_artist for song in liked_songs]))
    return jsonify({"liked_artists": liked_artists})

if __name__ == '__main__':
    app.run(debug=True)
