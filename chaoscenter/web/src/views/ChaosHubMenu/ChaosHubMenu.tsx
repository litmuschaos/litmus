import type { ApolloQueryResult, MutationFunction } from '@apollo/client';
import { Classes, Dialog, Menu } from '@blueprintjs/core';
import { CardBody } from '@harnessio/uicore';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import type {
  DeleteChaosHubRequest,
  DeleteChaosHubResponse,
  ListChaosHubRequest,
  ListChaosHubResponse,
  SyncChaosHubRequest,
  SyncChaosHubResponse
} from '@api/core';
import type { ChaosHub } from '@api/entities';
import { useRouteWithBaseUrl } from '@hooks';
import { useStrings } from '@strings';
import { getScope } from '@utils';
import EditHubModalWizardController from '@controllers/EditHubModalWizard';
import { ParentComponentErrorWrapper } from '@errors';
import RbacMenuItem from '@components/RbacMenuItem';
import { PermissionGroup } from '@models';
import css from '../AddHubModalWizard/AddHubModalWizard.module.scss';

interface ChaosHubMenuViewProps {
  chaosHub: ChaosHub;
  hubID: React.MutableRefObject<string | null>;
  deleteChaosHubMutation: MutationFunction<DeleteChaosHubResponse, DeleteChaosHubRequest>;
  syncChaosHubMutation: MutationFunction<SyncChaosHubResponse, SyncChaosHubRequest>;
  loading: {
    deleteChaosHub: boolean;
    syncChaosHub: boolean;
  };
  listChaosHubRefetch: (
    variables?: Partial<ListChaosHubRequest> | undefined
  ) => Promise<ApolloQueryResult<ListChaosHubResponse>>;
  isDefault: boolean;
}

export const ChaosHubMenuView: React.FC<ChaosHubMenuViewProps> = ({
  chaosHub,
  hubID,
  isDefault,
  loading,
  deleteChaosHubMutation,
  syncChaosHubMutation,
  listChaosHubRefetch
}) => {
  const scope = getScope();
  const history = useHistory();
  const { getString } = useStrings();
  const paths = useRouteWithBaseUrl();
  const [selectedHubDetails, setSelectedHubDetails] = useState<ChaosHub>();
  const [editHubModal, setEditHubModal] = useState(false);

  return (
    <div>
      <Dialog
        data-testid="dialog"
        onClose={() => {
          setEditHubModal(false);
        }}
        style={{
          width: 1000,
          minHeight: 600,
          borderLeft: 0,
          paddingBottom: 0,
          position: 'relative',
          overflow: 'hidden',
          display: 'grid'
        }}
        isCloseButtonShown={true}
        isOpen={editHubModal}
        enforceFocus={false}
      >
        <EditHubModalWizardController
          listChaosHubRefetch={listChaosHubRefetch}
          hideDarkModal={() => {
            setEditHubModal(false);
          }}
          chaosHubDetails={selectedHubDetails}
        />
      </Dialog>
      <CardBody.Menu
        data-testid="menu"
        menuPopoverProps={{
          className: Classes.DARK
        }}
        menuContent={
          <Menu>
            {!isDefault && (
              <RbacMenuItem
                data-testid="menuItem"
                text={getString('menuItems.syncHub')}
                className={css.menuItem}
                disabled={loading.syncChaosHub}
                onClick={() => {
                  hubID.current = chaosHub.id;
                  syncChaosHubMutation({ variables: { projectID: scope.projectID, id: chaosHub.id } });
                }}
                permission={PermissionGroup.EDITOR}
              />
            )}
            <ParentComponentErrorWrapper>
              <RbacMenuItem
                data-testid="menuItem"
                text={getString('menuItems.viewHub')}
                className={css.menuItem}
                onClick={() =>
                  history.push({
                    pathname: paths.toChaosHub({ hubID: chaosHub.id }),
                    search: `?hubName=${chaosHub.name}&isDefault=${chaosHub.isDefault}`
                  })
                }
                permission={PermissionGroup.VIEWER}
              />
            </ParentComponentErrorWrapper>
            {!isDefault && (
              <ParentComponentErrorWrapper>
                <RbacMenuItem
                  data-testid="menuItem"
                  text={getString('menuItems.editHub')}
                  className={css.menuItem}
                  disabled={loading.deleteChaosHub}
                  onClick={() => {
                    setSelectedHubDetails(chaosHub);
                    setEditHubModal(true);
                  }}
                  permission={PermissionGroup.EDITOR}
                />
              </ParentComponentErrorWrapper>
            )}
            {!isDefault && (
              <ParentComponentErrorWrapper>
                <RbacMenuItem
                  data-testid="menuItem"
                  text={getString('menuItems.deleteHub')}
                  className={css.menuItem}
                  disabled={loading.deleteChaosHub}
                  onClick={() => {
                    deleteChaosHubMutation({ variables: { projectID: scope.projectID, hubID: chaosHub.id } });
                  }}
                  permission={PermissionGroup.EDITOR}
                />
              </ParentComponentErrorWrapper>
            )}
          </Menu>
        }
      />
    </div>
  );
};
