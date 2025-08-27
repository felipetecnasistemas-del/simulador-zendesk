#!/usr/bin/env python3
import http.server
import socketserver
import json
import urllib.parse
from urllib.parse import urlparse, parse_qs
import os
from supabase import create_client, Client

# Configuração do Supabase
SUPABASE_URL = "https://qngnbyueqdewjjzgbkun.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuZ25ieXVlcWRld2pqemdia3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjE0MjYsImV4cCI6MjA3MTY5NzQyNn0.F-OOhtVHz-c2FiGMkl6e3lbzhvvG5uo5SC2z58_FSIY"

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Erro ao conectar com Supabase: {e}")
    supabase = None

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/users'):
            self.handle_users_api()
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path.startswith('/api/users'):
            self.handle_users_api()
        else:
            self.send_error(404)
    
    def do_PUT(self):
        if self.path.startswith('/api/users'):
            self.handle_users_api()
        else:
            self.send_error(404)
    
    def do_DELETE(self):
        if self.path.startswith('/api/users'):
            self.handle_users_api()
        else:
            self.send_error(404)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def handle_users_api(self):
        # Configurar CORS
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        if not supabase:
            response = {'error': 'Erro de conexão com o banco de dados'}
            self.wfile.write(json.dumps(response).encode())
            return
        
        try:
            if self.command == 'GET':
                self.get_users()
            elif self.command == 'POST':
                self.create_user()
            elif self.command == 'PUT':
                self.update_user()
            elif self.command == 'DELETE':
                self.delete_user()
        except Exception as e:
            print(f"Erro na API: {e}")
            response = {'error': 'Erro interno do servidor'}
            self.wfile.write(json.dumps(response).encode())
    
    def get_users(self):
        try:
            result = supabase.table('users').select('*').order('created_at', desc=True).execute()
            response = {'data': result.data, 'error': None}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao buscar usuários: {e}")
            response = {'data': None, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def create_user(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            user_data = json.loads(post_data.decode('utf-8'))
            
            # Validação
            if not user_data.get('name') or not user_data.get('email'):
                response = {'data': None, 'error': 'Nome e email são obrigatórios'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            result = supabase.table('users').insert(user_data).execute()
            response = {'data': result.data, 'error': None}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao criar usuário: {e}")
            response = {'data': None, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def update_user(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            user_data = json.loads(post_data.decode('utf-8'))
            
            user_id = user_data.get('id')
            if not user_id:
                response = {'data': None, 'error': 'ID do usuário é obrigatório'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            # Remove o ID dos dados para atualização
            update_data = {k: v for k, v in user_data.items() if k != 'id'}
            
            result = supabase.table('users').update(update_data).eq('id', user_id).execute()
            response = {'data': result.data, 'error': None}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao atualizar usuário: {e}")
            response = {'data': None, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def delete_user(self):
        try:
            # Extrair ID da URL
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            user_id = query_params.get('id', [None])[0]
            
            if not user_id:
                response = {'data': None, 'error': 'ID do usuário é obrigatório'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            result = supabase.table('users').delete().eq('id', user_id).execute()
            response = {'data': result.data, 'error': None}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao deletar usuário: {e}")
            response = {'data': None, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())

if __name__ == "__main__":
    PORT = 8000
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"Servidor rodando na porta {PORT}")
        print(f"Acesse: http://localhost:{PORT}")
        httpd.serve_forever()