import traceback
import json
import sys
import os
import random
from flask import Flask, render_template, request, jsonify, redirect
from models import Game, GameStatus, Player, Card, PlayerStatus


games = []


app = Flask(__name__)


### General methods ###
def get_game() -> Game:
    try:
        return games[0]
    except Exception:
        return None


def get_player(game: Game, id) -> Player:
    for player in game.players:
        if player.id == id:
            return player
    
    return None


def generate_memes(game, path):
    memes = os.listdir(path)
    for m in memes:
        game.assets['cards'].append(Card(m, f'{path}/{m}'))


def generate_game(game: Game):
    game.music['vote_start'] = os.listdir('./static/music/vote/start')
    game.music['vote_end'] = os.listdir('./static/music/vote/end')

    game.music['tracks'] = os.listdir('./static/music/back/')

    generate_memes(game, './static/memes/gif')
    generate_memes(game, './static/memes/img')

    with open("./static/memes/captions.txt", 'r', encoding='utf8') as f:
        game.assets['captions'] = f.readlines()
        f.close()


### Main getters ###
def get_caption():
    game = get_game()

    if game.rounds[-1]['caption'] == '':
        game.last['caption'] += 1
        if game.last['caption'] == len(game.assets['captions']):
            # reset captions
            game.last['caption'] = 0
            random.shuffle(game.assets['captions'])

        game.rounds[-1]['caption'] = game.assets['captions'][game.last['caption']]
    
    return game.rounds[-1]['caption']


def get_mvs(): # vote start music
    game = get_game()

    game.last['start'] += 1
    if game.last['start'] >= len(game.music['vote_start']):
        game.last['start'] = 0

    return f'./static/music/vote/start/{game.music["vote_start"][game.last["start"]]}'


def get_mve(): # vote end music
    game = get_game()

    game.last['end'] += 1
    if game.last['end'] >= len(game.music['vote_end']):
        game.last['end'] = 0

    return f'./static/music/vote/end/{game.music["vote_end"][game.last["end"]]}'


@app.route('/mvt')
def get_mvt(): # background music
    game = get_game()

    return f'./static/music/back/{game.music["tracks"][game.last["track"]]}'


@app.route('/nextmvt')
def get_nextmvt(): # next track
    game = get_game()

    game.last['track'] += 1
    if game.last['track'] >= len(game.music['tracks']):
        game.last['track'] = 0

    return get_mvt()


@app.route('/getjgame')
def gj():
    game = get_game()

    return jsonify(game.serialize())


### Server logic ###
@app.route('/start')
def start(cc):
    game = get_game()

    if cc is None:
        cc = request.args.get('cc')

    if cc and len(game.players) > 1:
        game.status = GameStatus.START
        game.options['cards_count'] = int(cc)
        return jsonify(True)
    else:
        return jsonify(False)


@app.route('/servertick')
def server_tick():
    game = get_game()

    if game.status == GameStatus.NOT_STARTED:
        return jsonify([int(game.status), [p.serialize() for p in game.players]])

    if game.status == GameStatus.START:
        random.shuffle(game.assets['cards'])
        random.shuffle(game.assets['captions'])

        for p in game.players:
            for _ in range(0, game.options['cards_count']):
                for c in game.assets['cards']:
                    if not c.owner:
                        c.owner = p.id
                        c.owner_name = p.name
                        p.cards.append(c)
                        break

        game.status = GameStatus.ROUND_START
    
    if game.status == GameStatus.ROUND_START:
        for p in game.players:
            if len(p.cards) < game.options['cards_count']:
                for allcard in game.assets['cards']:
                    if not allcard.owner:
                        allcard.owner = p.id
                        allcard.owner_name = p.name
                        p.cards.append(allcard)
                        break

        game.rounds.append({
            'caption': '',
            'picks': [],
            'voted': []
        })

        for p in game.players:
            p.status = PlayerStatus.SHOULD_PICK

        game.status = GameStatus.PICK
        return jsonify([int(game.status), get_caption(), [p.serialize() for p in game.players]])
        
    if game.status == GameStatus.PICK:
        if len(game.players) == len(game.rounds[-1]['picks']):            
            game.status = GameStatus.VOTE_START
        
    if game.status == GameStatus.VOTE_START:
        for p in game.players:
            p.status = PlayerStatus.SHOULD_VOTE

        game.status = GameStatus.VOTE
        return jsonify([int(game.status), get_mvs()])

    if game.status == GameStatus.VOTE:
        if len(game.rounds[-1]['voted']) == len(game.players):
            game.status = GameStatus.VOTE_END
        else:
            return jsonify([int(game.status), game.rounds[-1]['picks']])

    if game.status == GameStatus.VOTE_END:
        game.status = GameStatus.ROUND_END
        return jsonify([int(game.status), get_mve()])

    if game.status == GameStatus.ROUND_END:
        score = [0, '']
        for r in game.rounds[-1]['picks']:
            if r['points'] > score[0]:
                score = []
                score.append(r['points'])
                score.append(r['id'])
            elif score[0] == r['points']:
                score.append(r['id'])

        win = 'Раунд за: '
        ppp = ''
        for p in game.players:
            for s in range(1, len(score)):
                if p.id == score[s]:
                    for r in game.rounds[-1]['picks']:
                        if r['id'] == p.id:
                            format = r['card'].split('.')
                            format = format[len(format) - 1]

                            points = 1
                            if (format == 'gif'):
                                points = 2

                            ppp = r['card'].fullpath
                            p.points += points
                            win += f'{p.name} +{points};'
                            break

        win += f'|||<img src="{ppp}" id="supermem" style="margin-left: 50px;">'
        return jsonify([int(game.status), win]) 

    if game.status == GameStatus.FINISHED:
        pass


