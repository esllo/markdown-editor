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
import rehypeRaw from 'rehype-raw';

interface PreviewProps {
  doc: string;
}

const PreviewDiv = styled.div`
  flex: 0 0 50%;
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI',
    'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji',
    'Segoe UI Symbol', sans-serif;
  padding: 16px;
  box-sizing: border-box;
`;

const Preview = ({ doc }: PreviewProps) => {
  const md = unified()
    .use(remarkParse)
    .use(remarkBreaks)
    .use(remarkGfm)
    .use(remarkEmoji)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeReact, { createElement: React.createElement })
    .processSync(doc).result as React.ReactElement;

  return <PreviewDiv className="markdown-body">{md}</PreviewDiv>;
};

export default Preview;
