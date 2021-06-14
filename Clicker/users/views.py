from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import MainCycle, Boost
from .serializers import UserSerializerDetail, CycleSerializerDetail, BoostSerializerDetail


class BoostList(generics.ListAPIView):
    queryset = Boost
    serializer_class = BoostSerializerDetail

    def get_queryset(self):
        return Boost.objects.filter(mainCycle=self.kwargs['mainCycle'])


class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializerDetail


class CycleDetail(generics.RetrieveAPIView):
    queryset = MainCycle.objects.all()
    serializer_class = CycleSerializerDetail


@api_view(['GET'])
def call_click(request):
    cycle = MainCycle.objects.get(user=request.user)
    cycle.click()
    is_level_up = cycle.check_level_up()
    boosts = BoostSerializerDetail(Boost.objects.filter(mainCycle=cycle), many=True).data
    cycle.save()
    if is_level_up:
        return Response({"coinsCount": cycle.coinsCount,
                         "boosts": boosts})
    return Response({"coinsCount": cycle.coinsCount,
                     "boosts": None})


@api_view(['POST'])
def buy_boost(request):
    boost_level = request.data['boost_level']
    cycle = MainCycle.objects.get(user=request.user)
    boost = Boost.objects.get_or_create(mainCycle=cycle, level=boost_level)[0]
    cycle, level, price, power, boost_type = boost.upgrade()
    boost.save()
    return Response({'clickPower': cycle.clickPower,
                     'coinsCount': cycle.coinsCount,
                     'autoClickPower': cycle.autoClickPower,
                     'level': level,
                     'price': price,
                     'power': power,
                     'boost_type': boost_type})


@api_view(['POST'])
def set_main_cycle(request):
    MainCycle.objects.filter(user=request.user).update(coinsCount=request.data['coinsCount'])
    return Response({'success': 'ok'})
