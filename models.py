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
            'name': self.name,
            'points': self.points
        }


class Card:
    def __init__(self, path):
        self.path = path
        self.owner = None
        self.owner_name = ''

    def serialize(self):
        return {
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
