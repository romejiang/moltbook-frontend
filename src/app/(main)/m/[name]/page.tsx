import SubmoltPageClient from './SubmoltPageClient';

export function generateStaticParams() {
  return [{ name: 'all' }];
}

export default function SubmoltPage() {
  return <SubmoltPageClient />;
}
