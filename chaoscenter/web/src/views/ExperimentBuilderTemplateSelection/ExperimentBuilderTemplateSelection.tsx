import React from 'react';
import { Button, Container, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { Icon, IconName } from '@harnessio/icons';
import { Drawer as BlueprintJSDrawer, Position } from '@blueprintjs/core';
import cx from 'classnames';
import { useStrings } from '@strings';
import ListChaosHubsTabController from '@controllers/ListChaosHubsTab';
import { ExperimentManifest, StudioTabs } from '@models';
import BlankCanvas from './BlankCanvas';
import UploadYAML from './UploadYAML';
import css from './ExperimentBuilderTemplateSelection.module.scss';

interface ExperimentBuilderTemplateSelectionViewProps {
  isSelectTemplateDrawerOpen: boolean;
  onClose: (manifest: ExperimentManifest) => void;
  handleTabChange: (tabID: StudioTabs) => void;
}
interface ToggleSelectorProps {
  selected: boolean;
  handleSelect: () => void;
  heading: string;
  description: string;
  icon: IconName;
}
enum TemplateSelection {
  PREDEFINED_EXPERIMENT = 'PREDEFINED_EXPERIMENT',
  BLANK_CANVAS = 'BLANK_CANVAS',
  UPLOAD_YAML = 'UPLOAD_YAML'
}

function HighlightedList({
  selected,
  handleSelect,
  heading,
  description,
  icon
}: ToggleSelectorProps): React.ReactElement {
  return (
    <Layout.Horizontal
      onClick={handleSelect}
      background={selected ? Color.PRIMARY_7 : ''}
      padding="medium"
      flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      className={cx(css.gap6, css.toggleCard)}
    >
      <div className={css.iconBack}>
        <Icon name={icon} size={22} color={Color.PRIMARY_7} />
      </div>
      <Layout.Vertical>
        <Text font={{ variation: FontVariation.BODY1 }} color={Color.WHITE}>
          {heading}
        </Text>
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_200}>
          {description}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  );
}

export default function ExperimentBuilderTemplateSelectionView({
  isSelectTemplateDrawerOpen,
  handleTabChange,
  onClose
}: ExperimentBuilderTemplateSelectionViewProps): React.ReactElement {
  const { getString } = useStrings();
  const [templateSelection, setTemplateSelection] = React.useState<TemplateSelection>(TemplateSelection.BLANK_CANVAS);

  return (
    <div className={css.drawerMainCont}>
      <BlueprintJSDrawer
        usePortal={true}
        autoFocus={true}
        hasBackdrop={true}
        size={436 + 583}
        isOpen={isSelectTemplateDrawerOpen}
        position={Position.RIGHT}
        data-type={'templateSelection'}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
      >
        <Button
          className={css.drawerClosebutton}
          minimal
          icon="cross"
          withoutBoxShadow
          onClick={() => {
            handleTabChange(StudioTabs.OVERVIEW);
          }}
        />
        <Layout.Horizontal height={'100%'}>
          <Container width={436} height={'100%'} background={Color.PRIMARY_9}>
            <Text
              font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
              color={Color.WHITE}
              padding={{ top: 'large', right: 'medium', bottom: 'large', left: 'medium' }}
              border={{ bottom: true }}
            >
              {getString('mainTitle')}
            </Text>
            <Container padding={{ top: 'xlarge', bottom: 'xlarge', left: 'medium' }} className={css.toggleCardCont}>
              <HighlightedList
                selected={templateSelection === TemplateSelection.BLANK_CANVAS}
                handleSelect={() => setTemplateSelection(TemplateSelection.BLANK_CANVAS)}
                heading={getString('startBlankCanvasTitle')}
                description={getString('startBlankCanvasDescription')}
                icon="blank-canvas-header-icon"
              />
              <>
                <HighlightedList
                  selected={templateSelection === TemplateSelection.PREDEFINED_EXPERIMENT}
                  handleSelect={() => setTemplateSelection(TemplateSelection.PREDEFINED_EXPERIMENT)}
                  heading={getString('templateFromChaosHubsTitle')}
                  description={getString('templateFromChaosHubsDescription')}
                  icon="chaos-scenario-builder"
                />
              </>
              <HighlightedList
                selected={templateSelection === TemplateSelection.UPLOAD_YAML}
                handleSelect={() => setTemplateSelection(TemplateSelection.UPLOAD_YAML)}
                heading={getString('uploadYAMLTitle')}
                description={getString('uploadYAMLDescription')}
                icon="upload-box"
              />
            </Container>
          </Container>
          <Container width={583} height={'100%'} padding="xlarge" className={css.rightCont}>
            {templateSelection === TemplateSelection.BLANK_CANVAS && <BlankCanvas onClose={onClose} />}
            {templateSelection === TemplateSelection.PREDEFINED_EXPERIMENT && (
              <ListChaosHubsTabController onClose={onClose} />
            )}
            {templateSelection === TemplateSelection.UPLOAD_YAML && <UploadYAML onClose={onClose} />}
          </Container>
        </Layout.Horizontal>
      </BlueprintJSDrawer>
    </div>
  );
}
