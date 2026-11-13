import { Head } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
export default function AlumniPrivacy({
    version,
    contact,
}: {
    version: string;
    contact: { name: string; email: string | null; whatsapp: string | null };
}) {
    return (
        <>
            <Head title="Kebijakan privasi alumni" />
            <Card>
                <CardHeader>
                    <CardTitle>Kebijakan privasi alumni</CardTitle>
                    <CardDescription>
                        Versi {version}. Draf awal; teks hukum final perlu
                        ditinjau pengurus.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 text-sm">
                    <section className="flex flex-col gap-2">
                        <h2 className="font-semibold tracking-tight">
                            Tujuan dan data
                        </h2>
                        <p>
                            Pengurus mengelola data kesantrian, domisili
                            kota/kabupaten, profesi, keahlian, foto opsional,
                            serta kontak untuk verifikasi dan silaturahmi
                            alumni. Kami tidak meminta alamat rumah lengkap atau
                            koordinat rumah.
                        </p>
                    </section>
                    <section className="flex flex-col gap-2">
                        <h2 className="font-semibold tracking-tight">
                            Pilihan Anda
                        </h2>
                        <p>
                            Anda wajib memilih izin peta dan direktori secara
                            eksplisit. Tampil berarti dapat ditemukan oleh
                            alumni terverifikasi sesuai visibilitas setiap
                            field. Anonim hanya dihitung dalam peta agregat,
                            tanpa identitas. Sembunyi berarti tidak ikut peta,
                            direktori, atau radar. Belum memilih diperlakukan
                            sebagai tersembunyi. Field pada awalnya privat.
                        </p>
                        <p>
                            Peta publik hanya menampilkan jumlah alumni per
                            kota/kabupaten, apa adanya, tanpa nama atau profil
                            individu. WhatsApp dan email tidak ditampilkan
                            langsung; pemilik harus menyetujui permintaan
                            kontak. Persetujuan dapat ditarik setiap saat
                            melalui pengaturan privasi dan riwayatnya disimpan.
                        </p>
                    </section>
                    <section className="flex flex-col gap-2">
                        <h2 className="font-semibold tracking-tight">
                            Akses, penyimpanan, dan hak data
                        </h2>
                        <p>
                            Pengurus berwenang mengakses data untuk verifikasi,
                            impor, dan pengelolaan. Akses kontak dan tindakan
                            penting dicatat. Data disimpan selama akun atau
                            profil masih diperlukan untuk tujuan tersebut. Anda
                            dapat memperbaiki data, mengunduh salinan JSON,
                            menarik izin tampil, dan menghapus akun serta profil
                            secara permanen. Catatan audit penghapusan tidak
                            menyimpan isi data pribadi.
                        </p>
                        <p>
                            Peta memuat tile dari penyedia yang dikonfigurasi
                            pengurus; penyedia dapat menerima alamat IP dan area
                            peta yang dibuka. Koordinat individu tidak dikirim.
                        </p>
                    </section>
                    <section className="flex flex-col gap-2">
                        <h2 className="font-semibold tracking-tight">
                            Penanggung jawab
                        </h2>
                        <p>{contact.name}</p>
                        <p>Email: {contact.email ?? 'Belum diatur pengurus'}</p>
                        <p>
                            WhatsApp:{' '}
                            {contact.whatsapp ?? 'Belum diatur pengurus'}
                        </p>
                    </section>
                    <p>
                        Dengan mencentang persetujuan, saya menyatakan telah
                        membaca Kebijakan Privasi versi {version} dan menyetujui
                        pemrosesan untuk tujuan di atas. Izin tampil peta dan
                        direktori dipilih secara terpisah.
                    </p>
                </CardContent>
            </Card>
        </>
    );
}
