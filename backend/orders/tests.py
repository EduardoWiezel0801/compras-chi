from django.test import TestCase
from datetime import date, timedelta
from .models import Supplier, PurchaseOrder, DeliveryReceipt


class SupplierModelTest(TestCase):
    """Testes para o modelo Supplier"""
    
    def setUp(self):
        self.supplier = Supplier.objects.create(
            code="FOR001",
            name="Fornecedor Teste LTDA"
        )
    
    def test_supplier_creation(self):
        """Testa criação de fornecedor"""
        self.assertEqual(self.supplier.code, "FOR001")
        self.assertEqual(self.supplier.name, "Fornecedor Teste LTDA")
    
    def test_supplier_str(self):
        """Testa representação string do fornecedor"""
        expected = "FOR001 - Fornecedor Teste LTDA"
        self.assertEqual(str(self.supplier), expected)


class PurchaseOrderModelTest(TestCase):
    """Testes para o modelo PurchaseOrder"""
    
    def setUp(self):
        self.supplier = Supplier.objects.create(
            code="FOR001",
            name="Fornecedor Teste LTDA"
        )
        self.purchase_order = PurchaseOrder.objects.create(
            number="PC2024001",
            issue_date=date.today(),
            supplier=self.supplier,
            items_count=10,
            followup_date=date.today() + timedelta(days=7),
            warehouse="01",
            status="PENDENTE"
        )
    
    def test_purchase_order_creation(self):
        """Testa criação de pedido de compra"""
        self.assertEqual(self.purchase_order.number, "PC2024001")
        self.assertEqual(self.purchase_order.supplier, self.supplier)
        self.assertEqual(self.purchase_order.status, "PENDENTE")
    
    def test_purchase_order_str(self):
        """Testa representação string do pedido"""
        expected = "PC PC2024001 - Fornecedor Teste LTDA"
        self.assertEqual(str(self.purchase_order), expected)
    
    def test_is_delayed_property(self):
        """Testa propriedade is_delayed"""
        # Pedido não atrasado
        self.assertFalse(self.purchase_order.is_delayed)
        
        # Pedido atrasado
        self.purchase_order.followup_date = date.today() - timedelta(days=1)
        self.purchase_order.save()
        self.assertTrue(self.purchase_order.is_delayed)
    
    def test_delay_days_property(self):
        """Testa propriedade delay_days"""
        # Pedido não atrasado
        self.assertEqual(self.purchase_order.delay_days, 0)
        
        # Pedido atrasado por 3 dias
        self.purchase_order.followup_date = date.today() - timedelta(days=3)
        self.purchase_order.save()
        self.assertEqual(self.purchase_order.delay_days, 3)


class DeliveryReceiptModelTest(TestCase):
    """Testes para o modelo DeliveryReceipt"""
    
    def setUp(self):
        self.supplier = Supplier.objects.create(
            code="FOR001",
            name="Fornecedor Teste LTDA"
        )
        self.delivery = DeliveryReceipt.objects.create(
            cargo_number="CG001",
            manifest_date=date.today(),
            supplier=self.supplier,
            invoice_number="NF001",
            issue_date=date.today(),
            status="PENDENTE"
        )
    
    def test_delivery_creation(self):
        """Testa criação de recebimento"""
        self.assertEqual(self.delivery.cargo_number, "CG001")
        self.assertEqual(self.delivery.supplier, self.supplier)
        self.assertEqual(self.delivery.status, "PENDENTE")
    
    def test_delivery_str(self):
        """Testa representação string do recebimento"""
        expected = "Carga CG001 - Fornecedor Teste LTDA"
        self.assertEqual(str(self.delivery), expected)


class BasicIntegrationTest(TestCase):
    """Testes básicos de integração"""
    
    def test_full_workflow(self):
        """Testa fluxo básico: criar fornecedor -> pedido -> recebimento"""
        
        # 1. Criar fornecedor
        supplier = Supplier.objects.create(
            code="FOR999",
            name="Fornecedor Integração LTDA"
        )
        
        # 2. Criar pedido
        purchase_order = PurchaseOrder.objects.create(
            number="PC2024999",
            issue_date=date.today(),
            supplier=supplier,
            items_count=20,
            followup_date=date.today() + timedelta(days=5),
            warehouse="03",
            status="PENDENTE"
        )
        
        # 3. Criar recebimento
        delivery = DeliveryReceipt.objects.create(
            cargo_number="CG999",
            manifest_date=date.today(),
            supplier=supplier,
            invoice_number="NF999",
            issue_date=date.today(),
            status="FINALIZADO"
        )
        
        # Verificações
        self.assertEqual(Supplier.objects.count(), 1)
        self.assertEqual(PurchaseOrder.objects.count(), 1)
        self.assertEqual(DeliveryReceipt.objects.count(), 1)
        
        # Verificar relacionamentos
        self.assertEqual(purchase_order.supplier, supplier)
        self.assertEqual(delivery.supplier, supplier)

