export const pointsToSvgPath = (points, imagePosition) => {
  if (points.length < 3) return '';
  
  const relativePoints = points.map(point => ({
    x: point.x - imagePosition.x,
    y: point.y - imagePosition.y
  }));
  
  return `M${relativePoints[0].x},${relativePoints[0].y}` +
    relativePoints.slice(1).map(p => `L${p.x},${p.y}`).join('') +
    'Z';
};

export const scaleSvgPath = (pathData, scaleX, scaleY) => {
  if (!pathData) return null;
  
  const pathParts = pathData.match(/([MLHVCSQTAZ])([^MLHVCSQTAZ]*)/g) || [];
  
  return pathParts.map(part => {
    const command = part.charAt(0);
    const params = part.substring(1).trim();
    
    switch (command) {
      case 'M':
      case 'L':
        return command + scaleCoordinatePairs(params, scaleX, scaleY);
      case 'H':
        return command + scaleValues(params, scaleX);
      case 'V':
        return command + scaleValues(params, scaleY);
      case 'Z':
        return command;
      default:
        return part;
    }
  }).join('');
};

const scaleCoordinatePairs = (paramsStr, scaleX, scaleY) => {
  const pairs = paramsStr.trim().split(/[\s,]+/);
  const result = [];
  
  for (let i = 0; i < pairs.length; i += 2) {
    if (i + 1 < pairs.length) {
      const x = parseFloat(pairs[i]) * scaleX;
      const y = parseFloat(pairs[i + 1]) * scaleY;
      result.push(`${x},${y}`);
    }
  }
  
  return result.join(' ');
};

const scaleValues = (paramsStr, scale) => {
  const values = paramsStr.trim().split(/[\s,]+/);
  return values.map(val => parseFloat(val) * scale).join(' ');
};
