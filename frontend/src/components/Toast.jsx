import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const TOAST_ICONS = {
  success: <CheckCircle size={16} />,
  error: <XCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />
};

export function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {TOAST_ICONS[t.type] || TOAST_ICONS.info}
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
