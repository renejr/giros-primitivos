import sqlite3
import os
import sys # <-- Adicionado
import json # <-- Adicionado
from datetime import datetime

# --- Configuração (Verifique se DB_PATH está correto para execução via main.js) ---
ROOT_DIR_NAME = "giros-primitivos"
DB_FILENAME = "giros_primitivos.db"

# Tenta determinar o caminho correto do DB quando executado de fora
_script_dir = os.path.dirname(os.path.abspath(__file__))
# Assume que o script está em 'src', e a raiz do projeto é um nível acima
_project_root = os.path.dirname(_script_dir)
DB_PATH = os.path.join(_project_root, DB_FILENAME)
# Se a estrutura for diferente (ex: script na raiz), ajuste _project_root e DB_PATH
print(f"Database Manager using DB_PATH: {DB_PATH}", file=sys.stderr) # Log para debug do caminho

# --- Definições SQL (permanecem as mesmas) ---
SQL_CREATE_PLAYER_PROFILE = """...""" # Mantenha como antes
SQL_CREATE_HIGH_SCORES = """...""" # Mantenha como antes
SQL_INSERT_DEFAULT_PROFILE = """...""" # Mantenha como antes
SQL_CHECK_PROFILE_EXISTS = "SELECT COUNT(*) FROM player_profile WHERE profile_id = 1;"

# --- Funções do Banco de Dados (permanecem as mesmas em sua lógica interna) ---

def initialize_database(db_path=DB_PATH):
    # ... (código da função como antes) ...
    # Remova os prints de teste daqui ou mantenha-os indo para stderr
    print(f"Inicializando banco de dados em: {db_path}", file=sys.stderr)
    db_dir = os.path.dirname(db_path)
    if not os.path.exists(db_dir):
        try:
            os.makedirs(db_dir)
            print(f"Diretório do banco de dados criado: {db_dir}", file=sys.stderr)
        except OSError as e:
            print(f"Erro ao criar diretório '{db_dir}': {e}", file=sys.stderr)
            return False
    # Restante da lógica...
    # No final, retorna True/False, sem print para stdout
    # ...
    print("Banco de dados inicializado (ou já existia).", file=sys.stderr)
    return True


def _execute_query(sql, params=(), fetch_one=False, fetch_all=False, commit=False, db_path=DB_PATH):
    """Função auxiliar - sem modificações na lógica interna, mas cuidado com prints."""
    conn = None
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        # print(f"Executing SQL: {sql} with params {params}", file=sys.stderr) # Debug opcional
        cursor.execute(sql, params)

        if commit:
            conn.commit()
            # print("Commit successful.", file=sys.stderr) # Debug opcional
            return True # Ou lastrowid se precisar

        result = None
        if fetch_one:
            row = cursor.fetchone()
            result = dict(row) if row else None
        elif fetch_all:
            result = [dict(row) for row in cursor.fetchall()]
        else:
             result = True # Success for non-query commands

        # print(f"Query result: {result}", file=sys.stderr) # Debug opcional
        return result

    except sqlite3.Error as e:
        print(f"Erro SQLite ao executar query: {sql} | Erro: {e}", file=sys.stderr)
        if conn and commit:
            conn.rollback()
        return None # Ou False para indicar erro
    finally:
        if conn:
            conn.close()


def get_player_profile(profile_id=1, db_path=DB_PATH):
    """Busca o perfil do jogador pelo ID (padrão é 1)."""
    # A lógica interna não muda, apenas o retorno é usado pelo bloco principal
    print(f"Python: get_player_profile called (id={profile_id})", file=sys.stderr)
    sql = "SELECT * FROM player_profile WHERE profile_id = ?;"
    return _execute_query(sql, (profile_id,), fetch_one=True, db_path=db_path)

