'use client';
import { ButtonPrimary } from '@/components/Button/Button.style';
import { CustomColor } from '@/components/CustomColorTypography.style';
import {
  TrackingAction,
  TrackingCategory,
  TrackingEventParameter,
} from '@/const/trackingKeys';
import { useWelcomeScreen } from '@/hooks/useWelcomeScreen';
import { useUserTracking } from '@/hooks/userTracking/useUserTracking';
import { appendUTMParametersToLink } from '@/utils/append-utm-params-to-link';
import type { Breakpoint } from '@mui/material';
import { Slide, Typography, useTheme } from '@mui/material';
import type { MouseEventHandler } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next/TransWithoutContext';
import { ToolCards } from './ToolCard/ToolCards';
import { ContentWrapper, Overlay, WelcomeContent } from './WelcomeScreen.style';

const auditsWelcomeUrl = appendUTMParametersToLink(
  'https://docs.li.fi/smart-contracts/audits',
  {
    utm_campaign: 'jumper_to_docs',
    utm_medium: 'welcome_screen',
  },
);
const lifiWelcomeUrl = appendUTMParametersToLink('https://li.fi/', {
  utm_campaign: 'jumper_to_lifi',
  utm_medium: 'welcome_screen',
});

interface WelcomeScreenProps {
  closed: boolean;
}

