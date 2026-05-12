import { toast as hotToast } from 'react-hot-toast';

const toast = {
  success: (_msg?: string) => hotToast.success('Task finalized'),
  error: (_msg?: string) => hotToast.error('Bro is finished'),
  loading: (msg: string) => hotToast.loading(msg),
  dismiss: (id?: string) => hotToast.dismiss(id),
};

export default toast;
