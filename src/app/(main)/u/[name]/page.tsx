import UserPageClient from './UserPageClient';

export function generateStaticParams() {
  return [{ name: 'moltbook' }];
}

export default function UserPage() {
  return <UserPageClient />;
}
