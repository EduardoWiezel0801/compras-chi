#!/usr/bin/env python
"""
Gerador simples de dados para teste.
"""

import os
import sys
import django
from datetime import date, timedelta
import random

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from orders.models import Supplier, PurchaseOrder, DeliveryReceipt


def clear_data():
    """Remove todos os dados"""
    print("🗑️  Removendo dados existentes...")
    DeliveryReceipt.objects.all().delete()
    PurchaseOrder.objects.all().delete()
    Supplier.objects.all().delete()
    print("✅ Dados removidos!")


def create_suppliers():
    """Cria fornecedores"""
    print("👥 Criando fornecedores...")
    
    suppliers_data = [
        ("FOR001", "ALPHA MATERIAIS INDUSTRIAIS LTDA"),
        ("FOR002", "BETA COMERCIAL E INDUSTRIAL S.A."),
        ("FOR003", "GAMMA DISTRIBUIDORA DE PRODUTOS"),
        ("FOR004", "DELTA MATERIAIS ELÉTRICOS LTDA"),
        ("FOR005", "EPSILON COMPONENTES ELETRÔNICOS"),
    ]
    
    suppliers = []
    for code, name in suppliers_data:
        supplier = Supplier.objects.create(code=code, name=name)
        suppliers.append(supplier)
    
    print(f"✅ {len(suppliers)} fornecedores criados!")
    return suppliers


def create_orders(suppliers, quantity=20):
    """Cria pedidos de compra"""
    print(f"📋 Criando {quantity} pedidos...")
    
    today = date.today()
    orders = []
    
    for i in range(quantity):
        number = f"PC2024{i+1:03d}"
        issue_date = today - timedelta(days=random.randint(1, 30))
        supplier = random.choice(suppliers)
        items_count = random.randint(1, 50)
        
        # Distribuir datas de followup
        if i < 5:  # Pedidos para hoje
            followup_date = today
        elif i < 8:  # Pedidos atrasados
            followup_date = today - timedelta(days=random.randint(1, 5))
        elif i < 11:  # Pedidos para amanhã
            followup_date = today + timedelta(days=1)
        else:  # Pedidos futuros
            followup_date = today + timedelta(days=random.randint(2, 10))
        
        warehouse = random.choice(["01", "02", "03", "04", "05"])
        status = random.choice(["PENDENTE", "PARCIAL", "FINALIZADO"])
        
        order = PurchaseOrder.objects.create(
            number=number,
            issue_date=issue_date,
            supplier=supplier,
            items_count=items_count,
            followup_date=followup_date,
            warehouse=warehouse,
            status=status
        )
        orders.append(order)
    
    print(f"✅ {len(orders)} pedidos criados!")
    return orders


def create_deliveries(suppliers, quantity=5):
    """Cria recebimentos"""
    print(f"📦 Criando {quantity} recebimentos...")
    
    today = date.today()
    deliveries = []
    
    for i in range(quantity):
        supplier = random.choice(suppliers)
        
        delivery = DeliveryReceipt.objects.create(
            cargo_number=f"CG{i+1:03d}",
            manifest_date=today - timedelta(days=random.randint(0, 3)),
            supplier=supplier,
            invoice_number=f"NF{i+1:03d}",
            issue_date=today - timedelta(days=random.randint(0, 2)),
            status=random.choice(["PENDENTE", "FINALIZADO"])
        )
        deliveries.append(delivery)
    
    print(f"✅ {len(deliveries)} recebimentos criados!")
    return deliveries


def show_stats():
    """Mostra estatísticas"""
    print("\n📊 ESTATÍSTICAS")
    print("=" * 30)
    
    suppliers_count = Supplier.objects.count()
    orders_count = PurchaseOrder.objects.count()
    deliveries_count = DeliveryReceipt.objects.count()
    
    print(f"👥 Fornecedores: {suppliers_count}")
    print(f"📋 Pedidos: {orders_count}")
    print(f"📦 Recebimentos: {deliveries_count}")
    
    if orders_count > 0:
        today = date.today()
        tomorrow = today + timedelta(days=1)
        
        today_orders = PurchaseOrder.objects.filter(followup_date=today).count()
        tomorrow_orders = PurchaseOrder.objects.filter(followup_date=tomorrow).count()
        delayed_orders = PurchaseOrder.objects.filter(followup_date__lt=today).count()
        
        print(f"\n📅 Por Data:")
        print(f"   Hoje: {today_orders}")
        print(f"   Amanhã: {tomorrow_orders}")
        print(f"   Atrasados: {delayed_orders}")
    
    print("=" * 30)


def main():
    """Função principal"""
    print("🚀 GERANDO DADOS DE TESTE")
    print("=" * 30)
    
    clear_data()
    suppliers = create_suppliers()
    orders = create_orders(suppliers)
    deliveries = create_deliveries(suppliers)
    show_stats()
    
    print("\n🎉 DADOS CRIADOS COM SUCESSO!")
    print("💡 Acesse http://localhost:8000/admin para ver os dados")


if __name__ == "__main__":
    main()

