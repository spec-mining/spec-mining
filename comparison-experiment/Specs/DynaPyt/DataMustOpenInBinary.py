from .BaseAnalysis import BaseAnalysis
import warnings

"""
It is strongly recommended that you open files in binary mode. This is because Requests may attempt to provide
the Content-Length header for you, and if it does this value will be set to the number of bytes in the file.
Errors may occur if you open the file in text mode.

Author: Stephen Shen
"""


class DataMustOpenInBinary(BaseAnalysis):

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)

    def pre_call(self, dyn_ast, iid, function, pos_args, kw_args):

        # The target class names for monitoring
        targets = ["requests.api"]

        # Get the class name
        if hasattr(function, '__module__'):
            class_name = function.__module__
        else:
            class_name = None

        # Check if the class name is the target ones
        if class_name in targets:
            # Check if the function is post()
            if function.__name__ == "post":

                # Spec content
                kwords = ['data', 'files']
                for k in kwords:
                    if k in kw_args:
                        data = kw_args[k]
                        if hasattr(data, 'read') and hasattr(data, 'mode') and 'b' not in data.mode:

                            # Find the file name and line number of the function in the original file
                            call_file_name = dyn_ast
                            call_line_num = BaseAnalysis.iid_to_location(self, dyn_ast, iid).start_line
                            # Print the violation message
                            warnings.warn(
                                f'Spec - {self.__class__.__name__}: It is strongly recommended that you open files in '
                                f'binary mode. This is because Requests may attempt to provide the Content-Length '
                                f'header for you, and if it does this value will be set to the number of bytes in the '
                                f'file. Errors may occur if you open the file in text mode. in {call_file_name} at line'
                                f' {call_line_num}')

# =========================================================================
