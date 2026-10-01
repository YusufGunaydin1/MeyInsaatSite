export type InteriorImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export type InteriorStyle = InteriorImage & {
  id: string;
  label: string;
  description: string;
};

export type InteriorRoom = {
  id: string;
  title: string;
  description: string;
  original: InteriorImage;
  styles: InteriorStyle[];
};

export type InteriorProps = { rooms: InteriorRoom[] };

export const AI_NOTICE = 'Yapay zekâ ile hazırlanmış dekorasyon önerisi';
