import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-query';

import Button from '@oracle/elements/Button';
import Divider from '@oracle/elements/Divider';
import Flex from '@oracle/components/Flex';
import FlexContainer from '@oracle/components/FlexContainer';
import Headline from '@oracle/elements/Headline';
import Link from '@oracle/elements/Link';
import Panel from '@oracle/components/Panel';
import ProjectType, { FeatureUUIDEnum } from '@interfaces/ProjectType';
import Spacing from '@oracle/elements/Spacing';
import Text from '@oracle/elements/Text';
import TextInput from '@oracle/elements/Inputs/TextInput';
import ToggleSwitch from '@oracle/elements/Inputs/ToggleSwitch';
import api from '@api';
import { ContainerStyle } from './index.style';
import { PADDING_UNITS, UNITS_BETWEEN_SECTIONS } from '@oracle/styles/units/spacing';
import { onSuccess } from '@api/utils/response';
import { useError } from '@context/Error';

type PreferencesProps = {
  cancelButtonText?: string;
  contained?: boolean;
  header?: any;
  onCancel?: () => void;
  onSaveSuccess?: (project: ProjectType) => void;
};

function Preferences({
  cancelButtonText,
  contained,
  header,
  onCancel,
  onSaveSuccess,
}: PreferencesProps) {
  const [showError] = useError(null, {}, [], {
    uuid: 'settings/workspace/preferences',
  });
  const [projectAttributes, setProjectAttributes] = useState<ProjectType>(null);

  const { data, mutate: fetchProjects } = api.projects.list();
  const project: ProjectType = useMemo(() => data?.projects?.[0], [data]);
  const {
    name: projectName,
    project_uuid: projectUUID,
  } = project || {};

  useEffect(() => {
    if (!projectAttributes) {
      setProjectAttributes(project);
    }
  }, [project, projectAttributes]);

  const [updateProjectBase, { isLoading: isLoadingUpdateProject }]: any = useMutation(
    api.projects.useUpdate(projectName),
    {
      onSuccess: (response: any) => onSuccess(
        response, {
          callback: ({ project: p }) => {
            fetchProjects();
            setProjectAttributes(p);

            if (onSaveSuccess) {
              onSaveSuccess?.(p);
            }
          },
          onErrorCallback: (response, errors) => showError({
            errors,
            response,
          }),
        },
      ),
    },
  );
  const updateProject = useCallback((payload: {
    features?: {
      [key: string]: boolean;
    };
    help_improve_mage?: boolean;
    openai_api_key?: string;
  }) => updateProjectBase({
    project: payload,
  }), [updateProjectBase]);

  const el = (
    <>
      {header}

      <Panel noPadding>
        <Spacing p={PADDING_UNITS}>
          <Spacing mb={1}>
            <Headline level={5}>
              Project name
            </Headline>
          </Spacing>

          <Text default monospace>
            {projectName}
          </Text>
        </Spacing>

        <Divider light />

        <Spacing p={PADDING_UNITS}>
          <Spacing mb={1}>
            <Headline level={5}>
              Project UUID
            </Headline>
          </Spacing>

          <Text default={!!projectUUID} monospace muted={!projectUUID}>
            {projectUUID || 'Not required'}
          </Text>
        </Spacing>

        <Divider light />

        <Spacing p={PADDING_UNITS}>
          <FlexContainer
            alignItems="center"
            justifyContent="space-between"
          >
            <Flex flexDirection="column">
              <Spacing mb={1}>
                <Headline level={5}>
                  Help improve Mage
                </Headline>
              </Spacing>

              <Text default>
                Please contribute usage statistics to help improve the developer experience
                for you and everyone in the community. Learn more <Link
                  href="https://docs.mage.ai/contributing/statistics/overview"
                  openNewWindow
                >
                  here
                </Link>.
              </Text>
            </Flex>

            <Spacing mr={PADDING_UNITS} />

            <ToggleSwitch
              checked={projectAttributes?.help_improve_mage}
              onCheck={() => setProjectAttributes(prev => ({
                ...prev,
                help_improve_mage: !projectAttributes?.help_improve_mage,
              }))}
            />
          </FlexContainer>
        </Spacing>

        {/*<Divider light />

        <Spacing p={PADDING_UNITS}>
          <Spacing mb={1}>
            <Headline level={5}>
              Automatically generate block names
            </Headline>
          </Spacing>

          <FlexContainer alignItems="center">
            <Checkbox
              checked={automaticallyNameBlocks}
              label="Use randomly generated names for blocks created in the future"
              onClick={() => {
                setAutomaticallyNameBlocks(!automaticallyNameBlocks);
                set(LOCAL_STORAGE_KEY_AUTOMATICALLY_NAME_BLOCKS, !automaticallyNameBlocks);
              }}
            />
          </FlexContainer>
        </Spacing>*/}
      </Panel>

      <Spacing mt={UNITS_BETWEEN_SECTIONS} />

      <Panel noPadding>
        <Spacing p={PADDING_UNITS}>
          <Spacing mb={1}>
            <Headline level={5}>
              Features
            </Headline>
          </Spacing>

          {Object.entries(projectAttributes?.features || {}).map(([k, v]) => (
            <FlexContainer
              alignItems="center"
              justifyContent="space-between"
              key={k}
            >
              <Text default monospace>
                {k}
              </Text>

              <Spacing mr={PADDING_UNITS} />

              <ToggleSwitch
                checked={!!v}
                onCheck={() => setProjectAttributes(prev => ({
                  ...prev,
                  features: {
                    ...projectAttributes?.features,
                    [k]: !v,
                  },
                }))}
              />
            </FlexContainer>
          ))}
        </Spacing>
      </Panel>

      <Spacing mt={UNITS_BETWEEN_SECTIONS} />

      <Panel noPadding>
        <Spacing p={PADDING_UNITS}>
          <Spacing mb={1}>
            <Headline level={5}>
              OpenAI
            </Headline>
          </Spacing>

          <TextInput
            label="API key"
            monospace
            onChange={e => setProjectAttributes(prev => ({
              ...prev,
              openai_api_key: e.target.value,
            }))}
            primary
            setContentOnMount
            value={projectAttributes?.openai_api_key || ''}
          />
        </Spacing>
      </Panel>

      <Spacing mt={UNITS_BETWEEN_SECTIONS} />

      <FlexContainer alignItems="center">
        <Button
          loading={isLoadingUpdateProject}
          onClick={() => {
            updateProject({
              features: projectAttributes?.features,
              help_improve_mage: projectAttributes?.help_improve_mage,
              openai_api_key: projectAttributes?.openai_api_key,
            });
          }}
          primary
        >
          Save project settings
        </Button>

        {onCancel && (
          <>
            <Spacing mr={PADDING_UNITS} />

            <Button
              onClick={onCancel}
              secondary
            >
              {cancelButtonText || 'Cancel'}
            </Button>
          </>
        )}
      </FlexContainer>
    </>
  );

  if (contained) {
    return (
      <ContainerStyle>
        {el}
      </ContainerStyle>
    );
  }

  return el;
}

export default Preferences;