export const WelcomeScreen = ({ closed }: WelcomeScreenProps) => {
  const theme = useTheme();
  const { welcomeScreenClosed, setWelcomeScreenClosed } =
    useWelcomeScreen(closed);
  const { t } = useTranslation();
  const { trackEvent } = useUserTracking();
  const [openChainsToolModal, setOpenChainsToolModal] = useState(false);
  const [openBridgesToolModal, setOpenBridgesToolModal] = useState(false);
  const [openDexsToolModal, setOpenDexsToolModal] = useState(false);
  useEffect(() => {
    if (welcomeScreenClosed) {
      trackEvent({
        category: TrackingCategory.WelcomeScreen,
        label: 'open-welcome-screen',
        action: TrackingAction.ShowWelcomeMessageScreen,
      });
    }
  }, [trackEvent, welcomeScreenClosed]);

  const handleAuditClick = () => {
    trackEvent({
      category: TrackingCategory.WelcomeScreen,
      label: 'open-welcome-message-link',
      action: TrackingAction.OpenWelcomeMessageLink,
      data: { [TrackingEventParameter.WelcomeMessageLink]: '4x_audited' },
    });
    trackEvent({
      category: TrackingCategory.Pageload,
      action: TrackingAction.PageLoad,
      label: 'pageload-discord',
      data: {
        [TrackingEventParameter.PageloadSource]: TrackingCategory.WelcomeScreen,
        [TrackingEventParameter.PageloadDestination]: 'docs-sc-audits',
        [TrackingEventParameter.PageloadURL]: auditsWelcomeUrl,
        [TrackingEventParameter.PageloadExternal]: true,
      },
    });
  };

  const handleLIFIClick = () => {
    trackEvent({
      category: TrackingCategory.WelcomeScreen,
      label: 'open-welcome-message-link',
      action: TrackingAction.OpenWelcomeMessageLink,
      data: { [TrackingEventParameter.WelcomeMessageLink]: 'LIFI' },
    });
    trackEvent({
      category: TrackingCategory.Pageload,
      action: TrackingAction.PageLoad,
      label: 'pageload-discord',
      data: {
        [TrackingEventParameter.PageloadSource]: TrackingCategory.WelcomeScreen,
        [TrackingEventParameter.PageloadDestination]: 'lifi-website',
        [TrackingEventParameter.PageloadURL]: lifiWelcomeUrl,
        [TrackingEventParameter.PageloadExternal]: true,
      },
    });
  };

  const handleGetStarted: MouseEventHandler<HTMLButtonElement> = (event) => {
    const classList = (event.target as HTMLElement).classList;
    if (
      classList.contains?.('stats-card') ||
      classList.contains?.('link-lifi')
    ) {
      return;
    } else {
      event.stopPropagation();
      if (!welcomeScreenClosed) {
        setWelcomeScreenClosed(true);
        trackEvent({
          category: TrackingCategory.WelcomeScreen,
          action: TrackingAction.CloseWelcomeScreen,
          label: 'enter_welcome_screen',
          enableAddressable: true,
        });
      }
    }
  };

  return (
    <Overlay showWelcome={!welcomeScreenClosed}>
      <Slide
        direction="up"
        unmountOnExit
        appear={false}
        timeout={400}
        in={!welcomeScreenClosed}
      >
        <ContentWrapper showWelcome={!welcomeScreenClosed}>
          <WelcomeContent>
            <CustomColor as="h1" variant={'lifiHeaderMedium'}>
              {t('navbar.welcome.title')}
            </CustomColor>
            <Typography
              variant={'lifiBodyLarge'}
              sx={{
                marginTop: 2,
                color:
                  theme.palette.mode === 'dark'
                    ? theme.palette.accent1Alt.main
                    : theme.palette.primary.main,
                '& > .link-lifi': {
                  fontWeight: 700,
                  color: 'inherit',
                  textDecoration: 'none',
                },
                [theme.breakpoints.up('sm' as Breakpoint)]: {
                  fontSize: '24px',
                  fontWeight: 400,
                  lineHeight: '32px',
                },
              }}
            >
              <Trans
                i18nKey={'navbar.welcome.subtitle' as string & never[]}
                components={[
                  // fix: allow component with "no content"
                  // eslint-disable-next-line jsx-a11y/anchor-has-content
                  <a
                    className={'link-lifi'}
                    href={auditsWelcomeUrl}
                    target={'_blank'}
                    rel="noreferrer"
                    onClick={handleAuditClick}
                  />,
                  // eslint-disable-next-line jsx-a11y/anchor-has-content
                  <a
                    className={'link-lifi'}
                    href={lifiWelcomeUrl}
                    onClick={handleLIFIClick}
                    target={'_blank'}
                    rel="noreferrer"
                  />,
                ]}
              />
            </Typography>
            <ToolCards
              openChainsToolModal={openChainsToolModal}
              setOpenChainsToolModal={setOpenChainsToolModal}
              openBridgesToolModal={openBridgesToolModal}
              setOpenBridgesToolModal={setOpenBridgesToolModal}
              openDexsToolModal={openDexsToolModal}
              setOpenDexsToolModal={setOpenDexsToolModal}
            />
            <ButtonPrimary
              id="get-started-button"
              onClick={handleGetStarted}
              sx={(theme) => ({
                height: 48,
                width: 192,
                margin: theme.spacing(4, 'auto'),
                [theme.breakpoints.up('sm' as Breakpoint)]: {
                  margin: theme.spacing(6, 'auto'),
                  height: 56,
                  borderRadius: '28px',
                  width: 247,
                },
              })}
            >
              <Typography
                variant={'lifiBodyMediumStrong'}
                sx={{
                  maxHeight: 40,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  [theme.breakpoints.up('sm' as Breakpoint)]: {
                    fontSize: '18px',
                    maxHeight: 48,
                    lineHeight: '24px',
                  },
                }}
              >
                {t('navbar.welcome.cta')}
              </Typography>
            </ButtonPrimary>
          </WelcomeContent>
          {/* <FeaturedArticle
            showIntro={true}
            showAllButton={true}
            styles={{
              background: `linear-gradient(0deg, transparent, ${
                theme.palette.mode === 'light'
                  ? theme.palette.white.main
                  : theme.palette.accent1Alt.main
              })`,
            }}
          /> */}
        </ContentWrapper>
      </Slide>
    </Overlay>
  );
};
