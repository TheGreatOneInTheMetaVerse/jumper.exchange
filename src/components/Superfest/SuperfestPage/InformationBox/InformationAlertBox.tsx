import { LeftTextBox } from '../SuperfestMissionPage.style';
import { Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { InformationBox } from './InformationBox.style';

interface InformationAlertBoxProps {
  information?: string;
}

export const InformationAlertBox = ({
  information,
}: InformationAlertBoxProps) => {
  return (
    <InformationBox>
      <InfoOutlinedIcon sx={{ width: 32, height: 32 }} />
      <LeftTextBox ml="32px">
        <Typography>{information}</Typography>
      </LeftTextBox>
    </InformationBox>
  );
};
