# ============================== Define spec ==============================
from nltk.draw.util import CanvasFrame, CanvasWidget
from tkinter import Tk

class CircleWidget(CanvasWidget):
    def __init__(self, canvas, x, y, radius):
        self._circle_id = canvas.create_oval(x - radius, y - radius, x + radius, y + radius, fill="blue")
        super().__init__(canvas)
    
    def _tags(self):
        return (str(self._circle_id),)

class SimpleTextWidget(CanvasWidget):
    def __init__(self, canvas, text, skip_adding_child_step=False):
        # Step 1: Create the text graphical element.
        self._text_id = canvas.create_text(10, 10, anchor="nw", text=text, fill="black")
        
        # Initialize the circle widget without adding it as a child yet.
        self._circle_widget = CircleWidget(canvas, 40, 40, 10)

        # Conditionally skip adding the child widget based on the passed parameter.
        if not skip_adding_child_step:
            # Step 2: Create and add the child widget (circle) to this widget.
            self._add_child_widget(self._circle_widget)

        # Step 3: Call the CanvasWidget constructor.
        super().__init__(canvas)

    def __repr__(self):
        return "<SimpleTextWidget>"
    
    def _tags(self):
        # Include both the text and the child widget's tags.
        return (str(self._text_id),) + self._circle_widget._tags()

# Setup Tkinter root and canvas
root = Tk()
cf = CanvasFrame(root, width=400, height=200)
canvas = cf.canvas()

# ================================EXAMPLE=========================================

# Instantiate the custom widget with some text and a child circle widget,
# optionally skipping the step of adding the child widget.
text_widget = SimpleTextWidget(canvas, "Hello, NLTK Canvas!", skip_adding_child_step=False)

# Add the widget to the canvas frame to make sure it's visible.
cf.add_widget(text_widget)

cf.pack()
root.mainloop()
