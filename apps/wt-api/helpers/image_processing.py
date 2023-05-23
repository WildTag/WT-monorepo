import base64
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS, IFD
from pillow_heif import register_heif_opener    # HEIF support
from io import BytesIO

register_heif_opener()                          # HEIF support

def dms_to_dd(dms):
    degrees, minutes, seconds = dms
    dd = float(degrees) + float(minutes)/60 + float(seconds)/(60*60)
    return dd

def get_exif(img, image_type):
    # TODO: Add support for HEIF images
    
    if image_type == "application/octet-stream":
        pass    
    elif image_type == "image/jpeg":
        returned_image = img
    elif image_type == "image/png":
        returned_image = img.convert("RGB")
    else:
        return (422, "Filetype not supported.", None)
    
    exif = img.getexif()
    exif_gps = exif.get_ifd(IFD.GPSInfo)
    exif_basic = exif.get_ifd(IFD.Exif)
    
    try:
        gps_latitude = dms_to_dd(exif_gps[2])
        gps_longitude = dms_to_dd(exif_gps[4])
        date_time_original = exif_basic[36867]
    except KeyError:
            return (404, "No GPS Data Found.", None)
    
    result = {
        "gps_latitude": gps_latitude,
        "gps_longitude": gps_longitude,
        "date_time_original": date_time_original
        }
    
    # convert image to jpeg
    buffered = BytesIO()
    returned_image.save(buffered, format="JPEG")
    returned_image = base64.b64encode(buffered.getvalue())
    
    return (200, result, returned_image)