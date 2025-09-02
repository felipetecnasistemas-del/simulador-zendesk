import json
from http.server import BaseHTTPRequestHandler
from supabase import create_client, Client
from urllib.parse import parse_qs, urlparse

# Configuração do Supabase
SUPABASE_URL = "https://qngnbyueqdewjjzgbkun.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ25ieXVlcWRld2pqemdia3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjE0MjYsImV4cCI6MjA3MTY5NzQyNn0.F-OOhtVHz-c2FiGMkl6e3lbzhvvG5uo5SC2z58_FSIY"

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Erro ao conectar com Supabase: {e}")
    supabase = None

def handler(request):
    """Vercel serverless function handler"""
    print(f"[HANDLER] Método: {request.method}, Path: {request.url}")
    
    # Headers CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }
    
    if request.method == 'OPTIONS':
        print(f"[OPTIONS] Método OPTIONS chamado")
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    elif request.method == 'DELETE':
        print(f"[DELETE] Método DELETE chamado. URL: {request.url}")
        try:
            if not supabase:
                print("[DELETE] Erro: Supabase não conectado")
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({"error": "Erro de conexão com banco"})
                }

            # Extrair ID da URL
            url_parts = request.url.split('/')
            print(f"[DELETE] URL parts: {url_parts}")
            
            if len(url_parts) > 0:
                item_id = url_parts[-1]  # Último elemento da URL
                print(f"[DELETE] Tentando deletar item ID: {item_id}")
                
                # Marcar como inativo ao invés de deletar
                result = supabase.table('scope_items').update({'is_active': False}).eq('id', item_id).execute()
                print(f"[DELETE] Resultado da operação: {result}")
                
                response_data = {
                    "success": True,
                    "message": "Item de escopo removido com sucesso",
                    "item_id": item_id
                }
                
                print(f"[DELETE] Enviando resposta de sucesso: {response_data}")
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(response_data)
                }
            else:
                print(f"[DELETE] Erro: ID não encontrado na URL")
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({"error": "ID do item é obrigatório para remoção"})
                }
                
        except Exception as e:
            print(f"[DELETE] Exceção capturada: {str(e)}")
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({"error": str(e)})
            }
    
    else:
        print(f"[ERROR] Método não suportado: {request.method}")
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({"error": "Método não permitido"})
        }