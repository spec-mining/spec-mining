# ============================== Define spec ==============================
import builtins
import time
import random
import cProfile
import argparse
from pythonmop import Spec, call, TRUE_EVENT, FALSE_EVENT
from string import Template
import pythonmop.spec.spec as spec

spec.DONT_MONITOR_PYTHONMOP = False
random.seed(99)

parser = argparse.ArgumentParser("Fakse Program")
parser.add_argument("algo", help="The algorithm to run", type=str, choices=['A', 'B', 'C', 'C+', 'D'])
parser.add_argument("instance_count", help="The number of instances", type=int)
parser.add_argument("event_count", help="The number of events", type=int)
args = parser.parse_args()

# Replace the argparse section with this:
# class FakeArgs:
#     def __init__(self):
#         self.algo = 'C+'
#         self.instance_count = 100
#         self.event_count = 1000

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
        print('--- string template change after create ---')
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


class MyTemplate(Template):
    delimiter = '%'


def execute_fake_program(instance_count, event_count):
    # create a spec
    string_template_instance = StringTemplate_ChangeAfterCreate()
    string_template_instance.create_monitor(args.algo)

    # create instances
    all_instances = []
    all_possible_events = ['substitute', 'safe_substitute']
    for i in range(instance_count):
        all_instances.append(MyTemplate('Hello'))
    for i in range(event_count):
        inst = random.choice(all_instances)
        event = random.choice(all_possible_events)
        # 10 % of the time, we will violate the spec
        violate = random.random() < 0.1
        if violate:
            inst.delimiter = '#'
        getattr(inst, event)(who='world')
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