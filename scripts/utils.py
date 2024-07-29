import inspect


def is_public(name):
    """Check if a name is considered public (not starting with '_')."""
    return not name.startswith('_')


def get_doc(obj):
    """Fetches the docstring of an object if available."""
    return inspect.getdoc(obj) or ""


def is_value_typescript_supported(default_parameter):
    if type(default_parameter) is str:
        return True
    if type(default_parameter) is bool or None:
        return False
    if type(default_parameter) is tuple or dict or list:
        return False
    return True


def get_parameters(obj):
    """Fetches the parameters of a callable object."""
    parameters = []
    signature = inspect.signature(obj)
    for param in signature.parameters.values():
        param_info = {
            "name": param.name,
        }
        if param.default != param.empty:
            if not is_value_typescript_supported(param.default):
                param_info["default"] = str(param.default)
            else:
                param_info["default"] = f"'{param.default}'"
        parameters.append(param_info)
    return parameters
