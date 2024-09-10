# ============================== Define spec ==============================
import builtins
import time
import cProfile
import json
import argparse
from pythonmop import Spec, call, TRUE_EVENT, FALSE_EVENT, StatisticsSingleton
import pythonmop.spec.spec as spec

spec.DONT_MONITOR_PYTHONMOP = False
StatisticsSingleton().set_full_statistics()

parser = argparse.ArgumentParser("Fake Program")
parser.add_argument("algo", help="The algorithm to run", type=str, choices=['A', 'B', 'C', 'C+', 'D'])
parser.add_argument("instance_count", help="The number of instances", type=int)
parser.add_argument("event_count", help="The number of events", type=int)
args = parser.parse_args()

# Replace the argparse section with this:
# class FakeArgs:
#     def __init__(self):
#         self.algo = 'C+'
#         self.instance_count = 50
#         self.event_count = 10

# args = FakeArgs()


original_print = builtins.print


def mock_print():
    def fake_print(*args, **kwargs):
        pass

    builtins.print = fake_print


def unmock_print(*args, **kwargs):
    builtins.print = original_print



class A():
    def a(self):
        pass

    def c(self):
        pass

class B():
    def b(self):
        pass

class Fake_Spec(Spec):
    """
    This spec introduces fake events for the purpose of emphasizing the differences between the algorithms
    """

    def __init__(self):
        super().__init__()

        @self.event_before(call(A, 'a'))
        def a(**kw):
            pass

        @self.event_before(call(B, 'b'))
        def b(**kw):
            pass

        @self.event_before(call(A, 'c'))
        def c(**kw):
            pass

    ere = 'a b c+'
    creation_events = ['a']

    def match(self, call_file_name, call_line_num):
        print(
            f'Spec - {self.__class__.__name__}: should call events in order.'
            f'file {call_file_name}, line {call_line_num}.')

def execute_fake_program(instance_count, event_count):
    # create a spec
    the_spec = Fake_Spec()
    the_spec.create_monitor(args.algo)

    for i in range(instance_count):
        a = A()

        # 30% of the time call the creation event
        # [so that 70% of the time algos C+ and D would skip creating a monitor]
        if i > 0.7 * instance_count:
            a.a()

        # 15% of the time call the enabling event (that is part of the enable set of c)
        # [so that 85% of the time algo D would skip creating a monitor]
        if i > 0.85 * instance_count:
            b = B()
            b.b()

        for i in range(event_count): 
            a.c()
    
    if args.algo == 'A':
        the_spec.get_monitor().refresh_monitor()


mock_print()
time_1 = time.time()
execute_fake_program(args.instance_count, args.event_count)
time_2 = time.time()
unmock_print()

print(f'Running: algo {args.algo} Instance: {args.instance_count} Requested Event {args.event_count}')
try:
    # get the count of all events by summing the values of all keys within events dict within StringTemplate_ChangeAfterCreate
    events = StatisticsSingleton().full_statistics_dict['Fake_Spec']['events']
    event_count = sum(events.values())
    print('Registered Event count:', event_count)
except KeyError:
    print('Registered Event count: 0')
try:
    print('Monitor Count: ', StatisticsSingleton().full_statistics_dict['Fake_Spec']['monitors'])
except KeyError:
    print('Monitor Count: 0')

print('Time:', time_2 - time_1)

print('***************************************')


# print('Full statistics:')
# print(json.dumps(StatisticsSingleton().full_statistics_dict, indent=2))
