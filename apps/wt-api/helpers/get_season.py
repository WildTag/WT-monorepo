from datetime import datetime

def get_season(date: datetime) -> str:
    """
    checks to see what date a season is in

    Args:
        date (datetime): the date to get the season for

    Returns:
        datetime: returns the converted datetime 
    """
    month = date.month
    if 3 <= month < 6:
        return "spring"
    elif 6 <= month < 9:
        return "summer"
    elif 9 <= month < 12:
        return "autumn"
    else:
        return "winter"
      