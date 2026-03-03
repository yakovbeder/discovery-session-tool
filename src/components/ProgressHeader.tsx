import {
  Flex,
  FlexItem,
  Progress,
  ProgressMeasureLocation,
  ProgressVariant,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';

interface ProgressHeaderProps {
  progress: number;
}

function progressVariant(value: number) {
  if (value >= 75) return ProgressVariant.success;
  if (value >= 50) return undefined;
  if (value >= 25) return ProgressVariant.warning;
  return ProgressVariant.danger;
}

export default function ProgressHeader({ progress }: ProgressHeaderProps) {
  return (
    <Flex
      direction={{ default: 'column', sm: 'row' }}
      alignItems={{ sm: 'alignItemsCenter' }}
      justifyContent={{ default: 'justifyContentSpaceBetween' }}
      gap={{ default: 'gapMd' }}
    >
      <FlexItem>
        <TextContent>
          <Text component={TextVariants.h1}>
            OpenShift Discovery Session Checklist
          </Text>
          <Text component={TextVariants.p}>
            Complete discovery session checklist for OpenShift deployment
            planning
          </Text>
        </TextContent>
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
