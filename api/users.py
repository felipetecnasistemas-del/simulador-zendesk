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

def handler(request):
    # Headers CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

        if request.method == 'GET':
            response = supabase.table('users').select('*').execute()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(response.data)
            }
            
        elif request.method == 'POST':
            body = json.loads(request.body)
            response = supabase.table('users').insert(body).execute()
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps(response.data)
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