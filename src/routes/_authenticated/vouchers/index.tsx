import { createFileRoute } from '@tanstack/react-router';
import { checkIsRouteAllowed } from '@/lib/utils/auth/permissions';
import { Vouchers } from '@/modules/Vouchers';

export const Route = createFileRoute('/_authenticated/vouchers/')({
    beforeLoad({ context: { auth } }) {
        checkIsRouteAllowed('vouchers.view', auth.me.role);
    },
    component: Vouchers,
});
