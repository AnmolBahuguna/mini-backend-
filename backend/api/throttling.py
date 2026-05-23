from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

class AnonThreatCheckThrottle(AnonRateThrottle):
    scope = 'anon_threat'
    rate = '200/hour'

class AuthThreatCheckThrottle(UserRateThrottle):
    scope = 'auth_threat'
    rate = '1000/hour'
