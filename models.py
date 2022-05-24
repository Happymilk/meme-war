import shortuuid
from enum import IntEnum


class GameStatus(IntEnum):
    NOT_STARTED = 0
    START = 1
    ROUND_START = 2
    PICK = 3
    VOTE_START = 4
    VOTE = 5
    VOTE_END = 6
    ROUND_END = 7
    FINISHED = 8


class PlayerStatus(IntEnum):
    DISCONNECTED = 0,
    CONNECTED = 1,
    SHOULD_PICK = 2,
    PICKED = 3,
    SHOULD_VOTE = 4,
    VOTED = 5,
    LOST = 6,
    WON = 7


class Player:
    def __init__(self, name):
        self.name = name
        self.id = shortuuid.uuid()
        self.points = 0
        self.status = PlayerStatus.CONNECTED
        self.cards = []

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'status': self.status,
            'points': self.points,
            'cards': [c.serialize() for c in self.cards]
        }


class Card:
    def __init__(self, path, fullpath):
        self.fullpath = fullpath
        self.path = path
        self.owner = None
        self.used = False

    def serialize(self):
        return {
            'fullpath': self.fullpath,
            'path': self.path,
            'owner': self.owner,
            'used': self.used
        }


class Game:
    def __init__(self):
        self.id = shortuuid.uuid()
        self.status = GameStatus.NOT_STARTED
        self.options = {
            'cards_count': 10,
            'tracktime': 0
        }
        self.music = {
            'tracks': [],
            'vote_start': [],
            'vote_end': []
        }
        self.motivation = {
            'pics': [],
            'names': []
        }
        self.assets = {
            'cards': [],
            'captions': []
        }
        self.players = []
        self.rounds = []
        self.last = {
            'start': -1,
            'end': -1,
            'track': -1,
            'caption': -1,
            'timer': 0,
            'endtimer': 0
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
