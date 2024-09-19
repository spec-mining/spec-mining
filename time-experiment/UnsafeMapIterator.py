# ============================== Define spec ==============================
import builtins
import time
import argparse
from pythonmop import Spec, call, TRUE_EVENT, FALSE_EVENT, StatisticsSingleton
import pythonmop.spec.spec as spec

spec.DONT_MONITOR_PYTHONMOP = False
StatisticsSingleton().set_full_statistics()

parser = argparse.ArgumentParser("Fake Program")
parser.add_argument("algo", help="The algorithm to run", type=str, choices=['A', 'B', 'C', 'C+', 'D'])
parser.add_argument("instance_count", help="The number of instances", type=int)
parser.add_argument("event_count", help="The number of events", type=int)
parser.add_argument("creation_event_percent", help="The percentage of time creation event will be called", type=int)
parser.add_argument("enable_event_percent", help="The percentage of time enable event is called", type=int)
args = parser.parse_args()

# Replace the argparse section with this:
# class FakeArgs:
#     def __init__(self):
#         self.algo = 'B'
#         self.instance_count = 200
#         self.event_count = 10
#         self.creation_event_percent = 100
#         self.enable_event_percent = 100

# args = FakeArgs()


original_print = builtins.print
def mock_print():
    def fake_print(*args, **kwargs):
        pass
    builtins.print = fake_print

def unmock_print(*args, **kwargs):
    builtins.print = original_print



originalDict = builtins.dict

original__init__ = dict.__init__
original__setitem__ = dict.__setitem__

class CustomDict(dict):
    def __init__(self, *args, **kwargs):
        return original__init__(self, *args, **kwargs)
    
    def __hash__(self):
        return super.__hash__(super)
    
    def __setitem__(self, *args, **kwargs):
        return original__setitem__(self, *args, **kwargs)
builtins.dict = CustomDict

originalIsinstance = builtins.isinstance
def customIsinstance(object, type_to_check):
    if originalIsinstance(type_to_check, tuple):
        # replace the dict if found in the tuple with the original dict
        type_to_check = tuple([originalDict if x == dict else x for x in type_to_check])
    elif type_to_check == dict:
        type_to_check = originalDict

    return originalIsinstance(object, type_to_check)

builtins.isinstance = customIsinstance

class Iterator():
    def __init__(self, map) -> None:
        pass

    def __next__(self):
        pass

builtinToCustomIterRef = {}

originalIter = builtins.iter
def customIter(*args, **kwargs):
    builtinIter = originalIter(*args, **kwargs)
    builtinToCustomIterRef[builtinIter] = Iterator(args[0])
    return builtinIter

builtins.iter = customIter

originalNext = builtins.next
def customNext(*args, **kwargs):
    builtinIter = args[0]

    try:
        ourIter = builtinToCustomIterRef[builtinIter]
        ourIter.__next__()
    except KeyError:
        pass

    return originalNext(*args, **kwargs)

builtins.next = customNext

class UnsafeMapIterator(Spec):
    """
        Should not call next on iterator after modifying the map
    """
    def __init__(self):
        super().__init__()

        @self.event_before(call(CustomDict, '__init__'))
        def createMap(**kw):
            pass

        @self.event_before(call(CustomDict, '__setitem__'))
        def updateMap(**kw):
            pass
        
        @self.event_before(call(Iterator, '__init__'), target = [1], names = [call(CustomDict, '*')])
        def createIter(**kw):
            pass

        @self.event_before(call(Iterator, '__next__'))
        def next(**kw):
            pass

    ere = 'createMap updateMap* createIter next* updateMap next'
    creation_events = ['createMap']

    def match(self, call_file_name, call_line_num):
        print(
            f'Spec - {self.__class__.__name__}: Should not call next on iterator after modifying the map . file {call_file_name}, line {call_line_num}.')
# =========================================================================

def execute_fake_program(instance_count, event_count):
    map_instances = []
    iter_instances = []

    creation_event_start_index = int((1 - (args.creation_event_percent / 100)) * instance_count)

    for i in range(instance_count):
        # these creation events won't be considered as they're created before the spec is created
        if i <= creation_event_start_index:
            d = dict(a=1, b=2, c=3)
            map_instances.append(d)

    # create a spec
    the_spec = UnsafeMapIterator()
    the_spec.create_monitor(args.algo)

    for i in range(instance_count):
        # 30% of the time call the creation event
        # [so that 70% of the time algos C+ and D would skip creating a monitor]
        if i > creation_event_start_index:
            d = dict(a=1, b=2, c=3)
            map_instances.append(d)
    
    # Create iterators for all map instances
    for d in map_instances:
        iter_instances.append(iter(d))

    # 15% of the time call the enabling event (that is part of the enable set of d)
    # [so that 85% of the time algo D would skip creating a monitor]
    for i, d in enumerate(map_instances):
        if i > (1 - (args.enable_event_percent / 100)) * len(map_instances):
            del d['a']
            d['d'] = 4


    for iterator in iter_instances:
        next(iterator)

    if args.algo == 'A':
        the_spec.get_monitor().refresh_monitor()


mock_print()
time_1 = time.time()
execute_fake_program(args.instance_count, args.event_count)
time_2 = time.time()
unmock_print()

print(f'Running: algo {args.algo} Instance: {args.instance_count} Requested Events {args.event_count} Creation Events {args.creation_event_percent}% Enable Events {args.enable_event_percent}%')
try:
    # get the count of all events by summing the values of all keys within events dict within StringTemplate_ChangeAfterCreate
    events = StatisticsSingleton().full_statistics_dict['UnsafeMapIterator']['events']
    event_count = sum(events.values())
    print('Registered Event count:', event_count)
except KeyError:
    print('Registered Event count: 0')
try:
    print('Monitor Count: ', StatisticsSingleton().full_statistics_dict['UnsafeMapIterator']['monitors'])
except KeyError:
    print('Monitor Count: 0')

print('Time:', time_2 - time_1)

print('***************************************')


# print('Full statistics:')

# print(json.dumps(StatisticsSingleton().full_statistics_dict, indent=2))