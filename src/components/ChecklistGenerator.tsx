import { useState } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Stack,
  StackItem,
  Flex,
  FlexItem,
  Button,
  TextInput,
  TextArea,
  Form,
  FormGroup,
  Divider,
  EmptyState,
  EmptyStateBody,
  Title,
} from '@patternfly/react-core';
import {
  PlusCircleIcon,
  TrashIcon,
  TimesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ListIcon,
} from '@patternfly/react-icons';
import type { Section } from '../data/checklist';

interface GeneratorProps {
  onApply: (sections: Section[]) => void;
  onCancel: () => void;
}

interface EditableSection {
  id: string;
  title: string;
  questions: EditableQuestion[];
}

interface EditableQuestion {
  id: string;
  topic: string;
  question: string;
}

let counter = 0;
function uid() {
  return `gen-${Date.now()}-${counter++}`;
}

function emptyQuestion(): EditableQuestion {
  return { id: uid(), topic: '', question: '' };
}

function emptySection(): EditableSection {
  return { id: uid(), title: '', questions: [emptyQuestion()] };
}

export default function ChecklistGenerator({ onApply, onCancel }: GeneratorProps) {
  const [sections, setSections] = useState<EditableSection[]>([emptySection()]);

  const updateSectionTitle = (idx: number, title: string) =>
    setSections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, title } : s)),
    );

  const addSection = () =>
    setSections((prev) => [...prev, emptySection()]);

  const removeSection = (idx: number) =>
    setSections((prev) => prev.filter((_, i) => i !== idx));

  const moveSection = (idx: number, dir: -1 | 1) =>
    setSections((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });

  const updateQuestion = (
    sIdx: number,
    qIdx: number,
    field: 'topic' | 'question',
    value: string,
  ) =>
    setSections((prev) =>
      prev.map((s, si) =>
        si === sIdx
          ? {
              ...s,
              questions: s.questions.map((q, qi) =>
                qi === qIdx ? { ...q, [field]: value } : q,
              ),
            }
          : s,
      ),
    );

  const addQuestionTo = (sIdx: number) =>
    setSections((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? { ...s, questions: [...s.questions, emptyQuestion()] }
          : s,
      ),
    );

  const removeQuestion = (sIdx: number, qIdx: number) =>
    setSections((prev) =>
      prev.map((s, si) =>
        si === sIdx
          ? { ...s, questions: s.questions.filter((_, qi) => qi !== qIdx) }
          : s,
      ),
    );

  const handleApply = () => {
    const result: Section[] = sections
      .filter((s) => s.title.trim())
      .map((s) => ({
        id: s.id,
        title: s.title.trim(),
        questions: s.questions
          .filter((q) => q.question.trim())
          .map((q) => ({
            key: q.id,
            topic: q.topic.trim() || s.title.trim(),
            question: q.question.trim(),
          })),
      }));

    if (result.length === 0) return;
    onApply(result);
  };

  const totalQuestions = sections.reduce(
    (sum, s) => sum + s.questions.filter((q) => q.question.trim()).length,
    0,
  );
  const validSections = sections.filter((s) => s.title.trim()).length;

  return (
    <Stack hasGutter>
      <StackItem>
        <Card>
          <CardBody>
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              alignItems={{ default: 'alignItemsCenter' }}
            >
              <FlexItem>
                <Title headingLevel="h2" size="lg">
                  <ListIcon style={{ marginRight: 8 }} />
                  Checklist Generator
                </Title>
                <p style={{ color: '#6a6e73', marginTop: 4 }}>
                  Build your checklist from scratch. Define sections and
                  questions, then click "Create Checklist" to start your
                  session.
                </p>
              </FlexItem>
              <FlexItem>
                <Button variant="link" onClick={onCancel} icon={<TimesIcon />}>
                  Cancel
                </Button>
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      </StackItem>

      {sections.map((section, sIdx) => (
        <StackItem key={section.id}>
          <Card>
            <CardTitle>
              <Flex
                alignItems={{ default: 'alignItemsCenter' }}
                gap={{ default: 'gapSm' }}
              >
                <FlexItem
                  style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    minWidth: 30,
                    color: '#6a6e73',
                  }}
                >
                  {sIdx + 1}.
                </FlexItem>
                <FlexItem grow={{ default: 'grow' }}>
                  <TextInput
                    value={section.title}
                    onChange={(_e, val) => updateSectionTitle(sIdx, val)}
                    placeholder="Section title (e.g., Networking & Security)"
                    aria-label={`Section ${sIdx + 1} title`}
                  />
                </FlexItem>
                <FlexItem>
                  <Button
                    variant="plain"
                    size="sm"
                    aria-label="Move section up"
                    isDisabled={sIdx === 0}
                    onClick={() => moveSection(sIdx, -1)}
                  >
                    <ArrowUpIcon />
                  </Button>
                </FlexItem>
                <FlexItem>
                  <Button
                    variant="plain"
                    size="sm"
                    aria-label="Move section down"
                    isDisabled={sIdx === sections.length - 1}
                    onClick={() => moveSection(sIdx, 1)}
                  >
                    <ArrowDownIcon />
                  </Button>
                </FlexItem>
                <FlexItem>
                  <Button
                    variant="plain"
                    size="sm"
                    aria-label="Remove section"
                    onClick={() => removeSection(sIdx)}
                    isDisabled={sections.length <= 1}
                  >
                    <TrashIcon />
                  </Button>
                </FlexItem>
              </Flex>
            </CardTitle>
            <CardBody>
              <Stack hasGutter>
                {section.questions.map((q, qIdx) => (
                  <StackItem key={q.id}>
                    <Form isHorizontal>
                      <Flex
                        alignItems={{ default: 'alignItemsFlexStart' }}
                        gap={{ default: 'gapSm' }}
                      >
                        <FlexItem
                          style={{
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            minWidth: 35,
                            paddingTop: 6,
                            color: '#6a6e73',
                          }}
                        >
                          {sIdx + 1}.{qIdx + 1}
                        </FlexItem>
                        <FlexItem style={{ minWidth: 160 }}>
                          <FormGroup fieldId={`topic-${q.id}`}>
                            <TextInput
                              id={`topic-${q.id}`}
                              value={q.topic}
                              onChange={(_e, val) =>
                                updateQuestion(sIdx, qIdx, 'topic', val)
                              }
                              placeholder="Topic"
                              aria-label="Topic"
                            />
                          </FormGroup>
                        </FlexItem>
                        <FlexItem grow={{ default: 'grow' }}>
                          <FormGroup fieldId={`question-${q.id}`}>
                            <TextArea
                              id={`question-${q.id}`}
                              value={q.question}
                              onChange={(_e, val) =>
                                updateQuestion(sIdx, qIdx, 'question', val)
                              }
                              placeholder="Question text"
                              aria-label="Question"
                              autoResize
                              rows={1}
                            />
                          </FormGroup>
                        </FlexItem>
                        <FlexItem>
                          <Button
                            variant="plain"
                            size="sm"
                            aria-label="Remove question"
                            onClick={() => removeQuestion(sIdx, qIdx)}
                            isDisabled={section.questions.length <= 1}
                          >
                            <TrashIcon />
                          </Button>
                        </FlexItem>
                      </Flex>
                    </Form>
                    {qIdx < section.questions.length - 1 && (
                      <Divider style={{ marginTop: 8 }} />
                    )}
                  </StackItem>
                ))}
                <StackItem>
                  <Button
                    variant="link"
                    icon={<PlusCircleIcon />}
                    onClick={() => addQuestionTo(sIdx)}
                    size="sm"
                  >
                    Add Question
                  </Button>
                </StackItem>
              </Stack>
            </CardBody>
          </Card>
        </StackItem>
      ))}

      <StackItem>
        <Button
          variant="secondary"
          icon={<PlusCircleIcon />}
          onClick={addSection}
          isBlock
          style={{ borderStyle: 'dashed' }}
        >
          Add Section
        </Button>
      </StackItem>

      <StackItem>
        <Divider />
      </StackItem>

      <StackItem>
        {validSections === 0 ? (
          <EmptyState>
            <Title headingLevel="h3" size="md">
              No sections defined yet
            </Title>
            <EmptyStateBody>
              Add at least one section with a title and one question to create
              your checklist.
            </EmptyStateBody>
          </EmptyState>
        ) : (
          <Flex
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            <FlexItem>
              <span style={{ color: '#6a6e73' }}>
                {validSections} section{validSections !== 1 ? 's' : ''},{' '}
                {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
              </span>
            </FlexItem>
            <FlexItem>
              <Flex gap={{ default: 'gapMd' }}>
                <FlexItem>
                  <Button variant="link" onClick={onCancel}>
                    Cancel
                  </Button>
                </FlexItem>
                <FlexItem>
                  <Button
                    variant="primary"
                    onClick={handleApply}
                    isDisabled={validSections === 0 || totalQuestions === 0}
                  >
                    Create Checklist
                  </Button>
                </FlexItem>
              </Flex>
            </FlexItem>
          </Flex>
        )}
      </StackItem>
    </Stack>
  );
}
