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

class handler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Type', 'application/json')
    
    def do_OPTIONS(self):
        print(f"[OPTIONS] Método OPTIONS chamado. Path: {self.path}")
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
        return
    
    def do_GET(self):
        print(f"[GET] Método GET chamado. Path: {self.path}")
        try:
            if not supabase:
                print("[GET] Erro: Supabase não conectado")
                self.send_response(500)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Erro de conexão com banco"}).encode('utf-8'))
                return

            url_parts = urlparse(self.path)
            query_params = parse_qs(url_parts.query)
            
            # Verificar se há filtro por produto
            product_id = query_params.get('product_id', [None])[0]
            
            if product_id:
                # Buscar itens de escopo por produto específico
                result = supabase.table('scope_items').select('*, scope_categories(name, color)').eq('product_id', product_id).eq('is_active', True).execute()
            else:
                # Buscar todos os itens de escopo ativos
                result = supabase.table('scope_items').select('*, scope_categories(name, color)').eq('is_active', True).execute()
            
            response_data = {
                "success": True,
                "data": result.data
            }
            
            self.send_response(200)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
    
    def do_POST(self):
        try:
            if not supabase:
                self.send_response(500)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Erro de conexão com banco"}).encode('utf-8'))
                return

            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            
            # Validar campos obrigatórios
            required_fields = ['product_id', 'name', 'points', 'hours']
            for field in required_fields:
                if field not in body:
                    self.send_response(400)
                    self._set_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": f"Campo obrigatório: {field}"}).encode('utf-8'))
                    return
            
            # Definir valores padrão
            body.setdefault('minutes', 0)
            body.setdefault('is_active', True)
            
            result = supabase.table('scope_items').insert(body).execute()
            
            response_data = {
                "success": True,
                "data": result.data
            }
            
            self.send_response(201)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
    
    def do_PUT(self):
        print(f"[PUT] Método PUT chamado. Path: {self.path}")
        print(f"[PUT] Headers: {dict(self.headers)}")
        try:
            print(f"[PUT] Etapa 1: Verificando conexão com Supabase")
            if not supabase:
                print(f"[PUT] ERRO: Supabase não conectado")
                self.send_response(500)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Erro de conexão com banco"}).encode('utf-8'))
                return
            print(f"[PUT] Etapa 1: Conexão com Supabase OK")

            print(f"[PUT] Etapa 2: Extraindo ID da URL")
            url_parts = urlparse(self.path)
            path_parts = url_parts.path.split('/')
            print(f"[PUT] URL parts: {path_parts}")
            
            if len(path_parts) > 3 and path_parts[3]:
                item_id = path_parts[3]
                print(f"[PUT] Etapa 2: ID extraído com sucesso: {item_id}")
                
                print(f"[PUT] Etapa 3: Lendo dados do corpo da requisição")
                content_length = int(self.headers['Content-Length'])
                print(f"[PUT] Content-Length: {content_length}")
                post_data = self.rfile.read(content_length)
                body = json.loads(post_data.decode('utf-8'))
                print(f"[PUT] Etapa 3: Dados recebidos: {body}")
                
                print(f"[PUT] Etapa 4: Executando atualização no Supabase")
                print(f"[PUT] Query: UPDATE scope_items SET {body} WHERE id = {item_id}")
                result = supabase.table('scope_items').update(body).eq('id', item_id).execute()
                print(f"[PUT] Etapa 4: Resultado da atualização: {result}")
                
                response_data = {
                    "success": True,
                    "data": result.data
                }
                
                print(f"[PUT] Etapa 5: Enviando resposta de sucesso: {response_data}")
                self.send_response(200)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
                print(f"[PUT] Etapa 5: Resposta enviada com sucesso")
            else:
                print(f"[PUT] ERRO: ID não encontrado na URL. Path parts: {path_parts}")
                self.send_response(400)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "ID do item é obrigatório para atualização"}).encode('utf-8'))
                
        except Exception as e:
            self.send_response(500)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
    
    def do_DELETE(self):
        print(f"[DELETE] Método DELETE chamado. Path: {self.path}")
        print(f"[DELETE] Headers: {dict(self.headers)}")
        try:
            print(f"[DELETE] Etapa 1: Verificando conexão com Supabase")
            if not supabase:
                print("[DELETE] ERRO: Supabase não conectado")
                self.send_response(500)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Erro de conexão com banco"}).encode('utf-8'))
                return
            print(f"[DELETE] Etapa 1: Conexão com Supabase OK")

            print(f"[DELETE] Etapa 2: Extraindo ID da URL")
            url_parts = urlparse(self.path)
            path_parts = url_parts.path.split('/')
            print(f"[DELETE] URL parts: {url_parts}")
            print(f"[DELETE] Path parts: {path_parts}")
            
            if len(path_parts) > 3 and path_parts[3]:
                item_id = path_parts[3]
                print(f"[DELETE] Etapa 2: ID extraído com sucesso: {item_id}")
                
                print(f"[DELETE] Etapa 3: Verificando se item existe antes da exclusão")
                check_result = supabase.table('scope_items').select('id, name, is_active').eq('id', item_id).execute()
                print(f"[DELETE] Etapa 3: Resultado da verificação: {check_result}")
                
                if not check_result.data:
                    print(f"[DELETE] ERRO: Item com ID {item_id} não encontrado")
                    self.send_response(404)
                    self._set_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Item não encontrado"}).encode('utf-8'))
                    return
                
                print(f"[DELETE] Etapa 4: Item encontrado, executando exclusão lógica")
                print(f"[DELETE] Query: UPDATE scope_items SET is_active = false WHERE id = {item_id}")
                result = supabase.table('scope_items').update({'is_active': False}).eq('id', item_id).execute()
                print(f"[DELETE] Etapa 4: Resultado da exclusão: {result}")
                
                response_data = {
                    "success": True,
                    "message": "Item de escopo removido com sucesso",
                    "item_id": item_id,
                    "affected_rows": len(result.data) if result.data else 0
                }
                
                print(f"[DELETE] Etapa 5: Enviando resposta de sucesso: {response_data}")
                self.send_response(200)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
                print(f"[DELETE] Etapa 5: Resposta enviada com sucesso")
            else:
                print(f"[DELETE] ERRO: ID não encontrado no path. Path parts: {path_parts}")
                self.send_response(400)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "ID do item é obrigatório para remoção"}).encode('utf-8'))
                
        except Exception as e:
            print(f"[DELETE] Exceção capturada: {str(e)}")
            self.send_response(500)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))