import os
import sys

# --- Configuração ---
ROOT_DIR_NAME = "giros-primitivos"

# Lista de diretórios a serem criados (caminhos relativos à raiz)
# os.makedirs criará diretórios intermediários, então listamos os "galhos" finais.
# Incluímos diretórios que podem ficar vazios inicialmente (fonts, data).
DIRS_TO_CREATE = [
    "assets/images/backgrounds",
    "assets/images/symbols",
    "assets/images/ui",
    "assets/images/vfx",
    "assets/audio/bgm",
    "assets/audio/sfx",
    "assets/fonts",
    "assets/data",
    "src/scenes",
    "src/gameobjects",
    "src/helpers",
    "src/services",
]

# Lista de arquivos vazios a serem criados (caminhos relativos à raiz)
FILES_TO_CREATE = [
    "index.html",
    "main.js",
    "package.json", # Para gerenciamento de dependências npm/yarn
    "src/scenes/PreloaderScene.js",
    "src/scenes/MainMenuScene.js",
    "src/scenes/GameScene.js",
    "src/scenes/UIScene.js",
    "src/gameobjects/Reel.js",
    "src/gameobjects/Symbol.js",
    "src/gameobjects/SlotMachine.js",
    "src/gameobjects/Payline.js",
    "src/helpers/Constants.js",
    "src/helpers/RNG.js",
    "src/helpers/WinChecker.js",
    "src/helpers/Format.js",
    "src/services/SoundManager.js",
    # Adicionar arquivos placeholder em pastas vazias (opcional, bom para Git)
    "assets/fonts/.gitkeep",
    "assets/data/.gitkeep",
    "assets/images/backgrounds/.gitkeep",
    "assets/images/symbols/.gitkeep",
    "assets/images/ui/.gitkeep",
    "assets/images/vfx/.gitkeep",
    "assets/audio/bgm/.gitkeep",
    "assets/audio/sfx/.gitkeep",
]
# --- Fim da Configuração ---

def create_project_structure(root_dir):
    """
    Cria a estrutura de diretórios e arquivos para o projeto Phaser 3.
    """
    print(f"Criando estrutura do projeto em: '{root_dir}'")

    # 1. Criar o diretório raiz
    try:
        os.makedirs(root_dir, exist_ok=True)
        print(f"Diretório raiz '{root_dir}' criado ou já existente.")
    except OSError as e:
        print(f"Erro ao criar diretório raiz '{root_dir}': {e}", file=sys.stderr)
        return False # Interrompe se não conseguir criar a raiz

    # 2. Criar os subdiretórios
    print("\nCriando subdiretórios...")
    for dir_path_rel in DIRS_TO_CREATE:
        # Junta o caminho raiz com o caminho relativo do diretório
        full_dir_path = os.path.join(root_dir, dir_path_rel)
        try:
            # Cria o diretório e quaisquer diretórios pais necessários
            os.makedirs(full_dir_path, exist_ok=True)
            print(f"  Criado: '{full_dir_path}'")
        except OSError as e:
            print(f"  Erro ao criar diretório '{full_dir_path}': {e}", file=sys.stderr)
            # Pode optar por continuar ou parar aqui dependendo da severidade

    # 3. Criar os arquivos vazios
    print("\nCriando arquivos...")
    for file_path_rel in FILES_TO_CREATE:
        # Junta o caminho raiz com o caminho relativo do arquivo
        full_file_path = os.path.join(root_dir, file_path_rel)

        # Garante que o diretório pai do arquivo exista (caso não listado explicitamente em DIRS_TO_CREATE)
        parent_dir = os.path.dirname(full_file_path)
        if parent_dir and not os.path.exists(parent_dir):
             try:
                 os.makedirs(parent_dir, exist_ok=True)
                 print(f"  Diretório pai criado para arquivo: '{parent_dir}'")
             except OSError as e:
                 print(f"  Erro ao criar diretório pai '{parent_dir}' para arquivo '{full_file_path}': {e}", file=sys.stderr)
                 continue # Pula para o próximo arquivo

        # Cria o arquivo vazio (modo 'a' para append, 'w' para write, ambos criam se não existir)
        try:
            with open(full_file_path, 'a') as f:
                pass # Simplesmente abre e fecha para criar o arquivo vazio
            print(f"  Criado: '{full_file_path}'")
        except IOError as e:
            print(f"  Erro ao criar arquivo '{full_file_path}': {e}", file=sys.stderr)

    print(f"\nEstrutura de arquivos para '{root_dir}' criada com sucesso!")
    return True

# --- Execução do Script ---
if __name__ == "__main__":
    # Obtém o diretório onde o script está sendo executado
    script_location = os.path.dirname(os.path.abspath(__file__))
    # Define o caminho completo para o diretório raiz do projeto
    project_root_path = os.path.join(script_location, ROOT_DIR_NAME)

    create_project_structure(project_root_path)