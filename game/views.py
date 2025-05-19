from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Score
from django.contrib.auth.models import User
from django.contrib.auth import login
from django.contrib.auth.forms import AuthenticationForm

def index(request):
    if request.user.is_authenticated:
        return redirect('game:play')
    return render(request, 'game/index.html')

@login_required(login_url='/accounts/login/')
def play(request):
    return render(request, 'game/play.html')

@login_required(login_url='/accounts/login/')
def leaderboard(request):
    scores = Score.objects.all()[:10]  # Get top 10 scores
    return render(request, 'game/leaderboard.html', {'scores': scores})

@login_required(login_url='/accounts/login/')
def save_score(request):
    if request.method == 'POST':
        score_value = int(request.POST.get('score', 0))
        Score.objects.create(player=request.user, score=score_value)
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'}, status=400) 