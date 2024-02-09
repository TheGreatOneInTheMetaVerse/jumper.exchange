import type { Breakpoint, SxProps, Theme } from '@mui/material';
import { Typography, darken } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import {
  Menu,
  MenuHeaderAppBar,
  MenuHeaderAppWrapper,
  MenuItem,
  SubMenu,
} from 'src/components';
import { MenuKeysEnum } from 'src/const';
import { useMenuStore } from 'src/stores';
import { getContrastAlphaColor } from 'src/utils';
import { useWalletSelectContent } from './useWalletSelectContent';

interface MenuProps {
  anchorEl: any;
}

const NUMBER_OF_WALLETS_DISPLAYED = 9;

export const WalletSelectMenu = ({ anchorEl }: MenuProps) => {
  const t = useTranslations();
  const theme = useTheme();
  const walletSelectMenuItems = useWalletSelectContent();
  const isDarkMode = theme.palette.mode === 'dark';
  const filteredWalletSelectMenuItems = walletSelectMenuItems.slice(
    0,
    NUMBER_OF_WALLETS_DISPLAYED,
  );
  const {
    openWalletSelectMenu,
    setWalletSelectMenuState,
    openSubMenu,
    setSubMenuState,
  } = useMenuStore((state) => state);

  const handleClickSelectMore = () => {
    setSubMenuState(MenuKeysEnum.WalletSelectMore);
  };

  const menuItemStyles: SxProps<Theme> = {
    margin: 0,
    flexDirection: 'column',
    flexWrap: 'wrap',
    height: 72,
    width: 72,
    placeContent: 'center',

    [theme.breakpoints.up('sm' as Breakpoint)]: {
      height: 72,
    },
  };

  return (
    <Menu
      open={openWalletSelectMenu}
      cardsLayout={openSubMenu === MenuKeysEnum.WalletSelectMore ? false : true}
      styles={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        justifyItems: 'center',
        ul: {
          gridColumnStart: 1,
          gridColumnEnd: 4,
        },
      }}
      setOpen={setWalletSelectMenuState}
      isOpenSubMenu={openSubMenu === MenuKeysEnum.WalletSelectMore}
      anchorEl={anchorEl}
    >
      {openSubMenu === MenuKeysEnum.None && (
        <MenuHeaderAppWrapper
          sx={{
            gridColumn: 'span 3',
            marginBottom: '-12px',
          }}
        >
          <MenuHeaderAppBar component="div" elevation={0}>
            <Typography
              sx={{
                color: isDarkMode
                  ? theme.palette.white.main
                  : theme.palette.black.main,
              }}
              variant={'lifiBodyMediumStrong'}
              width={'100%'}
              align={'center'}
              flex={1}
              noWrap
            >
              {t('navbar.walletSelectMenu.connectWallet')}
            </Typography>
          </MenuHeaderAppBar>
        </MenuHeaderAppWrapper>
      )}
      {openSubMenu === MenuKeysEnum.None &&
        filteredWalletSelectMenuItems.map((el, index) => (
          <MenuItem
            key={`${el.label}-${index}`}
            triggerSubMenu={MenuKeysEnum.WalletSelect}
            showButton={false}
            styles={{
              borderRadius: '72px',
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? getContrastAlphaColor(theme, '12%')
                  : getContrastAlphaColor(theme, '4%'),

              '&:hover': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? theme.palette.alphaLight300.main
                    : darken(theme.palette.white.main, 0.08),
              },
              margin: 0,
              flexDirection: 'column',
              flexWrap: 'wrap',
              height: 72,
              width: 72,
              placeContent: 'center',

              [theme.breakpoints.up('sm' as Breakpoint)]: {
                height: 72,
              },
              ...el.styles,
            }}
            showMoreIcon={false}
            prefixIcon={el.prefixIcon}
            onClick={el.onClick}
            open={openWalletSelectMenu}
          />
        ))}
      {walletSelectMenuItems.length - NUMBER_OF_WALLETS_DISPLAYED > 0 &&
        openSubMenu === MenuKeysEnum.None && (
          <MenuItem
            key={`select-more-wallets`}
            triggerSubMenu={MenuKeysEnum.WalletSelectMore}
            showButton={true}
            showMoreIcon={false}
            open={true}
            styles={{
              ...menuItemStyles,
              gridColumn: 'span 3',
              padding: 0,
              width: '100%',
              height: '48px !important',
              borderRadius: 24,
              '> button': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? getContrastAlphaColor(theme, '12%')
                    : getContrastAlphaColor(theme, '4%'),
              },
              '&:hover': {
                backgroundColor: 'transparent',
              },

              '&:hover button': {
                backgroundColor: getContrastAlphaColor(theme, '16%'),
              },
            }}
            prefixIcon={
              <Typography
                variant={'lifiBodySmallStrong'}
                sx={{
                  color: isDarkMode
                    ? theme.palette.white.main
                    : theme.palette.black.main,
                }}
              >
                {t('navbar.seeAllWallets')}
              </Typography>
            }
            onClick={handleClickSelectMore}
          />
        )}
      <SubMenu
        label={t('navbar.walletSelectMenu.wallets')}
        triggerSubMenu={MenuKeysEnum.WalletSelectMore}
        open={openSubMenu === MenuKeysEnum.WalletSelectMore}
        prevMenu={MenuKeysEnum.None}
        subMenuList={walletSelectMenuItems}
      />
    </Menu>
  );
};
