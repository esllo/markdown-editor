export default function download(filename: string, text: string) {
  const meta = 'data:text/markdown;charset=utf-8;variant=GFM';
  const content = encodeURIComponent(text);

  const element = document.createElement('a');
  element.setAttribute('href', `${meta},${content}`);
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
