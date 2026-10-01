import { useEffect, useState } from 'react';
import type { InteriorRoom } from './types';

export function useInteriorSelection(rooms: InteriorRoom[]) {
  const [roomId, setRoomId] = useState(rooms[0].id);
  const [styleId, setStyleId] = useState(rooms[0].styles[0].id);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const room = rooms.find((item) => item.id === roomId) ?? rooms[0];
  const style = room.styles.find((item) => item.id === styleId) ?? room.styles[0];
  return { room, style, ready, setRoomId, setStyleId };
}

type Props = {
  rooms: InteriorRoom[];
  room: InteriorRoom;
  styleId: string;
  ready: boolean;
  onRoom: (id: string) => void;
  onStyle: (id: string) => void;
  prefix: string;
};

export default function RoomControls({ rooms, room, styleId, ready, onRoom, onStyle, prefix }: Props) {
  return (
    <div className="il-selectors">
      <label className="il-field" htmlFor={`${prefix}-room`}>
        <span className="t-tech">Mekân</span>
        <select id={`${prefix}-room`} data-testid={`${prefix}-room`} value={room.id}
          disabled={!ready} onChange={(event) => onRoom(event.target.value)}>
          {rooms.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      </label>
      <label className="il-field" htmlFor={`${prefix}-style`}>
        <span className="t-tech">Dekorasyon</span>
        <select id={`${prefix}-style`} data-testid={`${prefix}-style`} value={styleId}
          disabled={!ready} onChange={(event) => onStyle(event.target.value)}>
          {room.styles.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
    </div>
  );
}
