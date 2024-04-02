import os
import deepzoom
import PIL 

PIL.Image.MAX_IMAGE_PIXELS = 100000000000

# Specify your source image
# BASE_PATH = '/home/guillaume/Documents/toxicology/tox-discovery-ui/data/slides/svs'
# OUT_PATH = '/home/guillaume/Documents/toxicology/tox-discovery-ui/data/slides/dzi'

BASE_PATH = '/home/guillaume/Documents/toxicology/tox-discovery-ui/data/slides/tox2data/27686'
OUT_PATH = '/home/guillaume/Documents/toxicology/tox-discovery-ui/data/slides/tox2data/27686'

fnames = os.listdir(BASE_PATH)
fnames = [fn for fn in fnames if fn.endswith('.svs')]

for fn in fnames:
    print('Start processing: {}'.format(fn))
    slide_name = fn.replace('.svs', '')
    os.makedirs(os.path.join(OUT_PATH, slide_name), exist_ok=True)
 
    if not os.path.isfile(os.path.join(OUT_PATH, slide_name, fn.replace('.svs', '.dzi'))):
        try:
            creator = deepzoom.ImageCreator(
                tile_size=128,
                tile_overlap=1,
                tile_format="png",
                image_quality=0.8,
                resize_filter="bicubic",
            )
            # Create Deep Zoom image pyramid from source
            creator.create(
                os.path.join(BASE_PATH, fn),
                os.path.join(OUT_PATH, slide_name, fn.replace('.svs', '.dzi'))
            )
        except:
                print('Use VIPS instead')
                command = 'vips dzsave --tile-size 128 {} {}'.format(
                os.path.join(BASE_PATH, fn),
                os.path.join(OUT_PATH, slide_name, fn.replace('.svs', '.dzi'))                    
                )
                os.system(command)
