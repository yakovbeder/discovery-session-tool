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
} from '@patternfly/react-icons';

interface ChecklistToolbarProps {
  onSave: () => void;
  onLoad: () => void;
  onExportPDF: () => void;
  onExportJSON: () => void;
  onClear: () => void;
}

export default function ChecklistToolbar({
  onSave,
  onLoad,
  onExportPDF,
  onExportJSON,
  onClear,
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
        <ToolbarItem>
          <Button variant="danger" icon={<TrashIcon />} onClick={onClear}>
            Clear All
          </Button>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
}
