from .BaseAnalysis import BaseAnalysis
import warnings

"""
random.lognormvariate(mu, sigma) -> mu can have any value, and sigma must be greater than zero.
random.vonmisesvariate(mu, kappa) ->  kappa must be greater than or equal to zero.

Author: Stephen Shen
"""


class RandomParams_NoPositives(BaseAnalysis):

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
            # Check if the function is lognormvariate() or vonmisesvariate()
            if function.__name__ == "lognormvariate" or function.__name__ == "vonmisesvariate":

                # Spec content
                if ((function.__name__ == "lognormvariate" and pos_args[1] <= 0) or
                        (function.__name__ == "vonmisesvariate" and pos_args[1] < 0)):
                    # Find the file name and line number of the function in the original file
                    call_file_name = dyn_ast
                    call_line_num = BaseAnalysis.iid_to_location(self, dyn_ast, iid).start_line
                    # Print the violation message
                    warnings.warn(
                        f'Spec - {self.__class__.__name__}: The call to method lognormvariate or vonmisesvariate in '
                        f'file {call_file_name} at line {call_line_num} does not have the correct parameters.')

# =========================================================================
