import sys
import inspect
import importlib
import json

def get_methods_from_module(module_name):
    try:
        # Dynamically import the module
        module = importlib.import_module(module_name)
    except ModuleNotFoundError:
        return json.dumps({"error": f"Module '{module_name}' not found."})
    
    # List to store all methods
    methods_list = []

    # Iterate over all the members of the module
    for name, obj in inspect.getmembers(module):
        # Check if the member is a function or method
        if inspect.isfunction(obj) or inspect.ismethod(obj):
            methods_list.append(name)

    return json.dumps({"module_name": module_name, "methods": methods_list})

if __name__ == "__main__":
    # Check if the module name is provided as an argument
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python list_methods.py <module_name>"}))
        sys.exit(1)

    module_name = sys.argv[1]

    # Get methods as JSON string
    result = get_methods_from_module(module_name)
    print(result)
