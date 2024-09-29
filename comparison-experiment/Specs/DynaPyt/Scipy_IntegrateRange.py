from .BaseAnalysis import BaseAnalysis
import warnings

import numpy as np

"""
This specification ensures that the range of scipy.integrate values is not too large which can cause problems.
source: "https://stackoverflow.com/questions/39881249/scipy-integrate-quad-floatingpointerror-on-integration;
         https://stackoverflow.com/questions/30913664/scipy-integrate-quad-gives-wrong-result-on-large-ranges;
         https://stackoverflow.com/questions/72100195/scipy-quad-returns-near-zero-even-with-points-argument".

Author: Stephen Shen
"""


class Scipy_IntegrateRange(BaseAnalysis):

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)

    def pre_call(self, dyn_ast, iid, function, pos_args, kw_args):

        # The target class names for monitoring
        targets = ["scipy.integrate._quadpack_py"]

        # Get the class name
        if hasattr(function, '__module__'):
            class_name = function.__module__
        else:
            class_name = None

        # Check if the class name is the target ones
        if class_name in targets:
            # Check if the function is quad()
            if function.__name__ == "quad":

                # Spec content
                result = False

                # Check if the lower limit is too large (except np.inf which is allowed).
                if pos_args[1] != -np.inf and pos_args[1] != np.inf:
                    if abs(pos_args[1]) > 100000:
                        result = True

                # Check if the upper limit is too large (except np.inf which is allowed).
                if pos_args[2] != -np.inf and pos_args[2] != np.inf:
                    if abs(pos_args[2]) > 100000:
                        result = True

                # Check the result.
                if result:

                    # Find the file name and line number of the function in the original file
                    call_file_name = dyn_ast
                    call_line_num = BaseAnalysis.iid_to_location(self, dyn_ast, iid).start_line
                    # Print the violation message
                    warnings.warn(
                        f'Spec - {self.__class__.__name__}: The range of scipy.integrate.quad() maybe too large. '
                        f'File {call_file_name}, line {call_line_num}.')

# =========================================================================
