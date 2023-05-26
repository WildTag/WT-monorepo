def try_int(value) -> int or None:
    """
    tries to see if the input can be converted into an int

    Args:
        input (any): the input to check

    Returns:
        bool: returns int if the input can be converted into an int, None otherwise
    """
    try:
        return int(value)
    except Exception:
        return None
