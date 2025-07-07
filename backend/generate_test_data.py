#!/usr/bin/env python
"""
Gerador de dados para teste do sistema de pedidos de compra.
Este script cria dados realistas para demonstração e testes.
"""

import os
import sys
import django
from datetime import date, timedelta
import random
from faker import Faker

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from orders.models import Supplier, PurchaseOrder, DeliveryReceipt

# Configurar Faker para português brasileiro
fake = Faker('pt_BR')

class TestDataGenerator:
    """Gerador de dados de teste"""
    
    def __init__(self):
        self.suppliers = []
        self.purchase_orders = []
        self.deliveries = []
        
        # Dados realistas para fornecedores
        self.supplier_data = [
            ("FOR001", "ALPHA MATERIAIS INDUSTRIAIS LTDA"),
            ("FOR002", "BETA COMERCIAL E INDUSTRIAL S.A."),
            ("FOR003", "GAMMA DISTRIBUIDORA DE PRODUTOS"),
            ("FOR004", "DELTA MATERIAIS ELÉTRICOS LTDA"),
            ("FOR005", "EPSILON COMPONENTES ELETRÔNICOS"),
            ("FOR006", "ZETA FERRAMENTAS E EQUIPAMENTOS"),
            ("FOR007", "ETA PRODUTOS QUÍMICOS LTDA"),
            ("FOR008", "THETA MATERIAIS DE CONSTRUÇÃO"),
            ("FOR009", "IOTA EQUIPAMENTOS INDUSTRIAIS"),
            ("FOR010", "KAPPA PRODUTOS QUÍMICOS LTDA"),
            ("FOR011", "LAMBDA DISTRIBUIDORA GERAL"),
            ("FOR012", "MU MATERIAIS ESPECIAIS S.A."),
            ("FOR013", "NU COMPONENTES AUTOMOTIVOS"),
            ("FOR014", "XI FERRAMENTAS PROFISSIONAIS"),
            ("FOR015", "OMICRON EQUIPAMENTOS LTDA"),
        ]
        
        # Status possíveis
        self.status_options = ["PENDENTE", "PARCIAL", "FINALIZADO"]
        
        # Armazéns disponíveis
        self.storage_options = ["01", "02", "03", "04", "05"]
    
    def clear_existing_data(self):
        """Remove todos os dados existentes"""
        print("🗑️  Removendo dados existentes...")
        DeliveryReceipt.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        Supplier.objects.all().delete()
        print("✅ Dados removidos com sucesso!")
    
    def create_suppliers(self):
        """Cria fornecedores"""
        print("👥 Criando fornecedores...")
        
        for code, name in self.supplier_data:
            supplier = Supplier.objects.create(
                code=code,
                name=name,
                active=True
            )
            self.suppliers.append(supplier)
        
        print(f"✅ {len(self.suppliers)} fornecedores criados!")
    
    def create_purchase_orders(self, quantity=50):
        """Cria pedidos de compra"""
        print(f"📋 Criando {quantity} pedidos de compra...")
        
        today = date.today()
        
        for i in range(quantity):
            # Número do pedido sequencial
            number = f"PC2024{i+1:03d}"
            
            # Data de emissão (últimos 60 dias)
            issue_date = today - timedelta(days=random.randint(1, 60))
            
            # Fornecedor aleatório
            supplier = random.choice(self.suppliers)
            
            # Quantidade de itens (1-50)
            items_count = random.randint(1, 50)
            
            # Data de followup baseada na data de emissão
            days_ahead = random.randint(-5, 15)  # Pode ser atrasado ou futuro
            followup_date = today + timedelta(days=days_ahead)
            
            # Armazém aleatório
            warehouse = random.choice(self.storage_options)
            
            # Status baseado na data de followup
            if followup_date < today:
                # Pedidos atrasados têm maior chance de estar pendentes
                status = random.choices(
                    self.status_options,
                    weights=[70, 20, 10]  # 70% pendente, 20% parcial, 10% finalizado
                )[0]
            elif followup_date == today:
                # Pedidos de hoje
                status = random.choices(
                    self.status_options,
                    weights=[50, 30, 20]  # 50% pendente, 30% parcial, 20% finalizado
                )[0]
            else:
                # Pedidos futuros são principalmente pendentes
                status = random.choices(
                    self.status_options,
                    weights=[85, 10, 5]   # 85% pendente, 10% parcial, 5% finalizado
                )[0]
            
            purchase_order = PurchaseOrder.objects.create(
                number=number,
                issue_date=issue_date,
                supplier=supplier,
                items_count=items_count,
                followup_date=followup_date,
                warehouse=warehouse,
                status=status
            )
            
            self.purchase_orders.append(purchase_order)
        
        print(f"✅ {len(self.purchase_orders)} pedidos de compra criados!")
    
    def create_deliveries(self):
        """Cria recebimentos para alguns pedidos"""
        print("📦 Criando recebimentos...")
        
        # Criar alguns recebimentos básicos
        today = date.today()
        
        for i in range(5):
            supplier = random.choice(self.suppliers)
            
            delivery = DeliveryReceipt.objects.create(
                cargo_number=f"CG{i+1:03d}",
                manifest_date=today - timedelta(days=random.randint(0, 7)),
                supplier=supplier,
                invoice_number=f"NF{i+1:03d}",
                issue_date=today - timedelta(days=random.randint(0, 5)),
                status=random.choice(["PENDENTE", "FINALIZADO"])
            )
            
            self.deliveries.append(delivery)
        
        print(f"✅ {len(self.deliveries)} recebimentos criados!")
    
    def create_specific_scenarios(self):
        """Cria cenários específicos para demonstração"""
        print("🎯 Criando cenários específicos...")
        
        today = date.today()
        tomorrow = today + timedelta(days=1)
        yesterday = today - timedelta(days=1)
        
        # Cenário 1: Pedidos para hoje
        for i in range(5):
            supplier = random.choice(self.suppliers)
            PurchaseOrder.objects.create(
                number=f"PC2024T{i+1:02d}",
                issue_date=today - timedelta(days=random.randint(1, 10)),
                supplier=supplier,
                quantity_items=random.randint(5, 25),
                followup_date=today,
                storage=random.choice(self.storage_options),
                status="PENDENTE"
            )
        
        # Cenário 2: Pedidos atrasados
        for i in range(8):
            supplier = random.choice(self.suppliers)
            days_late = random.randint(1, 10)
            PurchaseOrder.objects.create(
                number=f"PC2024A{i+1:02d}",
                issue_date=today - timedelta(days=days_late + 5),
                supplier=supplier,
                quantity_items=random.randint(5, 30),
                followup_date=today - timedelta(days=days_late),
                storage=random.choice(self.storage_options),
                status="PENDENTE"
            )
        
        # Cenário 3: Pedidos para amanhã
        for i in range(3):
            supplier = random.choice(self.suppliers)
            PurchaseOrder.objects.create(
                number=f"PC2024M{i+1:02d}",
                issue_date=today - timedelta(days=random.randint(1, 5)),
                supplier=supplier,
                quantity_items=random.randint(3, 20),
                followup_date=tomorrow,
                storage=random.choice(self.storage_options),
                status="PENDENTE"
            )
        
        # Cenário 4: Recebimentos finalizados hoje
        for i in range(4):
            supplier = random.choice(self.suppliers)
            po = PurchaseOrder.objects.create(
                number=f"PC2024F{i+1:02d}",
                issue_date=today - timedelta(days=random.randint(5, 15)),
                supplier=supplier,
                quantity_items=random.randint(5, 25),
                followup_date=yesterday,
                storage=random.choice(self.storage_options),
                status="FINALIZADO"
            )
            
            # Criar recebimento
            Delivery.objects.create(
                purchase_order=po,
                delivery_date=today,
                quantity_received=po.quantity_items,
                status="FINALIZADO"
            )
        
        print("✅ Cenários específicos criados!")
    
    def print_statistics(self):
        """Exibe estatísticas dos dados criados"""
        print("\n📊 ESTATÍSTICAS DOS DADOS CRIADOS")
        print("=" * 50)
        
        # Fornecedores
        total_suppliers = Supplier.objects.count()
        print(f"👥 Fornecedores: {total_suppliers}")
        
        # Pedidos de compra
        total_orders = PurchaseOrder.objects.count()
        print(f"📋 Pedidos de Compra: {total_orders}")
        
        # Por status
        for status in self.status_options:
            count = PurchaseOrder.objects.filter(status=status).count()
            print(f"   - {status}: {count}")
        
        # Por data
        today = date.today()
        tomorrow = today + timedelta(days=1)
        
        today_orders = PurchaseOrder.objects.filter(followup_date=today).count()
        tomorrow_orders = PurchaseOrder.objects.filter(followup_date=tomorrow).count()
        delayed_orders = PurchaseOrder.objects.filter(followup_date__lt=today).count()
        
        print(f"📅 Por Data:")
        print(f"   - Hoje: {today_orders}")
        print(f"   - Amanhã: {tomorrow_orders}")
        print(f"   - Atrasados: {delayed_orders}")
        
        # Recebimentos
        total_deliveries = Delivery.objects.count()
        today_deliveries = Delivery.objects.filter(delivery_date=today).count()
        
        print(f"📦 Recebimentos: {total_deliveries}")
        print(f"   - Hoje: {today_deliveries}")
        
        # Por armazém
        print(f"🏪 Por Armazém:")
        for storage in self.storage_options:
            count = PurchaseOrder.objects.filter(storage=storage).count()
            print(f"   - Armazém {storage}: {count}")
        
        print("=" * 50)
    
    def generate_all(self, clear_data=True, orders_quantity=50):
        """Gera todos os dados de teste"""
        print("🚀 INICIANDO GERAÇÃO DE DADOS DE TESTE")
        print("=" * 50)
        
        if clear_data:
            self.clear_existing_data()
        
        self.create_suppliers()
        self.create_purchase_orders(orders_quantity)
        self.create_deliveries()
        self.create_specific_scenarios()
        self.print_statistics()
        
        print("\n🎉 GERAÇÃO DE DADOS CONCLUÍDA COM SUCESSO!")
        print("=" * 50)
        print("💡 Dicas:")
        print("   - Acesse http://localhost:8000/admin para ver os dados")
        print("   - Use http://localhost:5173 para ver o frontend")
        print("   - Execute 'python manage.py test' para rodar os testes")


def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Gerador de dados de teste')
    parser.add_argument('--keep-data', action='store_true', 
                       help='Manter dados existentes (não limpar)')
    parser.add_argument('--orders', type=int, default=50,
                       help='Quantidade de pedidos a criar (padrão: 50)')
    parser.add_argument('--minimal', action='store_true',
                       help='Criar apenas dados mínimos para demonstração')
    
    args = parser.parse_args()
    
    generator = TestDataGenerator()
    
    if args.minimal:
        # Dados mínimos para demonstração rápida
        generator.generate_all(
            clear_data=not args.keep_data,
            orders_quantity=20
        )
    else:
        # Dados completos
        generator.generate_all(
            clear_data=not args.keep_data,
            orders_quantity=args.orders
        )


if __name__ == "__main__":
    main()

