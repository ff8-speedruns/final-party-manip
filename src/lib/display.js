import { CHARACTERS } from './manip';

// Shared between App (checkbox/select labels) and the results list (party
// composition text), so capitalization stays consistent in one place.
export const CHARACTER_LABELS = Object.fromEntries(CHARACTERS.map((name) => [name, name[0].toUpperCase() + name.slice(1)]));

export const toDisplayParty = (party) => party.map((name) => CHARACTER_LABELS[name]).join('\n');