def update_player_profile(profile_data, profile_id=1, db_path=DB_PATH):
    """Atualiza os dados do perfil do jogador."""
    print(f"Python: update_player_profile called (id={profile_id}) with data: {profile_data}", file=sys.stderr)
    if not profile_data or not isinstance(profile_data, dict): # Validação básica
         print("Python Error: Invalid profile_data format for update.", file=sys.stderr)
         return False

    profile_data['last_played'] = datetime.now().isoformat(sep=' ', timespec='seconds')
    set_clause = ", ".join([f"{key} = ?" for key in profile_data.keys()])
    sql = f"UPDATE player_profile SET {set_clause} WHERE profile_id = ?;"
    params = list(profile_data.values()) + [profile_id]
    return _execute_query(sql, params, commit=True, db_path=db_path)

def add_high_score(player_name, score, db_path=DB_PATH):
    """Adiciona um novo high score ao banco de dados."""
    print(f"Python: add_high_score called (name={player_name}, score={score})", file=sys.stderr)
    sql = "INSERT INTO high_scores (player_name, score, timestamp) VALUES (?, ?, ?);"
    timestamp = datetime.now().isoformat(sep=' ', timespec='seconds')
    params = (player_name, int(score), timestamp) # Garante que score seja int
    return _execute_query(sql, params, commit=True, db_path=db_path)

def get_high_scores(limit=10, db_path=DB_PATH):
    """Busca os 'limit' maiores high scores."""
    print(f"Python: get_high_scores called (limit={limit})", file=sys.stderr)
    sql = "SELECT player_name, score, timestamp FROM high_scores ORDER BY score DESC LIMIT ?;"
    params = (int(limit),) # Garante que limit seja int
    return _execute_query(sql, params, fetch_all=True, db_path=db_path)

# --- Bloco Principal para Execução via Linha de Comando ---
if __name__ == "__main__":
    # O primeiro argumento (sys.argv[0]) é o nome do script.
    # O comando real estará em sys.argv[1].
    command = sys.argv[1] if len(sys.argv) > 1 else None
    result = None
    error = None

    # É uma boa ideia garantir a inicialização aqui também,
    # mas pode ser chamado explicitamente via 'init' se preferir.
    # initialize_database() # Removido daqui para ser chamado por 'init'

    try:
        if command == "init":
            result = initialize_database()
        elif command == "get_profile":
            # Poderia pegar profile_id de sys.argv[2] se necessário
            result = get_player_profile()
        elif command == "update_profile":
             # Espera os dados como uma string JSON em sys.argv[2]
             if len(sys.argv) > 2:
                  profile_data_json = sys.argv[2]
                  profile_data = json.loads(profile_data_json) # Converte JSON string para dict
                  # Poderia pegar profile_id de sys.argv[3] se necessário
                  result = update_player_profile(profile_data)
             else:
                  error = "Missing profile data argument for update_profile"
        elif command == "add_high_score":
             # Espera nome em sys.argv[2] e score em sys.argv[3]
             if len(sys.argv) > 3:
                  player_name = sys.argv[2]
                  score = sys.argv[3]
                  result = add_high_score(player_name, score)
             else:
                  error = "Missing name or score argument for add_high_score"
        elif command == "get_high_scores":
             # Espera limit opcional em sys.argv[2]
             limit = sys.argv[2] if len(sys.argv) > 2 else 10
             result = get_high_scores(limit)
        else:
            error = f"Unknown command: {command}"

    except Exception as e:
        error = f"Error executing command '{command}': {e}"
        print(error, file=sys.stderr) # Loga o erro no stderr

    # Prepara a saída
    output = {}
    if error:
        output['error'] = error
        # Considerar sair com código de erro: sys.exit(1) ?
    elif result is not None:
        output['data'] = result # Coloca o resultado (dict, list, bool) dentro de 'data'
    else:
        # Caso comando não produza resultado ou erro (ex: update falhou retornando None)
        output['error'] = "Command executed but produced no result or indicated failure."


    # Imprime o resultado final como uma string JSON para stdout
    print(json.dumps(output)) # <--- Saída para o Node.js ler