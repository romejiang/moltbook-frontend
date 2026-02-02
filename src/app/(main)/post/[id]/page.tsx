import PostPageClient from './PostPageClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function PostPage() {
  return <PostPageClient />;
}
