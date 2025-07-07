from rest_framework import serializers
from .models import PurchaseOrder, Supplier, DeliveryReceipt

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'code', 'name']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_code = serializers.CharField(source='supplier.code', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    delay_days = serializers.ReadOnlyField()
    is_today = serializers.ReadOnlyField()
    is_tomorrow = serializers.ReadOnlyField()
    is_delayed = serializers.ReadOnlyField()
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'number', 'issue_date', 'supplier', 'supplier_code', 
            'supplier_name', 'followup_date', 'warehouse', 'items_count', 
            'status', 'delay_days', 'is_today', 'is_tomorrow', 'is_delayed',
            'created_at', 'updated_at'
        ]

class DeliveryReceiptSerializer(serializers.ModelSerializer):
    supplier_code = serializers.CharField(source='supplier.code', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    
    class Meta:
        model = DeliveryReceipt
        fields = [
            'id', 'cargo_number', 'manifest_date', 'supplier', 'supplier_code',
            'supplier_name', 'invoice_number', 'issue_date', 'manifest_time',
            'entry_time', 'exit_time', 'status'
        ]

class DashboardStatsSerializer(serializers.Serializer):
    """Serializer para estatísticas do dashboard"""
    previsto_hoje = serializers.IntegerField()
    atrasada = serializers.IntegerField()
    previsto_amanha = serializers.IntegerField()
    finalizado = serializers.IntegerField()

