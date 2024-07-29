import sys
import inspect
import importlib
import json
from utils import *


def get_methods_from_module(module_name):
    try:
        # Dynamically import the module
        module = importlib.import_module(module_name)
    except ModuleNotFoundError:
        return json.dumps({"error": f"Module '{module_name}' not found."})
    
    # Dictionary to store all functions
    functions_data = {"module_name": module_name, "functions": []}

    # Iterate over all the members of the module
    for name, obj in inspect.getmembers(module):
        if (inspect.isfunction(obj) or inspect.isbuiltin(obj)) and is_public(name):
            function_info = {
                "name": name,
                "doc": get_doc(obj),
                "args": get_parameters(obj)
            }
            functions_data["functions"].append(function_info)

    return json.dumps(functions_data, indent=2)

if __name__ == "__main__":
    # Check if the module name is provided as an argument
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python list_functions.py <module_name>"}))
        sys.exit(1)

    module_name = sys.argv[1]

    # Get functions as JSON string
    result = get_methods_from_module(module_name)
    print(result)
