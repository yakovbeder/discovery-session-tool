import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  checklist,
  DEFAULT_TITLE,
  DEFAULT_SUBTITLE,
  type StoredData,
  type Section,
  type Question,
} from '../data/checklist';

const STORAGE_KEY = 'discoverySessionData';
const DEBOUNCE_MS = 500;

interface LoadedState {
  documentTitle: string;
  documentSubtitle: string;
  generatorSections: Section[] | null;
  responses: Record<string, string>;
  customSections: Section[];
  customQuestions: Record<string, Question[]>;
  skippedSections: Set<string>;
}

function loadFromStorage(): LoadedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return {
        documentTitle: DEFAULT_TITLE,
        documentSubtitle: DEFAULT_SUBTITLE,
        generatorSections: null,
        responses: {},
        customSections: [],
        customQuestions: {},
        skippedSections: new Set(),
      };
    const data: StoredData = JSON.parse(raw);
    const responses: Record<string, string> = {};
    if (data.sections) {
      for (const [key, val] of Object.entries(data.sections)) {
        if (val?.response) responses[key] = val.response;
      }
    }
    return {
      documentTitle: data.documentTitle || DEFAULT_TITLE,
      documentSubtitle: data.documentSubtitle || DEFAULT_SUBTITLE,
      generatorSections: data.generatorSections || null,
      responses,
      customSections: data.customSections || [],
      customQuestions: data.customQuestions || {},
      skippedSections: new Set(data.skippedSections || []),
    };
  } catch {
    return {
      documentTitle: DEFAULT_TITLE,
      documentSubtitle: DEFAULT_SUBTITLE,
      generatorSections: null,
      responses: {},
      customSections: [],
      customQuestions: {},
      skippedSections: new Set(),
    };
  }
}

function toStoredFormat(
  documentTitle: string,
  documentSubtitle: string,
  generatorSections: Section[] | null,
  responses: Record<string, string>,
  customSections: Section[],
  customQuestions: Record<string, Question[]>,
  skippedSections: Set<string>,
): StoredData {
  const sections: Record<string, Record<string, string>> = {};
  for (const [key, value] of Object.entries(responses)) {
    sections[key] = { response: value };
  }
  return {
    timestamp: new Date().toISOString(),
    version: '2.0',
    documentTitle:
      documentTitle !== DEFAULT_TITLE ? documentTitle : undefined,
    documentSubtitle:
      documentSubtitle !== DEFAULT_SUBTITLE ? documentSubtitle : undefined,
    generatorSections: generatorSections || undefined,
    sections,
    customSections: customSections.length > 0 ? customSections : undefined,
    customQuestions:
      Object.keys(customQuestions).length > 0 ? customQuestions : undefined,
    skippedSections:
      skippedSections.size > 0 ? [...skippedSections] : undefined,
  };
}

