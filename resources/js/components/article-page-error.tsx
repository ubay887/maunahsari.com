import { Alert, AlertTitle, AlertDescription } from '@/components/reui/alert';
import { Button } from '@/components/ui/button';
export function ArticlePageError({ retry }: { retry: () => void }) {
    return (
        <Alert variant="destructive" role="alert">
            <AlertTitle>Permintaan gagal</AlertTitle>
            <AlertDescription>
                Data belum dapat dimuat.{' '}
                <Button type="button" variant="outline" onClick={retry}>
                    Coba lagi
                </Button>
            </AlertDescription>
        </Alert>
    );
}
