class Link {
  constructor(nodeA, nodeB, text = '', snapToPadding = 5, hitTargetPadding = 5, nodeRadius = 10) {
    this.nodeA = nodeA;
    this.nodeB = nodeB;
    this.text = text;
    this.lineAngleAdjust = 0;
    this.parallelPart = 0.5;
    this.perpendicularPart = 0;
    this.snapToPadding = snapToPadding;
    this.hitTargetPadding = hitTargetPadding;
    this.nodeRadius = nodeRadius;
  }

  getAnchorPoint() {
    const dx = this.nodeB.x - this.nodeA.x;
    const dy = this.nodeB.y - this.nodeA.y;
    const scale = Math.hypot(dx, dy);
    return {
      x: this.nodeA.x + dx * this.parallelPart - (dy * this.perpendicularPart) / scale,
      y: this.nodeA.y + dy * this.parallelPart + (dx * this.perpendicularPart) / scale,
    };
  }

  setAnchorPoint(x, y) {
    const dx = this.nodeB.x - this.nodeA.x;
    const dy = this.nodeB.y - this.nodeA.y;
    const scale = Math.hypot(dx, dy);
    this.parallelPart = (dx * (x - this.nodeA.x) + dy * (y - this.nodeA.y)) / (scale * scale);
    this.perpendicularPart = (dx * (y - this.nodeA.y) - dy * (x - this.nodeA.x)) / scale;

    if (this.parallelPart > 0 && this.parallelPart < 1 && Math.abs(this.perpendicularPart) < this.snapToPadding) {
      this.lineAngleAdjust = this.perpendicularPart < 0 ? Math.PI : 0;
      this.perpendicularPart = 0;
    }
  }

  getEndPointsAndCircle() {
    if (this.perpendicularPart === 0) {
      const midX = (this.nodeA.x + this.nodeB.x) / 2;
      const midY = (this.nodeA.y + this.nodeB.y) / 2;
      const start = this.nodeA.closestPointOnCircle(midX, midY);
      const end = this.nodeB.closestPointOnCircle(midX, midY);
      return {
        hasCircle: false,
        startX: start.x,
        startY: start.y,
        endX: end.x,
        endY: end.y,
      };
    }

    const anchor = this.getAnchorPoint();
    const circle = circleFromThreePoints(this.nodeA.x, this.nodeA.y, this.nodeB.x, this.nodeB.y, anchor.x, anchor.y);
    const isReversed = this.perpendicularPart > 0;
    const reverseScale = isReversed ? 1 : -1;
    const startAngle = Math.atan2(this.nodeA.y - circle.y, this.nodeA.x - circle.x) - reverseScale * this.nodeRadius / circle.radius;
    const endAngle = Math.atan2(this.nodeB.y - circle.y, this.nodeB.x - circle.x) + reverseScale * this.nodeRadius / circle.radius;

    return {
      hasCircle: true,
      startX: circle.x + circle.radius * Math.cos(startAngle),
      startY: circle.y + circle.radius * Math.sin(startAngle),
      endX: circle.x + circle.radius * Math.cos(endAngle),
      endY: circle.y + circle.radius * Math.sin(endAngle),
      startAngle,
      endAngle,
      circleX: circle.x,
      circleY: circle.y,
      circleRadius: circle.radius,
      reverseScale,
      isReversed,
    };
  }

  draw(c) {
    const stuff = this.getEndPointsAndCircle();
    c.beginPath();
    if (stuff.hasCircle) {
      c.arc(stuff.circleX, stuff.circleY, stuff.circleRadius, stuff.startAngle, stuff.endAngle, stuff.isReversed);
    } else {
      c.moveTo(stuff.startX, stuff.startY);
      c.lineTo(stuff.endX, stuff.endY);
    }
    c.stroke();

    if (stuff.hasCircle) {
      drawArrow(c, stuff.endX, stuff.endY, stuff.endAngle - stuff.reverseScale * (Math.PI / 2));
    } else {
      drawArrow(c, stuff.endX, stuff.endY, Math.atan2(stuff.endY - stuff.startY, stuff.endX - stuff.startX));
    }

    if (stuff.hasCircle) {
      const textAngle = (stuff.startAngle + stuff.endAngle) / 2 + stuff.isReversed * Math.PI;
      const textX = stuff.circleX + stuff.circleRadius * Math.cos(textAngle);
      const textY = stuff.circleY + stuff.circleRadius * Math.sin(textAngle);
      drawText(c, this.text, textX, textY, textAngle, selectedObject === this);
    } else {
      const textX = (stuff.startX + stuff.endX) / 2;
      const textY = (stuff.startY + stuff.endY) / 2;
      const textAngle = Math.atan2(stuff.endX - stuff.startX, stuff.startY - stuff.endY);
      drawText(c, this.text, textX, textY, textAngle + this.lineAngleAdjust, selectedObject === this);
    }
  }

  containsPoint(x, y) {
    const stuff = this.getEndPointsAndCircle();
    if (stuff.hasCircle) {
      const dx = x - stuff.circleX;
      const dy = y - stuff.circleY;
      const distance = Math.hypot(dx, dy) - stuff.circleRadius;
      if (Math.abs(distance) < this.hitTargetPadding) {
        const angle = Math.atan2(dy, dx);
        let startAngle = stuff.startAngle;
        let endAngle = stuff.endAngle;
        if (stuff.isReversed) {
          [startAngle, endAngle] = [endAngle, startAngle];
        }
        if (endAngle < startAngle) endAngle += Math.PI * 2;
        if (angle < startAngle) angle += Math.PI * 2;
        return angle > startAngle && angle < endAngle;
      }
    } else {
      const dx = stuff.endX - stuff.startX;
      const dy = stuff.endY - stuff.startY;
      const length = Math.hypot(dx, dy);
      const percent = (dx * (x - stuff.startX) + dy * (y - stuff.startY)) / (length * length);
      const distance = (dx * (y - stuff.startY) - dy * (x - stuff.startX)) / length;
      return percent > 0 && percent < 1 && Math.abs(distance) < this.hitTargetPadding;
    }
    return false;
  }
}
