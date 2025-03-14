class StartLink {
  constructor(node, start = null, text = '', snapToPadding = 5, hitTargetPadding = 5) {
    this.node = node;
    this.deltaX = 0;
    this.deltaY = 0;
    this.text = text;
    this.snapToPadding = snapToPadding;
    this.hitTargetPadding = hitTargetPadding;

    if (start) {
      this.setAnchorPoint(start.x, start.y);
    }
  }

  setAnchorPoint(x, y) {
    this.deltaX = x - this.node.x;
    this.deltaY = y - this.node.y;

    // Snap to horizontal or vertical alignment
    if (Math.abs(this.deltaX) < this.snapToPadding) {
      this.deltaX = 0;
    }
    if (Math.abs(this.deltaY) < this.snapToPadding) {
      this.deltaY = 0;
    }
  }

  getEndPoints() {
    const startX = this.node.x + this.deltaX;
    const startY = this.node.y + this.deltaY;
    const end = this.node.closestPointOnCircle(startX, startY);
    return {
      startX,
      startY,
      endX: end.x,
      endY: end.y,
    };
  }

  draw(c) {
    const { startX, startY, endX, endY } = this.getEndPoints();

    // Draw the line
    c.beginPath();
    c.moveTo(startX, startY);
    c.lineTo(endX, endY);
    c.stroke();

    // Draw the text
    const textAngle = Math.atan2(startY - endY, startX - endX);
    drawText(c, this.text, startX, startY, textAngle, selectedObject === this);

    // Draw the arrowhead
    drawArrow(c, endX, endY, Math.atan2(-this.deltaY, -this.deltaX));
  }

  containsPoint(x, y) {
    const { startX, startY, endX, endY } = this.getEndPoints();
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.hypot(dx, dy);
    const percent = (dx * (x - startX) + dy * (y - startY)) / (length * length);
    const distance = (dx * (y - startY) - dy * (x - startX)) / length;
    return percent > 0 && percent < 1 && Math.abs(distance) < this.hitTargetPadding;
  }
}
