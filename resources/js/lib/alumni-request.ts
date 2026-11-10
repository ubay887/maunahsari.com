export async function alumniRequest(route: {
    url: string;
    method: string;
}): Promise<Response> {
    const token = document.cookie
        .split('; ')
        .find((value) => value.startsWith('XSRF-TOKEN='))
        ?.slice(11);
    const response = await fetch(route.url, {
        method: route.method.toUpperCase(),
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
            Accept: 'application/json',
            ...(token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}),
        },
    });
    if (!response.ok) throw new Error('Permintaan gagal');
    return response;
}
export async function downloadClaimCodes(route: {
    url: string;
    method: string;
}): Promise<void> {
    const response = await alumniRequest(route);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kode-klaim-alumni.csv';
    link.click();
    URL.revokeObjectURL(url);
}
