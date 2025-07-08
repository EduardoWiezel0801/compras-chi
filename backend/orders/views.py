from rest_framework import generics, filters
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from datetime import date, timedelta
from .models import PurchaseOrder, Supplier, DeliveryReceipt
from .serializers import PurchaseOrderSerializer, SupplierSerializer, DeliveryReceiptSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 11
    page_size_query_param = 'page_size'
    max_page_size = 100

class PurchaseOrderListView(generics.ListAPIView):
    queryset = PurchaseOrder.objects.select_related('fornecedor').all()
    serializer_class = PurchaseOrderSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'fornecedor__code', 'armazenamento']
    search_fields = ['numero_pc', 'fornecedor__name', 'fornecedor__code']
    ordering_fields = ['data_emissao', 'followup_date', 'numero_pc']
    ordering = ['-data_emissao']

class PurchaseOrderDetailView(generics.RetrieveAPIView):
    queryset = PurchaseOrder.objects.select_related('fornecedor').all()
    serializer_class = PurchaseOrderSerializer

class SupplierListView(generics.ListAPIView):
    queryset = Supplier.objects.filter(status='ATIVO').order_by('name')
    serializer_class = SupplierSerializer

class DeliveryReceiptListView(generics.ListAPIView):
    queryset = DeliveryReceipt.objects.select_related('supplier').all()
    serializer_class = DeliveryReceiptSerializer
    pagination_class = StandardResultsSetPagination

@api_view(['GET'])
def dashboard_stats(request):
    """Endpoint para estatísticas do dashboard"""
    today = date.today()
    tomorrow = today + timedelta(days=1)
    
    # Pedidos previstos para hoje
    previsto_hoje = PurchaseOrder.objects.filter(
        followup_date=today,
        status__in=['PENDENTE', 'PARCIAL']
    ).count()
    
    # Pedidos atrasados
    atrasada = PurchaseOrder.objects.filter(
        followup_date__lt=today,
        status__in=['PENDENTE', 'PARCIAL']
    ).count()
    
    # Pedidos previstos para amanhã
    previsto_amanha = PurchaseOrder.objects.filter(
        followup_date=tomorrow,
        status__in=['PENDENTE', 'PARCIAL']
    ).count()
    
    # Recebimentos finalizados hoje
    finalizado = DeliveryReceipt.objects.filter(
        manifest_date=today,
        status='FINALIZADO'
    ).count()
    
    return Response({
        'previsto_hoje': previsto_hoje,
        'atrasada': atrasada,
        'previsto_amanha': previsto_amanha,
        'finalizado': finalizado,
        'data_atualizacao': today.isoformat()
    })

@api_view(['GET'])
def health_check(request):
    """Health check para monitoramento"""
    try:
        # Verificar conectividade com banco
        count = PurchaseOrder.objects.count()
        
        return Response({
            'status': 'healthy',
            'database': 'connected',
            'total_orders': count,
            'timestamp': date.today().isoformat()
        })
    except Exception as e:
        return Response({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': date.today().isoformat()
        }, status=500)