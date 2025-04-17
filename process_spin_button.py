import os
from PIL import Image, UnidentifiedImageError

# --- Configurações ---

# !!! IMPORTANTE: Atualize este caminho para o seu arquivo WebP original !!!
INPUT_IMAGE_PATH = r"C:\wamp64\www\giros-primitivos\assets\images\button_spin.webp" # Exemplo: Use r"..." no Windows

# Caminho onde o botão processado será salvo
OUTPUT_DIR = os.path.join("assets", "images", "ui")
OUTPUT_FILENAME = "button_spin.png" # <<< Salvando como PNG
OUTPUT_IMAGE_PATH = os.path.join(OUTPUT_DIR, OUTPUT_FILENAME)

# Tamanho final desejado para o botão (quadrado)
FINAL_SIZE = 256 # Largura e Altura em pixels (ex: 256x256)

# --- Fim das Configurações ---

def crop_center_square(img):
    """Recorta o maior quadrado possível do centro da imagem."""
    original_width, original_height = img.size
    print(f"Original button dimensions: {original_width}x{original_height}")

    crop_size = min(original_width, original_height)
    print(f"Cropping to center square: {crop_size}x{crop_size}")

    left_margin = (original_width - crop_size) // 2
    top_margin = (original_height - crop_size) // 2
    right_margin = left_margin + crop_size
    bottom_margin = top_margin + crop_size

    crop_box = (left_margin, top_margin, right_margin, bottom_margin)
    print(f"Calculated crop box: {crop_box}")

    return img.crop(crop_box)

def process_button_image(input_path, output_path, final_square_size):
    """Carrega, recorta para quadrado central, redimensiona e salva o botão."""
    print(f"Processing button image: {input_path}")

    if not os.path.exists(input_path):
        print(f"ERRO: Arquivo de entrada não encontrado em '{input_path}'")
        return False

    try:
        with Image.open(input_path) as img:
            # 1. Verificar se a imagem tem canal alfa (transparência) - informativo
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                print("Image appears to have transparency.")
            else:
                print("WARNING: Image might not have transparency (Mode: %s)." % img.mode)

            # 2. Recortar o quadrado central
            cropped_square = crop_center_square(img)
            print(f"Cropped square dimensions: {cropped_square.size[0]}x{cropped_square.size[1]}")

            # 3. Redimensionar para o tamanho final
            print(f"Resizing to: {final_square_size}x{final_square_size}")
            # Usar Image.Resampling.LANCZOS para melhor qualidade
            resized_img = cropped_square.resize((final_square_size, final_square_size), Image.Resampling.LANCZOS)

            # 4. Garantir que o diretório de saída exista
            output_dir = os.path.dirname(output_path)
            os.makedirs(output_dir, exist_ok=True)
            print(f"Ensured output directory exists: {output_dir}")

            # 5. Salvar a imagem final como PNG
            # PNG suporta transparência, que deve ser preservada do WebP original
            resized_img.save(output_path, "PNG")
            print(f"Successfully saved processed button to: {output_path}")
            return True

    except UnidentifiedImageError:
        print(f"ERRO: Não foi possível identificar o formato da imagem em '{input_path}'. É um arquivo WebP válido?")
        return False
    except Exception as e:
        print(f"ERRO inesperado durante o processamento do botão: {e}")
        return False

# --- Execução do Script ---
if __name__ == "__main__":
    if process_button_image(INPUT_IMAGE_PATH, OUTPUT_IMAGE_PATH, FINAL_SIZE):
        print("\nProcessamento do botão concluído com sucesso!")
    else:
        print("\nProcessamento do botão falhou.")