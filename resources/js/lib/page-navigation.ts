export function shouldTransitionPage(
    destination: string,
    currentUrl: string,
    method: string,
    partialProps: string[],
): boolean {
    if (method !== 'get' || partialProps.length > 0) {
        return false;
    }

    const current = new URL(currentUrl);
    const next = new URL(destination, current);

    return next.origin === current.origin && next.pathname !== current.pathname;
}
