class TemporaryLink {
  constructor(from, to, lineColor = 'black', arrowSize = 10, lineWidth = 2) {
    this.from = from;
    this.to = to;
    this.lineColor = lineColor;
    this.arrowSize = arrowSize;
    this.lineWidth = lineWidth;
  }

  draw(c) {
    // Save the current context state
    c.save();

    // Set line properties
    c.strokeStyle = this.lineColor;
    c.lineWidth = this.lineWidth;

    // Draw the line
    c.beginPath();
    c.moveTo(this.from.x, this.from.y);
    c.lineTo(this.to.x, this.to.y);
    c.stroke();

    // Draw the arrowhead
    const angle = Math.atan2(this.to.y - this.from.y, this.to.x - this.from.x);
    drawArrow(c, this.to.x, this.to.y, angle, this.arrowSize);

    // Restore the context state
    c.restore();
  }
}
