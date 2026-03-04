import {
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarGroup,
  Button,
} from '@patternfly/react-core';
import {
  SaveIcon,
  FolderOpenIcon,
  FilePdfIcon,
  DownloadIcon,
  TrashIcon,
  ListIcon,
  UndoIcon,
} from '@patternfly/react-icons';

interface ChecklistToolbarProps {
  onSave: () => void;
  onLoad: () => void;
  onExportPDF: () => void;
  onExportJSON: () => void;
  onClear: () => void;
  onOpenGenerator: () => void;
  onResetToTemplate: () => void;
  isUsingCustomChecklist: boolean;
  isGeneratorOpen: boolean;
}

export default function ChecklistToolbar({
  onSave,
  onLoad,
  onExportPDF,
  onExportJSON,
  onClear,
  onOpenGenerator,
  onResetToTemplate,
  isUsingCustomChecklist,
  isGeneratorOpen,
}: ChecklistToolbarProps) {
  return (
    <Toolbar>
      <ToolbarContent>
        <ToolbarGroup>
          <ToolbarItem>
            <Button variant="primary" icon={<SaveIcon />} onClick={onSave}>
              Save
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button
              variant="secondary"
              icon={<FolderOpenIcon />}
              onClick={onLoad}
            >
              Load
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button
              variant="secondary"
              icon={<FilePdfIcon />}
              onClick={onExportPDF}
            >
              Export PDF
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button
              variant="secondary"
              icon={<DownloadIcon />}
              onClick={onExportJSON}
            >
              Export JSON
            </Button>
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarItem variant="separator" />
        <ToolbarGroup>
          {!isGeneratorOpen && (
            <ToolbarItem>
              <Button
                variant="secondary"
                icon={<ListIcon />}
                onClick={onOpenGenerator}
              >
                New Checklist
              </Button>
            </ToolbarItem>
          )}
          {isUsingCustomChecklist && !isGeneratorOpen && (
            <ToolbarItem>
              <Button
                variant="link"
                icon={<UndoIcon />}
                onClick={onResetToTemplate}
              >
                Reset to Template
              </Button>
            </ToolbarItem>
          )}
        </ToolbarGroup>
        <ToolbarItem variant="separator" />
        <ToolbarItem>
          <Button variant="danger" icon={<TrashIcon />} onClick={onClear}>
            Clear All
          </Button>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
}
