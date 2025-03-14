import { CanvasRenderer } from './CanvasRenderer.js';
import { SVGExporter } from './SVGExporter.js';
import { LaTeXExporter } from './LaTeXExporter.js';
import { EventHandlers } from './EventHandlers.js';

class DiagramEditor {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.nodes = [];
    this.links = [];
    this.selectedObject = null;
    this.currentLink = null;
    this.shift = false;
    this.caretVisible = true;
    this.nodeRadius = 30;
    this.snapToPadding = 6;
    this.hitTargetPadding = 6;

    this.renderer = new CanvasRenderer(this.canvas);
    this.eventHandlers = new EventHandlers(this);
    this.eventHandlers.attachEventListeners();
  }

  draw() {
    this.renderer.clear();
    this.nodes.forEach(node => node.draw(this.renderer.context));
    this.links.forEach(link => link.draw(this.renderer.context));
    if (this.currentLink) {
      this.currentLink.draw(this.renderer.context);
    }
  }

  selectObject(x, y) {
    for (const node of this.nodes) {
      if (node.containsPoint(x, y)) return node;
    }
    for (const link of this.links) {
      if (link.containsPoint(x, y)) return link;
    }
    return null;
  }

  snapNode(node) {
    for (const otherNode of this.nodes) {
      if (otherNode === node) continue;
      if (Math.abs(node.x - otherNode.x) < this.snapToPadding) node.x = otherNode.x;
      if (Math.abs(node.y - otherNode.y) < this.snapToPadding) node.y = otherNode.y;
    }
  }

  saveAsPNG() {
    const oldSelectedObject = this.selectedObject;
    this.selectedObject = null;
    this.draw();
    this.selectedObject = oldSelectedObject;
    const pngData = this.canvas.toDataURL('image/png');
    document.location.href = pngData;
  }

  saveAsSVG() {
    const exporter = new SVGExporter();
    const oldSelectedObject = this.selectedObject;
    this.selectedObject = null;
    this.drawUsing(exporter);
    this.selectedObject = oldSelectedObject;
    const svgData = exporter.toSVG();
    output(svgData);
  }

  saveAsLaTeX() {
    const exporter = new LaTeXExporter();
    const oldSelectedObject = this.selectedObject;
    this.selectedObject = null;
    this.drawUsing(exporter);
    this.selectedObject = oldSelectedObject;
    const texData = exporter.toLaTeX();
    output(texData);
  }
}

const editor = new DiagramEditor();
