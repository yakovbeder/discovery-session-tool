import { useState } from 'react';
import {
  Flex,
  FlexItem,
  Progress,
  ProgressMeasureLocation,
  ProgressVariant,
  Text,
  TextContent,
  TextVariants,
  TextInput,
  Button,
} from '@patternfly/react-core';
import { PencilAltIcon, CheckIcon } from '@patternfly/react-icons';

interface ProgressHeaderProps {
  progress: number;
  title: string;
  subtitle: string;
  onTitleChange: (title: string) => void;
  onSubtitleChange: (subtitle: string) => void;
}

function progressVariant(value: number) {
  if (value >= 75) return ProgressVariant.success;
  if (value >= 50) return undefined;
  if (value >= 25) return ProgressVariant.warning;
  return ProgressVariant.danger;
}

export default function ProgressHeader({
  progress,
  title,
  subtitle,
  onTitleChange,
  onSubtitleChange,
}: ProgressHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editSubtitle, setEditSubtitle] = useState(subtitle);

  const startEdit = () => {
    setEditTitle(title);
    setEditSubtitle(subtitle);
    setEditing(true);
  };

  const commitEdit = () => {
    onTitleChange(editTitle.trim() || title);
    onSubtitleChange(editSubtitle.trim() || subtitle);
    setEditing(false);
  };

  if (editing) {
    return (
      <Flex
        direction={{ default: 'column' }}
        gap={{ default: 'gapSm' }}
      >
        <FlexItem>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapSm' }}
          >
            <FlexItem grow={{ default: 'grow' }}>
              <TextInput
                value={editTitle}
                onChange={(_e, val) => setEditTitle(val)}
                aria-label="Document title"
                placeholder="Checklist title"
                style={{ fontSize: '1.4rem', fontWeight: 700 }}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
              />
            </FlexItem>
            <FlexItem>
              <Button
                variant="plain"
                aria-label="Confirm title"
                onClick={commitEdit}
              >
                <CheckIcon />
              </Button>
            </FlexItem>
          </Flex>
        </FlexItem>
        <FlexItem>
          <TextInput
            value={editSubtitle}
            onChange={(_e, val) => setEditSubtitle(val)}
            aria-label="Document subtitle"
            placeholder="Subtitle / description"
            onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
          />
        </FlexItem>
      </Flex>
    );
  }

  return (
    <Flex
      direction={{ default: 'column', sm: 'row' }}
      alignItems={{ sm: 'alignItemsCenter' }}
      justifyContent={{ default: 'justifyContentSpaceBetween' }}
      gap={{ default: 'gapMd' }}
    >
      <FlexItem>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapSm' }}
        >
          <FlexItem>
            <TextContent>
              <Text component={TextVariants.h1}>{title}</Text>
              {subtitle && (
                <Text component={TextVariants.p}>{subtitle}</Text>
              )}
            </TextContent>
          </FlexItem>
          <FlexItem>
            <Button
              variant="plain"
              aria-label="Edit title"
              onClick={startEdit}
              size="sm"
            >
              <PencilAltIcon />
            </Button>
          </FlexItem>
        </Flex>
      </FlexItem>
      <FlexItem style={{ minWidth: 220 }}>
        <Progress
          value={progress}
          title="Completion"
          measureLocation={ProgressMeasureLocation.outside}
          variant={progressVariant(progress)}
          aria-label="Checklist completion progress"
        />
      </FlexItem>
    </Flex>
  );
}
