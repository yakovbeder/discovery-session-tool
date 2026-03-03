import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Page,
  PageSection,
  PageSectionVariants,
  Alert,
  AlertGroup,
  AlertVariant,
  AlertActionCloseButton,
  Modal,
  ModalVariant,
  Button,
  TextInput,
  Form,
  FormGroup,
  TextArea,
  Masthead,
  MastheadMain,
  MastheadBrand,
  Brand,
} from '@patternfly/react-core';
import type { StoredData } from './data/checklist';
import { useChecklistState } from './hooks/useChecklistState';
import { downloadJSON, printPDF } from './utils/export';
import ProgressHeader from './components/ProgressHeader';
import ChecklistToolbar from './components/ChecklistToolbar';
import ChecklistView from './components/ChecklistView';

import redhatLogo from '/redhat-logo.svg';

interface ToastAlert {
  key: number;
  title: string;
  variant: AlertVariant;
}

let alertId = 0;

export default function App() {
  const {
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
  } = useChecklistState();

  const [alerts, setAlerts] = useState<ToastAlert[]>([]);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Section modal state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Add Question modal state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionTargetSection, setQuestionTargetSection] = useState('');
  const [newQuestionTopic, setNewQuestionTopic] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');

  const showToast = useCallback(
    (title: string, variant: AlertVariant = AlertVariant.info) => {
      const key = alertId++;
      setAlerts((prev) => [...prev, { key, title, variant }]);
    },
    [],
  );

  const removeAlert = useCallback((key: number) => {
    setAlerts((prev) => prev.filter((a) => a.key !== key));
  }, []);

  // --- Action handlers ---

  const handleSave = useCallback(() => {
    saveNow();
    showToast('Data saved successfully!', AlertVariant.success);
  }, [saveNow, showToast]);

  const handleLoad = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data: StoredData = JSON.parse(ev.target?.result as string);
          importData(data);
          showToast('Data loaded successfully!', AlertVariant.success);
        } catch {
          showToast(
            'Error loading file. Please check the file format.',
            AlertVariant.danger,
          );
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [importData, showToast],
  );

  const handleExportJSON = useCallback(() => {
    downloadJSON(collectData());
    showToast('Data exported to JSON successfully!', AlertVariant.success);
  }, [collectData, showToast]);

  const handleExportPDF = useCallback(() => {
    printPDF(collectData());
    showToast('PDF export initiated!', AlertVariant.info);
  }, [collectData, showToast]);

  const handleClearAll = useCallback(() => {
    clearAll();
    setIsClearModalOpen(false);
    showToast('All data cleared successfully!', AlertVariant.success);
  }, [clearAll, showToast]);

  // --- Add Section ---

  const openAddSection = useCallback(() => {
    setNewSectionTitle('');
    setIsSectionModalOpen(true);
  }, []);

  const handleAddSection = useCallback(() => {
    if (!newSectionTitle.trim()) return;
    addSection(newSectionTitle.trim());
    setIsSectionModalOpen(false);
    showToast('Section added!', AlertVariant.success);
  }, [newSectionTitle, addSection, showToast]);

  // --- Add Question ---

  const openAddQuestion = useCallback((sectionId: string) => {
    setQuestionTargetSection(sectionId);
    setNewQuestionTopic('');
    setNewQuestionText('');
    setIsQuestionModalOpen(true);
  }, []);

  const handleAddQuestion = useCallback(() => {
    if (!newQuestionText.trim()) return;
    addQuestion(
      questionTargetSection,
      newQuestionTopic.trim(),
      newQuestionText.trim(),
    );
    setIsQuestionModalOpen(false);
    showToast('Question added!', AlertVariant.success);
  }, [questionTargetSection, newQuestionTopic, newQuestionText, addQuestion, showToast]);

  // --- Keyboard shortcuts ---

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      switch (e.key) {
        case 's':
          e.preventDefault();
          handleSave();
          break;
        case 'o':
          e.preventDefault();
          handleLoad();
          break;
        case 'p':
          e.preventDefault();
          handleExportPDF();
          break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleSave, handleLoad, handleExportPDF]);

  // --- Render ---

  const header = (
    <Masthead>
      <MastheadMain>
        <MastheadBrand>
          <Brand
            src={redhatLogo}
            alt="Red Hat"
            heights={{ default: '36px' }}
          />
        </MastheadBrand>
      </MastheadMain>
    </Masthead>
  );

  return (
    <Page header={header}>
      <PageSection
        variant={PageSectionVariants.light}
        className="sticky-progress"
      >
        <ProgressHeader progress={progress} />
      </PageSection>

      <PageSection variant={PageSectionVariants.light}>
        <ChecklistToolbar
          onSave={handleSave}
          onLoad={handleLoad}
          onExportPDF={handleExportPDF}
          onExportJSON={handleExportJSON}
          onClear={() => setIsClearModalOpen(true)}
        />
      </PageSection>

      <PageSection isFilled>
        <ChecklistView
          allSections={allSections}
          responses={responses}
          skippedSections={skippedSections}
          onUpdateResponse={updateResponse}
          sectionProgress={sectionProgress}
          onAddQuestion={openAddQuestion}
          onAddSection={openAddSection}
          onDeleteQuestion={deleteQuestion}
          onDeleteSection={deleteSection}
          onToggleSkip={toggleSkipSection}
        />
      </PageSection>

      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-label="Load JSON file"
      />

      {/* Toast notifications */}
      <AlertGroup isToast isLiveRegion>
        {alerts.map((a) => (
          <Alert
            key={a.key}
            variant={a.variant}
            title={a.title}
            timeout={3000}
            onTimeout={() => removeAlert(a.key)}
            actionClose={
              <AlertActionCloseButton onClose={() => removeAlert(a.key)} />
            }
          />
        ))}
      </AlertGroup>

      {/* Clear All confirmation modal */}
      <Modal
        variant={ModalVariant.small}
        title="Clear All Data"
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        aria-label="Confirm clear all data"
        actions={[
          <Button key="confirm" variant="danger" onClick={handleClearAll}>
            Clear All
          </Button>,
          <Button
            key="cancel"
            variant="link"
            onClick={() => setIsClearModalOpen(false)}
          >
            Cancel
          </Button>,
        ]}
      >
        Are you sure you want to clear all data? This action cannot be undone.
      </Modal>

      {/* Add Section modal */}
      <Modal
        variant={ModalVariant.small}
        title="Add Section"
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        aria-label="Add a new section"
        actions={[
          <Button
            key="add"
            variant="primary"
            onClick={handleAddSection}
            isDisabled={!newSectionTitle.trim()}
          >
            Add Section
          </Button>,
          <Button
            key="cancel"
            variant="link"
            onClick={() => setIsSectionModalOpen(false)}
          >
            Cancel
          </Button>,
        ]}
      >
        <Form>
          <FormGroup label="Section title" isRequired fieldId="section-title">
            <TextInput
              id="section-title"
              value={newSectionTitle}
              onChange={(_e, val) => setNewSectionTitle(val)}
              placeholder="e.g., 11.0 Disaster Recovery"
              autoFocus
            />
          </FormGroup>
        </Form>
      </Modal>

      {/* Add Question modal */}
      <Modal
        variant={ModalVariant.small}
        title="Add Question"
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        aria-label="Add a new question"
        actions={[
          <Button
            key="add"
            variant="primary"
            onClick={handleAddQuestion}
            isDisabled={!newQuestionText.trim()}
          >
            Add Question
          </Button>,
          <Button
            key="cancel"
            variant="link"
            onClick={() => setIsQuestionModalOpen(false)}
          >
            Cancel
          </Button>,
        ]}
      >
        <Form>
          <FormGroup label="Topic label" fieldId="question-topic">
            <TextInput
              id="question-topic"
              value={newQuestionTopic}
              onChange={(_e, val) => setNewQuestionTopic(val)}
              placeholder='e.g., "11.1 DR Strategy" (optional)'
            />
          </FormGroup>
          <FormGroup
            label="Question"
            isRequired
            fieldId="question-text"
          >
            <TextArea
              id="question-text"
              value={newQuestionText}
              onChange={(_e, val) => setNewQuestionText(val)}
              placeholder="Enter the question..."
              autoResize
              rows={3}
              autoFocus
            />
          </FormGroup>
        </Form>
      </Modal>
    </Page>
  );
}
