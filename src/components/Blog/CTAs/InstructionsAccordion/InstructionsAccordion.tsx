import { ThemeModesSupported } from 'src/types/settings';
import { InstructionsAccordionContainer, InstructionsAccordionItem } from '.';

interface InstructionsItemLink {
  label: string;
  url: string;
}
export interface InstructionItemProps {
  title: string;
  step?: string;
  link?: InstructionsItemLink;
  url?: string;
  buttonText?: string;
  buttonLink?: string;
  activeTheme?: ThemeModesSupported;
}

interface InstructionsAccordionProps {
  data: InstructionItemProps[];
  activeTheme?: ThemeModesSupported;
}

export const InstructionsAccordion = ({
  data,
  activeTheme,
}: InstructionsAccordionProps) => {
  if (!data) {
    return;
  }

  return (
    <InstructionsAccordionContainer>
      {data?.map((el, index) => (
        <InstructionsAccordionItem
          key={`instructions-accordion-item-${index}`}
          index={index}
          title={el.title}
          step={el.step}
          link={el.link}
          buttonText={el.buttonText}
          buttonLink={el.buttonLink}
          activeTheme={activeTheme}
        />
      ))}
    </InstructionsAccordionContainer>
  );
};
