class ExportAsLaTeX {
  constructor(scale = 0.1, strokeStyle = 'black', font = '20px "Times New Roman", serif') {
    this._points = [];
    this._texData = '';
    this._scale = scale;
    this.strokeStyle = strokeStyle;
    this.font = font;
  }

  toLaTeX() {
    return (
      '\\documentclass[12pt]{article}\n' +
      '\\usepackage{tikz}\n' +
      '\n' +
      '\\begin{document}\n' +
      '\n' +
      '\\begin{center}\n' +
      '\\begin{tikzpicture}[scale=0.2]\n' +
      '\\tikzstyle{every node}+=[inner sep=0pt]\n' +
      this._texData +
      '\\end{tikzpicture}\n' +
      '\\end{center}\n' +
      '\n' +
      '\\end{document}\n'
    );
  }

  beginPath() {
    this._points = [];
  }

  arc(x, y, radius, startAngle, endAngle, isReversed) {
    x *= this._scale;
    y *= this._scale;
    radius *= this._scale;

    if (endAngle - startAngle === Math.PI * 2) {
      this._texData += `\\draw [${this.strokeStyle}] (${fixed(x, 3)},${fixed(-y, 3)}) circle (${fixed(radius, 3)});\n`;
    } else {
      if (isReversed) {
        [startAngle, endAngle] = [endAngle, startAngle];
      }
      if (endAngle < startAngle) {
        endAngle += Math.PI * 2;
      }
      if (Math.min(startAngle, endAngle) < -2 * Math.PI) {
        startAngle += 2 * Math.PI;
        endAngle += 2 * Math.PI;
      } else if (Math.max(startAngle, endAngle) > 2 * Math.PI) {
        startAngle -= 2 * Math.PI;
        endAngle -= 2 * Math.PI;
      }
      startAngle = -startAngle;
      endAngle = -endAngle;
      this._texData += `\\draw [${this.strokeStyle}] (${fixed(x + radius * Math.cos(startAngle), 3)},${fixed(
        -y + radius * Math.sin(startAngle),
        3
      )}) arc (${fixed((startAngle * 180) / Math.PI, 5)}:${fixed((endAngle * 180) / Math.PI, 5)}:${fixed(radius, 3)});\n`;
    }
  }

  moveTo(x, y) {
    x *= this._scale;
    y *= this._scale;
    this._points.push({ x, y });
  }

  lineTo(x, y) {
    this.moveTo(x, y);
  }

  stroke() {
    if (this._points.length === 0) return;
    this._texData += `\\draw [${this.strokeStyle}]`;
    this._points.forEach((p, i) => {
      this._texData += `${i > 0 ? ' --' : ''} (${fixed(p.x, 2)},${fixed(-p.y, 2)})`;
    });
    this._texData += ';\n';
  }

  fill() {
    if (this._points.length === 0) return;
    this._texData += `\\fill [${this.strokeStyle}]`;
    this._points.forEach((p, i) => {
      this._texData += `${i > 0 ? ' --' : ''} (${fixed(p.x, 2)},${fixed(-p.y, 2)})`;
    });
    this._texData += ';\n';
  }

  measureText(text) {
    const c = document.createElement('canvas').getContext('2d');
    c.font = this.font;
    return c.measureText(text);
  }

  advancedFillText(text, originalText, x, y, angleOrNull) {
    if (text.replace(' ', '').length > 0) {
      let nodeParams = '';
      if (angleOrNull != null) {
        const width = this.measureText(text).width;
        const dx = Math.cos(angleOrNull);
        const dy = Math.sin(angleOrNull);
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) {
            nodeParams = '[right] ';
            x -= width / 2;
          } else {
            nodeParams = '[left] ';
            x += width / 2;
          }
        } else {
          if (dy > 0) {
            nodeParams = '[below] ';
            y -= 10;
          } else {
            nodeParams = '[above] ';
            y += 10;
          }
        }
      }
      x *= this._scale;
      y *= this._scale;
      this._texData += `\\draw (${fixed(x, 2)},${fixed(-y, 2)}) node ${nodeParams}{$${originalText.replace(/ /g, '\\mbox{ }')}$};\n`;
    }
  }

  translate() {}
  save() {}
  restore() {}
  clearRect() {}
}

// Helper function to format numbers
function fixed(value, digits) {
  return value.toFixed(digits);
}
