
const STORAGE_KEY = "nursesim-eg-save-v1";

function readSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function loadProgress() {
  return readSave();
}

export function saveProgress(update) {
  const previous = readSave();
  const next = {
    ...previous,
    ...update,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
