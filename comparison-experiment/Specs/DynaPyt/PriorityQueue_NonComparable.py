from .BaseAnalysis import BaseAnalysis
import warnings

"""
This is used to check if PriorityQueue is about to have a non-comparable object.

Author: Stephen Shen
"""


class PriorityQueue_NonComparable(BaseAnalysis):

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)

    def pre_call(self, dyn_ast, iid, function, pos_args, kw_args):

        # The target class names for monitoring
        targets = ['queue', '_heapq']

        # Get the class name
        if hasattr(function, '__module__'):
            class_name = function.__module__
        else:
            class_name = None

        # Check if the class name is the target ones
        if class_name in targets:

            violation = False

            # Check if the function is put():
            if function.__name__ == "put" and class_name == 'queue':

                # Spec content
                obj = pos_args[0]
                try:  # check if the object is comparable
                    obj < obj
                except TypeError as e:
                    violation = True

            # Check if the function is heappush():
            if function.__name__ == 'heappush' and class_name == '_heapq':

                # Spec content
                obj = pos_args[1]
                try:  # check if the object is comparable
                    obj < obj
                except TypeError as e:
                    violation = True

            if violation:
                # Find the file name and line number of the function in the original file
                call_file_name = dyn_ast
                call_line_num = BaseAnalysis.iid_to_location(self, dyn_ast, iid).start_line
                # Print the violation message
                warnings.warn(
                    f'Spec - {self.__class__.__name__}: PriorityQueue is about to have a non-comparable object. '
                    f'File {call_file_name}, line {call_line_num}.')

# =========================================================================
