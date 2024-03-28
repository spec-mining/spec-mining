# ============================== Define spec ==============================
from tkinter import Tk, Canvas
from nltk.draw.util import CanvasWidget, CanvasFrame

class CircleWidget(CanvasWidget):
    def __init__(self, canvas, x, y, radius, **kwargs):
        self._canvas = canvas
        self._x, self._y = x, y
        self._radius = radius
        self._oval_id = self._canvas.create_oval(x - radius, y - radius, x + radius, y + radius, **kwargs)
        super().__init__(canvas)

    def _tags(self):
        return (self._oval_id,)

    def resize(self, new_radius, skip_update_parent=False):
        self._radius = new_radius
        self._canvas.coords(self._oval_id, self._x - new_radius, self._y - new_radius, self._x + new_radius, self._y + new_radius)
        if not skip_update_parent:
            self.parent().update(self)

class RectangleWidget(CanvasWidget):
    def __init__(self, canvas, child, **kwargs):
        self._canvas = canvas
        self._circle_widget = child
        self._add_child_widget(child)

        bbox = self.child_bbox()
        self._rect_id = self._canvas.create_rectangle(bbox, **kwargs)
        super().__init__(canvas)

    def _tags(self):
        return (self._rect_id,)

    def child_bbox(self):
        return self._canvas.bbox(self._circle_widget._tags()[0])

    def update(self, child):
        bbox = self.child_bbox()
        self._canvas.coords(self._rect_id, bbox)

# GUI setup
root = Tk()
cf = CanvasFrame(root, width=400, height=400)
canvas = cf.canvas()


# ================================EXAMPLE=========================================

# Create the circle widget
circle_widget = CircleWidget(canvas, 100, 100, 50, fill="red")

# Create the rectangle widget that surrounds the circle widget
rect_widget = RectangleWidget(canvas, circle_widget, outline="blue")

cf.add_widget(rect_widget)

# Schedule the circle widget to resize, causing the rectangle to adjust. 
# optionally skipping updating the parent widget.
root.after(2000, lambda: circle_widget.resize(25, skip_update_parent=False))

cf.pack()
root.mainloop()
