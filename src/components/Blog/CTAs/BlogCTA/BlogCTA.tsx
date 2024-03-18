'use client';
import { IconButtonPrimary } from '@/components/IconButton.style';
import { useUserTracking } from '@/hooks/userTracking/useUserTracking';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { Breakpoint } from '@mui/material';
import { useTheme } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  TrackingAction,
  TrackingCategory,
  TrackingEventParameter,
} from 'src/const';
import { EventTrackingTool } from 'src/types';
import { BlogCtaContainer, BlogCtaTitle } from '.';

interface BlogCTAProps {
  title?: string;
  url?: string;
  id?: number;
}

export const BlogCTA = ({ title, url, id }: BlogCTAProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { trackEvent } = useUserTracking();
  const theme = useTheme();
  const handleClick = () => {
    // url?.length && (!url?.includes(window?.location.host) || url[0] !== '/')
    //   ? openInNewTab(url)
    //   : router.push(url ?? '/');
    // typeof window !== 'undefined' &&
    //   window.scrollTo({ top: 0, behavior: 'instant' });
    trackEvent({
      category: TrackingCategory.BlogArticle,
      action: TrackingAction.ClickBlogCTA,
      label: 'click-blog-cta',
      disableTrackingTool: [EventTrackingTool.ARCx, EventTrackingTool.Cookie3],
      data: {
        [TrackingEventParameter.ArticleTitle]: title,
        [TrackingEventParameter.ArticleID]: id,
      },
    });
  };
  return (
    <BlogCtaContainer onClick={handleClick}>
      <BlogCtaTitle>{title ?? t('blog.jumperCta')}</BlogCtaTitle>
      <IconButtonPrimary
        onClick={handleClick}
        sx={{
          [theme.breakpoints.up('sm' as Breakpoint)]: {
            display: 'flex',
          },
        }}
      >
        <ArrowForwardIcon sx={{ width: '28px', height: '28px' }} />
      </IconButtonPrimary>
    </BlogCtaContainer>
  );
};
