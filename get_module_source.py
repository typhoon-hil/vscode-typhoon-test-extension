import sys
import inspect
import importlib
import json

def is_public(name):
    """Check if a name is considered public (not starting with '_')."""
    return not name.startswith('_')

def get_methods_from_module(module_name):
    try:
        # Dynamically import the module
        module = importlib.import_module(module_name)
    except ModuleNotFoundError:
        return json.dumps({"error": f"Module '{module_name}' not found."})
    
    # Dictionary to store all methods and classes
    module_data = {"module_name": module_name, "classes": []}

    # Iterate over all the members of the module
    for name, obj in inspect.getmembers(module):
        if inspect.isclass(obj):
            class_data = {"class_name": name, "methods": []}
            for cname, cobj in inspect.getmembers(obj):
                # Check if the member is a function or method and is public
                if (inspect.isfunction(cobj) or inspect.ismethod(cobj)) and is_public(cname):
                    class_data["methods"].append(cname)
            if class_data["methods"]:  # Only add classes with public methods
                module_data["classes"].append(class_data)
        elif (inspect.isfunction(obj) or inspect.ismethod(obj)) and is_public(name):
            module_data.setdefault("functions", []).append(name)

    return json.dumps(module_data)

if __name__ == "__main__":
    # Check if the module name is provided as an argument
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python list_methods.py <module_name>"}))
        sys.exit(1)

    module_name = sys.argv[1]

    # Get methods as JSON string
    result = get_methods_from_module(module_name)
    print(result)
