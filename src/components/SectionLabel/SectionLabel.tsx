import './SectionLabel.css';

interface SectionLabelProps {
  label: string;
  align?: 'left' | 'right';
}

export function SectionLabel({ label, align = 'left' }: SectionLabelProps) {
  return (
    <div className={`section-label section-label--${align}`} aria-hidden="true">
      {label}
    </div>
  );
}
