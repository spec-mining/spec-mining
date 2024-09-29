from .BaseAnalysis import BaseAnalysis
import warnings

"""
Timeout argument must not be a negative number
Source: https://docs.python.org/3/library/socket.html#socket.socket.settimeout

Author: Stephen Shen
"""


class socket_socket_settimeout(BaseAnalysis):

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)

    def pre_call(self, dyn_ast, iid, function, pos_args, kw_args):

        # The target class names for monitoring
        targets = [None]

        # Get the class name
        if hasattr(function, '__module__'):
            class_name = function.__module__
        else:
            class_name = None

        # Check if the class name is the target ones
        if class_name in targets:
            # Check if the function is settimeout()
            if function.__name__ == "settimeout":

                # Spec content
                if len(pos_args) > 0:
                    timeout = pos_args[0]
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
