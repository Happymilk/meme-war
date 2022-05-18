import shortuuid
from enum import Enum


class GameStatus(Enum):
    NOT_STARTED = 0
    PICK = 1
    VOTE = 2
    FINISHED = 3



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
        self.cc = 10
        self.players = []
        self.vote_start = []
        self.vote_end = []
        self.music = []
        self.cards = []
        self.capt = []
        self.captions = []
        self.last_action = ''
        self.rounds = []
        self.last_start = -1
        self.last_end = -1
        self.last_cap = -1
        self.last_track = -1
        self.voted = None
        self.votd = True

