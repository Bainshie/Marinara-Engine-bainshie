import { useCallback, useRef } from "react";
import { useUpdatePersona } from "../../../hooks/use-characters";

export interface PersonaPortraitSaveSnapshot {
  id: string;
  portraitFocusX: number;
  portraitFocusY: number;
  portraitZoom: number;
}

interface PendingPersonaPortraitSave {
  snapshot: PersonaPortraitSaveSnapshot;
  version: number;
}

export function usePersonaPortraitSaveCoordinator() {
  const { mutateAsync } = useUpdatePersona();
  const mutateAsyncRef = useRef(mutateAsync);
  const pendingSaveByPersonaIdRef = useRef(new Map<string, PendingPersonaPortraitSave>());
  const latestSaveVersionByPersonaIdRef = useRef(new Map<string, number>());
  const nextSaveVersionRef = useRef(0);
  const flushQueueRef = useRef<PendingPersonaPortraitSave[]>([]);
  const drainingRef = useRef(false);

  mutateAsyncRef.current = mutateAsync;

  const drainPersonaPortraitSaves = useCallback(async () => {
    if (drainingRef.current) return;
    drainingRef.current = true;

    try {
      let save: PendingPersonaPortraitSave | undefined;
      while ((save = flushQueueRef.current.shift())) {
        const personaId = save.snapshot.id;
        if (latestSaveVersionByPersonaIdRef.current.get(personaId) !== save.version) continue;

        try {
          await mutateAsyncRef.current({
            id: personaId,
            keepalive: true,
            trackerCardPortrait: {
              portraitFocusX: save.snapshot.portraitFocusX,
              portraitFocusY: save.snapshot.portraitFocusY,
              portraitZoom: save.snapshot.portraitZoom,
            },
          });
        } catch {
          if (
            !pendingSaveByPersonaIdRef.current.has(personaId) &&
            latestSaveVersionByPersonaIdRef.current.get(personaId) === save.version
          ) {
            pendingSaveByPersonaIdRef.current.set(personaId, save);
          }
        }
      }
    } finally {
      drainingRef.current = false;
    }
  }, []);

  const queuePersonaPortraitSave = useCallback((snapshot: PersonaPortraitSaveSnapshot) => {
    const version = ++nextSaveVersionRef.current;
    latestSaveVersionByPersonaIdRef.current.set(snapshot.id, version);
    pendingSaveByPersonaIdRef.current.set(snapshot.id, { snapshot, version });
  }, []);

  const flushPersonaPortraitSave = useCallback((personaId: string) => {
    const pendingSave = pendingSaveByPersonaIdRef.current.get(personaId);
    if (!pendingSave) return;
    pendingSaveByPersonaIdRef.current.delete(personaId);
    flushQueueRef.current.push(pendingSave);
    void drainPersonaPortraitSaves();
  }, [drainPersonaPortraitSaves]);

  return { queuePersonaPortraitSave, flushPersonaPortraitSave };
}
