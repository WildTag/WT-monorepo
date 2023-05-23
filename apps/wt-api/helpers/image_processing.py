import base64
from PIL.ExifTags import IFD
from io import BytesIO                       # HEIF support

def dms_to_dd(dms):
    degrees, minutes, seconds = dms
    dd = float(degrees) + float(minutes)/60 + float(seconds)/(60*60)
    return dd

def get_exif(img, image_type):
    # TODO: Add support for HEIF images
    
    if image_type == "application/octet-stream":
        returned_image = img   
    elif image_type == "image/jpeg":
        returned_image = img
    elif image_type == "image/png":
        returned_image = img
    else:
        print(image_type)
        return (422, f"Filetype not supported {image_type}.", None)
    

    img.verify()
    exif = img.getexif()
    exif_gps = exif.get_ifd(IFD.GPSInfo)
    exif_basic = exif.get_ifd(IFD.Exif)
    
    gps_latitude = None
    gps_longitude = None
    date_time_original = None

    try:
        gps_latitude = dms_to_dd(exif_gps[2])
        gps_longitude = dms_to_dd(exif_gps[4])
    except KeyError:
        print("No GPS Data Found.")

    try:
        date_time_original = exif_basic[36867]
    except KeyError:
        print("No Date Time Original Found.")
    
    result = {
        "gps_latitude": gps_latitude,
        "gps_longitude": gps_longitude,
        "date_time_original": date_time_original
        }

    # convert image to jpeg
    buffered = BytesIO()
    returned_image.save(buffered, format="JPEG")
    returned_image = base64.b64encode(buffered.getvalue())

        
    print(result)

    return (200, result, returned_image)