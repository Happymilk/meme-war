import traceback
import sys
import os
import random
from flask import Flask, render_template, request, jsonify, redirect
from models import Game, GameStatus, Player, Card


games = []

app = Flask(__name__)


def get_game():
    try:
        return games[0]
    except Exception:
        return None

def generate(game: Game):
    game.music['vote_start'] = os.listdir('./static/music/vote/start')
    game.music['vote_end'] = os.listdir('./static/music/vote/end')

    game.music = os.listdir('./static/music/back/')

    memes = os.listdir('./static/memes/gif')
    memes += os.listdir('./static/memes/img')
    for m in memes:
        game.assets['cards'].append(Card(m))
    memes = None

    capt = []
    with open("./static/memes/captions.txt", 'r', encoding='utf8') as f:
        capt = f.readlines()
        f.close()

    for c in capt:
        game.assets['captions'].append({'text': c, 'used': False})


@app.route('/winner')
def get_winner():
    game = get_game()

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

                        path = 1
                        ppp = '/static/memes/img/'
                        if (format == 'gif'):
                            path = 2
                            ppp = '/static/memes/gif/'

                        ppp += r['card']
                        p.points += path
                        win += f'{p.name} +{path};'
                        break

    win += f'|||<img src="{ppp}" id="supermem" style="margin-left: 50px;">'

    return win


@app.route('/caption')
def get_caption():
    game = get_game()

    if game.rounds[-1]['caption'] == '':
        game.last['caption'] += 1
        if game.last['caption'] == len(game.assets['captions']):
            for c in game.assets['captions']:
                c['used'] = False
            game.last['caption'] = 0

        game.assets['captions'][game.last['caption']]['used'] = True
        game.rounds[-1]['caption'] = game.assets['captions'][game.last['caption']]['text']
        return game.assets['captions'][game.last['caption']]['text']
    else:
        return game.rounds[-1]['caption']


@app.route('/getround')
def get_round():
    game = get_game()
    
    action = ''

    if game is not None and game.status != GameStatus.NOT_STARTED and len(game.players) == len(game.rounds[-1]['picks']):
        if allvote() == 'yes':
            action = 'end_vote'
        else:
            action = 'start_vote'
    else:
        action = ''

    if action != game.last['action']:
        game.last['action'] = action
        return action
    else:
        return ''


@app.route('/mvs')
def mvs():
    game = get_game()

    return f'./static/music/vote/start/{game.music["vote_start"][game.last["start"]]}'


@app.route('/mve')
def mve():
    game = get_game()

    return f'./static/music/vote/end/{game.music["vote_end"][game.last["end"]]}'


@app.route('/mvt')
def mvt():
    game = get_game()

    game.last['track'] += 1
    if game.last['track'] >= len(game.music):
        game.last['track'] = 0

    return f'./static/music/back/{game.music[game.last["track"]]}'


@app.route('/players')
def get_players():
    game = get_game()

    return jsonify([p.serialize() for p in game.players])


@app.route('/start')
def start():
    game = get_game()

    s = request.args.get('start')
    ccc = request.args.get('cc')
    if s and ccc:
        game.status = GameStatus.STARTED
        random.shuffle(game.assets['cards'])
        random.shuffle(game.assets['captions'])
        game.options['cards_count'] = int(ccc)
        game.rounds[-1]['votd'] = True
        for p in game.players:
            for _ in range(0, game.options['cards_count']):
                for c in game.assets['cards']:
                    if not c.owner:
                        c.owner = p.id
                        c.owner_name = p.name
                        p.cards.append(c)
                        break

        return 'started'
    else:
        if game.status != GameStatus.NOT_STARTED:
            return 'started'

        return 'not'


@app.route('/reset')
def reset():
    game = get_game()

    game.rounds.append({
        'caption': '',
        'picks': [],
        'voted': [],
        'votd': True
    })

    game.last['start'] += 1
    if game.last['start'] == len(game.music['vote_start']):
        game.last['start'] = 0

    game.last['end'] += 1
    if game.last['end'] == len(game.music['vote_end']):
        game.last['end'] = 0

    return 'reseted'


@app.route('/join')
def join():
    game = get_game()

    name = request.args.get('name')
    if name:
        if game.status == GameStatus.NOT_STARTED:
            for p in game.players:
                if p.name == name:
                    return redirect(f'/check?id={p.id}')

            player = Player(name)
            game.players.append(player)
            return redirect(f'/check?id={player.id}')
        else:
            return redirect('/')
    else:
        return render_template('join.html')


@app.route('/get')
def get():
    game = get_game()

    id = request.args.get('id')
    if id:
        for p in game.players:
            if p.id == id:
                return jsonify([c.serialize() for c in p.cards])

        return redirect('/')
    else:
        return redirect('/')


