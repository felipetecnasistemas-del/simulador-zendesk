#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para testar a estrutura do banco de dados e verificar:
1. Se a coluna is_template existe na tabela projects
2. Quantos projetos existem na tabela
3. Quantos projetos estão marcados como template
"""

import requests
import json
from supabase import create_client, Client

# Configuração do Supabase
SUPABASE_URL = "https://qngnbyueqdewjjzgbkun.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ25ieXVlcWRld2pqemdia3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjE0MjYsImV4cCI6MjA3MTY5NzQyNn0.F-OOhtVHz-c2FiGMkl6e3lbzhvvG5uo5SC2z58_FSIY"

BASE_URL = "http://localhost:8000"

def test_database_structure():
    print("=== TESTE DA ESTRUTURA DO BANCO DE DADOS ===")
    print()
    
    try:
        # Conectar ao Supabase
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✓ Conexão com Supabase estabelecida")
        
        # 1. Verificar se a tabela projects existe e listar todos os projetos
        print("\n1. Verificando tabela projects...")
        try:
            result = supabase.table('projects').select('*').execute()
            print(f"   ✓ Tabela projects existe")
            print(f"   ✓ Total de projetos: {len(result.data)}")
            
            if result.data:
                print("   ✓ Primeiros projetos encontrados:")
                for i, project in enumerate(result.data[:3]):
                    print(f"     - {project.get('name', 'Sem nome')} (ID: {project.get('id')})")
            else:
                print("   ⚠ Nenhum projeto encontrado na tabela")
                
        except Exception as e:
            print(f"   ✗ Erro ao acessar tabela projects: {e}")
            return
        
        # 2. Verificar se a coluna is_template existe
        print("\n2. Verificando coluna is_template...")
        try:
            # Tentar buscar projetos com is_template
            result = supabase.table('projects').select('id, name, is_template').execute()
            print(f"   ✓ Coluna is_template existe")
            
            # Contar projetos template
            template_count = sum(1 for p in result.data if p.get('is_template', False))
            print(f"   ✓ Projetos marcados como template: {template_count}")
            
            if template_count > 0:
                print("   ✓ Projetos template encontrados:")
                for project in result.data:
                    if project.get('is_template', False):
                        print(f"     - {project.get('name', 'Sem nome')} (ID: {project.get('id')})")
            else:
                print("   ⚠ Nenhum projeto marcado como template")
                
        except Exception as e:
            print(f"   ✗ Coluna is_template não existe ou erro: {e}")
            print("   → Execute o script add-is-template-column.sql no Supabase")
        
        # 3. Testar a API /api/default-projects
        print("\n3. Testando API /api/default-projects...")
        try:
            response = requests.get(f"{BASE_URL}/api/default-projects")
            print(f"   Status da resposta: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✓ API funcionando")
                print(f"   Estrutura da resposta: {type(data)}")
                
                if isinstance(data, dict) and 'data' in data:
                    projects = data['data']
                    print(f"   ✓ Projetos retornados pela API: {len(projects)}")
                    
                    if projects:
                        print("   ✓ Projetos encontrados:")
                        for project in projects[:3]:
                            print(f"     - {project.get('name', 'Sem nome')} (ID: {project.get('id')})")
                    else:
                        print("   ⚠ API retornou array vazio")
                else:
                    print(f"   ⚠ Formato de resposta inesperado: {data}")
            else:
                print(f"   ✗ Erro na API: {response.status_code}")
                print(f"   Resposta: {response.text}")
                
        except Exception as e:
            print(f"   ✗ Erro ao testar API: {e}")
        
        print("\n=== RESUMO ===")
        print("Para resolver o problema dos 'Itens Padrões':")
        print("1. Execute add-is-template-column.sql no Supabase (se a coluna não existir)")
        print("2. Execute insert-default-projects.sql no Supabase (para criar projetos template)")
        print("3. Teste novamente a aba 'Itens Padrões' na interface")
        
    except Exception as e:
        print(f"✗ Erro geral: {e}")

if __name__ == "__main__":
    test_database_structure()