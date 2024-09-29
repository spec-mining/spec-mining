from .BaseAnalysis import BaseAnalysis
import warnings

"""
This is used to check if the elements of a set are comparable before sorting them.
Source: https://docs.python.org/3/library/functions.html#sorted.

Author: Stephen Shen
"""


class Sets_Comparable(BaseAnalysis):

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)

    def pre_call(self, dyn_ast, iid, function, pos_args, kw_args):

        # The target class names for monitoring
        targets = ["builtins"]

        # Get the class name
        if hasattr(function, '__module__'):
            class_name = function.__module__
        else:
            class_name = None

        # Check if the class name is the target ones
        if class_name in targets:
            # Check if the function is sorted()
            if function.__name__ == "sorted":

                # Spec content
                objs = pos_args[0]
                if isinstance(objs, set):
                    new_objs = list(objs)  # Convert the elements in the set to a new list.
                    if kw_args.get('key'):  # If a key method for comparison is provided.
                        key = kw_args['key']  # Store the key method.
                        for i in range(len(new_objs)):  # Convert the elements using the inputted key method.
                            new_objs[i] = key(new_objs[i])
                    try:  # Check if the object is comparable.
                        for i in range(len(new_objs)):
                            for j in range(i + 1, len(new_objs)):
                                # This will raise a TypeError if elements at i and j are not comparable.
                                _ = new_objs[i] < new_objs[j]
                    except TypeError:
                        # Find the file name and line number of the function in the original file
                        call_file_name = dyn_ast
                        call_line_num = BaseAnalysis.iid_to_location(self, dyn_ast, iid).start_line
                        # Print the violation message
                        warnings.warn(
                            f'Spec - {self.__class__.__name__}: Set with non-comparable elements is about to be sorted. '
                            f'File {call_file_name}, line {call_line_num}.')

# =========================================================================
