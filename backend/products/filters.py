import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    """Filter for Product with date range support on created_at and updated_at."""
    created_after = django_filters.DateFilter(field_name='created_at', lookup_expr='date__gte')
    created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='date__lte')
    updated_after = django_filters.DateFilter(field_name='updated_at', lookup_expr='date__gte')
    updated_before = django_filters.DateFilter(field_name='updated_at', lookup_expr='date__lte')

    class Meta:
        model = Product
        fields = ['category', 'is_active', 'product_type', 'brand']
