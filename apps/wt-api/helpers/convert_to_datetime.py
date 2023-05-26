from datetime import datetime

def convert_to_datetime(date_str: str) -> datetime:
    """
    converts a string to a datetime

    Args:
        input (str): the datetime to convert

    Returns:
        datetime: returns the converted datetime 
    """
    date_str = date_str.split(" (", 1)[0]
    
    dt = datetime.strptime(date_str, '%a %b %d %Y %H:%M:%S %Z%z')
    return dt