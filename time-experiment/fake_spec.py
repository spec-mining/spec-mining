# ============================== Define spec ==============================
from pythonmop import Spec, call
import builtins
import time
import argparse

parser = argparse.ArgumentParser("Fakse Program")
parser.add_argument("algo", help="The algorithm to run", type=str, choices=['A', 'B', 'C', 'C+', 'D'])
parser.add_argument("instance_count", help="The number of instances", type=int)
parser.add_argument("event_count", help="The number of events", type=int)
parser.add_argument("raises_violation", help="Whether or not it should raise a violation", type=bool)
args = parser.parse_args()

# take algo as an argument when calling the file from command line

original_print = builtins.print
def mock_print():
    def fake_print(*args, **kwargs):
        pass

    builtins.print = fake_print

def unmock_print(*args, **kwargs):
    builtins.print = original_print


class A:
    def a(self):
        pass

    def b(self):
        pass

    def c(self):
        pass

    def d(self):
        pass

    def e(self):
        pass

class FakeSpec(Spec):
    """
        must call methods in order a, b, c, d, e (order of c and d doesn't matter)
    """
    def __init__(self):
        super().__init__()

        @self.event_before(call(A, 'a'))
        def a(**kw):
            pass

        @self.event_before(call(A, 'b'))
        def b(**kw):
            pass
    
        @self.event_before(call(A, 'c'))
        def c(**kw):
            pass

        @self.event_before(call(A, 'd'))
        def d(**kw):
            pass

        @self.event_before(call(A, 'e'))
        def e(**kw):
            pass

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


# =========================================================================
def execute_fake_program(instance_count, event_count, raises_violation):
    events = ['a', 'b', 'c', 'e', 'd'] if raises_violation else ['a', 'b', 'c', 'd', 'e']

    for i in range(instance_count):
        instance = A()
        for e in range(event_count):
            event_name = events[i % 5]
            getattr(instance, event_name)()

mock_print()

spec_instance = FakeSpec()
spec_instance.create_monitor(args.algo)

time_1 = time.time()
execute_fake_program(args.instance_count, args.event_count, raises_violation=args.raises_violation)
time_2 = time.time()

unmock_print()

print('Algo: ', args.algo)
print('Instance Count: ', args.instance_count)
print('Event Count: ', args.event_count)
print('Raises a violation: ', args.raises_violation)
print('Time:', time_2 - time_1)
