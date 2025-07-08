from django.urls import path
from . import views

urlpatterns = [
    # Pedidos de compra
    path('orders/', views.PurchaseOrderListView.as_view(), name='order-list'),
    path('orders/<int:pk>/', views.PurchaseOrderDetailView.as_view(), name='order-detail'),
    
    # Fornecedores
    path('suppliers/', views.SupplierListView.as_view(), name='supplier-list'),
    
    # Recebimentos
    path('deliveries/', views.DeliveryReceiptListView.as_view(), name='delivery-list'),
    
    # Estatísticas do dashboard
    path('stats/', views.dashboard_stats, name='dashboard-stats'),
    
    # Health check
    path('health/', views.health_check, name='health-check'),
]

