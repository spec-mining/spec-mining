# ============================== Define spec ==============================
from pythonmop import Spec, call
import builtins
import time
import argparse

parser = argparse.ArgumentParser("Fakse Program")
parser.add_argument("algo", help="The algorithm to run", type=str, choices=['A', 'B', 'C', 'C+', 'D'])
parser.add_argument("class_count", help="The number of classes", type=int)
parser.add_argument("instance_count", help="The number of instances", type=int)
parser.add_argument("event_count", help="The number of events", type=int)
args = parser.parse_args()

# take algo as an argument when calling the file from command line

def rename(newname):
    def decorator(f):
        f.__name__ = newname
        return f
    return decorator

original_print = builtins.print
def mock_print():
    def fake_print(*args, **kwargs):
        pass

    builtins.print = fake_print

def unmock_print(*args, **kwargs):
    builtins.print = original_print


# this function creates a class with the given name and the class has empty methods with the given names
def create_class(class_name, method_names_of_the_class):
    class_dict = {}

    def bindMethod(name):
        def method(*args):
            pass
        method.__name__ = name
        return method

    for method_name in method_names_of_the_class:
        class_dict[method_name] = bindMethod(method_name)
    return type(class_name, (), class_dict)


B = create_class('B', ['a', 'b'])
C = create_class('C', ['a', 'b', 'c'])


'''
    dynamically creates a spec that binds all classes given
'''
def create_spec(all_classes, method_names):
    class FakeSpec(Spec):
        """
            must call methods in order a, b, c, d, e (order of c and d doesn't matter)
        """
        def __init__(self):
            super().__init__()

            for method_name in method_names:
                for TheClass in all_classes:
                    # the defined function here must have the same name as method_name
                    @self.event_before(call(TheClass, method_name))
                    @rename(method_name)
                    def method(**kw):
                        pass

                    print('created function', method)

                    # func.__name__ = method_name

        fsm = """
            s0 [
                a -> s1
                default s6
            ]
            s1 [
                b -> s2
                default s6
            ]
            s2 [
                c -> s3
                d -> s3
                default s6
            ]
            s3 [
                c -> s4
                d -> s4
                default s6
            ]
            s4 [
                e -> s5
                default s6
            ]
            s5 [
                default s5
            ]
            s6 [
                default s6
            ]
            alias match = s6
        """
        creation_events = ['a']

        def match(self, call_file_name, call_line_num):
            print(
                f'Spec - {self.__class__.__name__}: Should call in order.'
                f'file {call_file_name}, line {call_line_num}.')

    return FakeSpec



def execute_fake_program(class_count, instance_count, event_count):
    all_classes = []
    events = ['a', 'b', 'c', 'd', 'e']

    # create all classes
    for c in range(class_count):
        TheClass = create_class(f'{c}', ['a', 'b', 'c', 'd', 'e'])
        all_classes.append(TheClass)

    # create a spec that monitors all these classes
    FakeSpec = create_spec(all_classes, ['a', 'b', 'c', 'd', 'e'])

    spec_instance = FakeSpec()
    spec_instance.create_monitor(args.algo)

    # create instances of all classes
    for c in range(class_count):
        for i in range(instance_count):
            instance = all_classes[c]()
            for e in range(event_count):
                event_name = events[i % 5]
                getattr(instance, event_name)()

mock_print()
time_1 = time.time()
execute_fake_program(args.class_count, args.instance_count, args.event_count)
time_2 = time.time()
unmock_print()

print('Algo: ', args.algo)
print('Class Count: ', args.class_count)
print('Instance Count: ', args.instance_count)
print('Event Count: ', args.event_count)
print('Time:', time_2 - time_1)
