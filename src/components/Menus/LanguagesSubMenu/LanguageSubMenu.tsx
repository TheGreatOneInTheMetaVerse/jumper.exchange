import { SubMenu } from 'src/components';
import { MenuKeysEnum } from 'src/const';
import { useClientTranslation } from 'src/i18n';
import { useMenuStore } from 'src/stores';
import { useLanguagesContent } from '.';

export const LanguagesSubmenu = () => {
  const { t } = useClientTranslation();
  const subMenuLanguages = useLanguagesContent();
  const openSubMenu = useMenuStore((state) => state.openSubMenu);
  return (
    <SubMenu
      label={t('language.key', { ns: 'language' })}
      triggerSubMenu={MenuKeysEnum.Language}
      open={openSubMenu === MenuKeysEnum.Language}
      prevMenu={MenuKeysEnum.None}
      subMenuList={subMenuLanguages}
    />
  );
};
