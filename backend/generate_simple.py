import os
import sys
import django
from datetime import date, timedelta
import random

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from orders.models import Supplier, PurchaseOrder, DeliveryReceipt

def clear_data():
    """Remove todos os dados existentes"""
    print("🗑️  Removendo dados existentes...")
    DeliveryReceipt.objects.all().delete()
    PurchaseOrder.objects.all().delete()
    Supplier.objects.all().delete()
    print("✅ Dados removidos!")

def create_suppliers():
    """Cria fornecedores de exemplo"""
    print("👥 Criando fornecedores...")
    
    suppliers_data = [
        ('FOR001', 'ALPHA MATERIAIS LTDA'),
        ('FOR002', 'BETA COMERCIAL S.A.'),
        ('FOR003', 'GAMMA DISTRIBUIDORA'),
        ('FOR004', 'DELTA SUPRIMENTOS'),
        ('FOR005', 'OMEGA LOGÍSTICA LTDA'),
    ]
    
    suppliers = []
    for code, name in suppliers_data:
        supplier = Supplier.objects.create(
            code=code,
            name=name,
            status='ATIVO'
        )
        suppliers.append(supplier)
    
    print(f"✅ {len(suppliers)} fornecedores criados!")
    return suppliers

def create_orders(suppliers):
    """Cria pedidos de compra de exemplo"""
    print("📋 Criando 20 pedidos...")
    
    statuses = ['PENDENTE', 'PARCIAL', 'FINALIZADO', 'CANCELADO']
    warehouses = ['CD01', 'CD02', 'CD03', 'LOJA']
    
    orders = []
    base_date = date.today() - timedelta(days=30)
    
    for i in range(1, 21):
        # Gerar datas
        issue_date = base_date + timedelta(days=random.randint(0, 30))
        followup_date = issue_date + timedelta(days=random.randint(1, 15))
        
        # Escolher status baseado na data
        if followup_date < date.today():
            status = random.choice(['FINALIZADO', 'PARCIAL', 'PENDENTE'])
        else:
            status = random.choice(['PENDENTE', 'PARCIAL'])
        
        numero_pc = f"PC{2024}{i:04d}"
        supplier = random.choice(suppliers)
        items_count = random.randint(1, 50)
        warehouse = random.choice(warehouses)
        
        order = PurchaseOrder.objects.create(
            numero_pc=numero_pc,
            data_emissao=issue_date,
            fornecedor=supplier,
            quantidade_itens=items_count,
            followup_date=followup_date,
            armazenamento=warehouse,
            status=status
        )
        orders.append(order)
    
    print(f"✅ {len(orders)} pedidos criados!")
    return orders

def create_delivery_receipts(suppliers, orders):
    """Cria recebimentos de exemplo"""
    print("📦 Criando 15 recebimentos...")
    
    receipts = []
    base_date = date.today() - timedelta(days=20)
    
    for i in range(1, 16):
        manifest_date = base_date + timedelta(days=random.randint(0, 20))
        issue_date = manifest_date - timedelta(days=random.randint(0, 5))
        
        cargo_number = f"CG{2024}{i:04d}"
        supplier = random.choice(suppliers)
        invoice_number = f"NF{random.randint(100000, 999999)}"
        status = random.choice(['PENDENTE', 'FINALIZADO'])
        
        # Selecionar um pedido do mesmo fornecedor (se existir)
        related_orders = [o for o in orders if o.fornecedor == supplier]
        purchase_order = random.choice(related_orders) if related_orders else None
        
        receipt = DeliveryReceipt.objects.create(
            cargo_number=cargo_number,
            manifest_date=manifest_date,
            supplier=supplier,
            invoice_number=invoice_number,
            issue_date=issue_date,
            status=status,
            purchase_order=purchase_order
        )
        receipts.append(receipt)
    
    print(f"✅ {len(receipts)} recebimentos criados!")
    return receipts

def main():
    print("🚀 GERANDO DADOS DE TESTE")
    print("=" * 30)
    
    # Limpar dados existentes
    clear_data()
    
    # Criar dados
    suppliers = create_suppliers()
    orders = create_orders(suppliers)
    receipts = create_delivery_receipts(suppliers, orders)
    
    print("\n✨ DADOS GERADOS COM SUCESSO!")
    print(f"📊 Resumo:")
    print(f"   - {len(suppliers)} fornecedores")
    print(f"   - {len(orders)} pedidos de compra")
    print(f"   - {len(receipts)} recebimentos")
    print("\n🎯 Execute o servidor Django e acesse o sistema!")

if __name__ == "__main__":
    main()