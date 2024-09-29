from .BaseAnalysis import BaseAnalysis
import warnings

"""
Timeout argument must not be a negative number
Source: https://docs.python.org/3/library/socket.html#socket.create_connection

Author: Stephen Shen
"""


class socket_create_connection(BaseAnalysis):

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)

    def pre_call(self, dyn_ast, iid, function, pos_args, kw_args):

        # The target class names for monitoring
        targets = ["socket"]

        # Get the class name
        if hasattr(function, '__module__'):
            class_name = function.__module__
        else:
            class_name = None

        # Check if the class name is the target ones
        if class_name in targets:
            # Check if the function is create_connection()
            if function.__name__ == "create_connection":

                # Spec content
                if "timeout" in kw_args:
                    timeout = kw_args["timeout"]
                elif len(pos_args) > 1:
                    timeout = pos_args[1]
                else:
                    timeout = None
                if timeout is not None and timeout < 0:
                    # Find the file name and line number of the function in the original file
                    call_file_name = dyn_ast
                    call_line_num = BaseAnalysis.iid_to_location(self, dyn_ast, iid).start_line
                    # Print the violation message
                    warnings.warn(
                        f'Spec - {self.__class__.__name__}: timeout must not be negative. '
                        f'File {call_file_name}, line {call_line_num}.')

# =========================================================================
