from http.server import BaseHTTPRequestHandler
from supabase import create_client, Client
from urllib.parse import parse_qs, urlparse
import json

# Configuração do Supabase
SUPABASE_URL = "https://qngnbyueqdewjjzgbkun.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ25ieXVlcWRld2pqemdia3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjE0MjYsImV4cCI6MjA3MTY5NzQyNn0.F-OOhtVHz-c2FiGMkl6e3lbzhvvG5uo5SC2z58_FSIY"

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Erro ao conectar com Supabase: {e}")
    supabase = None

class handler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Type', 'application/json')

    def do_OPTIONS(self):
        print(f"[OPTIONS] Método OPTIONS chamado para: {self.path}")
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
        return

    def do_GET(self):
        print(f"[GET] Método GET chamado para: {self.path}")
        try:
            if not supabase:
                print("[GET] Erro: Supabase não conectado")
                self.send_response(500)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Erro de conexão com banco"}).encode())
                return

            # Parse da URL para obter parâmetros
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            
            # Verificar se há filtro por produto
            product_id = query_params.get('product_id', [None])[0]
            
            if product_id:
                print(f"[GET] Buscando itens para produto: {product_id}")
                result = supabase.table('scope_items').select('*, scope_categories(name, color)').eq('product_id', product_id).eq('is_active', True).execute()
            else:
                print("[GET] Buscando todos os itens ativos")
                result = supabase.table('scope_items').select('*, scope_categories(name, color)').eq('is_active', True).execute()
            
            self.send_response(200)
            self._set_cors_headers()
            self.end_headers()
            
            response_data = {
                "success": True,
                "data": result.data,
                "count": len(result.data)
            }
            
            print(f"[GET] Retornando {len(result.data)} itens")
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            print(f"[GET] Erro: {str(e)}")
            self.send_response(500)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_POST(self):
        print(f"[POST] Método POST chamado para: {self.path}")
        try:
            if not supabase:
                print("[POST] Erro: Supabase não conectado")
                self.send_response(500)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Erro de conexão com banco"}).encode())
                return

            # Ler dados do corpo da requisição
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            print(f"[POST] Dados recebidos: {data}")
            
            # Inserir novo item
            result = supabase.table('scope_items').insert(data).execute()
            
            self.send_response(201)
            self._set_cors_headers()
            self.end_headers()
            
            response_data = {
                "success": True,
                "data": result.data[0] if result.data else None,
                "message": "Item criado com sucesso"
            }
            
            print(f"[POST] Item criado com sucesso: {result.data}")
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            print(f"[POST] Erro: {str(e)}")
            self.send_response(500)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_PUT(self):
        print(f"[PUT] Método PUT chamado para: {self.path}")
        try:
            if not supabase:
                print("[PUT] Erro: Supabase não conectado")
                self.send_response(500)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Erro de conexão com banco"}).encode())
                return

            # Extrair ID da URL
            path_parts = self.path.split('/')
            if len(path_parts) < 4:
                print("[PUT] Erro: ID não fornecido na URL")
                self.send_response(400)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "ID não fornecido"}).encode())
                return
            
            item_id = path_parts[3]
            print(f"[PUT] Atualizando item ID: {item_id}")
            
            # Ler dados do corpo da requisição
            content_length = int(self.headers['Content-Length'])
            put_data = self.rfile.read(content_length)
            data = json.loads(put_data.decode('utf-8'))
            
            print(f"[PUT] Dados para atualização: {data}")
            
            # Atualizar item
            result = supabase.table('scope_items').update(data).eq('id', item_id).execute()
            
            if not result.data:
                print(f"[PUT] Item não encontrado: {item_id}")
                self.send_response(404)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Item não encontrado"}).encode())
                return
            
            self.send_response(200)
            self._set_cors_headers()
            self.end_headers()
            
            response_data = {
                "success": True,
                "data": result.data[0],
                "message": "Item atualizado com sucesso"
            }
            
            print(f"[PUT] Item atualizado com sucesso: {result.data}")
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            print(f"[PUT] Erro: {str(e)}")
            self.send_response(500)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_DELETE(self):
        print(f"[DELETE] Método DELETE chamado para: {self.path}")
        try:
            if not supabase:
                print("[DELETE] Erro: Supabase não conectado")
                self.send_response(500)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Erro de conexão com banco"}).encode())
                return

            # Extrair ID da URL
            path_parts = self.path.split('/')
            if len(path_parts) < 4:
                print("[DELETE] Erro: ID não fornecido na URL")
                self.send_response(400)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "ID não fornecido"}).encode())
                return
            
            item_id = path_parts[3]
            print(f"[DELETE] Excluindo item ID: {item_id}")
            
            # Exclusão lógica - marcar como inativo
            result = supabase.table('scope_items').update({'is_active': False}).eq('id', item_id).execute()
            
            if not result.data:
                print(f"[DELETE] Item não encontrado: {item_id}")
                self.send_response(404)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Item não encontrado"}).encode())
                return
            
            self.send_response(200)
            self._set_cors_headers()
            self.end_headers()
            
            response_data = {
                "success": True,
                "message": "Item excluído com sucesso"
            }
            
            print(f"[DELETE] Item excluído com sucesso: {item_id}")
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            print(f"[DELETE] Erro: {str(e)}")
            self.send_response(500)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())