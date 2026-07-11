import { toast } from 'sonner';
import { COMMON_ERROR_MESSAGE } from '@/lib/constants';

export const useCopyToClipboard = () => {
    const copyToClipboard = async (value: string, successMessage?: string) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success(successMessage ?? 'Copied to clipboard');
        } catch (error) {
            if (error instanceof DOMException) {
                toast.error(error.message);
            } else {
                toast.error(COMMON_ERROR_MESSAGE);
            }
        }
    };

    return copyToClipboard;
};