export function useChecklistState() {
  const initial = useRef(loadFromStorage());
  const [documentTitle, setDocumentTitle] = useState(
    initial.current.documentTitle,
  );
  const [documentSubtitle, setDocumentSubtitle] = useState(
    initial.current.documentSubtitle,
  );
  const [generatorSections, setGeneratorSections] = useState<Section[] | null>(
    initial.current.generatorSections,
  );
  const [responses, setResponses] = useState<Record<string, string>>(
    initial.current.responses,
  );
  const [customSections, setCustomSections] = useState<Section[]>(
    initial.current.customSections,
  );
  const [customQuestions, setCustomQuestions] = useState<
    Record<string, Question[]>
  >(initial.current.customQuestions);
  const [skippedSections, setSkippedSections] = useState<Set<string>>(
    initial.current.skippedSections,
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseSections = generatorSections ?? checklist;

  const allSections = useMemo<Section[]>(() => {
    const merged = baseSections.map((s) => ({
      ...s,
      questions: [...s.questions, ...(customQuestions[s.id] || [])],
    }));
    const custom = customSections.map((s) => ({
      ...s,
      questions: [...s.questions, ...(customQuestions[s.id] || [])],
    }));
    return [...merged, ...custom];
  }, [baseSections, customSections, customQuestions]);

  const saveToStorage = useCallback(
    (
      dt: string,
      ds: string,
      gs: Section[] | null,
      r: Record<string, string>,
      cs: Section[],
      cq: Record<string, Question[]>,
      ss: Set<string>,
    ) => {
      const stored = toStoredFormat(dt, ds, gs, r, cs, cq, ss);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    },
    [],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveToStorage(
        documentTitle,
        documentSubtitle,
        generatorSections,
        responses,
        customSections,
        customQuestions,
        skippedSections,
      );
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    documentTitle,
    documentSubtitle,
    generatorSections,
    responses,
    customSections,
    customQuestions,
    skippedSections,
    saveToStorage,
  ]);

  const updateResponse = useCallback((key: string, value: string) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  }, []);

  const progress = useMemo(() => {
    const activeSections = allSections.filter(
      (s) => !skippedSections.has(s.id),
    );
    const activeKeys = activeSections.flatMap((s) =>
      s.questions.map((q) => q.key),
    );
    const total = activeKeys.length;
    if (total === 0) return 0;
    const filled = activeKeys.filter(
      (k) => (responses[k] || '').trim() !== '',
    ).length;
    return Math.round((filled / total) * 100);
  }, [allSections, skippedSections, responses]);

  const sectionProgress = useCallback(
    (section: Section) => {
      const total = section.questions.length;
      if (total === 0) return { answered: 0, total: 0 };
      const answered = section.questions.filter(
        (q) => (responses[q.key] || '').trim() !== '',
      ).length;
      return { answered, total };
    },
    [responses],
  );

  const collectData = useCallback(
    (): StoredData =>
      toStoredFormat(
        documentTitle,
        documentSubtitle,
        generatorSections,
        responses,
        customSections,
        customQuestions,
        skippedSections,
      ),
    [
      documentTitle,
      documentSubtitle,
      generatorSections,
      responses,
      customSections,
      customQuestions,
      skippedSections,
    ],
  );

  const importData = useCallback((data: StoredData) => {
    if (!data?.sections) return;
    const newResponses: Record<string, string> = {};
    for (const [key, val] of Object.entries(data.sections)) {
      if (val?.response) newResponses[key] = val.response;
    }
    setDocumentTitle(data.documentTitle || DEFAULT_TITLE);
    setDocumentSubtitle(data.documentSubtitle || DEFAULT_SUBTITLE);
    setGeneratorSections(data.generatorSections || null);
    setResponses(newResponses);
    setCustomSections(data.customSections || []);
    setCustomQuestions(data.customQuestions || {});
    setSkippedSections(new Set(data.skippedSections || []));
  }, []);

  const clearAll = useCallback(() => {
    setResponses({});
    setCustomSections([]);
    setCustomQuestions({});
    setSkippedSections(new Set());
  }, []);

  const saveNow = useCallback(() => {
    saveToStorage(
      documentTitle,
      documentSubtitle,
      generatorSections,
      responses,
      customSections,
      customQuestions,
      skippedSections,
    );
  }, [
    documentTitle,
    documentSubtitle,
    generatorSections,
    responses,
    customSections,
    customQuestions,
    skippedSections,
    saveToStorage,
  ]);

  const toggleSkipSection = useCallback((sectionId: string) => {
    setSkippedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const addSection = useCallback((title: string) => {
    const id = `custom-s-${Date.now()}`;
    setCustomSections((prev) => [
      ...prev,
      { id, title, questions: [], isCustom: true },
    ]);
    return id;
  }, []);

  const deleteSection = useCallback((sectionId: string) => {
    setCustomSections((prev) => prev.filter((s) => s.id !== sectionId));
    setCustomQuestions((prev) => {
      const next = { ...prev };
      delete next[sectionId];
      return next;
    });
    setResponses((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key.startsWith('custom-q-')) {
          delete next[key];
        }
      }
      return next;
    });
  }, []);

  const addQuestion = useCallback(
    (sectionId: string, topicLabel: string, questionText: string) => {
      const key = `custom-q-${Date.now()}`;
      const newQ: Question = {
        key,
        topic: topicLabel || 'Custom',
        question: questionText,
        isCustom: true,
      };
      setCustomQuestions((prev) => ({
        ...prev,
        [sectionId]: [...(prev[sectionId] || []), newQ],
      }));
      return key;
    },
    [],
  );

  const deleteQuestion = useCallback(
    (sectionId: string, questionKey: string) => {
      setCustomQuestions((prev) => ({
        ...prev,
        [sectionId]: (prev[sectionId] || []).filter(
          (q) => q.key !== questionKey,
        ),
      }));
      setResponses((prev) => {
        const next = { ...prev };
        delete next[questionKey];
        return next;
      });
    },
    [],
  );

  // --- Generator: replace the entire base checklist ---
  const applyGeneratorSections = useCallback((sections: Section[]) => {
    setGeneratorSections(sections);
    setCustomSections([]);
    setCustomQuestions({});
    setResponses({});
    setSkippedSections(new Set());
  }, []);

  const resetToTemplate = useCallback(() => {
    setDocumentTitle(DEFAULT_TITLE);
    setDocumentSubtitle(DEFAULT_SUBTITLE);
    setGeneratorSections(null);
    setCustomSections([]);
    setCustomQuestions({});
    setResponses({});
    setSkippedSections(new Set());
  }, []);

  const isUsingCustomChecklist = generatorSections !== null;

  return {
    documentTitle,
    documentSubtitle,
    setDocumentTitle,
    setDocumentSubtitle,
    responses,
    allSections,
    skippedSections,
    updateResponse,
    progress,
    sectionProgress,
    collectData,
    importData,
    clearAll,
    saveNow,
    addSection,
    deleteSection,
    addQuestion,
    deleteQuestion,
    toggleSkipSection,
    applyGeneratorSections,
    resetToTemplate,
    isUsingCustomChecklist,
  };
}
