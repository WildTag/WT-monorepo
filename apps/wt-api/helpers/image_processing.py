import base64
from PIL.ExifTags import IFD
from io import BytesIO
from PIL import ImageOps

def dms_to_dd(dms, direction):
    degrees, minutes, seconds = dms

    decimal_degrees = float(degrees) + float(minutes)/60 + float(seconds)/(60*60)

    if direction in ['S','W']:
        decimal_degrees *= -1
        
    return decimal_degrees

def get_exif(img, image_type):    
    supported_file_types = ["application/octet-stream", "image/jpeg", "image/png"]    
    if image_type not in supported_file_types:
        return (422, f"Filetype not supported {image_type}.", None)
    
    if image_type == "image/png":
        img = img.convert('RGB')
    
    img = ImageOps.exif_transpose(img)
    exif = img.getexif()
    exif_gps = exif.get_ifd(IFD.GPSInfo)
    exif_basic = exif.get_ifd(IFD.Exif)
    
    gps_latitude = None
    gps_longitude = None
    date_time_original = None

    try:
        gps_latitude = dms_to_dd(exif_gps[2], exif_gps[1])
        gps_longitude = dms_to_dd(exif_gps[4], exif_gps[3])
    except KeyError:
        return (404, "No GPS Data Found.", None)

    try:
        date_time_original = exif_basic[36867]
    except KeyError:
        return (404, "No Date Time Original Found.", None)
    
    result = {
        "gps_latitude": gps_latitude,
        "gps_longitude": gps_longitude,
        "date_time_original": date_time_original
        }
    
    buffered = BytesIO()
    img.save(buffered, format="JPEG")
    returned_image = base64.b64encode(buffered.getvalue())
    
    return (200, result, returned_image)