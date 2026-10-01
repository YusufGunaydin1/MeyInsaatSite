export type Vertex = [number, number, number];
export type Face = { vertices: Vertex[]; shade: 'top' | 'front' | 'side'; glass?: boolean };

export function project(vertices: Vertex[], angle = 0): string {
  const radians = angle * Math.PI / 180;
  return vertices.map(([x, y, z]) => {
    const rotatedX = x * Math.cos(radians) - y * Math.sin(radians);
    const rotatedY = x * Math.sin(radians) + y * Math.cos(radians);
    return `${360 + (rotatedX - rotatedY) * 1.3},${575 + (rotatedX + rotatedY) * 0.55 - z}`;
  }).join(' ');
}

export function box(x: number, y: number, z: number, width: number, depth: number, height: number): Face[] {
  return [
    { shade: 'side', vertices: [[x + width, y, z], [x + width, y + depth, z], [x + width, y + depth, z + height], [x + width, y, z + height]] },
    { shade: 'front', vertices: [[x, y + depth, z], [x + width, y + depth, z], [x + width, y + depth, z + height], [x, y + depth, z + height]] },
    { shade: 'top', vertices: [[x, y, z + height], [x + width, y, z + height], [x + width, y + depth, z + height], [x, y + depth, z + height]] },
  ];
}

export const layerInfo = {
  all: { name: 'Yapıyı bir bütün olarak okuyun.', text: 'Beş katmanı ayırın; temel, taşıyıcı sistem, döşemeler, cephe ve çatının bir araya gelişini inceleyin.' },
  foundation: { name: '01 / Temel', text: 'Yapının zemine oturduğu alt katman. Bu şemada temel, diğer bileşenlerin yerini okumak için sabit kalır.' },
  frame: { name: '02 / Taşıyıcı sistem', text: 'Kolon ve kirişler, katların taşıyıcı iskeletini oluşturur. Ayrıştırma, bu yapıyı cepheden bağımsız görmenizi sağlar.' },
  slabs: { name: '03 / Döşemeler', text: 'Yatay katmanlar, yapıyı katlara ayırır. Aralarındaki açıklık, mekânların üst üste nasıl yerleştiğini gösterir.' },
  facade: { name: '04 / Cephe', text: 'Dış kabuk, pencere açıklıkları ve kat çizgileri birlikte okunur. Renkler malzeme veya ürün taahhüdü değildir.' },
  roof: { name: '05 / Çatı', text: 'Üst örtü, kütleyi tamamlar. Şemadaki düz çatı yalnızca bu etkileşim örneğinin kavramsal geometrisidir.' },
};
export type LayerId = keyof typeof layerInfo;
