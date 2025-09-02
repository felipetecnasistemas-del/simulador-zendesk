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

class CustomHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/users'):
            self.handle_users_api()
        elif self.path.startswith('/api/projects'):
            self.handle_projects_api()
        elif self.path.startswith('/api/products'):
            self.handle_products_api()
        elif self.path.startswith('/api/product-rules'):
            self.handle_product_rules_api()
        elif self.path.startswith('/api/product-activities'):
            self.handle_product_activities_api()
        elif self.path.startswith('/api/defaultHours'):
            self.handle_default_hours_api()
        elif self.path.startswith('/api/system-rules'):
            self.handle_system_rules_api()
        elif self.path.startswith('/api/scope-categories'):
            self.handle_scope_categories_api()
        elif self.path.startswith('/api/scope-items'):
            self.handle_scope_items_api()
        elif self.path.startswith('/api/questions'):
            self.handle_questions_api()
        elif self.path.startswith('/api/advanced-questions'):
            self.handle_advanced_questions_api()
        elif self.path.startswith('/api/default-projects'):
            self.handle_default_projects_api()
        else:
            # Servir arquivos estáticos
            self.serve_static_file()
    
    def serve_static_file(self):
        """Servir arquivos estáticos"""
        try:
            # Remover parâmetros de query da URL
            path = self.path.split('?')[0]
            
            # Se for a raiz, servir index.html
            if path == '/':
                path = '/index.html'
            
            # Remover a barra inicial
            file_path = path.lstrip('/')
            
            # Verificar se o arquivo existe
            if os.path.exists(file_path):
                # Determinar o tipo de conteúdo
                if file_path.endswith('.html'):
                    content_type = 'text/html'
                elif file_path.endswith('.css'):
                    content_type = 'text/css'
                elif file_path.endswith('.js'):
                    content_type = 'application/javascript'
                elif file_path.endswith('.json'):
                    content_type = 'application/json'
                else:
                    content_type = 'text/plain'
                
                # Ler e enviar o arquivo
                with open(file_path, 'rb') as f:
                    content = f.read()
                
                self.send_response(200)
                self.send_header('Content-type', content_type)
                self.send_header('Content-length', str(len(content)))
                self.end_headers()
                self.wfile.write(content)
            else:
                # Arquivo não encontrado
                self.send_response(404)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(b'<h1>404 - File Not Found</h1>')
        except Exception as e:
            print(f"Erro ao servir arquivo estático: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<h1>500 - Internal Server Error</h1>')
    
    def do_POST(self):
        if self.path.startswith('/api/users'):
            self.handle_users_api()
        elif self.path.startswith('/api/projects'):
            self.handle_projects_api()
        elif self.path.startswith('/api/products'):
            self.handle_products_api()
        elif self.path.startswith('/api/product-rules'):
            self.handle_product_rules_api()
        elif self.path.startswith('/api/product-activities'):
            self.handle_product_activities_api()
        elif self.path.startswith('/api/defaultHours'):
            self.handle_default_hours_api()
        elif self.path.startswith('/api/system-rules'):
            self.handle_system_rules_api()
        elif self.path.startswith('/api/scope-categories'):
            self.handle_scope_categories_api()
        elif self.path.startswith('/api/scope-items'):
            self.handle_scope_items_api()
        elif self.path.startswith('/api/questions'):
            self.handle_questions_api()
        elif self.path.startswith('/api/advanced-questions'):
            self.handle_advanced_questions_api()
        elif self.path.startswith('/api/default-projects'):
            self.handle_default_projects_api()
        else:
            self.send_error(404)
    
    def do_PUT(self):
        if self.path.startswith('/api/users'):
            self.handle_users_api()
        elif self.path.startswith('/api/projects'):
            self.handle_projects_api()
        elif self.path.startswith('/api/products'):
            self.handle_products_api()
        elif self.path.startswith('/api/product-rules'):
            self.handle_product_rules_api()
        elif self.path.startswith('/api/product-activities'):
            self.handle_product_activities_api()
        elif self.path.startswith('/api/defaultHours'):
            self.handle_default_hours_api()
        elif self.path.startswith('/api/scope-categories'):
            self.handle_scope_categories_api()
        elif self.path.startswith('/api/scope-items'):
            self.handle_scope_items_api()
        elif self.path.startswith('/api/questions'):
            self.handle_questions_api()
        elif self.path.startswith('/api/advanced-questions'):
            self.handle_advanced_questions_api()
        elif self.path.startswith('/api/default-projects'):
            self.handle_default_projects_api()
        else:
            self.send_error(404)

    def do_DELETE(self):
        if self.path.startswith('/api/users'):
            self.handle_users_api()
        elif self.path.startswith('/api/projects'):
            self.handle_projects_api()
        elif self.path.startswith('/api/products'):
            self.handle_products_api()
        elif self.path.startswith('/api/product-rules'):
            self.handle_product_rules_api()
        elif self.path.startswith('/api/product-activities'):
            self.handle_product_activities_api()
        elif self.path.startswith('/api/defaultHours'):
            self.handle_default_hours_api()
        elif self.path.startswith('/api/scope-categories'):
            self.handle_scope_categories_api()
        elif self.path.startswith('/api/scope-items'):
            self.handle_scope_items_api()
        elif self.path.startswith('/api/questions'):
            self.handle_questions_api()
        elif self.path.startswith('/api/advanced-questions'):
            self.handle_advanced_questions_api()
        elif self.path.startswith('/api/default-projects'):
            self.handle_default_projects_api()
        else:
            self.send_error(404)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def handle_users_api(self):
        if not supabase:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {'error': 'Erro de conexão com o banco de dados'}
            self.wfile.write(json.dumps(response).encode())
            return
        
        try:
            if self.command == 'DELETE':
                # DELETE define seus próprios headers baseados no resultado
                self.delete_user()
            else:
                # Configurar CORS para outros métodos
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                
                if self.command == 'GET':
                    self.get_users()
                elif self.command == 'POST':
                    self.create_user()
                elif self.command == 'PUT':
                    self.update_user()
        except Exception as e:
            print(f"Erro na API: {e}")
            if self.command != 'DELETE':  # DELETE já definiu headers
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
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
                self.send_response(400)  # Bad Request
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
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
            # Ler dados do corpo da requisição
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            user_id = data.get('id')
            
            if not user_id:
                response = {'data': None, 'error': 'ID do usuário é obrigatório'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            # Verificar se existem projetos vinculados ao usuário
            projects_result = supabase.table('projects').select('id').eq('user_id', user_id).execute()
            
            if projects_result.data and len(projects_result.data) > 0:
                self.send_response(400)  # Bad Request
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {
                    'data': None, 
                    'error': f'Não é possível excluir este usuário pois ele possui {len(projects_result.data)} projeto(s) vinculado(s). Exclua os projetos primeiro ou transfira-os para outro usuário.'
                }
                self.wfile.write(json.dumps(response).encode())
                return
            
            result = supabase.table('users').delete().eq('id', user_id).execute()
            self.send_response(200)  # Success
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {'data': result.data, 'error': None}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao deletar usuário: {e}")
            self.send_response(400)  # Bad Request
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            # Verificar se é erro de chave estrangeira
            if 'foreign key constraint' in str(e):
                response = {'data': None, 'error': 'Não é possível excluir este usuário pois ele possui projetos vinculados. Exclua os projetos primeiro ou transfira-os para outro usuário.'}
            else:
                response = {'data': None, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def handle_projects_api(self):
        try:
            if self.command == 'GET':
                self.get_projects()
            elif self.command == 'POST':
                self.create_project()
            elif self.command == 'PUT':
                self.update_project()
            elif self.command == 'DELETE':
                self.delete_project()
            else:
                self.send_error(405)
        except Exception as e:
            print(f"Erro na API de projetos: {e}")
            self.send_error(500, f"Erro interno: {str(e)}")
    
    def get_projects(self):
        try:
            # Buscar projetos com dados do usuário
            response = supabase.table('projects').select(
                '*,'
                'users(id, name, email),'
                'project_products(product_id, products(name, icon))'
            ).order('created_at', desc=True).execute()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response.data).encode())
        except Exception as e:
            print(f"Erro ao buscar projetos: {e}")
            self.send_error(500, f"Erro ao buscar projetos: {str(e)}")
    
    def create_project(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            print(f"Dados recebidos para salvamento: {data}")
            print(f"Tipo dos dados: {type(data)}")
            
            # Validar campos obrigatórios
            if not data.get('client_name'):
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {'error': 'Nome do cliente é obrigatório'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            # Definir valores padrão
            project_data = {
                'name': data['client_name'],  # Usar client_name como name do projeto
                'description': data.get('description', ''),
                'client_type': data.get('client_type', 'base'),
                'user_id': data.get('user_id'),
                'project_type': data.get('project_type', 'standard'),
                'selected_products': data.get('selected_products', []),
                'agents_count': data.get('agents_count'),
                'scope_items': data.get('scope', []),
                'total_scope_hours': data.get('total_scope_hours', 0),
                'complexity_level': data.get('complexity_level'),
                'project_metadata': data.get('project_metadata', {}),
                'is_tecna_client': data.get('is_tecna_client', False),
                'has_zendesk_admin': data.get('has_zendesk_admin', False),
                'billing_model': data.get('billing_model', 'escopo_fechado'),
                'status': data.get('status', 'active')
            }
            
            # Inserir projeto no banco
            result = supabase.table('projects').insert(project_data).execute()
            
            if result.data:
                # Configurar resposta de sucesso
                self.send_response(201)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                self.end_headers()
                
                # Retornar apenas o primeiro item criado
                project = result.data[0] if isinstance(result.data, list) else result.data
                response = {'message': 'Projeto criado com sucesso', 'data': project}
                self.wfile.write(json.dumps(response).encode())
            else:
                raise Exception('Nenhum dado retornado após inserção')
                
        except Exception as e:
            print(f"Erro ao criar projeto: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def update_project(self):
        try:
            # Extrair ID da URL
            parsed_url = urlparse(self.path)
            path_parts = parsed_url.path.split('/')
            project_id = path_parts[-1] if len(path_parts) > 3 else None
            
            if not project_id:
                self.send_error(400, "ID do projeto é obrigatório")
                return
            
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            response = supabase.table('projects').update(data).eq('id', project_id).execute()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response.data).encode())
        except Exception as e:
            print(f"Erro ao atualizar projeto: {e}")
            self.send_error(500, f"Erro ao atualizar projeto: {str(e)}")
    
    def delete_project(self):
        try:
            # Extrair ID da URL
            parsed_url = urlparse(self.path)
            path_parts = parsed_url.path.split('/')
            project_id = path_parts[-1] if len(path_parts) > 3 else None
            
            if not project_id:
                self.send_error(400, "ID do projeto é obrigatório")
                return
            
            response = supabase.table('projects').delete().eq('id', project_id).execute()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response.data).encode())
        except Exception as e:
            print(f"Erro ao deletar projeto: {e}")
            self.send_error(500, f"Erro ao deletar projeto: {str(e)}")
    
    def handle_product_rules_api(self):
        try:
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()

            if self.command == 'OPTIONS':
                return

            if self.command == 'GET':
                # GET /api/product-rules?product_id=suite
                query_params = parse_qs(urlparse(self.path).query)
                product_id = query_params.get('product_id', [None])[0]
                
                if product_id:
                    result = supabase.table('product_rules').select('*').eq('product_id', product_id).eq('is_active', True).order('priority').execute()
                else:
                    result = supabase.table('product_rules').select('*').eq('is_active', True).order('product_id', 'priority').execute()
                
                self.wfile.write(json.dumps(result.data).encode())

            elif self.command == 'POST':
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                # Validate required fields
                required_fields = ['product_id', 'name', 'rule_type', 'conditions', 'actions']
                for field in required_fields:
                    if field not in data or not data[field]:
                        response = {'error': f'Campo obrigatório: {field}'}
                        self.wfile.write(json.dumps(response).encode())
                        return
                
                result = supabase.table('product_rules').insert(data).execute()
                self.wfile.write(json.dumps(result.data).encode())

            elif self.command == 'PUT':
                # Extract rule ID from path
                path_parts = self.path.split('/')
                if len(path_parts) >= 4:
                    rule_id = path_parts[3].split('?')[0]
                    
                    content_length = int(self.headers['Content-Length'])
                    post_data = self.rfile.read(content_length)
                    data = json.loads(post_data.decode('utf-8'))
                    
                    result = supabase.table('product_rules').update(data).eq('id', rule_id).execute()
                    self.wfile.write(json.dumps(result.data).encode())

            elif self.command == 'DELETE':
                # Extract rule ID from path
                path_parts = self.path.split('/')
                if len(path_parts) >= 4:
                    rule_id = path_parts[3].split('?')[0]
                    
                    result = supabase.table('product_rules').delete().eq('id', rule_id).execute()
                    self.wfile.write(json.dumps({'success': True}).encode())

        except Exception as e:
            self.send_error(500, f'Erro interno: {str(e)}')

    def handle_product_activities_api(self):
        try:
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()

            if self.command == 'OPTIONS':
                return

            if self.command == 'GET':
                # GET /api/product-activities?product_id=suite&complexity_level=baixo
                query_params = parse_qs(urlparse(self.path).query)
                product_id = query_params.get('product_id', [None])[0]
                complexity_level = query_params.get('complexity_level', [None])[0]
                
                query = supabase.table('product_activities').select('*').eq('is_active', True)
                
                if product_id:
                    query = query.eq('product_id', product_id)
                if complexity_level:
                    query = query.eq('complexity_level', complexity_level)
                
                result = query.order('order_index').execute()
                self.wfile.write(json.dumps(result.data).encode())

            elif self.command == 'POST':
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                # Validate required fields
                required_fields = ['product_id', 'complexity_level', 'activity_name']
                for field in required_fields:
                    if field not in data or not data[field]:
                        response = {'error': f'Campo obrigatório: {field}'}
                        self.wfile.write(json.dumps(response).encode())
                        return
                
                result = supabase.table('product_activities').insert(data).execute()
                self.wfile.write(json.dumps(result.data).encode())

            elif self.command == 'PUT':
                # Extract activity ID from path
                path_parts = self.path.split('/')
                if len(path_parts) >= 4:
                    activity_id = path_parts[3].split('?')[0]
                    
                    content_length = int(self.headers['Content-Length'])
                    post_data = self.rfile.read(content_length)
                    data = json.loads(post_data.decode('utf-8'))
                    
                    result = supabase.table('product_activities').update(data).eq('id', activity_id).execute()
                    self.wfile.write(json.dumps(result.data).encode())

            elif self.command == 'DELETE':
                # Extract activity ID from path
                path_parts = self.path.split('/')
                if len(path_parts) >= 4:
                    activity_id = path_parts[3].split('?')[0]
                    
                    result = supabase.table('product_activities').delete().eq('id', activity_id).execute()
                    self.wfile.write(json.dumps({'success': True}).encode())

        except Exception as e:
            self.send_error(500, f'Erro interno: {str(e)}')
    
    def handle_products_api(self):
        try:
            if self.command == 'GET':
                self.get_products()
            elif self.command == 'POST':
                self.create_product()
            elif self.command == 'PUT':
                self.update_product()
            elif self.command == 'DELETE':
                self.delete_product()
            else:
                self.send_error(405)
        except Exception as e:
            print(f"Erro na API de produtos: {e}")
            self.send_error(500, f"Erro interno: {str(e)}")
    
    def get_products(self):
        try:
            result = supabase.table('products').select('id, name, icon, description').order('name').execute()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result.data).encode())
        except Exception as e:
            print(f"Erro ao buscar produtos: {e}")
            self.send_error(500, f"Erro ao buscar produtos: {str(e)}")
    
    def create_product(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Validate required fields
            required_fields = ['name', 'description']
            for field in required_fields:
                if field not in data or not data[field]:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    response = {'error': f'Campo obrigatório: {field}'}
                    self.wfile.write(json.dumps(response).encode())
                    return
            
            # Set product data (ID será gerado automaticamente pelo banco)
            product_data = {
                'name': data['name'],
                'description': data['description'],
                'icon': data.get('icon', '📦'),
                'questionnaire': {}  # Campo obrigatório na tabela
            }
            
            result = supabase.table('products').insert(product_data).execute()
            
            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            self.end_headers()
            
            if result.data:
                response = {'message': 'Produto criado com sucesso', 'data': result.data}
            else:
                response = {'message': 'Produto criado com sucesso'}
                
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao criar produto: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def update_product(self):
        # Configurar CORS
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        try:
            # Extrair ID do produto da URL
            path_parts = self.path.split('/')
            product_id = None
            
            # Verificar se o ID está na URL como /api/products/11
            if len(path_parts) >= 4 and path_parts[3]:
                product_id = path_parts[3]
            else:
                # Fallback para query parameters
                parsed_url = urlparse(self.path)
                query_params = parse_qs(parsed_url.query)
                product_id = query_params.get('id', [None])[0]
            
            if not product_id:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {'error': 'ID do produto é obrigatório'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Remove id from update data to prevent changes
            update_data = {k: v for k, v in data.items() if k != 'id'}
            
            result = supabase.table('products').update(update_data).eq('id', product_id).execute()
            
            if result.data:
                response = {'message': 'Produto atualizado com sucesso', 'data': result.data}
            else:
                response = {'message': 'Produto atualizado com sucesso'}
                
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao atualizar produto: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def delete_product(self):
        # Configurar CORS
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        try:
            # Extrair ID do produto da URL
            path_parts = self.path.split('/')
            product_id = None
            
            # Verificar se o ID está na URL como /api/products/11
            if len(path_parts) >= 4 and path_parts[3]:
                product_id = path_parts[3]
            else:
                # Fallback para query parameters
                parsed_url = urlparse(self.path)
                query_params = parse_qs(parsed_url.query)
                product_id = query_params.get('id', [None])[0]
            
            if not product_id:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {'error': 'ID do produto é obrigatório'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            result = supabase.table('products').delete().eq('id', product_id).execute()
            
            if result.data is not None:
                response = {'message': 'Produto excluído com sucesso', 'data': result.data}
            else:
                response = {'message': 'Produto excluído com sucesso'}
                
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao deletar produto: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def handle_default_hours_api(self):
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
                self.get_default_hours()
            elif self.command == 'POST':
                self.create_default_hour()
            elif self.command == 'PUT':
                self.update_default_hour()
            elif self.command == 'DELETE':
                self.delete_default_hour()
        except Exception as e:
            print(f"Erro na API de horas padrão: {e}")
            response = {'error': 'Erro interno do servidor'}
            self.wfile.write(json.dumps(response).encode())
    
    def get_default_hours(self):
        try:
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            
            query = supabase.table('default_hours').select('*, products(id, name, icon)')
            
            # Aplicar filtros se fornecidos
            if 'product_id' in query_params:
                query = query.eq('product_id', query_params['product_id'][0])
            if 'complexity_level' in query_params:
                query = query.eq('complexity_level', query_params['complexity_level'][0])
            if 'phase' in query_params:
                query = query.eq('phase', query_params['phase'][0])
            
            result = query.order('product_id').order('complexity_level').order('phase').execute()
            self.wfile.write(json.dumps(result.data).encode())
        except Exception as e:
            print(f"Erro ao buscar horas padrão: {e}")
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def create_default_hour(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            result = supabase.table('default_hours').insert(data).execute()
            self.wfile.write(json.dumps(result.data).encode())
        except Exception as e:
            print(f"Erro ao criar hora padrão: {e}")
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def update_default_hour(self):
        try:
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            hour_id = query_params.get('id', [None])[0]
            
            if not hour_id:
                response = {'error': 'ID da hora padrão é obrigatório'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            result = supabase.table('default_hours').update(data).eq('id', hour_id).execute()
            self.wfile.write(json.dumps(result.data).encode())
        except Exception as e:
            print(f"Erro ao atualizar hora padrão: {e}")
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def delete_default_hour(self):
        try:
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            hour_id = query_params.get('id', [None])[0]
            
            if not hour_id:
                response = {'error': 'ID da hora padrão é obrigatório'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            result = supabase.table('default_hours').delete().eq('id', hour_id).execute()
            self.wfile.write(json.dumps(result.data).encode())
        except Exception as e:
            print(f"Erro ao deletar hora padrão: {e}")
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def handle_questions_api(self):
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
                self.get_questions()
            elif self.command == 'POST':
                self.create_question()
            elif self.command == 'PUT':
                self.update_question()
            elif self.command == 'DELETE':
                self.delete_question()
        except Exception as e:
            print(f"Erro na API de perguntas: {e}")
            response = {'error': 'Erro interno do servidor'}
            self.wfile.write(json.dumps(response).encode())
    
    def get_questions(self):
        try:
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            
            query = supabase.table('questions').select('*, products(id, name, icon)')
            
            # Aplicar filtros se fornecidos
            if 'product_id' in query_params:
                query = query.eq('product_id', query_params['product_id'][0])
            if 'type' in query_params:
                query = query.eq('type', query_params['type'][0])
            
            result = query.order('product_id').order('order_index').execute()
            self.wfile.write(json.dumps(result.data).encode())
        except Exception as e:
            print(f"Erro ao buscar perguntas: {e}")
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def create_question(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            result = supabase.table('questions').insert(data).execute()
            self.wfile.write(json.dumps(result.data).encode())
        except Exception as e:
            print(f"Erro ao criar pergunta: {e}")
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def update_question(self):
        try:
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            question_id = query_params.get('id', [None])[0]
            
            if not question_id:
                response = {'error': 'ID da pergunta é obrigatório'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            result = supabase.table('questions').update(data).eq('id', question_id).execute()
            self.wfile.write(json.dumps(result.data).encode())
        except Exception as e:
            print(f"Erro ao atualizar pergunta: {e}")
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def delete_question(self):
        try:
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            question_id = query_params.get('id', [None])[0]
            
            if not question_id:
                response = {'error': 'ID da pergunta é obrigatório'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            result = supabase.table('questions').delete().eq('id', question_id).execute()
            self.wfile.write(json.dumps(result.data).encode())
        except Exception as e:
            print(f"Erro ao deletar pergunta: {e}")
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def handle_system_rules_api(self):
        """Gerenciar API de regras do sistema"""
        try:
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            if self.command == 'GET':
                self.get_system_rules()
            elif self.command == 'POST':
                if '/hours' in self.path:
                    self.save_hours_rule()
                elif '/points' in self.path:
                    self.save_points_rule()
                elif '/rate' in self.path:
                    self.save_rate_rule()
                else:
                    response = {'error': 'Endpoint não encontrado'}
                    self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro na API de regras do sistema: {e}")
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def get_system_rules(self):
        """Buscar regras do sistema"""
        try:
            # Regras padrão
            default_rules = {
                'hours': {'baixo': 75, 'medio': 123, 'complexo': 188},
                'points': {'baixo': 50, 'medio': 100},
                'hourlyRate': 150.00
            }
            
            # Tentar buscar regras personalizadas do banco
            try:
                result = supabase.table('system_rules').select('*').single().execute()
                if result.data:
                    rules = {
                        'hours': result.data.get('hours', default_rules['hours']),
                        'points': result.data.get('points', default_rules['points']),
                        'hourlyRate': result.data.get('hourly_rate', default_rules['hourlyRate'])
                    }
                else:
                    rules = default_rules
            except:
                rules = default_rules
            
            response = {'success': True, 'data': rules}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao buscar regras do sistema: {e}")
            response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def save_hours_rule(self):
        """Salvar regra de horas"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            baixo = data.get('baixo')
            medio = data.get('medio')
            complexo = data.get('complexo')
            
            if not all([baixo, medio, complexo]):
                response = {'success': False, 'error': 'Todos os valores de horas são obrigatórios'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            if baixo >= medio or medio >= complexo:
                response = {'success': False, 'error': 'Os valores devem ser crescentes: Baixo < Médio < Complexo'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            hours_rule = {'baixo': baixo, 'medio': medio, 'complexo': complexo}
            
            # Verificar se já existe uma regra
            try:
                existing = supabase.table('system_rules').select('id').single().execute()
                if existing.data:
                    # Atualizar
                    result = supabase.table('system_rules').update({'hours': hours_rule}).eq('id', existing.data['id']).execute()
                else:
                    # Inserir
                    result = supabase.table('system_rules').insert({'hours': hours_rule}).execute()
            except:
                # Inserir se não existe
                result = supabase.table('system_rules').insert({'hours': hours_rule}).execute()
            
            response = {'success': True, 'message': 'Regra de horas salva com sucesso'}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao salvar regra de horas: {e}")
            response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def save_points_rule(self):
        """Salvar regra de pontos"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            baixo = data.get('baixo')
            medio = data.get('medio')
            
            if not all([baixo, medio]):
                response = {'success': False, 'error': 'Todos os valores de pontos são obrigatórios'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            if baixo >= medio:
                response = {'success': False, 'error': 'O valor do nível médio deve ser maior que o nível baixo'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            points_rule = {'baixo': baixo, 'medio': medio}
            
            # Verificar se já existe uma regra
            try:
                existing = supabase.table('system_rules').select('id').single().execute()
                if existing.data:
                    # Atualizar
                    result = supabase.table('system_rules').update({'points': points_rule}).eq('id', existing.data['id']).execute()
                else:
                    # Inserir
                    result = supabase.table('system_rules').insert({'points': points_rule}).execute()
            except:
                # Inserir se não existe
                result = supabase.table('system_rules').insert({'points': points_rule}).execute()
            
            response = {'success': True, 'message': 'Regra de pontos salva com sucesso'}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao salvar regra de pontos: {e}")
            response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def save_rate_rule(self):
        """Salvar valor por hora"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            rate = data.get('rate')
            
            if not rate or rate <= 0:
                response = {'success': False, 'error': 'Valor por hora deve ser maior que zero'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            # Verificar se já existe uma regra
            try:
                existing = supabase.table('system_rules').select('id').single().execute()
                if existing.data:
                    # Atualizar
                    result = supabase.table('system_rules').update({'hourly_rate': rate}).eq('id', existing.data['id']).execute()
                else:
                    # Inserir
                    result = supabase.table('system_rules').insert({'hourly_rate': rate}).execute()
            except:
                # Inserir se não existe
                result = supabase.table('system_rules').insert({'hourly_rate': rate}).execute()
            
            response = {'success': True, 'message': 'Valor por hora salvo com sucesso'}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao salvar valor por hora: {e}")
            response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())

    # ========== SCOPE CATEGORIES API ==========
    def handle_scope_categories_api(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

        if self.command == 'GET':
            self.get_scope_categories()
        elif self.command == 'POST':
            self.create_scope_category()
        elif self.command == 'PUT':
            self.update_scope_category()
        elif self.command == 'DELETE':
            self.delete_scope_category()

    def get_scope_categories(self):
        try:
            # Verificar se é uma busca por ID específico
            path_parts = self.path.split('/')
            if len(path_parts) > 3 and path_parts[3].isdigit():
                # Busca por ID específico: /api/scope-categories/{id}
                category_id = int(path_parts[3])
                result = supabase.table('scope_categories').select('*').eq('id', category_id).execute()
                if result.data and len(result.data) > 0:
                    self.wfile.write(json.dumps(result.data[0]).encode())
                else:
                    self.send_error(404, "Categoria não encontrada")
                    return
            else:
                # Listagem geral
                result = supabase.table('scope_categories').select('*').order('name').execute()
                categories = result.data if result.data else []
                self.wfile.write(json.dumps(categories).encode())
        except Exception as e:
            print(f"Erro ao buscar categorias: {e}")
            response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())

    def create_scope_category(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            if not data.get('name'):
                raise ValueError('Nome da categoria é obrigatório')
            
            category_data = {
                'name': data['name'].strip(),
                'description': data.get('description', ''),
                'color': data.get('color', '#6366f1')
            }
            
            result = supabase.table('scope_categories').insert(category_data).execute()
            response = {'success': True, 'data': result.data[0] if result.data else None}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao criar categoria: {e}")
            response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())

    def update_scope_category(self):
        try:
            # Extrair ID da URL
            path_parts = self.path.split('/')
            category_id = path_parts[-1] if path_parts[-1].isdigit() else None
            
            if not category_id:
                raise ValueError('ID da categoria é obrigatório')
            
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            if not data.get('name'):
                raise ValueError('Nome da categoria é obrigatório')
            
            update_data = {
                'name': data['name'].strip(),
                'description': data.get('description', ''),
                'color': data.get('color', '#6366f1')
            }
            
            result = supabase.table('scope_categories').update(update_data).eq('id', category_id).execute()
            response = {'success': True, 'data': result.data[0] if result.data else None}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao atualizar categoria: {e}")
            response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())

    def delete_scope_category(self):
        try:
            # Extrair ID da URL
            path_parts = self.path.split('/')
            category_id = path_parts[-1] if path_parts[-1].isdigit() else None
            
            if not category_id:
                raise ValueError('ID da categoria é obrigatório')
            
            # Verificar se há itens vinculados
            items_result = supabase.table('scope_items').select('id').eq('category_id', category_id).limit(1).execute()
            if items_result.data:
                raise ValueError('Não é possível excluir categoria que possui itens vinculados')
            
            result = supabase.table('scope_categories').delete().eq('id', category_id).execute()
            response = {'success': True, 'message': 'Categoria excluída com sucesso'}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao excluir categoria: {e}")
            response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())

    # ========== SCOPE ITEMS API ==========
    def handle_scope_items_api(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

        # Verificar se é um endpoint de bulk update
        if self.path.endswith('/bulk') and self.command == 'PUT':
            self.bulk_update_scope_items()
        elif self.command == 'GET':
            self.get_scope_items()
        elif self.command == 'POST':
            self.create_scope_item()
        elif self.command == 'PUT':
            self.update_scope_item()
        elif self.command == 'DELETE':
            self.delete_scope_item()

    def get_scope_items(self):
        try:
            # Verificar se é uma busca por ID específico
            path_parts = self.path.split('/')
            if len(path_parts) > 3 and path_parts[3].split('?')[0].isdigit():
                # Busca por ID específico: /api/scope-items/{id}
                item_id = int(path_parts[3].split('?')[0])
                result = supabase.table('scope_items').select('''
                    *,
                    products:product_id(id, name, icon),
                    scope_categories:category_id(id, name, color)
                ''').eq('id', item_id).execute()
                
                if result.data and len(result.data) > 0:
                    item = result.data[0]
                    formatted_item = {
                        'id': item['id'],
                        'name': item['name'],
                        'description': item.get('description'),
                        'points': item['points'],
                        'hours': item['hours'],
                        'minutes': item['minutes'],
                        'is_active': item['is_active'],
                        'product_id': item['product_id'],
                        'category_id': item['category_id'],
                        'response_type': item.get('response_type', 'numeric'),
                        'product_name': item['products']['name'] if item.get('products') else 'N/A',
                        'category_name': item['scope_categories']['name'] if item.get('scope_categories') else 'N/A',
                        'category_color': item['scope_categories']['color'] if item.get('scope_categories') else '#007bff'
                    }
                    self.wfile.write(json.dumps(formatted_item).encode())
                else:
                    self.send_error(404, "Item não encontrado")
                    return
            else:
                # Listagem geral com filtros
                from urllib.parse import urlparse, parse_qs
                parsed_url = urlparse(self.path)
                query_params = parse_qs(parsed_url.query)
                
                query = supabase.table('scope_items').select('''
                    *,
                    products:product_id(id, name, icon),
                    scope_categories:category_id(id, name, color)
                ''').order('name')
                
                # Aplicar filtros
                if 'product_id' in query_params:
                    query = query.eq('product_id', query_params['product_id'][0])
                
                if 'category_id' in query_params:
                    query = query.eq('category_id', query_params['category_id'][0])
                
                if 'is_active' in query_params:
                    is_active = query_params['is_active'][0].lower() == 'true'
                    query = query.eq('is_active', is_active)
                
                result = query.execute()
                items = result.data if result.data else []
                
                # Formatar dados para o frontend
                formatted_items = []
                for item in items:
                    formatted_item = {
                        'id': item['id'],
                        'name': item['name'],
                        'description': item.get('description'),
                        'points': item['points'],
                        'hours': item['hours'],
                        'minutes': item['minutes'],
                        'is_active': item['is_active'],
                        'product_id': item['product_id'],
                        'category_id': item['category_id'],
                        'response_type': item.get('response_type', 'numeric'),
                        'product_name': item['products']['name'] if item.get('products') else 'N/A',
                        'category_name': item['scope_categories']['name'] if item.get('scope_categories') else 'N/A',
                        'category_color': item['scope_categories']['color'] if item.get('scope_categories') else '#007bff'
                    }
                    formatted_items.append(formatted_item)
                
                self.wfile.write(json.dumps(formatted_items).encode())
        except Exception as e:
            print(f"Erro ao buscar itens de escopo: {e}")
            response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())

    def create_scope_item(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Validações
            if not data.get('product_id'):
                raise ValueError('Produto é obrigatório')
            
            if not data.get('name'):
                raise ValueError('Nome do item é obrigatório')
            
            points = int(data.get('points', 0))
            hours = int(data.get('hours', 0))
            minutes = int(data.get('minutes', 0))
            
            if points < 0:
                raise ValueError('Pontos não podem ser negativos')
            
            if hours < 0:
                raise ValueError('Horas não podem ser negativas')
            
            if minutes < 0 or minutes >= 60:
                raise ValueError('Minutos devem estar entre 0 e 59')
            
            # Validar response_type
            response_type = data.get('response_type', 'numeric')
            if response_type not in ['numeric', 'boolean']:
                raise ValueError('Tipo de resposta deve ser "numeric" ou "boolean"')
            
            item_data = {
                'product_id': data['product_id'],
                'category_id': data.get('category_id'),
                'name': data['name'].strip(),
                'description': data.get('description', ''),
                'points': points,
                'hours': hours,
                'minutes': minutes,
                'is_active': data.get('is_active', True),
                'response_type': response_type
            }
            
            result = supabase.table('scope_items').insert(item_data).execute()
            response = {'success': True, 'data': result.data[0] if result.data else None}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao criar item de escopo: {e}")
            response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())

    def update_scope_item(self):
        try:
            # Extrair ID da URL
            path_parts = self.path.split('/')
            item_id = path_parts[-1] if path_parts[-1].isdigit() else None
            
            if not item_id:
                raise ValueError('ID do item é obrigatório')
            
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            update_data = {}
            
            if 'name' in data:
                if not data['name'].strip():
                    raise ValueError('Nome do item não pode estar vazio')
                update_data['name'] = data['name'].strip()
            
            if 'description' in data:
                update_data['description'] = data['description']
            
            if 'category_id' in data:
                update_data['category_id'] = data['category_id']
            
            if 'points' in data:
                points = int(data['points'])
                if points < 0:
                    raise ValueError('Pontos não podem ser negativos')
                update_data['points'] = points
            
            if 'hours' in data:
                hours = int(data['hours'])
                if hours < 0:
                    raise ValueError('Horas não podem ser negativas')
                update_data['hours'] = hours
            
            if 'minutes' in data:
                minutes = int(data['minutes'])
                if minutes < 0 or minutes >= 60:
                    raise ValueError('Minutos devem estar entre 0 e 59')
                update_data['minutes'] = minutes
            
            if 'is_active' in data:
                update_data['is_active'] = data['is_active']
            
            if 'response_type' in data:
                response_type = data['response_type']
                if response_type not in ['numeric', 'boolean']:
                    raise ValueError('Tipo de resposta deve ser "numeric" ou "boolean"')
                update_data['response_type'] = response_type
            
            result = supabase.table('scope_items').update(update_data).eq('id', item_id).execute()
            response = {'success': True, 'data': result.data[0] if result.data else None}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao atualizar item de escopo: {e}")
            response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())

    def delete_scope_item(self):
        try:
            # Extrair ID da URL
            path_parts = self.path.split('/')
            item_id = path_parts[-1] if path_parts[-1].isdigit() else None
            
            if not item_id:
                raise ValueError('ID do item é obrigatório')
            
            result = supabase.table('scope_items').delete().eq('id', item_id).execute()
            response = {'success': True, 'message': 'Item excluído com sucesso'}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"Erro ao excluir item de escopo: {e}")
            response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())

    def bulk_update_scope_items(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            items_data = json.loads(post_data.decode('utf-8'))
            
            if not isinstance(items_data, list):
                raise ValueError('Dados devem ser uma lista de itens')
            
            updated_items = []
            
            for item_data in items_data:
                if not item_data.get('id'):
                    continue
                    
                item_id = item_data['id']
                update_data = {}
                
                if 'name' in item_data and item_data['name'].strip():
                    update_data['name'] = item_data['name'].strip()
                
                if 'description' in item_data:
                    update_data['description'] = item_data['description']
                
                if 'hours' in item_data:
                    hours = int(item_data['hours'])
                    if hours >= 0:
                        update_data['hours'] = hours
                
                if 'minutes' in item_data:
                    minutes = int(item_data['minutes'])
                    if 0 <= minutes < 60:
                        update_data['minutes'] = minutes
                
                if 'is_active' in item_data:
                    update_data['is_active'] = bool(item_data['is_active'])
                
                if 'response_type' in item_data:
                    response_type = item_data['response_type']
                    if response_type in ['numeric', 'boolean']:
                        update_data['response_type'] = response_type
                
                if update_data:
                    result = supabase.table('scope_items').update(update_data).eq('id', item_id).execute()
                    if result.data:
                        updated_items.extend(result.data)
            
            response = {
                'success': True, 
                'message': f'{len(updated_items)} itens atualizados com sucesso',
                'updated_items': updated_items
            }
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"Erro no bulk update de itens de escopo: {e}")
            response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(response).encode())

    # Handler para API de Perguntas Avançadas
    def handle_advanced_questions_api(self):
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
                self.get_advanced_questions()
            elif self.command == 'POST':
                if '/calculate-scope' in self.path:
                    self.calculate_question_scope()
                else:
                    self.create_advanced_question()
            elif self.command == 'PUT':
                self.update_advanced_question()
            elif self.command == 'DELETE':
                self.delete_advanced_question()
        except Exception as e:
            print(f"Erro na API de perguntas avançadas: {e}")
            response = {'error': 'Erro interno do servidor: ' + str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def get_advanced_questions(self):
        try:
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            
            # Verificar se é busca por ID específico
            path_parts = self.path.split('/')
            question_id = None
            for i, part in enumerate(path_parts):
                if part == 'advanced-questions' and i + 1 < len(path_parts):
                    potential_id = path_parts[i + 1]
                    if potential_id and not potential_id.startswith('?'):
                        question_id = potential_id
                        break
            
            if question_id:
                # Buscar pergunta específica com todas as vinculações
                result = supabase.table('questions').select(
                    '*, products(id, name, icon), '
                    'question_options(*), '
                    'question_scope_items(*, scope_items(*, scope_categories(*))), '
                    'question_agent_rules(*, agent_rule_scope_items(*, scope_items(*, scope_categories(*))))'
                ).eq('id', question_id).single().execute()
                
                if result.data:
                    self.wfile.write(json.dumps(result.data).encode())
                else:
                    response = {'error': 'Pergunta não encontrada'}
                    self.wfile.write(json.dumps(response).encode())
            else:
                # Buscar todas as perguntas com filtros
                query = supabase.table('questions').select(
                    '*, products(id, name, icon), '
                    'question_options(*), '
                    'question_scope_items(*, scope_items(*, scope_categories(*))), '
                    'question_agent_rules(*, agent_rule_scope_items(*, scope_items(*, scope_categories(*))))'
                )
                
                # Aplicar filtros se fornecidos
                if 'product_id' in query_params:
                    query = query.eq('product_id', query_params['product_id'][0])
                if 'billing_model' in query_params:
                    query = query.eq('billing_model', query_params['billing_model'][0])
                
                result = query.order('order_index').execute()
                self.wfile.write(json.dumps(result.data).encode())
                
        except Exception as e:
            print(f"Erro ao buscar perguntas avançadas: {e}")
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def create_advanced_question(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Validar dados obrigatórios
            if not data.get('product_id'):
                raise ValueError('product_id é obrigatório')
            if not data.get('text'):
                raise ValueError('text é obrigatório')
            if not data.get('answer_type') or data['answer_type'] not in ['numeric', 'dropdown']:
                raise ValueError('answer_type deve ser "numeric" ou "dropdown"')
            
            # Criar pergunta principal
            question_data = {
                'product_id': data['product_id'],
                'billing_model': data.get('billing_model', 'escopo_fechado'),
                'text': data['text'],
                'type': data.get('type', 'numeric'),
                'answer_type': data['answer_type'],
                'is_required': data.get('is_required', False),
                'has_agent_rules': data.get('has_agent_rules', False),
                'ignore_if_not_answered': data.get('ignore_if_not_answered', False),
                'project_level': data.get('project_level'),
                'is_complexity_question': data.get('is_complexity_question', False),
                'order_index': data.get('order_index', 0)
            }
            
            question_result = supabase.table('questions').insert(question_data).execute()
            question_id = question_result.data[0]['id']
            
            # Inserir opções se for dropdown
            if data['answer_type'] == 'dropdown' and data.get('options'):
                options_data = []
                for option in data['options']:
                    options_data.append({
                        'question_id': question_id,
                        'label': option['label'],
                        'value': option.get('value', option['label']),
                        'numeric_value': option.get('numeric_value'),
                        'cost_per_hour': option.get('cost_per_hour', 0),
                        'hours_impact': option.get('hours_impact', 0),
                        'complexity_weight': option.get('complexity_weight', 0)
                    })
                
                supabase.table('question_options').insert(options_data).execute()
            
            # Inserir vinculações com itens de escopo
            if data.get('scope_items'):
                scope_items_data = []
                for item in data['scope_items']:
                    scope_items_data.append({
                        'question_id': question_id,
                        'scope_item_id': item['scope_item_id'],
                        'quantity_per_unit': item.get('quantity_per_unit', 1.0),
                        'option_id': item.get('option_id')
                    })
                
                supabase.table('question_scope_items').insert(scope_items_data).execute()
            
            # Inserir regras de agentes
            if data.get('has_agent_rules') and data.get('agent_rules'):
                for rule in data['agent_rules']:
                    rule_data = {
                        'question_id': question_id,
                        'min_agents': rule['min_agents'],
                        'max_agents': rule['max_agents'],
                        'rule_order': rule.get('rule_order', 0),
                        'ignore_question': rule.get('ignore_question', False)
                    }
                    
                    rule_result = supabase.table('question_agent_rules').insert(rule_data).execute()
                    rule_id = rule_result.data[0]['id']
                    
                    # Inserir itens de escopo para esta regra
                    if rule.get('scope_items'):
                        rule_scope_items = []
                        for item in rule['scope_items']:
                            rule_scope_items.append({
                                'agent_rule_id': rule_id,
                                'scope_item_id': item['scope_item_id'],
                                'quantity': item.get('quantity', 1.0)
                            })
                        
                        supabase.table('agent_rule_scope_items').insert(rule_scope_items).execute()
            
            # Buscar pergunta criada com todas as vinculações
            created_question = supabase.table('questions').select(
                '*, question_options(*), '
                'question_scope_items(*, scope_items(*)), '
                'question_agent_rules(*, agent_rule_scope_items(*, scope_items(*)))'
            ).eq('id', question_id).single().execute()
            
            self.wfile.write(json.dumps(created_question.data).encode())
            
        except Exception as e:
            print(f"Erro ao criar pergunta avançada: {e}")
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def update_advanced_question(self):
        try:
            # Extrair ID da URL
            path_parts = self.path.split('/')
            question_id = None
            for i, part in enumerate(path_parts):
                if part == 'advanced-questions' and i + 1 < len(path_parts):
                    question_id = path_parts[i + 1]
                    break
            
            if not question_id:
                raise ValueError('ID da pergunta é obrigatório')
            
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Atualizar pergunta principal
            question_data = {
                'text': data['text'],
                'type': data.get('type', 'numeric'),
                'answer_type': data['answer_type'],
                'is_required': data.get('is_required', False),
                'has_agent_rules': data.get('has_agent_rules', False),
                'ignore_if_not_answered': data.get('ignore_if_not_answered', False),
                'project_level': data.get('project_level'),
                'is_complexity_question': data.get('is_complexity_question', False),
                'order_index': data.get('order_index', 0)
            }
            
            supabase.table('questions').update(question_data).eq('id', question_id).execute()
            
            # Atualizar opções (deletar e recriar)
            supabase.table('question_options').delete().eq('question_id', question_id).execute()
            
            if data['answer_type'] == 'dropdown' and data.get('options'):
                options_data = []
                for option in data['options']:
                    options_data.append({
                        'question_id': question_id,
                        'label': option['label'],
                        'value': option.get('value', option['label']),
                        'numeric_value': option.get('numeric_value'),
                        'cost_per_hour': option.get('cost_per_hour', 0),
                        'hours_impact': option.get('hours_impact', 0),
                        'complexity_weight': option.get('complexity_weight', 0)
                    })
                
                supabase.table('question_options').insert(options_data).execute()
            
            # Atualizar vinculações com itens de escopo
            supabase.table('question_scope_items').delete().eq('question_id', question_id).execute()
            
            if data.get('scope_items'):
                scope_items_data = []
                for item in data['scope_items']:
                    scope_items_data.append({
                        'question_id': question_id,
                        'scope_item_id': item['scope_item_id'],
                        'quantity_per_unit': item.get('quantity_per_unit', 1.0),
                        'option_id': item.get('option_id')
                    })
                
                supabase.table('question_scope_items').insert(scope_items_data).execute()
            
            # Atualizar regras de agentes
            supabase.table('question_agent_rules').delete().eq('question_id', question_id).execute()
            
            if data.get('has_agent_rules') and data.get('agent_rules'):
                for rule in data['agent_rules']:
                    rule_data = {
                        'question_id': question_id,
                        'min_agents': rule['min_agents'],
                        'max_agents': rule['max_agents'],
                        'rule_order': rule.get('rule_order', 0),
                        'ignore_question': rule.get('ignore_question', False)
                    }
                    
                    rule_result = supabase.table('question_agent_rules').insert(rule_data).execute()
                    rule_id = rule_result.data[0]['id']
                    
                    if rule.get('scope_items'):
                        rule_scope_items = []
                        for item in rule['scope_items']:
                            rule_scope_items.append({
                                'agent_rule_id': rule_id,
                                'scope_item_id': item['scope_item_id'],
                                'quantity': item.get('quantity', 1.0)
                            })
                        
                        supabase.table('agent_rule_scope_items').insert(rule_scope_items).execute()
            
            # Buscar pergunta atualizada
            updated_question = supabase.table('questions').select(
                '*, question_options(*), '
                'question_scope_items(*, scope_items(*)), '
                'question_agent_rules(*, agent_rule_scope_items(*, scope_items(*)))'
            ).eq('id', question_id).single().execute()
            
            self.wfile.write(json.dumps(updated_question.data).encode())
            
        except Exception as e:
            print(f"Erro ao atualizar pergunta avançada: {e}")
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def delete_advanced_question(self):
        try:
            # Extrair ID da URL
            path_parts = self.path.split('/')
            question_id = None
            for i, part in enumerate(path_parts):
                if part == 'advanced-questions' and i + 1 < len(path_parts):
                    question_id = path_parts[i + 1]
                    break
            
            if not question_id:
                raise ValueError('ID da pergunta é obrigatório')
            
            # Deletar pergunta (cascade irá deletar vinculações)
            supabase.table('questions').delete().eq('id', question_id).execute()
            
            response = {'success': True, 'message': 'Pergunta deletada com sucesso'}
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"Erro ao deletar pergunta avançada: {e}")
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def calculate_question_scope(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            question_id = data.get('question_id')
            answer_value = data.get('answer_value')
            agents_count = data.get('agents_count')
            
            if not question_id:
                raise ValueError('question_id é obrigatório')
            
            # Buscar pergunta com vinculações
            question = supabase.table('questions').select(
                '*, question_scope_items(*, scope_items(*)), '
                'question_agent_rules(*, agent_rule_scope_items(*, scope_items(*)))'
            ).eq('id', question_id).single().execute()
            
            if not question.data:
                raise ValueError('Pergunta não encontrada')
            
            question_data = question.data
            scope_items = []
            
            # Se a pergunta foi respondida
            if answer_value is not None and answer_value != '':
                # Para perguntas numéricas
                if question_data['answer_type'] == 'numeric':
                    numeric_value = float(answer_value)
                    for item in question_data.get('question_scope_items', []):
                        if not item.get('option_id'):  # Itens não vinculados a opções específicas
                            scope_items.append({
                                'scope_item': item['scope_items'],
                                'quantity': numeric_value * item['quantity_per_unit']
                            })
                
                # Para perguntas dropdown
                elif question_data['answer_type'] == 'dropdown':
                    for item in question_data.get('question_scope_items', []):
                        if item.get('option_id') == answer_value:
                            scope_items.append({
                                'scope_item': item['scope_items'],
                                'quantity': item['quantity_per_unit']
                            })
            
            # Se a pergunta não foi respondida, usar regras de agentes
            elif agents_count and question_data.get('has_agent_rules'):
                applicable_rule = None
                for rule in question_data.get('question_agent_rules', []):
                    if agents_count >= rule['min_agents'] and agents_count <= rule['max_agents']:
                        applicable_rule = rule
                        break
                
                if applicable_rule and not applicable_rule.get('ignore_question'):
                    for item in applicable_rule.get('agent_rule_scope_items', []):
                        scope_items.append({
                            'scope_item': item['scope_items'],
                            'quantity': item['quantity']
                        })
            
            # Calcular totais
            total_points = sum(item['scope_item']['points'] * item['quantity'] for item in scope_items)
            total_hours = sum(item['scope_item']['hours'] * item['quantity'] for item in scope_items)
            total_minutes = sum(item['scope_item']['minutes'] * item['quantity'] for item in scope_items)
            
            response = {
                'question': question_data,
                'scope_items': scope_items,
                'total_points': total_points,
                'total_hours': total_hours,
                'total_minutes': total_minutes
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"Erro ao calcular escopo da pergunta: {e}")
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())

    # ========== DEFAULT PROJECTS API ==========
    def handle_default_projects_api(self):
        """Gerenciar API de projetos padrões"""

        try:
            if self.command == 'GET':

                # Para GET, enviar cabeçalhos normalmente
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                self.get_default_projects()
            elif self.command == 'POST':
                # Para POST, deixar save_default_projects gerenciar a resposta completamente
                self.save_default_projects()
            elif self.command == 'PUT':
                # Para PUT, enviar cabeçalhos normalmente
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                self.update_default_projects()
            else:
                # Para métodos não suportados, enviar resposta de erro manual
                error_response = {'error': 'Método não suportado'}
                response_json = json.dumps(error_response)
                http_response = f"HTTP/1.1 405 Method Not Allowed\r\n"
                http_response += f"Content-Type: application/json\r\n"
                http_response += f"Access-Control-Allow-Origin: *\r\n"
                http_response += f"Content-Length: {len(response_json)}\r\n"
                http_response += f"\r\n"
                http_response += response_json
                self.wfile.write(http_response.encode())
        except Exception as e:
            print(f"Erro na API de projetos padrões: {e}")
            error_response = {'error': str(e)}
            response_json = json.dumps(error_response)
            http_response = f"HTTP/1.1 500 Internal Server Error\r\n"
            http_response += f"Content-Type: application/json\r\n"
            http_response += f"Access-Control-Allow-Origin: *\r\n"
            http_response += f"Content-Length: {len(response_json)}\r\n"
            http_response += f"\r\n"
            http_response += response_json
            self.wfile.write(http_response.encode())
    
    def get_default_projects(self):
        """Buscar configurações de projetos padrões baseado nos itens de escopo"""

        try:
            if not supabase:
                print("ERRO: Conexão com Supabase não está ativa!")
                # Fallback para dados fixos se não houver conexão com o banco
                default_data = [
                    {'name': 'Marcas', 'values': [1, 1, 2, 2, 3, 5]},
                    {'name': 'Canais de entrada', 'values': [2, 4, 5, 8, 10, 10]},
                    {'name': 'Instruções IA essencial', 'values': [3, 4, 6, 10, 20, 20]},
                    {'name': 'Grupos', 'values': [2, 4, 8, 10, 12, 15]},
                    {'name': 'Gatilhos', 'values': [5, 7, 10, 12, 14, 18]},
                    {'name': 'Automações', 'values': [2, 2, 4, 5, 7, 10]},
                    {'name': 'Visualizações', 'values': [7, 8, 10, 12, 15, 20]},
                    {'name': 'Encaminhamento omnichannel', 'values': ['Sim', 'Sim', 'Sim', 'Sim', 'Sim', 'Sim']},
                    {'name': 'Webhook', 'values': [0, 0, 1, 2, 3, 4]},
                    {'name': 'Macros', 'values': [3, 4, 5, 6, 8, 10]},
                    {'name': 'Orientação importação usuário/org', 'values': ['Não', 'Sim', 'Sim', 'Sim', 'Sim', 'Sim']},
                    {'name': 'Formulários', 'values': [1, 2, 2, 2, 3, 4]},
                    {'name': 'Campos Ticket', 'values': [3, 5, 6, 6, 8, 10]},
                    {'name': 'Campos de usuário', 'values': [2, 1, 5, 6, 8, 10]},
                    {'name': 'Conteúdo dinâmico', 'values': [5, 10, 15, 20, 20, 20]},
                    {'name': 'Objetos personalizados', 'values': [1, 1, 2, 2, 4, 4]},
                    {'name': 'SLA', 'values': [2, 3, 4, 5, 6, 6]},
                    {'name': 'Horário de programação e feriado', 'values': [1, 1, 1, 2, 2, 2]},
                    {'name': 'Treinamento Relatórios', 'values': [1, 1, 1, 1, 1, 1]}
                ]
            else:
                # Buscar dados dos itens de escopo ativos com response_type
                result = supabase.table('scope_items').select('*').eq('is_active', True).order('name').execute()
                
                if result.data:
                    # Converter dados dos itens de escopo para o formato esperado pelo frontend
                    default_data = []

                    
                    # Definir faixas de agentes e suas horas correspondentes
                    agent_ranges = [
                        {'min': 0, 'max': 10, 'hours': 32},
                        {'min': 11, 'max': 20, 'hours': 76}, 
                        {'min': 21, 'max': 40, 'hours': 96},
                        {'min': 41, 'max': 70, 'hours': 126},
                        {'min': 71, 'max': 100, 'hours': 156},
                        {'min': 101, 'max': 999999, 'hours': 186}
                    ]
                    
                    for item in result.data:

                        
                        # Usar valores salvos nas colunas agents_* se existirem, senão calcular
                        response_type = item.get('response_type', 'numeric')
                        
                        # Verificar se temos valores salvos nas colunas agents_*
                        saved_values = [
                            item.get('agents_10'),
                            item.get('agents_20'), 
                            item.get('agents_40'),
                            item.get('agents_70'),
                            item.get('agents_100'),
                            item.get('agents_more')
                        ]
                        
                        # Se todos os valores salvos existem, usar eles
                        if all(v is not None for v in saved_values):
                            if response_type == 'boolean':
                                values = saved_values  # Manter como strings para boolean
                            else:
                                # Converter para números para valores numéricos
                                values = []
                                for v in saved_values:
                                    try:
                                        values.append(int(v) if v.isdigit() else v)
                                    except:
                                        values.append(v)
                        else:
                            # Fallback: calcular valores baseados em horas/minutos
                            if response_type == 'boolean':
                                total_hours = item['hours'] + (item['minutes'] / 60.0)
                                if total_hours > 2:
                                    values = ['Não', 'Sim', 'Sim', 'Sim', 'Sim', 'Sim']
                                else:
                                    values = ['Sim', 'Sim', 'Sim', 'Sim', 'Sim', 'Sim']
                            else:
                                total_hours = item['hours'] + (item['minutes'] / 60.0)
                                values = []
                                for range_info in agent_ranges:
                                    scale_factor = range_info['hours'] / 32.0
                                    scaled_value = max(1, round(total_hours * scale_factor))
                                    values.append(scaled_value)
                        

                        
                        default_data.append({
                            'name': item['name'],
                            'values': values,
                            'response_type': response_type
                        })
                else:
                    # Se não há itens de escopo, usar dados padrão
                    default_data = [
                        {'name': 'Marcas', 'values': [1, 1, 2, 2, 3, 5]},
                        {'name': 'Canais de entrada', 'values': [2, 4, 5, 8, 10, 10]},
                        {'name': 'Instruções IA essencial', 'values': [3, 4, 6, 10, 20, 20]},
                        {'name': 'Grupos', 'values': [2, 4, 8, 10, 12, 15]},
                        {'name': 'Gatilhos', 'values': [5, 7, 10, 12, 14, 18]},
                        {'name': 'Automações', 'values': [2, 2, 4, 5, 7, 10]},
                        {'name': 'Visualizações', 'values': [7, 8, 10, 12, 15, 20]},
                        {'name': 'Encaminhamento omnichannel', 'values': ['Sim', 'Sim', 'Sim', 'Sim', 'Sim', 'Sim']},
                        {'name': 'Webhook', 'values': [0, 0, 1, 2, 3, 4]},
                        {'name': 'Macros', 'values': [3, 4, 5, 6, 8, 10]},
                        {'name': 'Orientação importação usuário/org', 'values': ['Não', 'Sim', 'Sim', 'Sim', 'Sim', 'Sim']},
                        {'name': 'Formulários', 'values': [1, 2, 2, 2, 3, 4]},
                        {'name': 'Campos Ticket', 'values': [3, 5, 6, 6, 8, 10]},
                        {'name': 'Campos de usuário', 'values': [2, 1, 5, 6, 8, 10]},
                        {'name': 'Conteúdo dinâmico', 'values': [5, 10, 15, 20, 20, 20]},
                        {'name': 'Objetos personalizados', 'values': [1, 1, 2, 2, 4, 4]},
                        {'name': 'SLA', 'values': [2, 3, 4, 5, 6, 6]},
                        {'name': 'Horário de programação e feriado', 'values': [1, 1, 1, 2, 2, 2]},
                        {'name': 'Treinamento Relatórios', 'values': [1, 1, 1, 1, 1, 1]}
                    ]
            
            response = {
                'success': True,
                'data': default_data,
                'agent_ranges': [
                    'Até 10 agentes (32h)',
                    '11 a 20 agentes (76h)',
                    '21 a 40 agentes (96h)',
                    '41 a 70 agentes (126h)',
                    '71 a 100 agentes (156h)',
                    'Mais de 100 agentes (186h)'
                ]
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"Erro ao buscar projetos padrões: {e}")
            response = {'error': str(e)}
            self.wfile.write(json.dumps(response).encode())
    
    def save_default_projects(self):
        """Salvar configurações de projetos padrões atualizando itens de escopo"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            print(f"\n=== SAVE DEFAULT PROJECTS (SCOPE ITEMS) ===")
            print(f"Dados recebidos: {data}")
            print(f"Tipo dos dados: {type(data)}")
            
            if not supabase:
                response = {
                    'success': False,
                    'message': 'Erro: Conexão com banco de dados não disponível'
                }
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                return
            
            # Verificar se os dados estão no formato correto
            if isinstance(data, dict) and 'data' in data:
                items_data = data['data']
            elif isinstance(data, dict) and 'projects' in data:
                items_data = data['projects']
            else:
                items_data = data if isinstance(data, list) else []
            
            print(f"Items data extraídos: {items_data}")
            
            # Verificar se items_data é uma lista
            if not isinstance(items_data, list):
                raise ValueError(f"Dados esperados como lista, recebido: {type(items_data)}")
            
            updated_count = 0
            
            for i, item in enumerate(items_data):
                if not isinstance(item, dict):
                    raise ValueError(f"Item {i} deve ser um dicionário, recebido: {type(item)} - {item}")
                
                if 'name' not in item or 'values' not in item:
                    raise ValueError(f"Item {i} deve ter 'name' e 'values': {item}")
                
                if not isinstance(item['values'], list) or len(item['values']) != 6:
                    raise ValueError(f"Item {i} 'values' deve ser uma lista com 6 elementos: {item['values']}")
                
                item_name = item['name']
                values = item['values']
                response_type = item.get('response_type', 'numeric')
                
                print(f"Processando item: {item_name}, values: {values}, type: {response_type}")
                
                # Buscar o item de escopo pelo nome
                scope_result = supabase.table('scope_items').select('*').eq('name', item_name).eq('is_active', True).execute()
                
                if scope_result.data and len(scope_result.data) > 0:
                    scope_item = scope_result.data[0]
                    scope_item_id = scope_item['id']
                    
                    # Calcular novos valores de hours e minutes baseados nos valores editados
                    # Para itens numéricos, usar o valor da primeira faixa (até 10 agentes) como base
                    if response_type == 'numeric':
                        # Usar o valor da primeira faixa como referência para calcular horas
                        base_value = values[0] if isinstance(values[0], (int, float)) else 1
                        # Converter para horas (assumindo que cada unidade = 0.5 horas)
                        new_hours = max(0, int(base_value * 0.5))
                        new_minutes = int((base_value * 0.5 - new_hours) * 60)
                    else:
                        # Para itens booleanos, manter os valores originais
                        new_hours = scope_item['hours']
                        new_minutes = scope_item['minutes']
                    
                    # Atualizar o item de escopo com valores por nível de projeto
                    update_data = {
                        'hours': new_hours,
                        'minutes': new_minutes,
                        'response_type': response_type,
                        'agents_10': str(values[0]) if values[0] is not None else None,
                        'agents_20': str(values[1]) if values[1] is not None else None,
                        'agents_40': str(values[2]) if values[2] is not None else None,
                        'agents_70': str(values[3]) if values[3] is not None else None,
                        'agents_100': str(values[4]) if values[4] is not None else None,
                        'agents_more': str(values[5]) if values[5] is not None else None
                    }
                    
                    print(f"Atualizando scope_item {scope_item_id}: {update_data}")
                    
                    update_result = supabase.table('scope_items').update(update_data).eq('id', scope_item_id).execute()
                    
                    if update_result.data:
                        updated_count += 1
                        print(f"Item {item_name} atualizado com sucesso")
                    else:
                        print(f"Erro ao atualizar item {item_name}")
                else:
                    print(f"Item de escopo '{item_name}' não encontrado")
            
            if updated_count > 0:
                response = {
                    'success': True,
                    'message': f'{updated_count} itens atualizados com sucesso',
                    'updated_count': updated_count
                }
            else:
                response = {
                    'success': False,
                    'message': 'Nenhum item foi atualizado'
                }
            
            print(f"Resposta final: {response}")
            
            # Enviar resposta HTTP manual para evitar cabeçalhos duplicados
            response_json = json.dumps(response)
            http_response = f"HTTP/1.1 200 OK\r\n"
            http_response += f"Content-Type: application/json\r\n"
            http_response += f"Access-Control-Allow-Origin: *\r\n"
            http_response += f"Content-Length: {len(response_json)}\r\n"
            http_response += f"\r\n"
            http_response += response_json
            
            self.wfile.write(http_response.encode())
            
        except Exception as e:
            print(f"Erro ao salvar projetos padrão: {str(e)}")
            import traceback
            traceback.print_exc()
            
            error_response = {
                'success': False,
                'message': f'Erro interno do servidor: {str(e)}'
            }
            
            # Enviar resposta HTTP manual para evitar cabeçalhos duplicados
            response_json = json.dumps(error_response)
            http_response = f"HTTP/1.1 500 Internal Server Error\r\n"
            http_response += f"Content-Type: application/json\r\n"
            http_response += f"Access-Control-Allow-Origin: *\r\n"
            http_response += f"Content-Length: {len(response_json)}\r\n"
            http_response += f"\r\n"
            http_response += response_json
            
            self.wfile.write(http_response.encode())
    
    def update_default_projects(self):
        """Atualizar configurações de projetos padrões no banco de dados"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            if not supabase:
                response = {
                    'success': False,
                    'message': 'Erro: Conexão com banco de dados não disponível'
                }
                self.wfile.write(json.dumps(response).encode())
                return
            
            # Converter dados do frontend para formato do banco
            records_to_upsert = []
            for item in data:
                record = {
                    'item_name': item['name'],
                    'agents_10': str(item['values'][0]),
                    'agents_20': str(item['values'][1]),
                    'agents_40': str(item['values'][2]),
                    'agents_70': str(item['values'][3]),
                    'agents_100': str(item['values'][4]),
                    'agents_more': str(item['values'][5])
                }
                records_to_upsert.append(record)
            
            # Usar upsert para atualizar registros existentes
            result = supabase.table('default_projects').upsert(
                records_to_upsert,
                on_conflict='item_name'
            ).execute()
            
            if result.data:
                response = {
                    'success': True,
                    'message': f'Configurações atualizadas com sucesso! {len(result.data)} itens modificados.'
                }
            else:
                response = {
                    'success': False,
                    'message': 'Erro ao atualizar dados no banco'
                }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"Erro ao atualizar projetos padrões: {e}")
            response = {
                'success': False,
                'error': str(e),
                'message': 'Erro interno do servidor ao atualizar dados'
            }
            self.wfile.write(json.dumps(response).encode())

if __name__ == "__main__":
    PORT = 8000
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"Servidor rodando na porta {PORT}")
        print(f"Acesse: http://localhost:{PORT}")
        httpd.serve_forever()