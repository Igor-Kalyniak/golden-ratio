'use client';

import { isValidDimension } from '../lib/calculations';
import { ROOM_NAME, type Room } from '../lib/app-state';
import { useI18n } from '../lib/i18n-context';
import { DIMENSION_HINT, InlineError, NumberField } from './fields';

interface RoomListProps {
  rooms: Room[];
  onAddRoom: () => void;
  onRemoveRoom: (id: string) => void;
  onRoomChange: (id: string, patch: Partial<Pick<Room, 'name' | 'length' | 'width'>>) => void;
}

/** A room name is valid when its trimmed length is within ROOM_NAME bounds (FR-ROOM-03). */
function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= ROOM_NAME.min && trimmed.length <= ROOM_NAME.max;
}

/**
 * The room list (DESIGN §5.3): a header row with an "Add room" button over one panel card
 * per room. Each card carries an editable name plus length/width fields with inline
 * validation matching the apartment fields (FR-ROOM-04 ≡ FR-APT-04). Reactive — no submit
 * button; every edit recomputes synchronously. Fills the rooms slot in `Shell` (change 6).
 */
export function RoomList({ rooms, onAddRoom, onRemoveRoom, onRoomChange }: RoomListProps) {
  const { t } = useI18n();
  const lastRoom = rooms.length === 1;

  return (
    <div className="space-y-3 rounded-xl border border-line bg-panel p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {t('rooms')} <span className="font-mono text-xs text-muted">{rooms.length}</span>
        </h3>
        <button
          type="button"
          onClick={onAddRoom}
          className="rounded-md border border-accent-line bg-accent-bg px-2.5 py-1 text-xs font-medium text-accent"
        >
          + {t('addRoom')}
        </button>
      </div>

      <ul className="space-y-3">
        {rooms.map((room, index) => (
          <li
            key={room.id}
            className="space-y-2.5 rounded-lg border border-line2 bg-field/40 p-3"
          >
            <div className="flex items-center justify-between">
              <span
                aria-hidden="true"
                className="rounded bg-panel2 px-1.5 py-0.5 font-mono text-[11px] text-muted"
              >
                R{index + 1}
              </span>
              <button
                type="button"
                onClick={() => onRemoveRoom(room.id)}
                disabled={lastRoom}
                aria-disabled={lastRoom}
                aria-label={t('removeRoom')}
                className="rounded-md border border-line2 px-2 py-1 text-sm text-muted disabled:cursor-not-allowed disabled:opacity-30"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <TextField
              id={`${room.id}-name`}
              label={t('roomName')}
              value={room.name}
              invalid={!isValidName(room.name)}
              errorText={t('errName')}
              onChange={(name) => onRoomChange(room.id, { name })}
            />

            <div className="grid grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-2.5">
              <NumberField
                id={`${room.id}-length`}
                label={t('length')}
                hint={DIMENSION_HINT}
                value={room.length}
                invalid={!isValidDimension(room.length)}
                errorText={t('errDim')}
                onChange={(length) => onRoomChange(room.id, { length })}
                size="sm"
              />
              <NumberField
                id={`${room.id}-width`}
                label={t('width')}
                hint={DIMENSION_HINT}
                value={room.width}
                invalid={!isValidDimension(room.width)}
                errorText={t('errDim')}
                onChange={(width) => onRoomChange(room.id, { width })}
                size="sm"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  invalid,
  errorText,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  invalid: boolean;
  errorText: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="mb-1 block text-xs text-fg2">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
        className={`w-full rounded-md border bg-field px-2.5 py-1.5 text-sm text-fg ${
          invalid ? 'border-err' : 'border-line2'
        }`}
      />
      {invalid && <InlineError id={errorId} text={errorText} />}
    </div>
  );
}
