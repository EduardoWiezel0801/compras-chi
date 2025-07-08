from django.contrib import admin
from .models import Supplier, PurchaseOrder, DeliveryReceipt

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'status']
    list_filter = ['status']
    search_fields = ['code', 'name']


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ['numero_pc', 'fornecedor', 'data_emissao', 'followup_date', 'status', 'is_delayed']
    list_filter = ['status', 'fornecedor', 'armazenamento']
    search_fields = ['numero_pc', 'fornecedor__name']
    date_hierarchy = 'data_emissao'

    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('supplier')

@admin.register(DeliveryReceipt)
class DeliveryReceiptAdmin(admin.ModelAdmin):
    list_display = ['cargo_number', 'supplier', 'manifest_date', 'status']
    list_filter = ['status', 'supplier']
    search_fields = ['cargo_number', 'invoice_number']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('supplier')

