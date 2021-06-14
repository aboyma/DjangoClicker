from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import render, redirect

from users.forms import UserForm
from users.models import MainCycle


def index(request):
    user = User.objects.filter(id=request.user.id)
    if len(user) != 0:
        main_cycle = MainCycle.objects.get(user=request.user)
        return render(request, 'index.html', {'mainCycle': main_cycle})
    return redirect('login')


def user_login(request):
    if request.method == "POST":
        user = authenticate(request, username=request.POST["username"], password=request.POST["password"])
        if user is not None:
            login(request, user)
            return redirect('index')
        return redirect('login')
    return render(request, 'login.html')


def user_logout(request):
    logout(request)
    return redirect('login')


def user_registration(request):
    if request.method == "POST":
        form = UserForm(request.POST)
        if form.is_valid():
            user = form.save()
            mainCycle = MainCycle()
            mainCycle.user = user
            mainCycle.save()
            user = authenticate(request, username=request.POST['username'], password=request.POST['password'])
            login(request, user)
            return redirect('index')
        return render(request, 'registration.html', {'invalid': True, 'form': form})
    form = UserForm()
    return render(request, 'registration.html', {'invalid': False, 'form': form})
