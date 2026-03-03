import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardExpandableContent,
  TextArea,
  Stack,
  StackItem,
  Flex,
  FlexItem,
  Label,
  Button,
  Divider,
  Switch,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import {
  PlusCircleIcon,
  TrashIcon,
  ExpandIcon,
  CompressIcon,
  CheckCircleIcon,
} from '@patternfly/react-icons';
import {
  type Section,
  formatSectionTitle,
  formatQuestionNum,
} from '../data/checklist';

interface ChecklistViewProps {
  allSections: Section[];
  responses: Record<string, string>;
  skippedSections: Set<string>;
  onUpdateResponse: (key: string, value: string) => void;
  sectionProgress: (section: Section) => { answered: number; total: number };
  onAddQuestion: (sectionId: string) => void;
  onAddSection: () => void;
  onDeleteQuestion: (sectionId: string, questionKey: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onToggleSkip: (sectionId: string) => void;
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}

function progressLabel(answered: number, total: number) {
  if (total === 0) return <Label color="grey">0/0</Label>;
  if (answered === total)
    return (
      <Label color="green" icon={<CheckCircleIcon />}>
        {answered}/{total}
      </Label>
    );
  if (answered > 0)
    return (
      <Label color="blue">
        {answered}/{total}
      </Label>
    );
  return (
    <Label color="grey">
      {answered}/{total}
    </Label>
  );
}

export default function ChecklistView({
  allSections,
  responses,
  skippedSections,
  onUpdateResponse,
  sectionProgress,
  onAddQuestion,
  onAddSection,
  onDeleteQuestion,
  onDeleteSection,
  onToggleSkip,
}: ChecklistViewProps) {
  const isMobile = useIsMobile();

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    allSections.forEach((s) => {
      init[s.id] = true;
    });
    return init;
  });

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      allSections.forEach((s) => {
        if (!(s.id in next)) next[s.id] = true;
      });
      return next;
    });
  }, [allSections]);

  const toggle = useCallback(
    (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] })),
    [],
  );

  const expandAll = useCallback(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      allSections.forEach((s) => {
        next[s.id] = true;
      });
      return next;
    });
  }, [allSections]);

  const collapseAll = useCallback(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      allSections.forEach((s) => {
        next[s.id] = false;
      });
      return next;
    });
  }, [allSections]);

  return (
    <Stack hasGutter>
      <StackItem>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <Button
                variant="link"
                icon={<ExpandIcon />}
                onClick={expandAll}
              >
                Expand All
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <Button
                variant="link"
                icon={<CompressIcon />}
                onClick={collapseAll}
              >
                Collapse All
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </StackItem>

      {allSections.map((section, sectionIdx) => {
        const isSkipped = skippedSections.has(section.id);
        const { answered, total } = sectionProgress(section);
        const isExpanded = expanded[section.id] ?? true;
        const displayTitle = formatSectionTitle(sectionIdx, section.title);

        return (
          <StackItem key={section.id}>
            <Card
              isExpanded={isExpanded}
              className={isSkipped ? 'section-skipped' : undefined}
            >
              <CardHeader
                onExpand={() => toggle(section.id)}
                toggleButtonProps={{
                  id: `toggle-${section.id}`,
                  'aria-label': `Toggle ${displayTitle}`,
                }}
                actions={{
                  actions: (
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      gap={{ default: 'gapSm' }}
                    >
                      <FlexItem>
                        <Switch
                          id={`skip-${section.id}`}
                          label="Applicable"
                          labelOff="Skipped"
                          isChecked={!isSkipped}
                          onChange={() => onToggleSkip(section.id)}
                          isReversed
                        />
                      </FlexItem>
                      {section.isCustom && (
                        <FlexItem>
                          <Button
                            variant="plain"
                            aria-label={`Delete section ${displayTitle}`}
                            onClick={() => onDeleteSection(section.id)}
                          >
                            <TrashIcon />
                          </Button>
                        </FlexItem>
                      )}
                    </Flex>
                  ),
                  hasNoOffset: true,
                }}
              >
                <CardTitle
                  onClick={() => toggle(section.id)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <Flex
                    alignItems={{ default: 'alignItemsCenter' }}
                    gap={{ default: 'gapMd' }}
                  >
                    <FlexItem>
                      <span
                        className={
                          isSkipped ? 'section-title-skipped' : 'section-title'
                        }
                      >
                        {displayTitle}
                      </span>
                    </FlexItem>
                    <FlexItem>
                      {isSkipped ? (
                        <Label color="grey">Skipped</Label>
                      ) : (
                        progressLabel(answered, total)
                      )}
                    </FlexItem>
                  </Flex>
                </CardTitle>
              </CardHeader>
              <CardExpandableContent>
                <CardBody>
                  {section.questions.length === 0 ? (
                    <div style={{ padding: '16px 0', color: '#6a6e73' }}>
                      No questions yet. Add your first question below.
                    </div>
                  ) : isMobile ? (
                    <MobileQuestions
                      section={section}
                      sectionIdx={sectionIdx}
                      responses={responses}
                      onUpdateResponse={onUpdateResponse}
                      onDeleteQuestion={onDeleteQuestion}
                    />
                  ) : (
                    <DesktopQuestions
                      section={section}
                      sectionIdx={sectionIdx}
                      responses={responses}
                      onUpdateResponse={onUpdateResponse}
                      onDeleteQuestion={onDeleteQuestion}
                    />
                  )}
                  <Divider style={{ margin: '16px 0 12px' }} />
                  <Button
                    variant="link"
                    icon={<PlusCircleIcon />}
                    onClick={() => onAddQuestion(section.id)}
                  >
                    Add Question
                  </Button>
                </CardBody>
              </CardExpandableContent>
            </Card>
          </StackItem>
        );
      })}

      <StackItem>
        <Button
          variant="secondary"
          icon={<PlusCircleIcon />}
          onClick={onAddSection}
          isBlock
        >
          Add Section
        </Button>
      </StackItem>
    </Stack>
  );
}

