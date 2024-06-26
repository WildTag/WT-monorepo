import base64
from PIL.ExifTags import IFD
from io import BytesIO
from PIL import ImageOps, Image

def dms_to_dd(dms, direction):
    """
        convert values suitable for long and lat

    Args:
        dms
        direction

    Returns:
        float: degrees in decimal value
    
    """
    degrees, minutes, seconds = dms

    decimal_degrees = float(degrees) + float(minutes)/60 + float(seconds)/(60*60)

    if direction in ['S','W']:
        decimal_degrees *= -1
        
    return decimal_degrees

def get_exif(img: Image, image_type: str):
    """
    retrieves all of the exif data from an image, and converts images to JPEG if they are not already.

    Args:
        img (Pil Image): the image to be processed
        image_type (str): the type of image, used to determine if the image needs to be converted to JPEG

    Returns:
        tuple: (response_code, meta_data, returned_image, error_text)
    """
    supported_file_types = ["application/octet-stream", "image/jpeg", "image/png"]    
    if image_type not in supported_file_types:
        return (422, f"Filetype not supported {image_type}.", None)
    
    if image_type == "image/png":
        img = img.convert('RGB')
    
    img = ImageOps.exif_transpose(img)
    exif = img.getexif()
    exif_gps = exif.get_ifd(IFD.GPSInfo)
    exif_basic = exif.get_ifd(IFD.Exif)
    
    error_text = ""

    try:
        gps_latitude = dms_to_dd(exif_gps[2], exif_gps[1])
        gps_longitude = dms_to_dd(exif_gps[4], exif_gps[3])
    except KeyError:
        gps_latitude = None
        gps_longitude = None
        error_text += "GPS information not found. "

    try:
        date_time_original = exif_basic[36867]
    except KeyError:
        date_time_original = None
        error_text += "Date information not found. "
    
    data = {
        "gps_latitude": gps_latitude,
        "gps_longitude": gps_longitude,
        "date_time_original": date_time_original
        }
    
    buffered = BytesIO()
    img.save(buffered, format="JPEG")
    returned_image = base64.b64encode(buffered.getvalue())
    
    return (200, data, returned_image, error_text)