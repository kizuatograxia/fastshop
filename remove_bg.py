import os
from rembg import remove
from PIL import Image

files = ['lobo-emoji.png', 'onca-emoji.png', 'arara-emoji.png', 'tartaruga-emoji.png', 'garca-emoji.png', 'beijaflor-emoji.png', 'mico-emoji.png', 'garoupa-emoji.png']

for f in files:
    in_path = f'public/{f}'
    temp_path = f'public/{f}-temp.png'
    img = Image.open(in_path).convert('RGBA')
    img.save(temp_path)
    out_img = remove(Image.open(temp_path))
    out_img.save(in_path)
    os.remove(temp_path)
    print(f'Processed {f}')