### Client logic ###
@app.route('/join')
def join(name):
    game = get_game()

    if name is None:
        name = request.args.get('name')

    if name:
        if game.status == GameStatus.NOT_STARTED:
            for p in game.players:
                if p.name == name:
                    return redirect(f'/client?id={p.id}')

            player = Player(name)
            game.players.append(player)
            return redirect(f'/client?id={player.id}')
        else:
            for p in game.players:
                if p.name == name:
                    return redirect(f'/client?id={p.id}')

            return redirect('/join?clear=true')
    else:
        return render_template('join.html')


@app.route('/sendcard')
def send_card(id, card):
    game = get_game()

    if id is None:
        id = request.args.get('id')
        card = request.args.get('card')

    player = get_player(game, id)
    
    if id and card:
        for c in player.cards:
            if c.path == card:
                for rp in game.rounds[-1]['picks']:
                    if rp['id'] == id:
                        return redirect('/')

                game.rounds[-1]['picks'].append({
                    'id': id,
                    'name': player.name,
                    'card': card,
                    "points": 0
                })

                player.status = PlayerStatus.PICKED

                return ''

        return redirect('/join?clear=true')
    else:
        return redirect('/')


@app.route('/sendvote')
def sendvote(id, vid):
    game = get_game()

    if id is None:
        id = request.args.get('id')
        vid = request.args.get('vid')

    if id and vid:
        for v in game.rounds[-1]['voted']:
            if v == id:
                return ''

        game.rounds[-1]['voted'].append(id)
        player = get_player(game, id)
        player.status = PlayerStatus.VOTED

        for p in game.rounds[-1]['picks']:
            if p['id'] == vid:
                p['points'] += 1
                break
        
        return ''
    else:
        return redirect('/')


@app.route('/clienttick')
def client_tick(id):
    game = get_game()

    if id is None:
        id = request.args.get('id')

    player = get_player(game, id)

    if player.status == PlayerStatus.CONNECTED:
        return jsonify([int(player.status)])

    if player.status == PlayerStatus.SHOULD_PICK:
        return jsonify([int(player.status), c.serialize() for c in player.cards]) # client.html
    
    if player.status == PlayerStatus.PICKED:
        if card is None:
            card = request.args.get('card')

        if id and card:
            for c in player.cards:
                if c.path == card:
                    for pc in range(0, len(player.cards)):
                        if player.cards[pc].path == card:
                            del player.cards[pc]
                            break

                    return jsonify([int(player.status), c.fullpath]) # show.html

    if player.status == PlayerStatus.SHOULD_VOTE:
        inner = ''
        for r in game.rounds[-1]['picks']:
            inner += f'<div class="container"><div>{r["name"]}:</div><div class="overlay" hidden id="{r["id"]}" onclick="$(\'#{r["id"]}\').hide();"><input type="button" class="overlaybtn" style="background-color: darkgreen;" onclick="location.href=\'/sendvote?id={id}&vid={r["id"]}\';" value="Выбрать" /></div><img src="{r["card"]["fullpath"]}" onclick="$(\'#{r["id"]}\').show();"/></div>'
        return jsonify([int(player.status), inner]) # vote.html
    
    if player.status == PlayerStatus.VOTED:
        return jsonify([int(player.status)])

    if player.status == PlayerStatus.LOST:
        pass
    if player.status == PlayerStatus.WON:
        pass


### Simple pages ###
@app.route('/create')
def create():
    game = Game()
    generate_game(game)
    games.append(game)

    return redirect('/board')


@app.route('/board')
def board():
    return render_template('board.html')


@app.route('/client')
def client():
    if id is None:
        id = request.args.get('id')
    
    return render_template('client.html')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/rules')
def rules():
    return render_template('rules.html')


### Main method ###
if __name__ == '__main__':
    try:
        try:
            app.run(threaded=True, debug=True, use_reloader=False, host='0.0.0.0', port=8000)
        except Exception:
            app.run(threaded=True, debug=True, use_reloader=False, host='0.0.0.0', port=10000)
    except Exception:
        print('Server not started:')
        traceback.print_exc(file=sys.stdout)
