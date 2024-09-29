from .BaseAnalysis import BaseAnalysis
import warnings

"""
Keyword arguments should not be used because they can be interpreted in unexpected ways
source: https://docs.python.org/3/library/random.html#random.randrange

Author: Stephen Shen
"""


class RandomRandrange_MustNotUseKwargs(BaseAnalysis):

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)

    def pre_call(self, dyn_ast, iid, function, pos_args, kw_args):

        # The target class names for monitoring
        targets = ['random']

        # Get the class name
        if hasattr(function, '__module__'):
            class_name = function.__module__
        else:
            class_name = None

        # Check if the class name is the target ones
        if class_name in targets:
            # Check if the function is randrange()
            if function.__name__ == "randrange":

                # Spec content
                if len(kw_args) > 0:
                    # Find the file name and line number of the function in the original file
                    call_file_name = dyn_ast
                    call_line_num = BaseAnalysis.iid_to_location(self, dyn_ast, iid).start_line
                    # Print the violation message
                    warnings.warn(
                        f'Spec - {self.__class__.__name__}: Keyword arguments should not be used in '
                        f'random.randrange because they can be interpreted in unexpected ways. '
                        f'File {call_file_name}, line {call_line_num}.')

# =========================================================================
