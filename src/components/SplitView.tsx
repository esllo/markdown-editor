import styled from '@emotion/styled';

interface SplitViewProps {
  children: React.ReactNode;
}

const SplitViewDiv = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
`;

const SplitView = ({ children }: SplitViewProps) => {
  return <SplitViewDiv>{children}</SplitViewDiv>;
};

export default SplitView;