function DesktopQuestions({
  section,
  sectionIdx,
  responses,
  onUpdateResponse,
  onDeleteQuestion,
}: {
  section: Section;
  sectionIdx: number;
  responses: Record<string, string>;
  onUpdateResponse: (key: string, val: string) => void;
  onDeleteQuestion: (sectionId: string, questionKey: string) => void;
}) {
  return (
    <Table aria-label={`Questions for ${section.title}`} variant="compact">
      <Thead>
        <Tr>
          <Th width={10}>#</Th>
          <Th width={15}>Topic</Th>
          <Th width={25}>Question</Th>
          <Th width={40}>Response</Th>
          <Th width={10} />
        </Tr>
      </Thead>
      <Tbody>
        {section.questions.map((q, qIdx) => {
          const num = formatQuestionNum(sectionIdx, qIdx);
          return (
            <Tr key={q.key}>
              <Td dataLabel="#" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                {num}
              </Td>
              <Td dataLabel="Topic" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                {q.topic}
              </Td>
              <Td dataLabel="Question" style={{ fontWeight: 500 }}>
                {q.question}
              </Td>
              <Td dataLabel="Response">
                <TextArea
                  value={responses[q.key] || ''}
                  onChange={(_e, val) => onUpdateResponse(q.key, val)}
                  placeholder="Enter response..."
                  aria-label={`Response for ${num} ${q.topic}: ${q.question}`}
                  autoResize
                  rows={2}
                />
              </Td>
              <Td dataLabel="Actions">
                {q.isCustom && (
                  <Button
                    variant="plain"
                    aria-label="Delete question"
                    onClick={() => onDeleteQuestion(section.id, q.key)}
                    size="sm"
                  >
                    <TrashIcon />
                  </Button>
                )}
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}

function MobileQuestions({
  section,
  sectionIdx,
  responses,
  onUpdateResponse,
  onDeleteQuestion,
}: {
  section: Section;
  sectionIdx: number;
  responses: Record<string, string>;
  onUpdateResponse: (key: string, val: string) => void;
  onDeleteQuestion: (sectionId: string, questionKey: string) => void;
}) {
  return (
    <Stack hasGutter>
      {section.questions.map((q, qIdx) => {
        const num = formatQuestionNum(sectionIdx, qIdx);
        return (
          <React.Fragment key={q.key}>
            <StackItem>
              <Flex
                justifyContent={{ default: 'justifyContentSpaceBetween' }}
                alignItems={{ default: 'alignItemsFlexStart' }}
              >
                <FlexItem>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>
                    {num} {q.topic}
                  </div>
                  <div style={{ marginBottom: 8 }}>{q.question}</div>
                </FlexItem>
                {q.isCustom && (
                  <FlexItem>
                    <Button
                      variant="plain"
                      aria-label="Delete question"
                      onClick={() => onDeleteQuestion(section.id, q.key)}
                      size="sm"
                    >
                      <TrashIcon />
                    </Button>
                  </FlexItem>
                )}
              </Flex>
              <TextArea
                value={responses[q.key] || ''}
                onChange={(_e, val) => onUpdateResponse(q.key, val)}
                placeholder="Enter response..."
                aria-label={`Response for ${num} ${q.topic}: ${q.question}`}
                autoResize
                rows={2}
              />
            </StackItem>
            {qIdx < section.questions.length - 1 && <Divider />}
          </React.Fragment>
        );
      })}
    </Stack>
  );
}
