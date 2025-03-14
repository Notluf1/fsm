function restoreBackup() {
  if (!localStorage || !JSON) return;

  try {
    const backup = JSON.parse(localStorage.fsm);

    backup.nodes.forEach(backupNode => {
      const node = new Node(backupNode.x, backupNode.y);
      node.isAcceptState = backupNode.isAcceptState;
      node.text = backupNode.text;
      nodes.push(node);
    });

    backup.links.forEach(backupLink => {
      let link = null;
      if (backupLink.type === 'SelfLink') {
        link = new SelfLink(nodes[backupLink.node]);
        link.anchorAngle = backupLink.anchorAngle;
        link.text = backupLink.text;
      } else if (backupLink.type === 'StartLink') {
        link = new StartLink(nodes[backupLink.node]);
        link.deltaX = backupLink.deltaX;
        link.deltaY = backupLink.deltaY;
        link.text = backupLink.text;
      } else if (backupLink.type === 'Link') {
        link = new Link(nodes[backupLink.nodeA], nodes[backupLink.nodeB]);
        link.parallelPart = backupLink.parallelPart;
        link.perpendicularPart = backupLink.perpendicularPart;
        link.text = backupLink.text;
        link.lineAngleAdjust = backupLink.lineAngleAdjust;
      }
      if (link) links.push(link);
    });
  } catch (e) {
    localStorage.fsm = '';
  }
}

function saveBackup() {
  if (!localStorage || !JSON) return;

  const backup = {
    nodes: nodes.map(node => ({
      x: node.x,
      y: node.y,
      text: node.text,
      isAcceptState: node.isAcceptState,
    })),
    links: links.map(link => {
      if (link instanceof SelfLink) {
        return {
          type: 'SelfLink',
          node: nodes.indexOf(link.node),
          text: link.text,
          anchorAngle: link.anchorAngle,
        };
      } else if (link instanceof StartLink) {
        return {
          type: 'StartLink',
          node: nodes.indexOf(link.node),
          text: link.text,
          deltaX: link.deltaX,
          deltaY: link.deltaY,
        };
      } else if (link instanceof Link) {
        return {
          type: 'Link',
          nodeA: nodes.indexOf(link.nodeA),
          nodeB: nodes.indexOf(link.nodeB),
          text: link.text,
          lineAngleAdjust: link.lineAngleAdjust,
          parallelPart: link.parallelPart,
          perpendicularPart: link.perpendicularPart,
        };
      }
      return null;
    }).filter(link => link !== null),
  };

  localStorage.fsm = JSON.stringify(backup);
}
