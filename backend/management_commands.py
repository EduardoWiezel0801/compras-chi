#!/usr/bin/env python
"""
Comandos de gerenciamento para o sistema de pedidos de compra.
"""

import os
import sys
import django
from datetime import date, timedelta

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from orders.models import Supplier, PurchaseOrder, Delivery


class ManagementCommands:
    """Comandos de gerenciamento do sistema"""
    
    def reset_database(self):
        """Reseta o banco de dados"""
        print("🗑️  Resetando banco de dados...")
        
        # Remover dados
        Delivery.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        Supplier.objects.all().delete()
        
        print("✅ Banco de dados resetado!")
    
    def create_superuser(self, username="admin", email="admin@chiaperini.com", password="admin123"):
        """Cria um superusuário"""
        from django.contrib.auth.models import User
        
        if User.objects.filter(username=username).exists():
            print(f"⚠️  Usuário '{username}' já existe!")
            return
        
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        
        print(f"✅ Superusuário '{username}' criado!")
        print(f"   Email: {email}")
        print(f"   Senha: {password}")
        print(f"   Acesse: http://localhost:8000/admin")
    
    def backup_data(self, filename=None):
        """Faz backup dos dados"""
        import json
        from django.core import serializers
        
        if not filename:
            filename = f"backup_{date.today().strftime('%Y%m%d')}.json"
        
        print(f"💾 Fazendo backup para {filename}...")
        
        # Serializar todos os dados
        data = []
        
        # Fornecedores
        suppliers = serializers.serialize('json', Supplier.objects.all())
        data.extend(json.loads(suppliers))
        
        # Pedidos
        orders = serializers.serialize('json', PurchaseOrder.objects.all())
        data.extend(json.loads(orders))
        
        # Recebimentos
        deliveries = serializers.serialize('json', Delivery.objects.all())
        data.extend(json.loads(deliveries))
        
        # Salvar arquivo
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Backup salvo em {filename}")
        print(f"   Total de registros: {len(data)}")
    
    def restore_data(self, filename):
        """Restaura dados do backup"""
        import json
        from django.core import serializers
        
        if not os.path.exists(filename):
            print(f"❌ Arquivo {filename} não encontrado!")
            return
        
        print(f"📥 Restaurando dados de {filename}...")
        
        # Limpar dados existentes
        self.reset_database()
        
        # Carregar dados
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Deserializar e salvar
        for obj in serializers.deserialize('json', json.dumps(data)):
            obj.save()
        
        print(f"✅ Dados restaurados!")
        print(f"   Total de registros: {len(data)}")
    
    def show_statistics(self):
        """Mostra estatísticas do sistema"""
        print("\n📊 ESTATÍSTICAS DO SISTEMA")
        print("=" * 40)
        
        # Contadores gerais
        suppliers_count = Supplier.objects.count()
        orders_count = PurchaseOrder.objects.count()
        deliveries_count = Delivery.objects.count()
        
        print(f"👥 Fornecedores: {suppliers_count}")
        print(f"📋 Pedidos: {orders_count}")
        print(f"📦 Recebimentos: {deliveries_count}")
        
        if orders_count > 0:
            # Estatísticas por status
            print(f"\n📊 Por Status:")
            for status in ["PENDENTE", "PARCIAL", "FINALIZADO"]:
                count = PurchaseOrder.objects.filter(status=status).count()
                percentage = (count / orders_count) * 100
                print(f"   {status}: {count} ({percentage:.1f}%)")
            
            # Estatísticas por data
            today = date.today()
            tomorrow = today + timedelta(days=1)
            
            today_count = PurchaseOrder.objects.filter(followup_date=today).count()
            tomorrow_count = PurchaseOrder.objects.filter(followup_date=tomorrow).count()
            delayed_count = PurchaseOrder.objects.filter(followup_date__lt=today).count()
            
            print(f"\n📅 Por Data:")
            print(f"   Hoje: {today_count}")
            print(f"   Amanhã: {tomorrow_count}")
            print(f"   Atrasados: {delayed_count}")
            
            # Top fornecedores
            print(f"\n🏆 Top 5 Fornecedores:")
            from django.db.models import Count
            top_suppliers = (Supplier.objects
                           .annotate(order_count=Count('purchaseorder'))
                           .order_by('-order_count')[:5])
            
            for i, supplier in enumerate(top_suppliers, 1):
                print(f"   {i}. {supplier.code} - {supplier.name} ({supplier.order_count} pedidos)")
        
        print("=" * 40)
    
    def check_health(self):
        """Verifica a saúde do sistema"""
        print("🏥 VERIFICAÇÃO DE SAÚDE DO SISTEMA")
        print("=" * 40)
        
        checks = []
        
        # Verificar conexão com banco
        try:
            Supplier.objects.count()
            checks.append(("✅", "Conexão com banco de dados"))
        except Exception as e:
            checks.append(("❌", f"Conexão com banco de dados: {e}"))
        
        # Verificar integridade dos dados
        try:
            # Verificar se há pedidos sem fornecedor
            orphan_orders = PurchaseOrder.objects.filter(supplier__isnull=True).count()
            if orphan_orders == 0:
                checks.append(("✅", "Integridade dos pedidos"))
            else:
                checks.append(("⚠️", f"Integridade dos pedidos: {orphan_orders} pedidos órfãos"))
            
            # Verificar se há recebimentos sem pedido
            orphan_deliveries = Delivery.objects.filter(purchase_order__isnull=True).count()
            if orphan_deliveries == 0:
                checks.append(("✅", "Integridade dos recebimentos"))
            else:
                checks.append(("⚠️", f"Integridade dos recebimentos: {orphan_deliveries} recebimentos órfãos"))
        
        except Exception as e:
            checks.append(("❌", f"Verificação de integridade: {e}"))
        
        # Verificar performance
        try:
            import time
            start = time.time()
            PurchaseOrder.objects.all()[:100]
            end = time.time()
            
            query_time = end - start
            if query_time < 1.0:
                checks.append(("✅", f"Performance de consulta ({query_time:.3f}s)"))
            else:
                checks.append(("⚠️", f"Performance de consulta lenta ({query_time:.3f}s)"))
        
        except Exception as e:
            checks.append(("❌", f"Verificação de performance: {e}"))
        
        # Exibir resultados
        for status, message in checks:
            print(f"{status} {message}")
        
        # Status geral
        failed_checks = [c for c in checks if c[0] == "❌"]
        warning_checks = [c for c in checks if c[0] == "⚠️"]
        
        print("=" * 40)
        if failed_checks:
            print("❌ Sistema com problemas críticos!")
        elif warning_checks:
            print("⚠️  Sistema funcionando com avisos")
        else:
            print("✅ Sistema funcionando perfeitamente!")
    
    def optimize_database(self):
        """Otimiza o banco de dados"""
        print("⚡ OTIMIZANDO BANCO DE DADOS")
        print("=" * 40)
        
        # Para SQLite, executar VACUUM
        from django.db import connection
        
        try:
            with connection.cursor() as cursor:
                cursor.execute("VACUUM;")
            print("✅ VACUUM executado")
        except Exception as e:
            print(f"⚠️  Erro no VACUUM: {e}")
        
        # Recriar índices se necessário
        try:
            with connection.cursor() as cursor:
                cursor.execute("REINDEX;")
            print("✅ Índices recriados")
        except Exception as e:
            print(f"⚠️  Erro na recriação de índices: {e}")
        
        print("✅ Otimização concluída!")


def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Comandos de gerenciamento')
    parser.add_argument('command', choices=[
        'reset', 'superuser', 'backup', 'restore', 
        'stats', 'health', 'optimize'
    ], help='Comando a executar')
    parser.add_argument('--file', help='Arquivo para backup/restore')
    parser.add_argument('--username', default='admin', help='Nome do usuário')
    parser.add_argument('--email', default='admin@chiaperini.com', help='Email do usuário')
    parser.add_argument('--password', default='admin123', help='Senha do usuário')
    
    args = parser.parse_args()
    
    mgmt = ManagementCommands()
    
    if args.command == 'reset':
        mgmt.reset_database()
    
    elif args.command == 'superuser':
        mgmt.create_superuser(args.username, args.email, args.password)
    
    elif args.command == 'backup':
        mgmt.backup_data(args.file)
    
    elif args.command == 'restore':
        if not args.file:
            print("❌ Especifique o arquivo com --file")
            return
        mgmt.restore_data(args.file)
    
    elif args.command == 'stats':
        mgmt.show_statistics()
    
    elif args.command == 'health':
        mgmt.check_health()
    
    elif args.command == 'optimize':
        mgmt.optimize_database()


if __name__ == "__main__":
    main()

