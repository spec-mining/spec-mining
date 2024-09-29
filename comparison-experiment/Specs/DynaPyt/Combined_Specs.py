from .BaseAnalysis import BaseAnalysis
import warnings

import numpy as np

"""
This spec combines 11 individual specs together for testing purposes.

Author: Stephen Shen
"""


class Combined_Specs(BaseAnalysis):

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)

    def pre_call(self, dyn_ast, iid, function, pos_args, kw_args):

        # The target class names for monitoring
        targets = ["builtins", "requests.api", "requests.sessions", "queue", "_heapq", "random",
                   "scipy.integrate._quadpack_py", "socket", "_socket", None]

        # Get the class name
        if hasattr(function, '__module__'):
            class_name = function.__module__
        else:
            class_name = None

        # Check if the class name is the target ones
        if class_name in targets:

            # Check if the function is sorted()
            if function.__name__ == "sorted" and class_name == 'builtins':

                # Spec content
                objs = pos_args[0]
                if isinstance(objs, list):
                    new_objs = objs[:]  # Shallow copy the elements in the list inputted.
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
                            f'Spec - {self.__class__.__name__}: Array with non-comparable elements is about to be sorted. '
                            f'File {call_file_name}, line {call_line_num}.')
                elif isinstance(objs, set):
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

            # Check if the function is post()
            elif function.__name__ == "post" and class_name == 'requests.api':

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

            # Check if the function is mount()
            elif function.__name__ == "mount" and class_name == 'requests.sessions':

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

            # Check if the function is put():
            elif function.__name__ == "put" and class_name == 'queue':

                # Spec content
                obj = pos_args[0]
                try:  # check if the object is comparable
                    obj < obj
                except TypeError as e:
                    # Find the file name and line number of the function in the original file
                    call_file_name = dyn_ast
                    call_line_num = BaseAnalysis.iid_to_location(self, dyn_ast, iid).start_line
                    # Print the violation message
                    warnings.warn(
                        f'Spec - {self.__class__.__name__}: PriorityQueue is about to have a non-comparable object. '
                        f'File {call_file_name}, line {call_line_num}.')

            # Check if the function is heappush():
            elif function.__name__ == 'heappush' and class_name == '_heapq':

                # Spec content
                obj = pos_args[1]
                try:  # check if the object is comparable
                    obj < obj
                except TypeError as e:
                    # Find the file name and line number of the function in the original file
                    call_file_name = dyn_ast
                    call_line_num = BaseAnalysis.iid_to_location(self, dyn_ast, iid).start_line
                    # Print the violation message
                    warnings.warn(
                        f'Spec - {self.__class__.__name__}: PriorityQueue is about to have a non-comparable object. '
                        f'File {call_file_name}, line {call_line_num}.')

            # Check if the function is lognormvariate() or vonmisesvariate()
            elif ((function.__name__ == "lognormvariate" or function.__name__ == "vonmisesvariate")
                  and class_name == 'random'):

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

            # Check if the function is randrange()
            elif function.__name__ == "randrange" and class_name == 'random':

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

            # Check if the function is quad()
            elif function.__name__ == "quad" and class_name == "scipy.integrate._quadpack_py":

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

            # Check if the function is create_connection()
            elif function.__name__ == "create_connection" and class_name == 'socket':

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

            # Check if the function is setdefaulttimeout()
            elif function.__name__ == "setdefaulttimeout" and class_name == '_socket':

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

            # Check if the function is settimeout()
            elif function.__name__ == "settimeout" and class_name is None:

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
