#!/usr/bin/env python
"""
Script para popular o banco de dados com dados de exemplo
"""
import os
import sys
import django
from datetime import date, timedelta, time
from random import randint, choice

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from orders.models import Supplier, PurchaseOrder, DeliveryReceipt

def create_suppliers():
    """Cria fornecedores de exemplo"""
    suppliers_data = [
        {'code': 'FOR001', 'name': 'FORNECEDOR ALPHA LTDA'},
        {'code': 'FOR002', 'name': 'BETA COMERCIAL E INDUSTRIAL'},
        {'code': 'FOR003', 'name': 'GAMMA DISTRIBUIDORA S.A.'},
        {'code': 'FOR004', 'name': 'DELTA MATERIAIS ELETRICOS'},
        {'code': 'FOR005', 'name': 'EPSILON COMPONENTES ELETRONICOS'},
        {'code': 'FOR006', 'name': 'ZETA FERRAMENTAS E EQUIPAMENTOS'},
        {'code': 'FOR007', 'name': 'ETA SUPRIMENTOS INDUSTRIAIS'},
        {'code': 'FOR008', 'name': 'THETA PECAS E ACESSORIOS'},
        {'code': 'FOR009', 'name': 'IOTA MATERIAIS DE CONSTRUCAO'},
        {'code': 'FOR010', 'name': 'KAPPA PRODUTOS QUIMICOS LTDA'},
    ]
    
    suppliers = []
    for data in suppliers_data:
        supplier, created = Supplier.objects.get_or_create(
            code=data['code'],
            defaults={'name': data['name']}
        )
        suppliers.append(supplier)
        if created:
            print(f"Fornecedor criado: {supplier}")
    
    return suppliers

def create_purchase_orders(suppliers):
    """Cria pedidos de compra de exemplo"""
    today = date.today()
    statuses = ['PENDENTE', 'PARCIAL']
    warehouses = ['01', '02', '03', '04', '05']
    
    orders_data = []
    
    # Pedidos para hoje (5 pedidos)
    for i in range(1, 6):
        orders_data.append({
            'number': f'PC{2024}{str(i).zfill(4)}',
            'issue_date': today - timedelta(days=randint(1, 30)),
            'supplier': choice(suppliers),
            'followup_date': today,
            'warehouse': choice(warehouses),
            'items_count': randint(1, 20),
            'status': choice(statuses)
        })
    
    # Pedidos atrasados (8 pedidos)
    for i in range(6, 14):
        orders_data.append({
            'number': f'PC{2024}{str(i).zfill(4)}',
            'issue_date': today - timedelta(days=randint(5, 45)),
            'supplier': choice(suppliers),
            'followup_date': today - timedelta(days=randint(1, 10)),
            'warehouse': choice(warehouses),
            'items_count': randint(1, 25),
            'status': choice(statuses)
        })
    
    # Pedidos para amanhã (3 pedidos)
    for i in range(14, 17):
        orders_data.append({
            'number': f'PC{2024}{str(i).zfill(4)}',
            'issue_date': today - timedelta(days=randint(1, 20)),
            'supplier': choice(suppliers),
            'followup_date': today + timedelta(days=1),
            'warehouse': choice(warehouses),
            'items_count': randint(1, 15),
            'status': choice(statuses)
        })
    
    # Pedidos futuros (10 pedidos)
    for i in range(17, 27):
        orders_data.append({
            'number': f'PC{2024}{str(i).zfill(4)}',
            'issue_date': today - timedelta(days=randint(1, 15)),
            'supplier': choice(suppliers),
            'followup_date': today + timedelta(days=randint(2, 15)),
            'warehouse': choice(warehouses),
            'items_count': randint(1, 30),
            'status': choice(statuses)
        })
    
    orders = []
    for data in orders_data:
        order, created = PurchaseOrder.objects.get_or_create(
            number=data['number'],
            defaults=data
        )
        orders.append(order)
        if created:
            print(f"Pedido criado: {order}")
    
    return orders

def create_delivery_receipts(suppliers):
    """Cria recebimentos de exemplo"""
    today = date.today()
    statuses = ['PENDENTE', 'FINALIZADO']
    
    receipts_data = []
    
    # Recebimentos de hoje
    for i in range(1, 8):
        status = choice(statuses)
        receipts_data.append({
            'cargo_number': f'CG{2024}{str(i).zfill(4)}',
            'manifest_date': today,
            'supplier': choice(suppliers),
            'invoice_number': f'NF{randint(10000, 99999)}',
            'issue_date': today - timedelta(days=randint(0, 3)),
            'manifest_time': time(randint(8, 17), randint(0, 59)),
            'entry_time': time(randint(8, 17), randint(0, 59)),
            'exit_time': time(randint(8, 17), randint(0, 59)) if status == 'FINALIZADO' else None,
            'status': status
        })
    
    receipts = []
    for data in receipts_data:
        receipt, created = DeliveryReceipt.objects.get_or_create(
            cargo_number=data['cargo_number'],
            defaults=data
        )
        receipts.append(receipt)
        if created:
            print(f"Recebimento criado: {receipt}")
    
    return receipts

def main():
    """Função principal"""
    print("Populando banco de dados com dados de exemplo...")
    
    # Limpar dados existentes (opcional)
    # PurchaseOrder.objects.all().delete()
    # DeliveryReceipt.objects.all().delete()
    # Supplier.objects.all().delete()
    
    # Criar dados
    suppliers = create_suppliers()
    orders = create_purchase_orders(suppliers)
    receipts = create_delivery_receipts(suppliers)
    
    print(f"\nDados criados com sucesso!")
    print(f"Fornecedores: {len(suppliers)}")
    print(f"Pedidos de Compra: {len(orders)}")
    print(f"Recebimentos: {len(receipts)}")

if __name__ == '__main__':
    main()

