from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', RedirectView.as_view(pattern_name='game:index'), name='home'),
    path('game/', include('game.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
] 