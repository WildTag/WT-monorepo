from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS, IFD
from pillow_heif import register_heif_opener    # HEIF support

register_heif_opener()                          # HEIF support

def print_exif(fname: str):
    img = Image.open(fname)
    exif = img.getexif()

    print('>>>>>>>>>>>>>>>>>>', 'Base tags', '<<<<<<<<<<<<<<<<<<<<')
    for k, v in exif.items():
        tag = TAGS.get(k, k)
        print(tag, v)

    for ifd_id in IFD:
        print('>>>>>>>>>', ifd_id.name, '<<<<<<<<<<')
        try:
            ifd = exif.get_ifd(ifd_id)

            if ifd_id == IFD.GPSInfo:
                resolve = GPSTAGS
            else:
                resolve = TAGS

            for k, v in ifd.items():
                tag = resolve.get(k, k)
                print(tag, v)
        except KeyError:
            pass
        
print_exif("test.heif")
