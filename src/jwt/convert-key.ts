const P256_PEM_HEADER = Uint8Array.from([
  0x30, 0x59,
    0x30, 0x13,
      0x06, 0x07, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x02, 0x01,
      0x06, 0x08, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x03, 0x01, 0x07,
  0x03, 0x42, 0x00
]);

export function convertP256PublicKeyToPEM(rawKey: string): string {
  const keyArray = Uint8Array.from(atob(rawKey), c => c.charCodeAt(0));

  const pemKeyArray = new Uint8Array(P256_PEM_HEADER.length + keyArray.length);
  pemKeyArray.set(P256_PEM_HEADER);
  pemKeyArray.set(keyArray, P256_PEM_HEADER.length);

  // @ts-ignore
  const base64Key = btoa(String.fromCharCode.apply(0, pemKeyArray));

  return "-----BEGIN PUBLIC KEY-----\n" + base64Key + "\n-----END PUBLIC KEY-----";
}
