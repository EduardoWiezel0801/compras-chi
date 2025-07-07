from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Q
from datetime import date, timedelta
from .models import PurchaseOrder, Supplier, DeliveryReceipt
from .serializers import (
    PurchaseOrderSerializer, 
    SupplierSerializer, 
    DeliveryReceiptSerializer,
    DashboardStatsSerializer
)

class PurchaseOrderListView(generics.ListCreateAPIView):
    """Lista e cria pedidos de compra"""
    queryset = PurchaseOrder.objects.select_related('supplier').all()
    serializer_class = PurchaseOrderSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros opcionais
        status_filter = self.request.query_params.get('status', None)
        supplier_filter = self.request.query_params.get('supplier', None)
        date_filter = self.request.query_params.get('date', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if supplier_filter:
            queryset = queryset.filter(supplier__code=supplier_filter)
        
        if date_filter == 'today':
            queryset = queryset.filter(followup_date=date.today())
        elif date_filter == 'tomorrow':
            queryset = queryset.filter(followup_date=date.today() + timedelta(days=1))
        elif date_filter == 'delayed':
            queryset = queryset.filter(followup_date__lt=date.today())
        
        return queryset

class PurchaseOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detalha, atualiza e deleta pedido de compra"""
    queryset = PurchaseOrder.objects.select_related('supplier').all()
    serializer_class = PurchaseOrderSerializer

class SupplierListView(generics.ListCreateAPIView):
    """Lista e cria fornecedores"""
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class DeliveryReceiptListView(generics.ListCreateAPIView):
    """Lista e cria recebimentos"""
    queryset = DeliveryReceipt.objects.select_related('supplier').all()
    serializer_class = DeliveryReceiptSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrar apenas recebimentos de hoje por padrão
        today_filter = self.request.query_params.get('today', 'true')
        if today_filter.lower() == 'true':
            queryset = queryset.filter(manifest_date=date.today())
        
        return queryset

@api_view(['GET'])
def dashboard_stats(request):
    """Retorna estatísticas para o dashboard"""
    today = date.today()
    tomorrow = today + timedelta(days=1)
    
    # Contadores de pedidos
    previsto_hoje = PurchaseOrder.objects.filter(
        followup_date=today,
        status__in=['PENDENTE', 'PARCIAL']
    ).count()
    
    atrasada = PurchaseOrder.objects.filter(
        followup_date__lt=today,
        status__in=['PENDENTE', 'PARCIAL']
    ).count()
    
    previsto_amanha = PurchaseOrder.objects.filter(
        followup_date=tomorrow,
        status__in=['PENDENTE', 'PARCIAL']
    ).count()
    
    # Recebimentos finalizados hoje
    finalizado = DeliveryReceipt.objects.filter(
        manifest_date=today,
        status='FINALIZADO'
    ).count()
    
    stats = {
        'previsto_hoje': previsto_hoje,
        'atrasada': atrasada,
        'previsto_amanha': previsto_amanha,
        'finalizado': finalizado
    }
    
    serializer = DashboardStatsSerializer(stats)
    return Response(serializer.data)

@api_view(['GET'])
def health_check(request):
    """Endpoint para verificar saúde da API"""
    return Response({
        'status': 'healthy',
        'timestamp': date.today().isoformat(),
        'version': '1.0.0'
    })