@app.route('/check')
def check():
    game = get_game()

    id = request.args.get('id')
    if id:
        for p in game.players:
            if p.id == id:
                return redirect(f'/client?id={id}')

        return redirect('/join?clear=true')
    else:
        return redirect('/')


@app.route('/client')
def client():
    game = get_game()

    id = request.args.get('id')
    if id:
        for p in game.players:
            if p.id == id:
                return render_template('client.html')

        return redirect(f'/check?id={id}')
    else:
        return redirect('/')


@app.route('/send')
def send():
    game = get_game()

    id = request.args.get('id')
    card = request.args.get('card')
    if id and card:
        if game.rounds[-1]['votd']:
            game.rounds[-1]['votd'] = False
        for p in game.players:
            if p.id == id:
                for c in p.cards:
                    if c.path == card:
                        for rp in game.rounds[-1]['picks']:
                            if rp['id'] == id:
                                return redirect('/')

                        game.rounds[-1]['picks'].append({
                            'id': id,
                            'name': p.name,
                            'card': card,
                            "points": 0
                        })

                        return redirect(f'/show?id={id}&card={card}')

        return redirect('/')
    else:
        return redirect('/')


@app.route('/show')
def show():
    game = get_game()

    id = request.args.get('id')
    card = request.args.get('card')
    if id and card:
        for p in game.players:
            if p.id == id:
                for c in p.cards:
                    if c.path == card:
                        for pc in range(0, len(p.cards)):
                            if p.cards[pc].path == card:
                                del p.cards[pc]
                                break

                        format = card.split('.')
                        format = format[len(format) - 1]

                        path = ''
                        if (format == 'gif'):
                            path = '/static/memes/gif/'
                        else:
                            path = '/static/memes/img/'
                        return render_template('show.html', card=(path + card))

        return redirect('/')
    else:
        return redirect('/')


@app.route('/getvote')
def gv():
    game = get_game()

    id = request.args.get('id')
    if id:
        if len(game.players) == len(game.rounds[-1]['picks']):
            for p in game.players:
                if len(p.cards) < game.options['cards_count']:
                    for allcard in game.assets['cards']:
                        if not allcard.owner:
                            allcard.owner = p.id
                            allcard.owner_name = p.name
                            p.cards.append(allcard)
                            break

            return "started"
        else:
            return "not"
    else:
        return redirect('/')


@app.route('/vote')
def vote():
    game = get_game()

    id = request.args.get('id')
    if id:
        for p in game.players:
            if p.id == id:
                inner = ''
                for r in game.rounds[-1]['picks']:
                    format = r['card'].split('.')
                    format = format[len(format) - 1]

                    path = ''
                    if (format == 'gif'):
                        path = '/static/memes/gif/'
                    else:
                        path = '/static/memes/img/'
                    inner += f'<div class="container"><div>{r["name"]}:</div><div class="overlay" hidden id="{r["id"]}" onclick="$(\'#{r["id"]}\').hide();"><input type="button" class="overlaybtn" style="background-color: darkgreen;" onclick="location.href=\'/sendvote?id={id}&vid={r["id"]}\';" value="Выбрать" /></div><img src="{path + r["card"]}" onclick="$(\'#{r["id"]}\').show();"/></div>'
                return render_template('vote.html', body=inner)
        return redirect('/join?clear=true')
    else:
        return redirect('/')


@app.route('/sendvote')
def sendvote():
    game = get_game()

    id = request.args.get('id')
    vid = request.args.get('vid')
    if id and vid:
        for v in game.rounds[-1]['voted']:
            if v == id:
                return redirect(f'/client?id={id}')
        game.rounds[-1]['voted'].append(id)
        for r in game.rounds[-1]['picks']:
            if r['id'] == vid:
                r['points'] += 1
                break
        return redirect(f'/client?id={id}')
    else:
        return redirect('/')


@app.route('/allvoted')
def allvote():
    game = get_game()

    if game.rounds[-1]['votd'] or len(game.rounds[-1]['voted']) == len(game.players):
        game.rounds[-1]['votd'] = True
        return 'yes'
    else:
        return 'no'


@app.route('/round')
def ar():
    game = get_game()

    return jsonify(game.rounds[-1]['voted'])


@app.route('/getjround')
def arj():
    game = get_game()

    return jsonify(game.rounds[-1]['picks'])


@app.route('/create')
def create():
    game = Game()
    generate(game)
    games.append(game)

    return redirect('/board')


@app.route('/board')
def board():
    return render_template('board.html')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/rules')
def rules():
    return render_template('rules.html')


if __name__ == '__main__':
    try:
        try:
            app.run(threaded=True, debug=True, use_reloader=False, host='0.0.0.0', port=8000)
        except Exception:
            app.run(threaded=True, debug=True, use_reloader=False, host='0.0.0.0', port=10000)
    except Exception:
        print('Server not started:')
        traceback.print_exc(file=sys.stdout)
