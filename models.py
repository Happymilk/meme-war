import shortuuid
from enum import Enum


class GameStatus(Enum):
    NOT_STARTED = 0
    PICK = 1
    VOTE = 2
    ROUND = 3
    FINISHED = 4


class Player:
    def __init__(self, name):
        self.name = name
        self.id = shortuuid.uuid()
        self.points = 0
        self.cards = []

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'points': self.points,
            'cards': [c.serialize() for c in self.cards]
        }


class Card:
    def __init__(self, path, fullpath):
        self.fullpath = fullpath
        self.path = path
        self.owner = None
        self.owner_name = ''

    def serialize(self):
        return {
            'fullpath': self.fullpath,
            'path': self.path,
            'owner': self.owner,
            'name': self.owner_name
        }


class Game:
    def __init__(self):
        self.id = shortuuid.uuid()
        self.status = GameStatus.NOT_STARTED
        self.options = {
            'cards_count': 10
        }
        self.music = {
            'tracks': [],
            'vote_start': [],
            'vote_end': []
        }
        self.assets = {
            'cards': [],
            'captions': []
        }
        self.players = []
        self.rounds = [{
            'caption': '',
            'picks': [],
            'voted': None,
            'votd': True
        }]
        self.last = {
            'action': '',
            'start': -1,
            'end': -1,
            'track': -1,
            'caption': -1
        }

    def serialize(self):
        return {
            'id': self.id,
            'status': str(self.status),
            'options': self.options,
            'last': self.last,
            'players': [p.serialize() for p in self.players],
            'rounds': self.rounds,
            'assets': {
                'cards': [c.serialize() for c in self.assets['cards']],
                'captions': self.assets['captions']
            },
            'music': self.music
        }
