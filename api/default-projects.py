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
        """Buscar configurações de projetos padrões baseado nos itens de escopo"""
        try:
            if not supabase:
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
                # Buscar dados dos itens de escopo ativos
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
                                        values.append(int(v) if str(v).isdigit() else v)
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
                    # Se não há dados no banco, usar dados fixos
                    default_data = [
                        {'name': 'Marcas', 'values': [1, 1, 2, 2, 3, 5]},
                        {'name': 'Canais de entrada', 'values': [2, 4, 5, 8, 10, 10]},
                        {'name': 'Instruções IA essencial', 'values': [3, 4, 6, 10, 20, 20]}
                    ]
            
            response_data = {
                "success": True,
                "data": default_data
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
            
            # Marcar projeto como template/padrão
            body['is_template'] = True
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
                # Remover marcação de template ao invés de deletar o projeto
                result = supabase.table('projects').update({'is_template': False}).eq('id', project_id).execute()
                
                self.send_response(200)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"message": "Projeto removido dos padrões com sucesso"}).encode('utf-8'))
            else:
                self.send_response(400)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "ID do projeto é obrigatório para remoção"}).encode('utf-8'))
                
        except Exception as e:
            self.send_response(500)
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))