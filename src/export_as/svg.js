class ExportAsSVG {
  constructor(width = 800, height = 600, fillStyle = 'black', strokeStyle = 'black', lineWidth = 1, font = '12px Arial, sans-serif') {
    this.fillStyle = fillStyle;
    this.strokeStyle = strokeStyle;
    this.lineWidth = lineWidth;
    this.font = font;
    this._points = [];
    this._svgData = '';
    this._transX = 0;
    this._transY = 0;
    this.width = width;
    this.height = height;
  }

  toSVG() {
    return (
      '<?xml version="1.0" standalone="no"?>\n' +
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n\n' +
      `<svg width="${this.width}" height="${this.height}" version="1.1" xmlns="http://www.w3.org/2000/svg">\n` +
      this._svgData +
      '</svg>\n'
    );
  }

  beginPath() {
    this._points = [];
  }

  arc(x, y, radius, startAngle, endAngle, isReversed) {
    x += this._transX;
    y += this._transY;
    const style = `stroke="${this.strokeStyle}" stroke-width="${this.lineWidth}" fill="none"`;

    if (endAngle - startAngle === Math.PI * 2) {
      this._svgData += `\t<ellipse ${style} cx="${fixed(x, 3)}" cy="${fixed(y, 3)}" rx="${fixed(radius, 3)}" ry="${fixed(radius, 3)}"/>\n`;
    } else {
      if (isReversed) {
        [startAngle, endAngle] = [endAngle, startAngle];
      }
      if (endAngle < startAngle) {
        endAngle += Math.PI * 2;
      }

      const startX = x + radius * Math.cos(startAngle);
      const startY = y + radius * Math.sin(startAngle);
      const endX = x + radius * Math.cos(endAngle);
      const endY = y + radius * Math.sin(endAngle);
      const useGreaterThan180 = Math.abs(endAngle - startAngle) > Math.PI;
      const goInPositiveDirection = 1;

      this._svgData += `\t<path ${style} d="`;
      this._svgData += `M ${fixed(startX, 3)},${fixed(startY, 3)} `; // startPoint(startX, startY)
      this._svgData += `A ${fixed(radius, 3)},${fixed(radius, 3)} `; // radii(radius, radius)
      this._svgData += '0 '; // value of 0 means perfect circle, others mean ellipse
      this._svgData += `${+useGreaterThan180} `;
      this._svgData += `${+goInPositiveDirection} `;
      this._svgData += `${fixed(endX, 3)},${fixed(endY, 3)}`; // endPoint(endX, endY)
      this._svgData += '"/>\n';
    }
  }

  moveTo(x, y) {
    x += this._transX;
    y += this._transY;
    this._points.push({ x, y });
  }

  lineTo(x, y) {
    this.moveTo(x, y);
  }

  stroke() {
    if (this._points.length === 0) return;
    this._svgData += `\t<polygon stroke="${this.strokeStyle}" stroke-width="${this.lineWidth}" points="`;
    this._points.forEach((p, i) => {
      this._svgData += `${i > 0 ? ' ' : ''}${fixed(p.x, 3)},${fixed(p.y, 3)}`;
    });
    this._svgData += '"/>\n';
  }

  fill() {
    if (this._points.length === 0) return;
    this._svgData += `\t<polygon fill="${this.fillStyle}" stroke-width="${this.lineWidth}" points="`;
    this._points.forEach((p, i) => {
      this._svgData += `${i > 0 ? ' ' : ''}${fixed(p.x, 3)},${fixed(p.y, 3)}`;
    });
    this._svgData += '"/>\n';
  }

  measureText(text) {
    const c = document.createElement('canvas').getContext('2d');
    c.font = this.font;
    return c.measureText(text);
  }

  fillText(text, x, y) {
    x += this._transX;
    y += this._transY;
    if (text.replace(' ', '').length > 0) {
      this._svgData += `\t<text x="${fixed(x, 3)}" y="${fixed(y, 3)}" font-family="Times New Roman" font-size="20">${textToXML(text)}</text>\n`;
    }
  }

  translate(x, y) {
    this._transX = x;
    this._transY = y;
  }

  save() {}
  restore() {}
  clearRect() {}
}

// Helper function to format numbers
function fixed(value, digits) {
  return value.toFixed(digits);
}

// Helper function to escape text for XML/SVG
function textToXML(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
