import os
from PIL import Image, UnidentifiedImageError

# --- Configurações ---

# !!! IMPORTANTE: Atualize este caminho para onde você salvou a imagem quadrada original!!!
INPUT_IMAGE_PATH = r"C:\wamp64\www\giros-primitivos\assets\images\bg_jungle.png" # Exemplo: Use r"..." no Windows para evitar problemas com '\'

# Caminho onde a imagem processada será salva (dentro da estrutura do projeto)
OUTPUT_DIR = os.path.join("assets", "images", "backgrounds")
OUTPUT_FILENAME = "bg_jungle.png" # Salvar como PNG para manter qualidade (ou .jpg se preferir)
OUTPUT_IMAGE_PATH = os.path.join(OUTPUT_DIR, OUTPUT_FILENAME)

# Dimensões FINAIS desejadas para o jogo (Aspect Ratio 4:3)
TARGET_WIDTH = 1024
TARGET_HEIGHT = 768

# --- Fim das Configurações ---

def crop_to_aspect_ratio(img, target_aspect_ratio):
    """Recorta a imagem no centro para atingir o aspect ratio alvo."""
    original_width, original_height = img.size
    original_aspect_ratio = original_width / original_height

    print(f"Original dimensions: {original_width}x{original_height} (Ratio: {original_aspect_ratio:.2f})")
    print(f"Target aspect ratio: {target_aspect_ratio:.2f}")

    if abs(original_aspect_ratio - target_aspect_ratio) < 0.01:
        print("Image already has target aspect ratio. No crop needed.")
        return img # Retorna a imagem original se já estiver no aspect ratio correto

    if original_aspect_ratio > target_aspect_ratio:
        # Imagem original é mais LARGA que o alvo (ex: 16:9 original -> 4:3 alvo)
        # Precisa cortar as laterais
        target_width = int(target_aspect_ratio * original_height)
        margin = (original_width - target_width) // 2
        crop_box = (margin, 0, original_width - margin, original_height)
        print(f"Cropping sides. Box: {crop_box}")
    else:
        # Imagem original é mais ALTA que o alvo (ex: 1:1 original -> 4:3 alvo)
        # Precisa cortar topo/base - NOSSO CASO (1:1 -> 4:3)
        target_height = int(original_width / target_aspect_ratio)
        margin = (original_height - target_height) // 2
        # Box: (left, upper, right, lower)
        crop_box = (0, margin, original_width, original_height - margin)
        print(f"Cropping top/bottom. Box: {crop_box}")

    return img.crop(crop_box)

def process_background_image(input_path, output_path, final_width, final_height):
    """Carrega, recorta, redimensiona e salva a imagem de fundo."""
    print(f"Processing image: {input_path}")

    if not os.path.exists(input_path):
        print(f"ERRO: Arquivo de entrada não encontrado em '{input_path}'")
        return False

    try:
        with Image.open(input_path) as img:
            # 1. Recortar para o Aspect Ratio 4:3 (ou o que for definido por final_width/final_height)
            target_aspect = final_width / final_height
            cropped_img = crop_to_aspect_ratio(img, target_aspect)
            print(f"Cropped dimensions: {cropped_img.size[0]}x{cropped_img.size[1]}")

            # 2. Redimensionar para as dimensões finais do jogo
            print(f"Resizing to: {final_width}x{final_height}")
            # Usar Image.Resampling.LANCZOS para melhor qualidade
            resized_img = cropped_img.resize((final_width, final_height), Image.Resampling.LANCZOS)

            # 3. Garantir que o diretório de saída exista
            output_dir = os.path.dirname(output_path)
            os.makedirs(output_dir, exist_ok=True)
            print(f"Ensured output directory exists: {output_dir}")

            # 4. Salvar a imagem final
            resized_img.save(output_path)
            print(f"Successfully saved processed image to: {output_path}")
            return True

    except UnidentifiedImageError:
        print(f"ERRO: Não foi possível identificar o formato da imagem em '{input_path}'. É um arquivo de imagem válido?")
        return False
    except Exception as e:
        print(f"ERRO inesperado durante o processamento da imagem: {e}")
        return False

# --- Execução do Script ---
if __name__ == "__main__":
    if process_background_image(INPUT_IMAGE_PATH, OUTPUT_IMAGE_PATH, TARGET_WIDTH, TARGET_HEIGHT):
        print("\nProcessamento concluído com sucesso!")
    else:
        print("\nProcessamento falhou.")