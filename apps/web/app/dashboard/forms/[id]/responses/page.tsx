import ResponsesClient from './ResponsesClient';

export function generateStaticParams() {
  return [
    { id: 'form-event-registration' },
    { id: 'pendaftaran-event' },
    { id: 'default' }
  ];
}

export default function ResponsesPage() {
  return <ResponsesClient />;
}
