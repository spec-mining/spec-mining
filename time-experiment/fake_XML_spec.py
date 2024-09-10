# ============================== Define spec ==============================
import builtins
import time
import random
import cProfile
import json
import argparse
from pythonmop import Spec, call, TRUE_EVENT, FALSE_EVENT, StatisticsSingleton
from string import Template
import pythonmop.spec.spec as spec

spec.DONT_MONITOR_PYTHONMOP = False
StatisticsSingleton().set_full_statistics()
random.seed(99)

parser = argparse.ArgumentParser("Fakse Program")
parser.add_argument("algo", help="The algorithm to run", type=str, choices=['A', 'B', 'C', 'C+', 'D'])
parser.add_argument("instance_count", help="The number of instances", type=int)
parser.add_argument("event_count", help="The number of events", type=int)
# args = parser.parse_args()


# Replace the argparse section with this:
class FakeArgs:
    def __init__(self):
        self.algo = 'C+'
        self.instance_count = 100
        self.event_count = 1000

args = FakeArgs()



original_print = builtins.print


def mock_print():
    def fake_print(*args, **kwargs):
        pass

    builtins.print = fake_print


def unmock_print(*args, **kwargs):
    builtins.print = original_print


from pythonmop import Spec, call, End, getKwOrPosArg, getStackTrace, TRUE_EVENT, FALSE_EVENT
import ctypes
import xml.parsers.expat

monitoredParseObjects = {}


class MonitoredXMLParser():
    def Parse(self, data, isFinal, stackTrace):
        pass


# ======================== Magically monkey-patch readonly prop ==========================
def magic_get_dict(o):
    # find address of dict whose offset is stored in the type
    dict_addr = id(o) + type(o).__dictoffset__

    # retrieve the dict object itself
    dict_ptr = ctypes.cast(dict_addr, ctypes.POINTER(ctypes.py_object))
    return dict_ptr.contents.value


def magic_flush_mro_cache():
    ctypes.PyDLL(None).PyType_Modified(ctypes.py_object(object))


# Named function to wrap the Parse method
def custom_parse(self, data, isFinal=False):
    if self not in monitoredParseObjects:
        monitoredParseObjects[self] = MonitoredXMLParser()

    stackTrace = getStackTrace()

    monitoredParseObjects[self].Parse(data, isFinal, stackTrace)
    return orig_parse(self, data, isFinal)


# Monkey-patch xml.parsers.expat.XMLParserType.Parse
dct = magic_get_dict(xml.parsers.expat.XMLParserType)
orig_parse = dct['Parse']
dct['Parse'] = lambda self, data, isFinal=False, orig_parse=orig_parse: custom_parse(self, data, isFinal)

# Flush the method cache for the monkey-patch to take effect
magic_flush_mro_cache()


# ========================================================================================

class XMLParser_ParseMustFinalize(Spec):
    """
    isfinal must be true on the final call.
    src: https://docs.python.org/3/library/pyexpat.html
    """

    def __init__(self):
        super().__init__()

        @self.event_before(call(MonitoredXMLParser, 'Parse'))
        def parse(**kw):
            if (getKwOrPosArg('isFinal', 2, kw)):
                return FALSE_EVENT
            else:
                return TRUE_EVENT

        @self.event_before(call(MonitoredXMLParser, 'Parse'))
        def final_parse(**kw):
            if (getKwOrPosArg('isFinal', 2, kw)):
                return TRUE_EVENT
            else:
                return FALSE_EVENT

        @self.event_after(call(End, 'end_execution'))
        def end(**kw):
            return TRUE_EVENT

    fsm = """
        s0 [
            parse -> s1
            final_parse -> s2
            end -> s0
        ]
        s1 [
            parse -> s1
            final_parse -> s2
            end -> s3
        ]
        s2 [
            parse -> s1
            final_parse -> s2
            end -> s2
        ]
        s3 [
            default s3
        ]
        alias match = s3
        """
    creation_events = ['parse']

    def match(self, call_file_name, call_line_num):
        print(
            f'Spec - {self.__class__.__name__}: Must pass True to is_final in the final call to XMLParser. file {call_file_name}, line {call_line_num}.')



def execute_fake_program(instance_count, event_count):
    # create a spec
    string_template_instance = XMLParser_ParseMustFinalize()
    string_template_instance.create_monitor(args.algo)

    # create instances
    all_instances = []
    all_possible_events = ['parse', 'final_parse', 'end']
    for i in range(instance_count):
        theInstance = xml.parsers.expat.ParserCreate()

        # 10 % of the time, call creation event
        # if random.random() < 0.1:
        #     theInstance.create()

        all_instances.append(theInstance)
    for i in range(event_count):
        inst = random.choice(all_instances)
        event = random.choice(all_possible_events)
        # 10 % of the time, we will violate the spec
        violation = random.random() < 0.1
        if event == 'parse':
            inst.Parse('<root>', isFinal=False)
        if event == 'final_parse':
            inst.Parse('<root>', isFinal=True)
        if event == 'end':
            End().end_execution()

        if violation:
            inst.Parse('<root>', isFinal=True)
            inst.Parse('<root>', isFinal=False)
            End().end_execution()
    if args.algo == 'A':
        string_template_instance.get_monitor().refresh_monitor()


mock_print()
time_1 = time.time()
# cProfile.run('execute_fake_program(args.instance_count, args.event_count)', sort='cumulative')
execute_fake_program(args.instance_count, args.event_count)
time_2 = time.time()
unmock_print()

print('Algo: ', args.algo)
print('Instance Count: ', args.instance_count)
print('Event Count: ', args.event_count)
print('Time:', time_2 - time_1)
print('Full statistics:')
print(json.dumps(StatisticsSingleton().full_statistics_dict, indent=2))
