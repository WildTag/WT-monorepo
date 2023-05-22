from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS, IFD
from pillow_heif import register_heif_opener    # HEIF support

register_heif_opener()                          # HEIF support

def dms_to_dd(dms):
    degrees, minutes, seconds = dms
    dd = float(degrees) + float(minutes)/60 + float(seconds)/(60*60)
    return dd

def get_exif(img, image_type):

    if image_type == "image/heic":
        pass
    elif image_type == "image/jpeg":
        pass
    elif image_type == "image/png":
        pass
    else:
        return (400, "Filetype not supported.") #400 Bad Request
            
    
    exif = img.getexif()
    exif_gps = exif.get_ifd(IFD.GPSInfo)
    exif_basic = exif.get_ifd(IFD.Exif)
    
    try:
        gps_latitude = dms_to_dd(exif_gps[2])
        gps_longitude = dms_to_dd(exif_gps[4])
        date_time_original = exif_basic[36867]
    except KeyError:
            return (404, "No GPS Data Found.")
    
    result = {
        "GPSLatitude": gps_latitude,
        "GPSLongitude": gps_longitude,
        "DateTimeOriginal": date_time_original
        }
    
    return (200, result)