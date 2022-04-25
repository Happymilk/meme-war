import traceback
import sys
import os
import random
from flask import Flask, render_template, request, jsonify, redirect
from models import Player, Card


started = False
cc = 10
players = []
vote_start = []
vote_end = []
music = []
memes = []
cards = []
capt = []
captions = []
last_action = ''

round = []
last_start = -1
last_end = -1
last_cap = -1
last_track = -1
voted = None
votd = True

app = Flask(__name__)


def generate():
    global vote_start, vote_end, memes, cards, captions, capt, music

    vote_start = os.listdir('./static/music/vote/start')
    vote_end = os.listdir('./static/music/vote/end')

    music = os.listdir('./static/music/back/')

    memes = os.listdir('./static/memes/gif')
    memes += os.listdir('./static/memes/img')
    for m in memes:
        cards.append(Card(m))
    memes = None

    with open("./static/memes/captions.txt", 'r', encoding='utf8') as f:
        capt = f.readlines()
        f.close()

    for c in capt:
        captions.append({'text': c, 'used': False})
    capt = ''


@app.route('/winner')
def get_winner():
    score = [0, '']
    for r in round:
        if r['points'] > score[0]:
            score = []
            score.append(r['points'])
            score.append(r['id'])
        elif score[0] == r['points']:
            score.append(r['id'])

    win = 'Раунд за: '
    ppp = ''
    for p in players:
        for s in range(1, len(score)):
            if p.id == score[s]:
                for r in round:
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
    global capt
    if capt == '':
        global last_cap
        last_cap += 1
        if last_cap == len(captions):
            for c in captions:
                c['used'] = False
            last_cap = 0

        captions[last_cap]['used'] = True
        capt = captions[last_cap]['text']
        return captions[last_cap]['text']
    else:
        return capt


@app.route('/getround')
def get_round():
    action = ''
    global last_action

    if started and len(players) == len(round):
        if allvote() == 'yes':
            action = 'end_vote'
        else:
            action = 'start_vote'
    else:
        action = ''

    if action != last_action:
        last_action = action
        return action
    else:
        return ''


@app.route('/mvs')
def mvs():
    return f'./static/music/vote/start/{vote_start[last_start]}'


@app.route('/mve')
def mve():
    return f'./static/music/vote/end/{vote_end[last_end]}'


@app.route('/mvt')
def mvt():
    global last_track

    last_track += 1
    if last_track >= len(music):
        last_track = 0

    return f'./static/music/back/{music[last_track]}'


@app.route('/players')
def get_players():
    return jsonify([p.serialize() for p in players])


@app.route('/start')
def start():
    global cards, started, cc, players, votd

    s = request.args.get('start')
    ccc = request.args.get('cc')
    if s and ccc:
        started = True
        random.shuffle(cards)
        random.shuffle(captions)
        cc = int(ccc)
        votd = True
        for p in players:
            for count in range(0, cc):
                for c in cards:
                    if not c.owner:
                        c.owner = p.id
                        c.owner_name = p.name
                        p.cards.append(c)
                        break

        return 'started'
    else:
        if started:
            return 'started'

        return 'not'


@app.route('/reset')
def reset():
    global vote_start, vote_end, round, last_start, last_end, voted, capt

    round = []

    last_start += 1
    if last_start == len(vote_start):
        last_start = 0

    last_end += 1
    if last_end == len(vote_end):
        last_end = 0

    voted = []

    capt = ''

    return 'reseted'


@app.route('/join')
def join():
    name = request.args.get('name')
    if name:
        if not started:
            for p in players:
                if p.name == name:
                    return redirect(f'/check?id={p.id}')

            player = Player(name)
            players.append(player)
            return redirect(f'/check?id={player.id}')
        else:
            return redirect('/')
    else:
        return render_template('join.html')


@app.route('/get')
def get():
    id = request.args.get('id')
    if id:
        for p in players:
            if p.id == id:
                return jsonify([c.serialize() for c in p.cards])

        return redirect('/')
    else:
        return redirect('/')


@app.route('/check')
def check():
    id = request.args.get('id')
    if id:
        for p in players:
            if p.id == id:
                return redirect(f'/client?id={id}')

        return redirect('/join?clear=true')
    else:
        return redirect('/')


@app.route('/client')
def client():
    id = request.args.get('id')
    if id:
        for p in players:
            if p.id == id:
                return render_template('client.html')

        return redirect(f'/check?id={id}')
    else:
        return redirect('/')


@app.route('/send')
def send():
    id = request.args.get('id')
    card = request.args.get('card')
    if id and card:
        global votd
        if votd:
            votd = False
        for p in players:
            if p.id == id:
                for c in p.cards:
                    if c.path == card:
                        for rp in round:
                            if rp['id'] == id:
                                return redirect('/')

                        round.append({
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
    id = request.args.get('id')
    card = request.args.get('card')
    if id and card:
        for p in players:
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
    id = request.args.get('id')
    if id:
        if len(players) == len(round):
            for p in players:
                if len(p.cards) < cc:
                    for allcard in cards:
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
    id = request.args.get('id')
    if id:
        for p in players:
            if p.id == id:
                inner = ''
                for r in round:
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
    id = request.args.get('id')
    vid = request.args.get('vid')
    if id and vid:
        for v in voted:
            if v == id:
                return redirect(f'/client?id={id}')
        voted.append(id)
        for r in round:
            if r['id'] == vid:
                r['points'] += 1
                break
        return redirect(f'/client?id={id}')
    else:
        return redirect('/')


@app.route('/allvoted')
def allvote():
    global votd
    if votd or len(voted) == len(players):
        votd = True
        return 'yes'
    else:
        return 'no'


@app.route('/round')
def ar():
    return jsonify(voted)


@app.route('/getjround')
def arj():
    return jsonify(round)


@app.route('/create')
def create():
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
        generate()

        try:
            app.run(threaded=True, debug=True, use_reloader=False, host='0.0.0.0', port=80)
        except Exception:
            app.run(threaded=True, debug=True, use_reloader=False, host='0.0.0.0', port=10000)
    except Exception:
        print('Server not started:')
        traceback.print_exc(file=sys.stdout)
