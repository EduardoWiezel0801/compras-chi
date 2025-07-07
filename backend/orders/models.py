from django.db import models
from datetime import date

class Supplier(models.Model):
    """Modelo para fornecedores"""
    code = models.CharField(max_length=20, unique=True, verbose_name="Código")
    name = models.CharField(max_length=200, verbose_name="Razão Social")
    
    class Meta:
        verbose_name = "Fornecedor"
        verbose_name_plural = "Fornecedores"
    
    def __str__(self):
        return f"{self.code} - {self.name}"

class PurchaseOrder(models.Model):
    """Modelo para pedidos de compra"""
    
    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('PARCIAL', 'Parcial'),
        ('FINALIZADO', 'Finalizado'),
    ]
    
    number = models.CharField(max_length=20, unique=True, verbose_name="Número do Pedido")
    issue_date = models.DateField(verbose_name="Data de Emissão")
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, verbose_name="Fornecedor")
    followup_date = models.DateField(verbose_name="Data de Followup")
    warehouse = models.CharField(max_length=10, verbose_name="Armazém")
    items_count = models.IntegerField(verbose_name="Quantidade de Itens")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDENTE', verbose_name="Status")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Pedido de Compra"
        verbose_name_plural = "Pedidos de Compra"
        ordering = ['followup_date', 'number']
    
    def __str__(self):
        return f"PC {self.number} - {self.supplier.name}"
    
    @property
    def delay_days(self):
        """Calcula dias de atraso"""
        if self.followup_date < date.today():
            return (date.today() - self.followup_date).days
        return 0
    
    @property
    def is_today(self):
        """Verifica se é previsto para hoje"""
        return self.followup_date == date.today()
    
    @property
    def is_tomorrow(self):
        """Verifica se é previsto para amanhã"""
        from datetime import timedelta
        return self.followup_date == date.today() + timedelta(days=1)
    
    @property
    def is_delayed(self):
        """Verifica se está atrasado"""
        return self.followup_date < date.today()

class DeliveryReceipt(models.Model):
    """Modelo para recebimentos/entregas"""
    
    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('FINALIZADO', 'Finalizado'),
    ]
    
    cargo_number = models.CharField(max_length=20, verbose_name="Número da Carga")
    manifest_date = models.DateField(verbose_name="Data do Manifesto")
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, verbose_name="Fornecedor")
    invoice_number = models.CharField(max_length=20, verbose_name="Número da Nota")
    issue_date = models.DateField(verbose_name="Data de Emissão")
    manifest_time = models.TimeField(null=True, blank=True, verbose_name="Hora do Manifesto")
    entry_time = models.TimeField(null=True, blank=True, verbose_name="Hora de Entrada")
    exit_time = models.TimeField(null=True, blank=True, verbose_name="Hora de Saída")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDENTE', verbose_name="Status")
    
    class Meta:
        verbose_name = "Recebimento"
        verbose_name_plural = "Recebimentos"
        ordering = ['-manifest_date']
    
    def __str__(self):
        return f"Carga {self.cargo_number} - {self.supplier.name}"

