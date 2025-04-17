import os
import glob
from PIL import Image, UnidentifiedImageError

# --- Configurações ---

# !!! IMPORTANTE: Verifique se este é o caminho correto para SUA pasta de símbolos !!!
SYMBOLS_DIR = r"C:\wamp64\www\giros-primitivos\assets\images\symbols"

# Tamanho final desejado (quadrado)
TARGET_SIZE = (150, 150) # Largura x Altura

# Subdiretório para salvar os resultados (para não sobrescrever os originais)
OUTPUT_SUBDIR = "resized_150x150"

# Tipos de arquivo de imagem a processar
IMAGE_EXTENSIONS = ('.png', '.webp', '.jpg', '.jpeg')

# --- Fim das Configurações ---

def resize_symbol(input_path, output_path, target_size):
    """Abre, redimensiona e salva uma imagem de símbolo."""
    try:
        with Image.open(input_path) as img:
            original_size = img.size
            print(f"  Processing: {os.path.basename(input_path)} ({original_size[0]}x{original_size[1]})", end='')

            # Preserva o modo original (incluindo transparência, se houver)
            original_mode = img.mode
            if 'A' in original_mode: # Check if has Alpha channel
                 print(" (has transparency)", end='')

            # Redimensiona para o tamanho alvo (pode distorcer)
            # Usar Image.Resampling.LANCZOS para melhor qualidade
            resized_img = img.resize(target_size, Image.Resampling.LANCZOS)
            print(f" -> Resized to {target_size[0]}x{target_size[1]}...", end='')

            # Garante que o diretório de saída exista
            output_dir = os.path.dirname(output_path)
            os.makedirs(output_dir, exist_ok=True)

            # Salva como PNG para garantir suporte à transparência no output
            final_output_path = os.path.splitext(output_path)[0] + ".png"
            resized_img.save(final_output_path, "PNG")
            print(f" Saved as PNG.")
            return True

    except UnidentifiedImageError:
        print(f"\n  ERRO: Arquivo não reconhecido como imagem: {os.path.basename(input_path)}")
        return False
    except Exception as e:
        print(f"\n  ERRO inesperado processando {os.path.basename(input_path)}: {e}")
        return False

# --- Lógica Principal ---
if __name__ == "__main__":
    print(f"Starting symbol resize process...")
    print(f"Input directory: {SYMBOLS_DIR}")
    print(f"Target size: {TARGET_SIZE[0]}x{TARGET_SIZE[1]}")

    if not os.path.isdir(SYMBOLS_DIR):
        print(f"ERRO CRÍTICO: Diretório de entrada não encontrado: {SYMBOLS_DIR}")
        sys.exit(1) # Import sys no início se usar exit

    output_dir_path = os.path.join(SYMBOLS_DIR, OUTPUT_SUBDIR)
    print(f"Output directory: {output_dir_path}")

    processed_count = 0
    skipped_count = 0

    # Itera sobre todos os arquivos no diretório de símbolos
    for filepath in glob.glob(os.path.join(SYMBOLS_DIR, '*')):
        if os.path.isfile(filepath):
            # Verifica se a extensão é uma das permitidas
            if filepath.lower().endswith(IMAGE_EXTENSIONS):
                # Define o nome e caminho do arquivo de saída
                filename = os.path.basename(filepath)
                output_filename = os.path.splitext(filename)[0] + ".png" # Força PNG na saída
                output_filepath = os.path.join(output_dir_path, output_filename)

                if resize_symbol(filepath, output_filepath, TARGET_SIZE):
                    processed_count += 1
                else:
                    skipped_count += 1
            else:
                # print(f"  Skipping non-image file: {os.path.basename(filepath)}")
                skipped_count += 1
        else:
            # print(f"  Skipping directory: {os.path.basename(filepath)}")
            skipped_count += 1


    print(f"\nResize process finished.")
    print(f"Successfully processed: {processed_count} images.")
    print(f"Skipped: {skipped_count} items.")
    if processed_count > 0:
         print(f"Resized images saved in: {output_dir_path}")