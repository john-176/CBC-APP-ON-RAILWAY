from django.shortcuts import render

# Create your views here.
# frontend/views.py
from django.views.generic import TemplateView

class FrontendView(TemplateView):
    template_name = 'frontend/index.html'  # Points to your built React index.html