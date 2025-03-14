class Node {
  constructor(x, y, text = '', isAcceptState = false, nodeRadius = 10, acceptStateRadius = 6) {
    this.x = x;
    this.y = y;
    this.mouseOffsetX = 0;
    this.mouseOffsetY = 0;
    this.isAcceptState = isAcceptState;
    this.text = text;
    this.nodeRadius = nodeRadius;
    this.acceptStateRadius = acceptStateRadius;
  }

  setMouseStart(x, y) {
    this.mouseOffsetX = this.x - x;
    this.mouseOffsetY = this.y - y;
  }

  setAnchorPoint(x, y) {
    this.x = x + this.mouseOffsetX;
    this.y = y + this.mouseOffsetY;
  }

  draw(c) {
    // Draw the outer circle
    c.beginPath();
    c.arc(this.x, this.y, this.nodeRadius, 0, 2 * Math.PI, false);
    c.stroke();

    // Draw the text
    drawText(c, this.text, this.x, this.y, null, selectedObject === this);

    // Draw the inner circle for accept state
    if (this.isAcceptState) {
      c.beginPath();
      c.arc(this.x, this.y, this.nodeRadius - this.acceptStateRadius, 0, 2 * Math.PI, false);
      c.stroke();
    }
  }

  closestPointOnCircle(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    const scale = Math.hypot(dx, dy);
    return {
      x: this.x + (dx * this.nodeRadius) / scale,
      y: this.y + (dy * this.nodeRadius) / scale,
    };
  }

  containsPoint(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    return dx * dx + dy * dy < this.nodeRadius * this.nodeRadius;
  }
}
