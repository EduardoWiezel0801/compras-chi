from rest_framework import serializers
from .models import PurchaseOrder, Supplier, DeliveryReceipt

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'code', 'name', 'status']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    fornecedor = SupplierSerializer(read_only=True)
    is_delayed = serializers.ReadOnlyField()
    delay_days = serializers.ReadOnlyField()
    atraso = serializers.ReadOnlyField()
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'numero_pc', 'data_emissao', 'fornecedor', 
            'quantidade_itens', 'followup_date', 'armazenamento', 
            'status', 'is_delayed', 'delay_days', 'atraso'
        ]

class DeliveryReceiptSerializer(serializers.ModelSerializer):
    supplier = SupplierSerializer(read_only=True)
    
    class Meta:
        model = DeliveryReceipt
        fields = [
            'id', 'cargo_number', 'manifest_date', 'supplier',
            'invoice_number', 'issue_date', 'manifest_time',
            'entry_time', 'exit_time', 'status'
        ]