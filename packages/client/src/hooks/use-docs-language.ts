// ──────────────────────────────────────────────
// React Query: Documentation language (docs/i18n/<code> trees)
// ──────────────────────────────────────────────
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api-client";

/**
 * Root of every docs query key (mirrors docsKeys.all in use-docs.ts, duplicated
 * here to avoid an import cycle: use-docs reads the active language from this file).
 */
const DOCS_QUERY_ROOT = ["docs"] as const;

export interface DocLanguageInfo {
  code: string;
  /** Native name shown in pickers (e.g. "Español") */
  label: string;
  englishLabel: string;
  /** Whether this language's pack is downloaded ("en" is built-in, always true) */
  installed: boolean;
  /** English doc paths covered by this language's installed pack */
  translated: number;
  total: number;
}

export interface DocsPackInstallProgress {
  language: string;
  phase: "manifest" | "downloading" | "finalizing";
  filesDone: number;
  filesTotal: number;
}

export interface DocsLanguageStatus {
  /** Language the server is serving right now */
  active: string;
  /** True once the user has explicitly stored a choice (even a broken one) */
  configured: boolean;
  available: DocLanguageInfo[];
  /** Progress of an in-flight pack download, or null */
  install: DocsPackInstallProgress | null;
  integrity: {
    ok: boolean;
    unknownLanguage: boolean;
    activeRootMissing: boolean;
    packIncomplete: boolean;
    leftovers: boolean;
  };
}

export interface DocsLanguageFixResult extends DocsLanguageStatus {
  repaired: boolean;
  actions: string[];
}

export const docsLanguageKeys = {
  status: () => [...DOCS_QUERY_ROOT, "language"] as const,
};

export function useDocsLanguage(enabled = true) {
  return useQuery({
    queryKey: docsLanguageKeys.status(),
    queryFn: () => api.get<DocsLanguageStatus>("/docs/language"),
    enabled,
    staleTime: 30_000,
    // While a pack download is running server-side, poll for filesDone/filesTotal
    // so the Settings row and onboarding can show live progress.
    refetchInterval: (query) => (query.state.data?.install ? 1_000 : false),
  });
}

/** Switching invalidates every docs query so the viewer refetches in the new language. */
export function useSetDocsLanguage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (language: string) => api.put<DocsLanguageStatus>("/docs/language", { language }),
    onSuccess: (status) => {
      qc.setQueryData(docsLanguageKeys.status(), status);
      void qc.invalidateQueries({ queryKey: DOCS_QUERY_ROOT });
    },
  });
}

/** Failsafe: resets a dangling/corrupt stored language back to English on the server. */
export function useFixDocsLanguage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<DocsLanguageFixResult>("/docs/language/fix", {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: DOCS_QUERY_ROOT });
    },
  });
}
