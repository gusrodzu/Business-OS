const signatures = {
  pdf: (buffer) => buffer.subarray(0, 5).toString('ascii') === '%PDF-',
  jpg: (buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  png: (buffer) => buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])),
  webp: (buffer) => buffer.length >= 12 && buffer.subarray(0,4).toString('ascii') === 'RIFF' && buffer.subarray(8,12).toString('ascii') === 'WEBP',
  ole: (buffer) => buffer.length >= 8 && buffer.subarray(0,8).equals(Buffer.from([0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1])),
  zip: (buffer) => buffer.length >= 4 && (
    buffer.subarray(0,4).equals(Buffer.from([0x50,0x4b,0x03,0x04])) ||
    buffer.subarray(0,4).equals(Buffer.from([0x50,0x4b,0x05,0x06])) ||
    buffer.subarray(0,4).equals(Buffer.from([0x50,0x4b,0x07,0x08]))
  ),
};

function looksLikePlainText(buffer) {
  if (!buffer.length) return false;
  const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
  if (sample.includes(0)) return false;
  let control = 0;
  for (const byte of sample) {
    if (byte < 9 || (byte > 13 && byte < 32)) control += 1;
  }
  return control / sample.length < 0.02;
}

export function hasExpectedFileSignature(file) {
  const buffer = file?.buffer;
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) return false;
  const mime = String(file.mimetype || '').toLowerCase();
  if (mime === 'application/pdf') return signatures.pdf(buffer);
  if (mime === 'image/jpeg') return signatures.jpg(buffer);
  if (mime === 'image/png') return signatures.png(buffer);
  if (mime === 'image/webp') return signatures.webp(buffer);
  if (mime === 'application/msword' || mime === 'application/vnd.ms-excel') return signatures.ole(buffer);
  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return signatures.zip(buffer);
  if (mime === 'text/plain') return looksLikePlainText(buffer);
  return false;
}

export function assertExpectedFileSignature(file) {
  if (!hasExpectedFileSignature(file)) {
    const error = new Error('El contenido del archivo no coincide con el formato declarado.');
    error.code = 'INVALID_FILE_SIGNATURE';
    error.statusCode = 400;
    throw error;
  }
}
