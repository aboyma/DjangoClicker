from rest_framework import serializers

from .models import User, MainCycle, Boost


class UserSerializerDetail(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'cycle']


class CycleSerializerDetail(serializers.ModelSerializer):
    class Meta:
        model = MainCycle
        fields = ['id', 'user', 'coinsCount', 'clickPower', 'boosts']


class BoostSerializerDetail(serializers.ModelSerializer):
    class Meta:
        model = Boost
        fields = ['level', 'power', 'price', 'boost_type']
