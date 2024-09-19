# ============================== Define spec ==============================
import builtins
import time
import cProfile
import json
import argparse
from pythonmop import Spec, call, TRUE_EVENT, FALSE_EVENT, StatisticsSingleton
import pythonmop.spec.spec as spec
from string import Template

spec.DONT_MONITOR_PYTHONMOP = False
StatisticsSingleton().set_full_statistics()

parser = argparse.ArgumentParser("Fake Program")
parser.add_argument("algo", help="The algorithm to run", type=str, choices=['A', 'B', 'C', 'C+', 'D'])
parser.add_argument("instance_count", help="The number of instances", type=int)
parser.add_argument("event_count", help="The number of events", type=int)
parser.add_argument("creation_event_percent", help="The percentage of time creation event will be called", type=int)
parser.add_argument("enable_event_percent", help="The percentage of time enable event is called", type=int)
args = parser.parse_args()

# # Replace the argparse section with this:
# class FakeArgs:
#     def __init__(self):
#         self.algo = 'D'
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

class StringTemplate_ChangeAfterCreate(Spec):
    """
    Note further that you cannot change the delimiter after class creation
    (i.e. a different delimiter must be set in the subclass’s class namespace).
    src: https://docs.python.org/3/library/string.html#string.Template.template
    """

    def __init__(self):
        super().__init__()
        self.created_classes_delimier = {}  # key: class, value: delimiter

        @self.event_before(call(Template, '__init__'))
        def class_creation(**kw):
            obj = kw['obj']
            self.created_classes_delimier[obj] = obj.delimiter

        @self.event_before(call(Template, 'substitute'))
        def call_substitute(**kw):
            return check_change(**kw)

        @self.event_before(call(Template, 'safe_substitute'))
        def call_safe_substitute(**kw):
            return check_change(**kw)

        def check_change(**kw):
            obj = kw['obj']
            if obj in self.created_classes_delimier:
                if obj.delimiter != self.created_classes_delimier[obj]:
                    return TRUE_EVENT

            return FALSE_EVENT

    ere = 'class_creation (call_safe_substitute | call_substitute)+'
    creation_events = ['class_creation']

    def match(self, call_file_name, call_line_num):
        print(
            f'Spec - {self.__class__.__name__}: Note further that you cannot change the delimiter after class creation.'
            f'file {call_file_name}, line {call_line_num}.')

# Modify the execute_fake_program function
def execute_fake_program(instance_count, event_count):
    # create a spec
    the_spec = StringTemplate_ChangeAfterCreate()
    the_spec.create_monitor(args.algo)

    class MyTemplate(Template):
        delimiter = '%'

    templates = []
    for i in range(instance_count):
        template = MyTemplate('Hello, %who!')
        templates.append(template)

        # Call creation event (class_creation)
        if i > (1 - (args.creation_event_percent / 100)) * instance_count:
            template.substitute(who='world')

    # Call substitute and safe_substitute methods
    for i in range(event_count):
        template = templates[i % instance_count]
        
        if i % 2 == 0:
            template.substitute(who='user')
        else:
            template.safe_substitute(who='guest')

        # Occasionally change the delimiter 
        if i % 5 == 0:
            template.delimiter = '#'

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
    events = StatisticsSingleton().full_statistics_dict['StringTemplate_ChangeAfterCreate']['events']
    event_count = sum(events.values())
    print('Registered Event count:', event_count)
except KeyError:
    print('Registered Event count: 0')
try:
    print('Monitor Count: ', StatisticsSingleton().full_statistics_dict['StringTemplate_ChangeAfterCreate']['monitors'])
except KeyError:
    print('Monitor Count: 0')

print('Time:', time_2 - time_1)

print('***************************************')


# print('Full statistics:')
# print(json.dumps(StatisticsSingleton().full_statistics_dict, indent=2))
