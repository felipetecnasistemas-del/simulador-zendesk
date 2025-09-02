from flask import Flask, request, jsonify
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

app = Flask(__name__)

# Configurar CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/api/scope-items', methods=['OPTIONS'])
@app.route('/api/scope-items/<int:item_id>', methods=['OPTIONS'])
def handle_options(item_id=None):
    print(f"[OPTIONS] Método OPTIONS chamado para item_id: {item_id}")
    return '', 200

@app.route('/api/scope-items', methods=['GET'])
def get_scope_items():
    print(f"[GET] Método GET chamado")
    try:
        if not supabase:
            print("[GET] Erro: Supabase não conectado")
            return jsonify({"error": "Erro de conexão com banco"}), 500

        # Verificar se há filtro por produto
        product_id = request.args.get('product_id')
        
        if product_id:
            # Buscar itens de escopo por produto específico
            result = supabase.table('scope_items').select('*, scope_categories(name, color)').eq('product_id', product_id).eq('is_active', True).execute()
        else:
            # Buscar todos os itens de escopo ativos
            result = supabase.table('scope_items').select('*, scope_categories(name, color)').eq('is_active', True).execute()
        
        return jsonify({
            "success": True,
            "data": result.data
        }), 200
        
    except Exception as e:
        print(f"[GET] Erro: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/scope-items', methods=['POST'])
def create_scope_item():
    print(f"[POST] Método POST chamado")
    try:
        if not supabase:
            print("[POST] Erro: Supabase não conectado")
            return jsonify({"error": "Erro de conexão com banco"}), 500

        data = request.get_json()
        print(f"[POST] Dados recebidos: {data}")
        
        # Inserir novo item
        result = supabase.table('scope_items').insert(data).execute()
        print(f"[POST] Item criado: {result.data}")
        
        return jsonify({
            "success": True,
            "data": result.data
        }), 201
        
    except Exception as e:
        print(f"[POST] Erro: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/scope-items/<int:item_id>', methods=['PUT'])
def update_scope_item(item_id):
    print(f"[PUT] Método PUT chamado para item_id: {item_id}")
    print(f"[PUT] Headers: {dict(request.headers)}")
    try:
        print(f"[PUT] Etapa 1: Verificando conexão com Supabase")
        if not supabase:
            print(f"[PUT] ERRO: Supabase não conectado")
            return jsonify({"error": "Erro de conexão com banco"}), 500
        print(f"[PUT] Etapa 1: Conexão com Supabase OK")

        print(f"[PUT] Etapa 2: ID recebido: {item_id}")
        
        print(f"[PUT] Etapa 3: Lendo dados do corpo da requisição")
        data = request.get_json()
        print(f"[PUT] Etapa 3: Dados recebidos: {data}")
        
        print(f"[PUT] Etapa 4: Executando atualização no Supabase")
        print(f"[PUT] Query: UPDATE scope_items SET {data} WHERE id = {item_id}")
        result = supabase.table('scope_items').update(data).eq('id', item_id).execute()
        print(f"[PUT] Etapa 4: Resultado da atualização: {result}")
        
        response_data = {
            "success": True,
            "data": result.data
        }
        
        print(f"[PUT] Etapa 5: Enviando resposta de sucesso: {response_data}")
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"[PUT] Erro: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/scope-items/<int:item_id>', methods=['DELETE'])
def delete_scope_item(item_id):
    print(f"[DELETE] Método DELETE chamado para item_id: {item_id}")
    print(f"[DELETE] Headers: {dict(request.headers)}")
    try:
        print(f"[DELETE] Etapa 1: Verificando conexão com Supabase")
        if not supabase:
            print(f"[DELETE] ERRO: Supabase não conectado")
            return jsonify({"error": "Erro de conexão com banco"}), 500
        print(f"[DELETE] Etapa 1: Conexão com Supabase OK")

        print(f"[DELETE] Etapa 2: ID recebido: {item_id}")
        
        print(f"[DELETE] Etapa 3: Verificando se o item existe")
        check_result = supabase.table('scope_items').select('id').eq('id', item_id).execute()
        print(f"[DELETE] Etapa 3: Resultado da verificação: {check_result}")
        
        if not check_result.data:
            print(f"[DELETE] ERRO: Item não encontrado")
            return jsonify({"error": "Item não encontrado"}), 404
        
        print(f"[DELETE] Etapa 4: Executando exclusão lógica no Supabase")
        print(f"[DELETE] Query: UPDATE scope_items SET is_active = false WHERE id = {item_id}")
        result = supabase.table('scope_items').update({'is_active': False}).eq('id', item_id).execute()
        print(f"[DELETE] Etapa 4: Resultado da exclusão: {result}")
        
        response_data = {
            "success": True,
            "message": "Item excluído com sucesso",
            "affected_rows": len(result.data)
        }
        
        print(f"[DELETE] Etapa 5: Enviando resposta de sucesso: {response_data}")
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"[DELETE] Erro: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)