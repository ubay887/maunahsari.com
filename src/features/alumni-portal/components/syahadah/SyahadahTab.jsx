import { useState } from 'react';
import { SYAHADAH_TYPES } from '../../data/alumniMockData';
import { SyahadahForm } from './SyahadahForm';
import { CertificateModal } from './CertificateModal';

export function SyahadahTab({ alumniData }) {
  const [syahadahType, setSyahadahType] = useState('30juz');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSyahadah, setGeneratedSyahadah] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleRequestSyahadah = (e) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      setGeneratedSyahadah({
        id: `SYH-MS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        name: alumniData.name.replace(/, S\.Pd\./g, ''),
        title: SYAHADAH_TYPES[syahadahType],
        program: syahadahType,
        year: alumniData.yearOut,
        dateGenerated: new Date().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        signatory: 'KH. R. Abdul Hamid Abdul Qodir',
      });
      setIsGenerating(false);
      setShowModal(true);
    }, 2000);
  };

  return (
    <>
      <SyahadahForm
        syahadahType={syahadahType}
        onTypeChange={setSyahadahType}
        isGenerating={isGenerating}
        generatedSyahadah={generatedSyahadah}
        onSubmit={handleRequestSyahadah}
        onOpenCertificate={() => setShowModal(true)}
      />
      {showModal && generatedSyahadah && (
        <CertificateModal
          syahadah={generatedSyahadah}
          alumniData={alumniData}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
