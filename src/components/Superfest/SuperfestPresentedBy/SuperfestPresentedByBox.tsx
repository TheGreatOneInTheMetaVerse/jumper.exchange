'use client';

import { openInNewTab } from '@/utils/openInNewTab';
import { SuperfestPresentedBy } from 'src/components/illustrations/SuperfestPresentedBy';
import { SuperFestPoweredContainer } from './SuperfestPresentedByBox.style';
import { usePathname } from 'next/navigation';
import { JUMPER_FEST } from 'src/const/urls';

export const SuperfestPresentedByBox = () => {
  const currentPath = usePathname();
  const isSuperfest = currentPath.includes(JUMPER_FEST);

  console.log(currentPath);

  const handleClick = () => {
    // openInNewTab(lifiUrl);
  };

  return (
    <>
      {isSuperfest ? (
        <SuperFestPoweredContainer fixedPosition={false}>
          <a
            className={'link-superfest'}
            onClick={handleClick}
            href={'https://www.optimism.io/'}
            target={'_blank'}
            rel="noreferrer"
          >
            <>
              <SuperfestPresentedBy />
            </>
          </a>
        </SuperFestPoweredContainer>
      ) : null}
    </>
  );
};
