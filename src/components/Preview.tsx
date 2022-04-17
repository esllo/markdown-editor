import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkEmoji from 'remark-emoji';
import { unified } from 'unified';
import 'github-markdown-css/github-markdown.css';
import Code from './Code';
import rehypeReact from 'rehype-react/lib';
import React from 'react';
import remarkRehype from 'remark-rehype';
import remarkBreaks from 'remark-breaks';
import styled from '@emotion/styled';

interface PreviewProps {
  doc: string;
}

const PreviewDiv = styled.div`
  flex: 0 0 50%;
`;

const Preview = ({ doc }: PreviewProps) => {
  const md = unified()
    .use(remarkParse)
    .use(remarkBreaks)
    .use(remarkGfm)
    .use(remarkEmoji)
    .use(remarkRehype)
    .use(rehypeReact, { createElement: React.createElement })
    .processSync(doc).result as React.ReactElement;

  return <PreviewDiv>{md}</PreviewDiv>;
};

export default Preview;
