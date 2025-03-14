class SelfLink {
  constructor(node, mouse = null, text = '', nodeRadius = 10, hitTargetPadding = 5) {
    this.node = node;
    this.anchorAngle = 0;
    this.mouseOffsetAngle = 0;
    this.text = text;
    this.nodeRadius = nodeRadius;
    this.hitTargetPadding = hitTargetPadding;

    if (mouse) {
      this.setAnchorPoint(mouse.x, mouse.y);
    }
  }

  setMouseStart(x, y) {
    this.mouseOffsetAngle = this.anchorAngle - Math.atan2(y - this.node.y, x - this.node.x);
  }

  setAnchorPoint(x, y) {
    this.anchorAngle = Math.atan2(y - this.node.y, x - this.node.x) + this.mouseOffsetAngle;

    // Snap to 90 degrees
    const snap = Math.round(this.anchorAngle / (Math.PI / 2)) * (Math.PI / 2);
    if (Math.abs(this.anchorAngle - snap) < 0.1) this.anchorAngle = snap;

    // Keep in the range -π to π
    if (this.anchorAngle < -Math.PI) this.anchorAngle += 2 * Math.PI;
    if (this.anchorAngle > Math.PI) this.anchorAngle -= 2 * Math.PI;
  }

  getEndPointsAndCircle() {
    const circleX = this.node.x + 1.5 * this.nodeRadius * Math.cos(this.anchorAngle);
    const circleY = this.node.y + 1.5 * this.nodeRadius * Math.sin(this.anchorAngle);
    const circleRadius = 0.75 * this.nodeRadius;
    const startAngle = this.anchorAngle - Math.PI * 0.8;
    const endAngle = this.anchorAngle + Math.PI * 0.8;
    const startX = circleX + circleRadius * Math.cos(startAngle);
    const startY = circleY + circleRadius * Math.sin(startAngle);
    const endX = circleX + circleRadius * Math.cos(endAngle);
    const endY = circleY + circleRadius * Math.sin(endAngle);

    return {
      hasCircle: true,
      startX,
      startY,
      endX,
      endY,
      startAngle,
      endAngle,
      circleX,
      circleY,
      circleRadius,
    };
  }

  draw(c) {
    const stuff = this.getEndPointsAndCircle();

    // Draw arc
    c.beginPath();
    c.arc(stuff.circleX, stuff.circleY, stuff.circleRadius, stuff.startAngle, stuff.endAngle, false);
    c.stroke();

    // Draw text
    const textX = stuff.circleX + stuff.circleRadius * Math.cos(this.anchorAngle);
    const textY = stuff.circleY + stuff.circleRadius * Math.sin(this.anchorAngle);
    drawText(c, this.text, textX, textY, this.anchorAngle, selectedObject === this);

    // Draw arrowhead
    drawArrow(c, stuff.endX, stuff.endY, stuff.endAngle + Math.PI * 0.4);
  }

  containsPoint(x, y) {
    const stuff = this.getEndPointsAndCircle();
    const dx = x - stuff.circleX;
    const dy = y - stuff.circleY;
    const distance = Math.hypot(dx, dy) - stuff.circleRadius;
    return Math.abs(distance) < this.hitTargetPadding;
  }
}
