import PublicFormClient from './PublicFormClient';

export function generateStaticParams() {
  return [{ slug: 'pendaftaran-event' }, { slug: 'event-2026' }];
}

export default function PublicFormPage() {
  return <PublicFormClient />;
}
