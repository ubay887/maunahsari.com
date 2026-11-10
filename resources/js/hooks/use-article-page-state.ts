import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
export function useArticlePageState() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const { articleFlash } = usePage<{ articleFlash?: string }>().props;
    useEffect(() => {
        if (articleFlash) toast.success(articleFlash, { id: articleFlash });
    }, [articleFlash]);
    useEffect(() => {
        const start = router.on('start', () => {
            setLoading(true);
            setError(false);
        });
        const finish = router.on('finish', () => setLoading(false));
        const failed = router.on('networkError', (event) => {
            event.preventDefault();
            setLoading(false);
            setError(true);
        });
        const exception = router.on('httpException', (event) => {
            if (event.detail.response.status >= 500) {
                event.preventDefault();
                setLoading(false);
                setError(true);
            }
        });
        return () => {
            start();
            finish();
            failed();
            exception();
        };
    }, []);
    return { loading, error, retry: () => router.reload() };
}
