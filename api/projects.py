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

def handler(request):
    # Headers CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }
    
    # Handle OPTIONS request (CORS preflight)
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    try:
        if not supabase:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({"error": "Erro de conexão com banco"})
            }

        # Parse URL para obter parâmetros
        url_parts = urlparse(request.url)
        path_parts = url_parts.path.split('/')
        query_params = parse_qs(url_parts.query)
        
        if request.method == 'GET':
            # Se há ID na URL, buscar projeto específico
            if len(path_parts) > 3 and path_parts[3]:
                project_id = path_parts[3]
                response = supabase.table('projects').select('*').eq('id', project_id).execute()
            else:
                # Buscar todos os projetos
                response = supabase.table('projects').select('*').execute()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(response.data)
            }
            
        elif request.method == 'POST':
            body = json.loads(request.body)
            response = supabase.table('projects').insert(body).execute()
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps(response.data)
            }
            
        elif request.method == 'PUT':
            if len(path_parts) > 3 and path_parts[3]:
                project_id = path_parts[3]
                body = json.loads(request.body)
                response = supabase.table('projects').update(body).eq('id', project_id).execute()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(response.data)
                }
            else:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({"error": "ID do projeto é obrigatório para atualização"})
                }
                
        elif request.method == 'DELETE':
            if len(path_parts) > 3 and path_parts[3]:
                project_id = path_parts[3]
                response = supabase.table('projects').delete().eq('id', project_id).execute()
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({"message": "Projeto deletado com sucesso"})
                }
            else:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({"error": "ID do projeto é obrigatório para exclusão"})
                }
            
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({"error": "Método não permitido"})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({"error": str(e)})
        }