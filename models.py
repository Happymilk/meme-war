import shortuuid


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
