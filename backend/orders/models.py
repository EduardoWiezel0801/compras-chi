from django.db import models
from datetime import date, timedelta

class Supplier(models.Model):
    code = models.CharField(max_length=10, unique=True, verbose_name="Código")
    name = models.CharField(max_length=100, verbose_name="Razão Social")
    status = models.CharField(max_length=10, choices=[('ATIVO', 'Ativo'), ('INATIVO', 'Inativo')], default='ATIVO', verbose_name="Status")
    
    class Meta:
        verbose_name = "Fornecedor"
        verbose_name_plural = "Fornecedores"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"

class PurchaseOrder(models.Model):
    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('PARCIAL', 'Parcial'),
        ('FINALIZADO', 'Finalizado'),
        ('CANCELADO', 'Cancelado'),
    ]
    
    numero_pc = models.CharField(max_length=20, unique=True, verbose_name="Número PC")
    data_emissao = models.DateField(verbose_name="Data de Emissão")
    fornecedor = models.ForeignKey(Supplier, on_delete=models.CASCADE, verbose_name="Fornecedor")
    quantidade_itens = models.IntegerField(verbose_name="Quantidade de Itens")
    followup_date = models.DateField(verbose_name="Data de Follow-up")
    armazenamento = models.CharField(max_length=5, verbose_name="Armazenamento")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDENTE', verbose_name="Status")
    
    class Meta:
        verbose_name = "Pedido de Compra"
        verbose_name_plural = "Pedidos de Compra"
        ordering = ['-data_emissao']
    
    def __str__(self):
        return f"{self.numero_pc} - {self.fornecedor.name}"
    
    @property
    def is_delayed(self):
        """Verifica se o pedido está atrasado"""
        return self.followup_date < date.today() and self.status != 'FINALIZADO'
    
    @property
    def delay_days(self):
        """Retorna quantidade de dias de atraso"""
        if self.is_delayed:
            return (date.today() - self.followup_date).days
        return 0
    
    @property
    def atraso(self):
        """Compatibilidade com frontend"""
        return self.delay_days

class DeliveryReceipt(models.Model):
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
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Pedido de Compra")
    
    class Meta:
        verbose_name = "Recebimento"
        verbose_name_plural = "Recebimentos"
        ordering = ['-manifest_date']
    
    def __str__(self):
        return f"Carga {self.cargo_number} - {self.supplier.name}"