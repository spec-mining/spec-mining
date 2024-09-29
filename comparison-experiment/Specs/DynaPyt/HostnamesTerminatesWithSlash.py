from .BaseAnalysis import BaseAnalysis
import warnings

"""
It is recommended to terminate full hostnames with a /.

Author: Stephen Shen
"""


class HostnamesTerminatesWithSlash(BaseAnalysis):

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)

    def pre_call(self, dyn_ast, iid, function, pos_args, kw_args):

        # The target class names for monitoring
        targets = ["requests.sessions"]

        # Get the class name
        if hasattr(function, '__module__'):
            class_name = function.__module__
        else:
            class_name = None

        # Check if the class name is the target ones
        if class_name in targets:
            # Check if the function is mount()
            if function.__name__ == "mount":

                # Spec content
                url = pos_args[0]
                if not url.endswith('/'):

                    # Find the file name and line number of the function in the original file
                    call_file_name = dyn_ast
                    call_line_num = BaseAnalysis.iid_to_location(self, dyn_ast, iid).start_line
                    # Print the violation message
                    warnings.warn(
                        f'Spec - {self.__class__.__name__}: The call to method mount in file {call_file_name} at line '
                        f'{call_line_num} does not terminate the hostname with a /.')

# =========================================================================
