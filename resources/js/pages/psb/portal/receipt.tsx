import { Printer } from 'lucide-react';
import { PortalPage } from '@/components/alumni/portal-page';
import { Button } from '@/components/ui/button';
import { dateTime } from '@/lib/psb';
import { images, site } from '@/lib/site';
import type { PortalApplicant } from '@/types/psb';

function longDate(value: string | null): string {
    return value
        ? new Intl.DateTimeFormat('id-ID', {
              dateStyle: 'long',
              timeZone: 'Asia/Jakarta',
          }).format(new Date(value))
        : '';
}

/** Kop surat: logo di kiri, identitas lembaga di tengah, garis ganda di bawah. */
function Letterhead() {
    return (
        <header className="flex items-center gap-4 border-b-4 border-double border-black pb-4">
            <img
                src={images.seal}
                alt={`Logo ${site.name}`}
                width={80}
                height={80}
                className="size-14 shrink-0 object-contain sm:size-20"
            />
            <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 text-center">
                <p className="text-xs font-semibold tracking-widest uppercase">
                    Panitia Penerimaan Santri Baru
                </p>
                <p className="font-display text-base leading-tight font-bold tracking-wide uppercase sm:text-xl">
                    {site.orgName}
                </p>
                <p className="text-xs">
                    Berafiliasi dengan RMI Nahdlatul Ulama
                </p>
                <p className="text-xs text-black/70">{site.address}</p>
            </div>
            <div aria-hidden className="hidden size-20 shrink-0 sm:block" />
        </header>
    );
}

function SignatureBlock({
    title,
    name,
    place,
}: {
    title: string;
    name: string;
    place?: string;
}) {
    return (
        <div className="flex flex-col items-center gap-1 text-center text-sm">
            <p>{place ?? ' '}</p>
            <p className="font-medium">{title}</p>
            <div className="h-16 sm:h-20" aria-hidden />
            <p className="w-full max-w-48 border-t border-black pt-1 break-words">
                {name}
            </p>
        </div>
    );
}

export default function PortalReceipt({
    applicant,
}: {
    applicant: PortalApplicant;
}) {
    const office = site.contacts.find(
        (contact) => contact.role === `Kantor ${applicant.pondok}`,
    );
    const facts: [string, string][] = [
        ['Nama calon santri', applicant.full_name],
        ['Nama wali', applicant.guardian_name],
        ['Program', applicant.program],
        ['Pondok', applicant.pondok],
        ['Jenis santri', applicant.residence_type],
        ['Tanggal daftar', dateTime(applicant.registered_at)],
        ['Status', applicant.status_label],
        ...(applicant.visit_scheduled_at
            ? [
                  [
                      'Jadwal kunjungan',
                      dateTime(applicant.visit_scheduled_at),
                  ] as [string, string],
              ]
            : []),
    ];

    return (
        <PortalPage
            title="Bukti pendaftaran"
            description="Cetak atau simpan sebagai PDF untuk administrasi di kantor."
        >
            <div className="flex flex-col gap-4">
                <article
                    aria-label="Bukti pendaftaran santri baru"
                    className="mx-auto flex w-full max-w-[210mm] flex-col gap-6 bg-white p-5 text-black ring-1 ring-black/10 [print-color-adjust:exact] sm:p-10 print:max-w-none print:p-0 print:ring-0"
                >
                    <Letterhead />

                    <div className="flex flex-col items-center gap-1 text-center">
                        <h2 className="text-base font-bold tracking-wide uppercase underline underline-offset-4">
                            Bukti Pendaftaran Santri Baru
                        </h2>
                        <p className="text-xs">Periode {applicant.period}</p>
                    </div>

                    <div className="flex flex-col items-center gap-1 border border-black px-3 py-4 text-center">
                        <p className="text-xs tracking-wide uppercase">
                            Nomor registrasi
                        </p>
                        <p className="text-2xl font-bold tracking-wide break-all tabular-nums">
                            {applicant.registration_number}
                        </p>
                    </div>

                    <dl className="grid grid-cols-[7.5rem_1fr] gap-x-3 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
                        {facts.map(([label, value]) => (
                            <div key={label} className="contents">
                                <dt className="text-black/70">{label}</dt>
                                <dd className="font-medium break-words">
                                    <span aria-hidden className="mr-2">
                                        :
                                    </span>
                                    {value}
                                </dd>
                            </div>
                        ))}
                    </dl>

                    <section className="flex break-inside-avoid flex-col gap-2 text-sm">
                        <h3 className="font-semibold">Catatan</h3>
                        <ol className="flex list-decimal flex-col gap-1 pl-5">
                            <li>
                                Simpan bukti ini dan bawa saat datang ke kantor
                                pondok.
                            </li>
                            <li>
                                Calon santri wajib diantar orang tua atau wali.
                            </li>
                            <li>
                                Konfirmasi jadwal kehadiran dan sowan kepada
                                narahubung
                                {office
                                    ? ` ${office.role}: ${office.phone}`
                                    : ''}
                                .
                            </li>
                            <li>
                                Bukti ini menandakan pendaftaran telah tercatat,
                                bukan keputusan penerimaan. Status penerimaan
                                ditetapkan oleh pengurus.
                            </li>
                        </ol>
                    </section>

                    <section className="grid break-inside-avoid grid-cols-2 gap-6 pt-2">
                        <SignatureBlock
                            title="Wali calon santri"
                            name={applicant.guardian_name}
                        />
                        <SignatureBlock
                            place={`Kediri, ${longDate(applicant.registered_at)}`}
                            title="Panitia PSB"
                            name="(……………………………)"
                        />
                    </section>

                    <footer className="border-t border-black/30 pt-2 text-center text-xs text-black/70">
                        {site.orgName} · {site.tagline}
                    </footer>
                </article>

                <div className="mx-auto flex w-full max-w-[210mm] flex-col gap-2 print:hidden">
                    <Button
                        type="button"
                        className="w-full sm:w-auto sm:self-start"
                        onClick={() => window.print()}
                    >
                        <Printer data-icon="inline-start" aria-hidden />
                        Cetak atau simpan PDF
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        Di dialog cetak, pilih ukuran A4 dan matikan header
                        serta footer browser agar hasilnya rapi.
                    </p>
                </div>
            </div>
        </PortalPage>
    );
}
