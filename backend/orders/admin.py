from django.contrib import admin
from .models import Supplier, PurchaseOrder, DeliveryReceipt

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['code', 'name']
    search_fields = ['code', 'name']
    ordering = ['code']

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ['number', 'supplier', 'issue_date', 'followup_date', 'status', 'items_count']
    list_filter = ['status', 'issue_date', 'followup_date', 'warehouse']
    search_fields = ['number', 'supplier__name', 'supplier__code']
    ordering = ['followup_date', 'number']
    date_hierarchy = 'followup_date'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('supplier')

@admin.register(DeliveryReceipt)
class DeliveryReceiptAdmin(admin.ModelAdmin):
    list_display = ['cargo_number', 'supplier', 'manifest_date', 'invoice_number', 'status']
    list_filter = ['status', 'manifest_date']
    search_fields = ['cargo_number', 'invoice_number', 'supplier__name']
    ordering = ['-manifest_date']
    date_hierarchy = 'manifest_date'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('supplier')

