import { Button } from 'src/components/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { JUMPER_FEST } from 'src/const/urls';
import {
  LeftTextBox,
  SuperfestPageElementContainer,
} from '../SuperfestMissionPage.style';
import { Typography } from '@mui/material';
import { sequel85 } from 'src/fonts/fonts';
import { CustomRichBlocks } from 'src/components/Blog';
import { RootNode } from 'node_modules/@strapi/blocks-react-renderer/dist/BlocksRenderer';
import { Sequel85Typography } from '../../Superfest.style';

interface StepsBoxProps {
  steps?: RootNode[];
  baseUrl: string;
}

export const StepsBox = ({ steps, baseUrl }: StepsBoxProps) => {
  return (
    <SuperfestPageElementContainer>
      <LeftTextBox>
        <Sequel85Typography fontSize={'32px'} fontWeight={700}>
          Steps to complete the mission
        </Sequel85Typography>
      </LeftTextBox>
      <>
        <CustomRichBlocks
          id={1}
          baseUrl={baseUrl}
          content={steps}
          variant={'superfest'}
        />
      </>
    </SuperfestPageElementContainer>
  );
};
