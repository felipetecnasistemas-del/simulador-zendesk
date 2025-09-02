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
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
        return
    
    def do_GET(self):
        try:
            if not supabase:
                self.send_response(500)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Erro de conexão com banco"}).encode('utf-8'))
                return

            # Parse URL para obter parâmetros
            url_parts = urlparse(self.path)
            path_parts = url_parts.path.split('/')
            
            # Se há ID na URL, buscar projeto específico
            if len(path_parts) > 3 and path_parts[3]:
                project_id = path_parts[3]
                result = supabase.table('projects').select('*').eq('id', project_id).execute()
            else:
                # Buscar todos os projetos
                result = supabase.table('projects').select('*').execute()
            
            self.send_response(200)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(result.data).encode('utf-8'))
            
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
            
            result = supabase.table('projects').insert(body).execute()
            
            self.send_response(201)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(result.data).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
    
    def do_PUT(self):
        try:
            if not supabase:
                self.send_response(500)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Erro de conexão com banco"}).encode('utf-8'))
                return

            url_parts = urlparse(self.path)
            path_parts = url_parts.path.split('/')
            
            if len(path_parts) > 3 and path_parts[3]:
                project_id = path_parts[3]
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                body = json.loads(post_data.decode('utf-8'))
                
                result = supabase.table('projects').update(body).eq('id', project_id).execute()
                
                self.send_response(200)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(result.data).encode('utf-8'))
            else:
                self.send_response(400)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "ID do projeto é obrigatório para atualização"}).encode('utf-8'))
                
        except Exception as e:
            self.send_response(500)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
    
    def do_DELETE(self):
        try:
            if not supabase:
                self.send_response(500)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Erro de conexão com banco"}).encode('utf-8'))
                return

            url_parts = urlparse(self.path)
            path_parts = url_parts.path.split('/')
            
            if len(path_parts) > 3 and path_parts[3]:
                project_id = path_parts[3]
                result = supabase.table('projects').delete().eq('id', project_id).execute()
                
                self.send_response(200)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"message": "Projeto deletado com sucesso"}).encode('utf-8'))
            else:
                self.send_response(400)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "ID do projeto é obrigatório para exclusão"}).encode('utf-8'))
                
        except Exception as e:
            self.send_response(500)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))