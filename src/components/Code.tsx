import { useEffect, useState } from 'react';

interface Line {
  text: string;
  style: Nullable<string>;
}

const Code = ({
  className,
  children,
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>) => {
  const [lines, setLines] = useState<Array<Line>>([]);
  const language = (className || '').substring(9);

  useEffect(() => {}, []);

  return <code>{children}</code>;
};

export default Code;
