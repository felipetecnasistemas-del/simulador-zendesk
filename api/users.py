import json
from supabase import create_client, Client

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
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
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

        if request.method == 'GET':
            result = supabase.table('users').select('*').execute()
            response.status_code = 200
            return response.json(result.data)
            
        elif request.method == 'POST':
            body = json.loads(request.body)
            result = supabase.table('users').insert(body).execute()
            response.status_code = 201
            return response.json(result.data)
            
        else:
            response.status_code = 405
            return response.json({"error": "Método não permitido"})
            
    except Exception as e:
        response.status_code = 500
        return response.json({"error": str(e)})