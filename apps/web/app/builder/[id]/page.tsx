import BuilderClient from './BuilderClient';

export function generateStaticParams() {
  return [{ id: 'form-event-registration' }, { id: 'default' }];
}

export default function BuilderPage() {
  return <BuilderClient />;
}
