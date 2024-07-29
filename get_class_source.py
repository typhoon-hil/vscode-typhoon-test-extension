import sys
import inspect
import importlib
import json


def is_public(name):
    """Check if a name is considered public (not starting with '_')."""
    return not name.startswith('_')


def get_doc(obj):
    """Fetches the docstring of an object if available."""
    return inspect.getdoc(obj) or ""


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


def get_class_methods(module_name, class_name):
    try:
        # Dynamically import the module
        module = importlib.import_module(module_name)
    except ModuleNotFoundError:
        return {"error": f"Module '{module_name}' not found."}
    
    # Try to get the class object from the module
    try:
        class_obj = getattr(module, class_name)
    except AttributeError:
        return {"error": f"Class '{class_name}' not found in module '{module_name}'."}
    
    # Dictionary to store class information
    class_data = {"class_name": f'{module_name}.{class_name}', "methods": []}
    
    # Iterate over all members of the class
    for name, obj in inspect.getmembers(class_obj):
        # Check if the member is a function or method and is public
        if (inspect.isfunction(obj) or inspect.ismethod(obj)) and is_public(name):
            method_info = {
                "name": name,
                "doc": get_doc(obj),
                "args": get_parameters(obj),
            }
            class_data["methods"].append(method_info)
    
    return class_data


def is_value_typescript_supported(default_parameter):
    if type(default_parameter) is str:
        return True
    if type(default_parameter) is bool or None:
        return False
    if type(default_parameter) is tuple or dict or list:
        return False
    return True


if __name__ == "__main__":
    # Check if the module name and class name are provided as arguments
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python list_methods.py <module_name>.<class_name>"}))
        sys.exit(1)

    # Get the module and class names from the command line arguments
    module_class_name = sys.argv[1]
    try:
        module_name, class_name = module_class_name.rsplit(".", 1)
    except ValueError:
        print(json.dumps({"error": "Invalid argument format. Usage: python list_methods.py <module_name>.<class_name>"}))
        sys.exit(1)

    # Get class methods as JSON string
    result = get_class_methods(module_name, class_name)
    print(json.dumps(result, indent=2))
