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
import type { StoredData, Section } from './data/checklist';
import { useChecklistState } from './hooks/useChecklistState';
import { downloadJSON, printPDF } from './utils/export';
import ProgressHeader from './components/ProgressHeader';
import ChecklistToolbar from './components/ChecklistToolbar';
import ChecklistView from './components/ChecklistView';
import ChecklistGenerator from './components/ChecklistGenerator';

import redhatLogo from '/redhat-logo.svg';

interface ToastAlert {
  key: number;
  title: string;
  variant: AlertVariant;
}

let alertId = 0;

export default function App() {
  const {
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
  } = useChecklistState();

  const [alerts, setAlerts] = useState<ToastAlert[]>([]);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

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
          setIsGeneratorOpen(false);
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
    setIsGeneratorOpen(false);
    showToast('All data cleared successfully!', AlertVariant.success);
  }, [clearAll, showToast]);

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
  }, [
    questionTargetSection,
    newQuestionTopic,
    newQuestionText,
    addQuestion,
    showToast,
  ]);

  const handleGeneratorApply = useCallback(
    (sections: Section[]) => {
      applyGeneratorSections(sections);
      setIsGeneratorOpen(false);
      showToast(
        'Custom checklist created! Start filling in your responses.',
        AlertVariant.success,
      );
    },
    [applyGeneratorSections, showToast],
  );

  const handleResetToTemplate = useCallback(() => {
    resetToTemplate();
    showToast('Reset to OpenShift template.', AlertVariant.info);
  }, [resetToTemplate, showToast]);

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
        <ProgressHeader
          progress={progress}
          title={documentTitle}
          subtitle={documentSubtitle}
          onTitleChange={setDocumentTitle}
          onSubtitleChange={setDocumentSubtitle}
        />
      </PageSection>

      <PageSection variant={PageSectionVariants.light}>
        <ChecklistToolbar
          onSave={handleSave}
          onLoad={handleLoad}
          onExportPDF={handleExportPDF}
          onExportJSON={handleExportJSON}
          onClear={() => setIsClearModalOpen(true)}
          onOpenGenerator={() => setIsGeneratorOpen(true)}
          onResetToTemplate={handleResetToTemplate}
          isUsingCustomChecklist={isUsingCustomChecklist}
          isGeneratorOpen={isGeneratorOpen}
        />
      </PageSection>

      <PageSection isFilled>
        {isGeneratorOpen ? (
          <ChecklistGenerator
            onApply={handleGeneratorApply}
            onCancel={() => setIsGeneratorOpen(false)}
          />
        ) : (
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
        )}
      </PageSection>

      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-label="Load JSON file"
      />

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
              placeholder="e.g., Disaster Recovery"
              autoFocus
            />
          </FormGroup>
        </Form>
      </Modal>

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
              placeholder='e.g., "DR Strategy" (optional)'
            />
          </FormGroup>
          <FormGroup label="Question" isRequired fieldId="question-text">
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
