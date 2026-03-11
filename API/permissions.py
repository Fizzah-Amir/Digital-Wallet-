from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'person_type') and request.user.person_type == 'admin'

class IsMerchantUser(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'person_type') and request.user.person_type == 'merchant'

class IsRegularUser(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'person_type') and request.user.person_type == 'user'

class IsAdminOrUser(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'person_type') and request.user.person_type in ['admin', 'user']

class IsAdminOrMerchant(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'person_type') and request.user.person_type in ['admin', 'merchant']

class IsUserOrMerchant(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'person_type') and request.user.person_type in ['user', 'merchant']

class IsAnyRole(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'person_type') and request.user.person_type in ['admin', 'merchant', 'user']