from django.urls import path

from api.views import (
    AlertsView,
    ChatbotView,
    DashboardView,
    EnrichmentView,
    EvidenceDeleteView,
    EvidenceListCreateView,
    AuthHealthView,
    HealthCheckView,
    HeatmapView,
    NewsView,
    PanicView,
    ProfileView,
    ReportDetailView,
    ReportsListCreateView,
    StoriesListCreateView,
    SubmitReportView,
    ScanView,
    ThreatCheckDetailView,
    ThreatCheckView,
)
from api.views.auth_views import SignupView, LoginView, LogoutView, PasswordResetView
from api.views.crime_views import IndiaCrimeStatsView, CertInAlertsView, CombinedDashboardView

urlpatterns = [
    path('', HealthCheckView.as_view()),
    path('health/auth/', AuthHealthView.as_view()),

    # Authentication endpoints
    path('auth/signup/', SignupView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/logout/', LogoutView.as_view()),
    path('auth/password-reset/', PasswordResetView.as_view()),
    path('auth/profile/', ProfileView.as_view()),

    path('threat-check/', ThreatCheckView.as_view()),
    path('scan/', ScanView.as_view()),
    path('threat-check/<uuid:id>/', ThreatCheckDetailView.as_view()),
    path('threat-check/<uuid:id>/enrichment/', EnrichmentView.as_view()),

    path('reports/', ReportsListCreateView.as_view()),
    path('reports/create/', ReportsListCreateView.as_view()),
    path('reports/submit/', SubmitReportView.as_view()),
    path('reports/<uuid:id>/', ReportDetailView.as_view()),

    path('alerts/', AlertsView.as_view()),
    path('heatmap/', HeatmapView.as_view()),
    path('dashboard/', DashboardView.as_view()),
    path('news/', NewsView.as_view()),
    
    # India Crime Data & CERT-In APIs
    path('crime-stats/', IndiaCrimeStatsView.as_view()),
    path('live-alerts/', CertInAlertsView.as_view()),
    path('dashboard-combined/', CombinedDashboardView.as_view()),

    # Evidence Vault (frontend posts multipart to this route)
    path('evidence/', EvidenceListCreateView.as_view()),
    path('evidence/create/', EvidenceListCreateView.as_view()),
    path('evidence/<uuid:id>/', EvidenceDeleteView.as_view()),

    path('panic/', PanicView.as_view()),

    path('stories/', StoriesListCreateView.as_view()),
    path('stories/create/', StoriesListCreateView.as_view()),

    # Women Safety companion (frontend uses /support-chat)
    path('support-chat/', ChatbotView.as_view()),
    # Back-compat alias for tests/mocks
    path('chatbot/', ChatbotView.as_view()),
]
