// Packing & Box Optimizer
// Optimize box selection and packing arrangements to minimize shipping volume and material waste.

const BOX_CATALOG = [
  { id: 'xs', name: 'Extra Small', length: 8, width: 6, height: 4, weight: 0.5 },
  { id: 'sm', name: 'Small', length: 12, width: 8, height: 6, weight: 1.0 },
  { id: 'md', name: 'Medium', length: 16, width: 12, height: 8, weight: 1.5 },
  { id: 'lg', name: 'Large', length: 20, width: 16, height: 12, weight: 2.0 },
  { id: 'xl', name: 'Extra Large', length: 24, width: 18, height: 16, weight: 2.5 },
];

function selectBox(item, catalog = BOX_CATALOG) {
  const { length, width, height } = item;
  const sorted = [...catalog].sort((a, b) => {
    const aFit = a.length >= length && a.width >= width && a.height >= height;
    const bFit = b.length >= length && b.width >= width && b.height >= height;
    if (aFit && !bFit) return -1;
    if (!aFit && bFit) return 1;
    const aVol = a.length * a.width * a.height;
    const bVol = b.length * b.width * b.height;
    return aVol - bVol;
  });
  const best = sorted.find(b => b.length >= length && b.width >= width && b.height >= height);
  if (!best) return { error: 'No suitable box found', item };
  const boxVol = best.length * best.width * best.height;
  const itemVol = length * width * height;
  return {
    box: best,
    utilization: +((itemVol / boxVol) * 100).toFixed(1),
    wastedSpace: +(boxVol - itemVol).toFixed(1),
  };
}

function packItems(items, catalog = BOX_CATALOG) {
  const sorted = [...items].sort((a, b) => {
    const aVol = (a.length || 0) * (a.width || 0) * (a.height || 0);
    const bVol = (b.length || 0) * (b.width || 0) * (b.height || 0);
    return bVol - aVol;
  });
  const boxes = [];
  for (const item of sorted) {
    const result = selectBox(item, catalog);
    if (result.error) continue;
    const existing = boxes.find(b =>
      b.box.id === result.box.id && b.items.length < 10
    );
    if (existing) {
      existing.items.push(item);
      existing.totalWeight += item.weight || 0;
    } else {
      boxes.push({ box: result.box, items: [item], totalWeight: item.weight || 0 });
    }
  }
  return boxes.map(b => ({
    box: b.box,
    items: b.items.length,
    totalWeight: +b.totalWeight.toFixed(2),
    utilization: +((b.items.reduce((s, i) => s + (i.length || 0) * (i.width || 0) * (i.height || 0), 0) /
      (b.box.length * b.box.width * b.box.height)) * 100).toFixed(1),
  }));
}

function calculateShippingVolume(box) {
  const dimensionalWeight = (box.length * box.width * box.height) / 139;
  const billableWeight = Math.max(box.weight || 0, dimensionalWeight);
  return {
    volume: +(box.length * box.width * box.height).toFixed(1),
    dimensionalWeight: +dimensionalWeight.toFixed(2),
    billableWeight: +billableWeight.toFixed(2),
  };
}

module.exports = { selectBox, packItems, calculateShippingVolume, BOX_CATALOG };
