import json
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

def handler(request, response):
    # Headers CORS
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Content-Type'] = 'application/json'
    
    # Handle OPTIONS request (CORS preflight)
    if request.method == 'OPTIONS':
        response.status_code = 200
        return response.json('')
    
    try:
        if not supabase:
            response.status_code = 500
            return response.json({"error": "Erro de conexão com banco"})

        # Parse URL para obter parâmetros
        url_parts = urlparse(request.url)
        path_parts = url_parts.path.split('/')
        query_params = parse_qs(url_parts.query)
        
        if request.method == 'GET':
            # Se há ID na URL, buscar projeto específico
            if len(path_parts) > 3 and path_parts[3]:
                project_id = path_parts[3]
                result = supabase.table('projects').select('*').eq('id', project_id).execute()
            else:
                # Buscar todos os projetos
                result = supabase.table('projects').select('*').execute()
            
            response.status_code = 200
            return response.json(result.data)
            
        elif request.method == 'POST':
            body = json.loads(request.body)
            result = supabase.table('projects').insert(body).execute()
            response.status_code = 201
            return response.json(result.data)
            
        elif request.method == 'PUT':
            if len(path_parts) > 3 and path_parts[3]:
                project_id = path_parts[3]
                body = json.loads(request.body)
                result = supabase.table('projects').update(body).eq('id', project_id).execute()
                response.status_code = 200
                return response.json(result.data)
            else:
                response.status_code = 400
                return response.json({"error": "ID do projeto é obrigatório para atualização"})
                
        elif request.method == 'DELETE':
            if len(path_parts) > 3 and path_parts[3]:
                project_id = path_parts[3]
                result = supabase.table('projects').delete().eq('id', project_id).execute()
                response.status_code = 200
                return response.json({"message": "Projeto deletado com sucesso"})
            else:
                response.status_code = 400
                return response.json({"error": "ID do projeto é obrigatório para exclusão"})
            
        else:
            response.status_code = 405
            return response.json({"error": "Método não permitido"})
            
    except Exception as e:
        response.status_code = 500
        return response.json({"error": str(e)})