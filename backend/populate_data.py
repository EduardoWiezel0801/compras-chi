# populate_data.py
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
    """Limpa todos os dados existentes"""
    print("🗑️  Limpando dados existentes...")
    DeliveryReceipt.objects.all().delete()
    PurchaseOrder.objects.all().delete()
    Supplier.objects.all().delete()
    print("✅ Dados limpos!")

def create_suppliers():
    """Cria fornecedores de exemplo"""
    print("👥 Criando fornecedores...")
    
    suppliers_data = [
        ('FOR001', 'ALPHA MATERIAIS LTDA'),
        ('FOR002', 'BETA COMERCIAL S.A.'),
        ('FOR003', 'GAMMA DISTRIBUIDORA'),
        ('FOR004', 'DELTA SUPRIMENTOS'),
        ('FOR005', 'EPSILON INDUSTRIAL'),
    ]
    
    suppliers = []
    for code, name in suppliers_data:
        supplier = Supplier.objects.create(
            code=code,
            name=name,
            status='ATIVO'
        )
        suppliers.append(supplier)
        print(f"  ✓ {code} - {name}")
    
    return suppliers

def create_purchase_orders(suppliers):
    """Cria pedidos de compra de exemplo"""
    print("📋 Criando pedidos de compra...")
    
    today = date.today()
    orders = []
    
    # Diferentes cenários de datas
    scenarios = [
        # (data_followup, quantidade, status_opcoes)
        (today, 3, ['PENDENTE', 'PARCIAL']),  # Para hoje
        (today - timedelta(days=1), 2, ['PENDENTE']),  # Atrasados
        (today + timedelta(days=1), 2, ['PENDENTE']),  # Para amanhã
        (today + timedelta(days=2), 3, ['PENDENTE']),  # Futuros
    ]
    
    pc_number = 1
    
    for followup_date, count, status_options in scenarios:
        for i in range(count):
            # Data de emissão entre 1-30 dias atrás
            issue_date = today - timedelta(days=random.randint(1, 30))
            
            order = PurchaseOrder.objects.create(
                numero_pc=f'PC2024{pc_number:03d}',
                data_emissao=issue_date,
                fornecedor=random.choice(suppliers),
                quantidade_itens=random.randint(5, 50),
                followup_date=followup_date,
                armazenamento=f'{random.randint(1, 3):02d}',
                status=random.choice(status_options)
            )
            orders.append(order)
            
            print(f"  ✓ {order.numero_pc} - {order.fornecedor.code} - {order.status}")
            pc_number += 1
    
    return orders

def create_delivery_receipts(suppliers):
    """Cria recebimentos de exemplo"""
    print("📦 Criando recebimentos...")
    
    today = date.today()
    
    # Criar alguns recebimentos
    for i in range(2):
        supplier = random.choice(suppliers)
        
        receipt = DeliveryReceipt.objects.create(
            cargo_number=f'CG{today.strftime("%Y%m%d")}{i+1:03d}',
            manifest_date=today,
            supplier=supplier,
            invoice_number=f'NF{random.randint(100000, 999999)}',
            issue_date=today,
            status='FINALIZADO'
        )
        
        print(f"  ✓ {receipt.cargo_number} - {supplier.code} - {receipt.status}")

def main():
    """Função principal"""
    print("🚀 Iniciando população do banco de dados...")
    print("=" * 50)
    
    try:
        # Limpar dados existentes
        clear_data()
        
        # Criar dados
        suppliers = create_suppliers()
        orders = create_purchase_orders(suppliers)
        create_delivery_receipts(suppliers)
        
        print("=" * 50)
        print("✅ População concluída com sucesso!")
        print(f"📊 Criados:")
        print(f"   • {Supplier.objects.count()} fornecedores")
        print(f"   • {PurchaseOrder.objects.count()} pedidos de compra")
        print(f"   • {DeliveryReceipt.objects.count()} recebimentos")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()